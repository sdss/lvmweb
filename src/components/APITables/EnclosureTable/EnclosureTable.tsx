/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-21
 *  @Filename: EnclosureTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import { IconBuildingWarehouse } from '@tabler/icons-react';
import useAPICall from '@/src/hooks/use-api-call';
import APITable from '../../APITable/APITable';
import CalLamps from './CalLamps';
import DomeStatus from './DomeStatus';
import DoorStatus from './DoorStatus';
import Lights from './Lights';
import O2Levels from './O2Levels';
import { EnclosureResponse } from './types';

export default function EnclosureTable() {
  const [enclosure, , noData, refreshData] = useAPICall<EnclosureResponse>(
    '/enclosure/',
    {
      interval: 15000,
    }
  );

  const elements = [
    {
      key: 'dome_status',
      label: 'Dome Status',
      value: (
        <DomeStatus
          domeLabels={enclosure?.dome_status.labels}
          noData={noData}
          refreshData={refreshData}
        />
      ),
      valign: 'center',
    },
    // {
    //   key: 'dome_labels',
    //   label: 'Dome Status Labels',
    //   value: enclosure?.dome_status.labels.join(' | '),
    // },
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
    // {
    //   key: 'safety_labels',
    //   label: 'Safety Labels',
    //   value: enclosure?.safety_status.labels.join(' | '),
    // },
    {
      key: 'lights',
      label: 'Lights',
      value: (
        <Lights enclosureStatus={enclosure} noData={noData} refreshData={refreshData} />
      ),
      valign: 'top',
    },
    {
      key: 'callamps',
      label: 'Cal. Lamps',
      value: (
        <CalLamps
          data={enclosure?.cal_lamp_state}
          noData={noData}
          refreshData={refreshData}
        />
      ),
      valign: 'top',
    },
  ];

  return (
    <APITable
      title="Enclosure"
      elements={elements}
      noData={noData}
      icon={<IconBuildingWarehouse />}
      refreshData={refreshData}
      w={100}
    />
  );
}
