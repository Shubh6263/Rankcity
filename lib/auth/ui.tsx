'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';

export function Show({
  when,
  children,
}: {
  when: 'signed-in' | 'signed-out';
  children: React.ReactNode;
}) {
  const { isSignedIn } = useAuth();
  return (when === 'signed-in') === isSignedIn ? <>{children}</> : null;
}

export function SignInButton({ children }: { mode?: 'modal'; children: React.ReactNode }) {
  return <Link href="/sign-in">{children}</Link>;
}

export function SignUpButton({ children }: { mode?: 'modal'; children: React.ReactNode }) {
  return <Link href="/sign-up">{children}</Link>;
}

export function UserButton() {
  return (
    <Link href="/profile" aria-label="Open profile" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
      U
    </Link>
  );
}
