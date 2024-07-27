/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-26
 *  @Filename: LVMWebRoot.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import useAlerts, { AlertsModel } from '@/src/hooks/use-alerts';
import React from 'react';
import LVMAppShell from './LVMAppShell/LVMAppShell';

export const AlertsContext = React.createContext<AlertsModel | undefined>(undefined);

export default function LVMWebRoot({ children }: { children: any }) {
  const alerts = useAlerts();

  return (
    <AlertsContext.Provider value={alerts}>
      <LVMAppShell>{children}</LVMAppShell>
    </AlertsContext.Provider>
  );
}
