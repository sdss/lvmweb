/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-16
 *  @Filename: page.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import EphemerisTable from '@/src/components/APITables/EphemerisTable/EphemerisTable';
import SpecTable from '@/src/components/APITables/SpecTable/SpecTable';
import { SimpleGrid } from '@mantine/core';

export default function OverviewPage() {
  return (
    <SimpleGrid cols={{ sm: 1, md: 2, xl: 3 }} spacing="xl" verticalSpacing="xl">
      <EphemerisTable />
      <SpecTable />
    </SimpleGrid>
  );
}
