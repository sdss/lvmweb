/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-16
 *  @Filename: page.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import ActorsTable from '@/src/components/APITables/ActorsTable/ActorsTable';
import EnclosureTable from '@/src/components/APITables/EnclosureTable/EnclosureTable';
import EphemerisTable from '@/src/components/APITables/EphemerisTable/EphemerisTable';
import SpecTable from '@/src/components/APITables/SpecTable/SpecTable';
import WeatherTable from '@/src/components/APITables/WeatherTable/WeatherTable';
import useAlerts, { AlertsModel } from '@/src/hooks/use-alerts';
import { SimpleGrid, Stack } from '@mantine/core';
import React from 'react';

export const AlertsContext = React.createContext<AlertsModel | undefined>(undefined);

export default function OverviewPage() {
  const alerts = useAlerts();

  return (
    <AlertsContext.Provider value={alerts}>
      <SimpleGrid cols={{ sm: 2, lg: 3, xl: 4 }} spacing="lg" verticalSpacing="lg">
        <Stack gap="lg">
          <SpecTable />
          <WeatherTable />
        </Stack>
        <Stack gap="lg">
          <EnclosureTable />
          <EphemerisTable />
        </Stack>
        <ActorsTable />
      </SimpleGrid>
    </AlertsContext.Provider>
  );
}
