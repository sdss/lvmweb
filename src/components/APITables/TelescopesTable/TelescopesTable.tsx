/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-18
 *  @Filename: TelescopesTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import { IconTelescope } from '@tabler/icons-react';
import APITable from '../../APITable/APITable';
import TelescopePositionPlot from '../../TelescopePositionPlot/TelescopePositionPlot';

export default function TelescopesTable() {
  const elements = [
    {
      key: 'position',
      label: undefined,
      value: <TelescopePositionPlot size="small" />,
    },
  ];

  return <APITable title="Telescopes" elements={elements} icon={<IconTelescope />} />;
}
