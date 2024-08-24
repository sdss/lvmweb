/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-26
 *  @Filename: use-alerts-context.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import { AlertsContext } from '../components/LVMWebRoot/LVMWebRoot';

export default function useAlertsContext() {
  // Returns the alerts context.

  const alerts = React.useContext(AlertsContext);
  return alerts;
}
