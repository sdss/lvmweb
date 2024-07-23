/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-21
 *  @Filename: EnclosureTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { AlertsContext } from '@/app/overview/page';
import fetchFromAPI from '@/src/actions/fetchFromAPI';
import useAPICall, { APICallStatus } from '@/src/hooks/use-api-call';
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Pill,
  Progress,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconBuildingWarehouse,
  IconHandStop,
} from '@tabler/icons-react';
import React from 'react';
import APIStatusText from '../../APIStatusText/APIStatusText';
import APITable from '../../APITable/APITable';

type EnclosureResponse = {
  dome_status: {
    labels: string[];
  };
  safety_status: {
    labels: string[];
  };
  lights_status: {
    labels: string[];
  };
  o2_status: {
    utilities_room: number;
    spectrograph_room: number;
  };
};

function DomeIcon(props: {
  icon: React.ReactNode;
  tooltip: string;
  route: string;
  color?: string;
}) {
  const { icon, tooltip, route, color = 'blue' } = props;

  const [opened, { open, close }] = useDisclosure();

  const handleAction = React.useCallback(() => {
    close();
    fetchFromAPI(route).catch(() => {});
  }, [route, close]);

  return (
    <>
      <Tooltip label={tooltip}>
        <ActionIcon size="sm" color={color} onClick={open}>
          {icon}
        </ActionIcon>
      </Tooltip>
      <Modal opened={opened} onClose={close} title={tooltip} size="sm">
        <Box p={4}>Are you sure you want to {tooltip.toLowerCase()}?</Box>
        <Group justify="end" pt={16}>
          <Button color="blue" onClick={close}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleAction}>
            Yes
          </Button>
        </Group>
      </Modal>
    </>
  );
}

function DomeIcons() {
  return (
    <>
      <Group gap={8}>
        <DomeIcon
          icon={<IconArrowsMaximize size={18} />}
          tooltip="Open the dome"
          route="/enclosure/open/"
        />
        <DomeIcon
          icon={<IconArrowsMinimize size={18} />}
          tooltip="Close the dome"
          route="/enclosure/close/"
        />
        <DomeIcon
          icon={<IconHandStop size={18} />}
          tooltip="Stop the dome"
          route="/enclosure/stop/"
          color="red.9"
        />
      </Group>
    </>
  );
}

function DomeStatus({
  domeLabels,
  noData,
}: {
  domeLabels: string[] | undefined;
  noData: boolean;
}) {
  if (!domeLabels || domeLabels.length === 0) {
    return null;
  }

  let DividerElement = <Box style={{ flexGrow: 1 }} />;
  let label: string;

  if (domeLabels.includes('OPEN')) {
    label = 'Open';
  } else if (domeLabels.includes('CLOSED')) {
    label = 'Closed';
  } else if (domeLabels.includes('MOVING')) {
    label = 'Moving';
    DividerElement = <Progress h={10} value={100} style={{ flexGrow: 1 }} animated />;
  } else {
    label = 'Unknown';
  }

  return (
    <Group pr={4}>
      <Pill bg={domeLabels.includes('CLOSED') ? 'green.9' : 'orange.9'}>
        <APIStatusText nodata={noData}>{label}</APIStatusText>
      </Pill>
      {DividerElement}
      <DomeIcons />
    </Group>
  );
}

function O2Levels(props: {
  enclosureStatus: EnclosureResponse | null;
  noData: boolean;
}) {
  const { enclosureStatus, noData } = props;

  const alerts = React.useContext(AlertsContext);

  if (!enclosureStatus) {
    return null;
  }

  const { utilities_room, spectrograph_room } = enclosureStatus.o2_status;

  return (
    <Group gap="xs">
      <APIStatusText
        defaultTooltipText="Utilities room"
        nodata={noData}
        error={alerts?.o2_room_alerts.o2_util_room}
      >
        {utilities_room.toFixed(1)}%
      </APIStatusText>
      <Divider orientation="vertical" />
      <APIStatusText
        defaultTooltipText="Spectrograph room"
        nodata={noData}
        error={alerts?.o2_room_alerts.o2_spec_room}
      >
        {spectrograph_room.toFixed(1)}%
      </APIStatusText>
    </Group>
  );
}

function Lights(props: { enclosureStatus: EnclosureResponse | null; noData: boolean }) {
  const { enclosureStatus, noData } = props;

  if (!enclosureStatus) {
    return null;
  }

  const lights = enclosureStatus.lights_status.labels.filter((light) => light);

  if (lights.length === 0) {
    return <APIStatusText nodata={noData}>No lights</APIStatusText>;
  }

  return (
    <Group gap="xs">
      {lights.map((light) => (
        <Pill key={light} bg="orange.9">
          <APIStatusText nodata={noData}>
            {light.toLocaleLowerCase().replace('_', ' ')}
          </APIStatusText>
        </Pill>
      ))}
    </Group>
  );
}

function DoorStatus(props: {
  enclosureStatus: EnclosureResponse | null;
  noData: boolean;
}) {
  const { enclosureStatus, noData } = props;

  if (!enclosureStatus) {
    return null;
  }

  const { labels } = enclosureStatus.safety_status;

  if (labels.includes('DOOR_OPEN')) {
    return (
      <Pill key="door_open" bg="red.8">
        <APIStatusText nodata={noData}>Door open</APIStatusText>
      </Pill>
    );
  }

  if (labels.includes('DOOR_CLOSED') && !labels.includes('DOOR_LOCKED')) {
    return (
      <Pill key="door_unlocked" bg="yellow.8">
        <APIStatusText nodata={noData}>Door unlocked</APIStatusText>
      </Pill>
    );
  }

  return <APIStatusText nodata={noData}>Closed and locked</APIStatusText>;
}

export default function EnclosureTable() {
  const [enclosure, enclosureStatus] = useAPICall<EnclosureResponse>('/enclosure', {
    interval: 10000,
  });

  const noData =
    enclosureStatus === APICallStatus.ERROR || enclosureStatus === APICallStatus.NODATA;

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
      value: enclosure?.dome_status.labels.join(', '),
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
      value: enclosure?.safety_status.labels.join(', '),
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
      status={enclosureStatus}
      icon={<IconBuildingWarehouse />}
    />
  );
}
