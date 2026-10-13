'use client';

import React from 'react';
import { PwaProvider } from '@/lib/pwa/context';
import { PwaInstallBanner } from './PwaInstallBanner';
import { OfflineStatusToast } from './OfflineStatusToast';
import { UpdatePromptToast } from './UpdatePromptToast';
import { IosInstallGuideModal } from './IosInstallGuideModal';
import { SplashScreen } from './SplashScreen';

export function PwaRoot({ children }: { children: React.ReactNode }) {
  return (
    <PwaProvider>
      <SplashScreen />
      {children}
      <PwaInstallBanner />
      <OfflineStatusToast />
      <UpdatePromptToast />
      <IosInstallGuideModal />
    </PwaProvider>
  );
}
