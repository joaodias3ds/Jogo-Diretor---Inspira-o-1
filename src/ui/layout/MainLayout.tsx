/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppStore } from '@/app/useAppStore';
import { Topbar } from '@/ui/layout/Topbar';
import { ToastContainer } from '@/ui/components/Toast';
import { MainMenuScreen } from '@/ui/screens/MainMenuScreen';
import { DashboardView } from '@/ui/screens/DashboardView';
import { NewSeasonWizard } from '@/ui/screens/NewSeasonWizard';
import { SettingsModal } from '@/ui/screens/SettingsModal';
import { GuideModal } from '@/ui/screens/GuideModal';
import { HireParticipantModal } from '@/ui/screens/HireParticipantModal';
import { RandomEventModal } from '@/ui/screens/RandomEventModal';
import { useGameStore } from '@/app/useGameStore';

export const MainLayout: React.FC = () => {
  const { currentScreen, setScreen, toasts, dismissToast, addToast } = useAppStore();
  const { activeRandomEvent, resolveRandomEventAction, dismissRandomEventAction } = useGameStore();

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Topbar Navigation & Status */}
      <Topbar />

      {/* Main Dynamic Viewport */}
      <main className="flex-1 w-full relative">
        {currentScreen === 'menu' && <MainMenuScreen />}
        {currentScreen === 'wizard' && (
          <NewSeasonWizard
            onComplete={() => setScreen('dashboard')}
            onCancel={() => setScreen('menu')}
          />
        )}
        {currentScreen !== 'menu' && currentScreen !== 'wizard' && <DashboardView />}
      </main>

      {/* Modals Host */}
      <SettingsModal />
      <GuideModal />
      <HireParticipantModal />
      <RandomEventModal
        event={activeRandomEvent}
        onResolve={(opt) => {
          resolveRandomEventAction(opt.id);
          addToast(
            'success',
            `Decisão Executada: ${opt.label}`,
            opt.actionLog
          );
        }}
        onDismiss={dismissRandomEventAction}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
