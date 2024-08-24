/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-21
 *  @Filename: EnclosureTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import useAPICall from '@/src/hooks/use-api-call';
import { IconBuildingWarehouse } from '@tabler/icons-react';
import APITable from '../../APITable/APITable';
import DomeStatus from './DomeStatus';
import DoorStatus from './DoorStatus';
import Lights from './Lights';
import O2Levels from './O2Levels';
import { EnclosureResponse } from './types';

export default function EnclosureTable() {
  const [enclosure, , noData, refresh] = useAPICall<EnclosureResponse>('/enclosure/', {
    interval: 10000,
  });

  const elements = [
    {
      key: 'dome_status',
      label: 'Dome Status',
      value: <DomeStatus domeLabels={enclosure?.dome_status.labels} noData={noData} />,
      valign: 'center',
    },
    {
      key: 'dome_labels',
      label: 'Dome Status Labels',
      value: enclosure?.dome_status.labels.join(' | '),
    },
    {
      key: 'door',
      label: 'Door',
      value: <DoorStatus enclosureStatus={enclosure} noData={noData} />,
    },
    {
      key: 'o2',
      label: 'O\u2082 Levels',
      value: <O2Levels enclosureStatus={enclosure} noData={noData} />,
    },
    {
      key: 'safety_labels',
      label: 'Safety Labels',
      value: enclosure?.safety_status.labels.join(' | '),
    },
    {
      key: 'lights',
      label: 'Lights',
      value: <Lights enclosureStatus={enclosure} noData={noData} />,
      valign: 'center',
    },
  ];

  return (
    <APITable
      title="Enclosure"
      elements={elements}
      noData={noData}
      icon={<IconBuildingWarehouse />}
      refreshData={refresh}
    />
  );
}
