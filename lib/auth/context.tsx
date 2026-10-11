'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import { User, Wallet, NotificationItem } from '@/types';

interface AuthContextType {
  currentUser: User;
  allUsers: User[];
  wallet: Wallet | null;
  unreadCount: number;
  notifications: NotificationItem[];
  isSignedIn: boolean;
  isLoaded: boolean;
  switchUser: (userId: string) => void;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; phone?: string; companyName?: string; avatarUrl?: string }) => Promise<{ success: boolean; error?: string }>;
  markNotificationAsRead: (id: string) => Promise<void>;
}

const guestUser: User = {
  id: 'guest_user',
  name: 'Guest Explorer',
  email: '',
  role: 'CUSTOMER',
  phone: '',
  createdAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType>({
  currentUser: guestUser,
  allUsers: [],
  wallet: null,
  unreadCount: 0,
  notifications: [],
  isSignedIn: false,
  isLoaded: false,
  switchUser: () => {},
  logout: () => {},
  refreshUserData: async () => {},
  updateProfile: async () => ({ success: false }),
  markNotificationAsRead: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return <>{children}</>;
  return <ClerkAuthProvider>{children}</ClerkAuthProvider>;
}

function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const { signOut } = useClerkAuth();

  const [currentUser, setCurrentUser] = useState<User>(guestUser);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Function to sync Clerk user with backend database
  const syncClerkUser = useCallback(async () => {
    if (!clerkUser) {
      setCurrentUser(guestUser);
      setWallet(null);
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const email = clerkUser.primaryEmailAddress?.emailAddress || '';
      const name = clerkUser.fullName || clerkUser.username || email.split('@')[0] || 'User';
      const avatarUrl = clerkUser.imageUrl || undefined;
      const phone = clerkUser.primaryPhoneNumber?.phoneNumber || undefined;

      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: clerkUser.id,
          name,
          email,
          avatarUrl,
          phone,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) setCurrentUser(data.user);
        if (data.wallet) setWallet(data.wallet);
      }

      // Fetch user notifications
      const nRes = await fetch(`/api/notifications?userId=${clerkUser.id}`);
      if (nRes.ok) {
        const nData = await nRes.json();
        setNotifications(nData.notifications || []);
        const unread = (nData.notifications || []).filter((n: NotificationItem) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (e) {
      console.error('Failed to sync authenticated Clerk user', e);
    }
  }, [clerkUser]);

  const fetchUserData = useCallback(async (userId: string) => {
    if (!userId || userId === 'guest_user') return;
    try {
      const res = await fetch(`/api/auth/me?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user) setCurrentUser(data.user);
        if (data.wallet) setWallet(data.wallet);
        if (data.allUsers) setAllUsers(data.allUsers);
        setUnreadCount(data.unreadNotifs || 0);
      }

      const nRes = await fetch(`/api/notifications?userId=${userId}`);
      if (nRes.ok) {
        const nData = await nRes.json();
        setNotifications(nData.notifications || []);
      }
    } catch (e: any) {
      // Don't clutter console if laptop went to sleep or internet is disconnected
      if (typeof window !== 'undefined' && !navigator.onLine) return;
      if (e?.name === 'TypeError' && (e?.message?.includes('Failed to fetch') || e?.message?.includes('NetworkError'))) {
        return;
      }
      console.warn('Auth sync notice:', e?.message || e);
    }
  }, []);

  // When Clerk user state updates
  useEffect(() => {
    if (!isClerkLoaded) return;

    if (isSignedIn && clerkUser) {
      syncClerkUser();
    } else {
      setCurrentUser(guestUser);
      setWallet(null);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isClerkLoaded, isSignedIn, clerkUser, syncClerkUser]);

  // Periodic polling only for active authenticated user when online & document visible
  useEffect(() => {
    if (!currentUser.id || currentUser.id === 'guest_user') return;

    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        if (!navigator.onLine) return;
        if (document.visibilityState === 'hidden') return;
      }
      fetchUserData(currentUser.id);
    }, 60000);

    const handleOnline = () => {
      fetchUserData(currentUser.id);
    };
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }, [currentUser.id, fetchUserData]);

  const switchUser = (userId: string) => {
    const found = allUsers.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
    fetchUserData(userId);
  };

  const logout = async () => {
    try {
      if (signOut) {
        await signOut();
      }
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(guestUser);
    setWallet(null);
    setNotifications([]);
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const updateProfile = async (data: { name?: string; email?: string; phone?: string; companyName?: string; avatarUrl?: string }) => {
    if (!currentUser.id || currentUser.id === 'guest_user') {
      return { success: false, error: 'Please sign in to update your profile' };
    }
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, ...data }),
      });
      const result = await res.json();
      if (res.ok && result.user) {
        setCurrentUser(result.user);
        setAllUsers((prev) =>
          prev.map((u) => (u.id === result.user.id ? result.user : u))
        );
        return { success: true };
      }
      return { success: false, error: result.error || 'Failed to update profile' };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error occurred' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        wallet,
        unreadCount,
        notifications,
        isSignedIn: !!isSignedIn,
        isLoaded: isClerkLoaded,
        switchUser,
        logout,
        refreshUserData: () => fetchUserData(currentUser.id),
        updateProfile,
        markNotificationAsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
