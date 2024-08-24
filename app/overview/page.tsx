/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-16
 *  @Filename: page.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import ActorsTable from '@/src/components/APITables/ActorsTable/ActorsTable';
import EnclosureTable from '@/src/components/APITables/EnclosureTable/EnclosureTable';
import EphemerisTable from '@/src/components/APITables/EphemerisTable/EphemerisTable';
import OverwatcherTable from '@/src/components/APITables/OverwatcherTable/OverwatcherTable';
import SpecTable from '@/src/components/APITables/SpecTable/SpecTable';
import TelescopesTable from '@/src/components/APITables/TelescopesTable/TelescopesTable';
import WeatherTable from '@/src/components/APITables/WeatherTable/WeatherTable';
import { Box, SimpleGrid, Stack, useMatches } from '@mantine/core';
import React from 'react';

export default function OverviewPage() {
  const nCols = useMatches({ md: 1, lg: 2, xl: 3 });

  let tableArrangement: React.ReactNode;

  if (nCols <= 2) {
    tableArrangement = (
      <>
        <Stack gap="lg">
          <OverwatcherTable />
          <SpecTable />
          <WeatherTable />
          <ActorsTable />
        </Stack>
        <Stack gap="lg">
          <EnclosureTable />
          <TelescopesTable />
          <EphemerisTable />
        </Stack>
      </>
    );
  } else {
    tableArrangement = (
      <>
        <Stack gap="lg">
          <OverwatcherTable />
          <SpecTable />
          <WeatherTable />
        </Stack>
        <Stack gap="lg">
          <EnclosureTable />
          <TelescopesTable />
          <EphemerisTable />
        </Stack>
        <ActorsTable />
      </>
    );
  }

  return (
    <Box style={{ display: 'flex', justifyContent: 'center' }}>
      <SimpleGrid cols={nCols} spacing="lg" verticalSpacing="lg" maw={1600}>
        {tableArrangement}
      </SimpleGrid>
    </Box>
  );
}
