/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-21
 *  @Filename: EnclosureTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { AlertsContext } from '@/app/overview/page';
import fetchFromAPI from '@/src/actions/fetchFromAPI';
import useAPICall from '@/src/hooks/use-api-call';
import useTask from '@/src/hooks/use-task';
import {
  ActionIcon,
  Box,
  Divider,
  Group,
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
import ConfirmationModal from '../../ConfirmationModal/ConfirmationModal';

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
  disabled?: boolean;
  taskName?: string;
  task?: boolean;
  setDisabled?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    icon,
    tooltip,
    route,
    color = 'blue',
    disabled = false,
    setDisabled,
    taskName = 'undefined',
    task = false,
  } = props;

  const [opened, { open, close }] = useDisclosure();
  const [runner, isRunning] = useTask({ taskName, notifyErrors: false });

  const handleAction = React.useCallback(() => {
    close();

    if (task) {
      const result = runner(route);
      setDisabled && setDisabled(isRunning);
      result.catch(() => {});
    } else {
      fetchFromAPI(route)
        .catch(() => {})
        .finally(() => setDisabled && setDisabled(false));
    }
  }, [route, close]);

  return (
    <>
      <Tooltip label={tooltip}>
        <ActionIcon size="sm" color={color} onClick={open} disabled={disabled}>
          {icon}
        </ActionIcon>
      </Tooltip>
      <ConfirmationModal
        opened={opened}
        close={close}
        title={tooltip}
        handleAction={handleAction}
        message={`Are you sure you want to ${tooltip.toLowerCase()}?`}
      />
    </>
  );
}

function DomeIcons(props: { moving?: boolean }) {
  const [disabled, setDisabled] = React.useState(false);

  return (
    <>
      <Group gap={8}>
        <DomeIcon
          icon={<IconArrowsMaximize size={18} />}
          tooltip="Open the dome"
          route="/enclosure/open/"
          disabled={props.moving || disabled}
          setDisabled={setDisabled}
          taskName="open dome"
          task
        />
        <DomeIcon
          icon={<IconArrowsMinimize size={18} />}
          tooltip="Close the dome"
          route="/enclosure/close/"
          disabled={props.moving || disabled}
          setDisabled={setDisabled}
          taskName="close dome"
          task
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
      <Pill bg={domeLabels.includes('CLOSED') ? 'lime.9' : 'orange.9'}>
        <APIStatusText size="xs" nodata={noData}>
          {label}
        </APIStatusText>
      </Pill>
      {DividerElement}
      <DomeIcons moving={label === 'Moving'} />
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
          <APIStatusText nodata={noData} size="xs">
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
        <APIStatusText nodata={noData} size="xs">
          Door open
        </APIStatusText>
      </Pill>
    );
  }

  if (labels.includes('DOOR_CLOSED') && !labels.includes('DOOR_LOCKED')) {
    return (
      <Pill key="door_unlocked" bg="yellow.8">
        <APIStatusText size="xs" nodata={noData}>
          Door unlocked
        </APIStatusText>
      </Pill>
    );
  }

  return <APIStatusText nodata={noData}>Closed and locked</APIStatusText>;
}

export default function EnclosureTable() {
  const [enclosure, , noData] = useAPICall<EnclosureResponse>('/enclosure', {
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
      noData={noData}
      icon={<IconBuildingWarehouse />}
    />
  );
}
