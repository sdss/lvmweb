/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-26
 *  @Filename: LVMWebRoot.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import useAlerts, { AlertsModel } from '@/src/hooks/use-alerts';
import useIsLogged from '@/src/hooks/use-is-logged';
import React from 'react';
import LVMAppShell from './LVMAppShell/LVMAppShell';

export const AlertsContext = React.createContext<AlertsModel | undefined>(undefined);
export const AuthContext = React.createContext<AuthContextType>({
  logged: false,
  check: async () => false,
});

type AuthContextType = {
  logged: boolean;
  check: () => Promise<boolean>;
};

export default function LVMWebRoot({ children }: { children: React.ReactNode }) {
  const alerts = useAlerts();
  const [isLogged, checkLogged] = useIsLogged();

  return (
    <AlertsContext.Provider value={alerts}>
      <AuthContext.Provider value={{ logged: isLogged, check: checkLogged }}>
        <LVMAppShell>{children}</LVMAppShell>
      </AuthContext.Provider>
    </AlertsContext.Provider>
  );
}
