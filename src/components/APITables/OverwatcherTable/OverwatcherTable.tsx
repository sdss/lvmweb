/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-19
 *  @Filename: OverwatcherTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import {
  IconExchange,
  IconRobot,
  IconRuler2,
  IconRuler2Off,
  IconSpray,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Divider,
  Group,
  Modal,
  Pill,
  Stack,
  Switch,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import fetchFromAPI from '@/src/actions/fetch-from-API';
import APIStatusText from '@/src/components/APITable/APIStatusText/APIStatusText';
import APITable from '@/src/components/APITable/APITable';
import { AuthContext } from '@/src/components/LVMWebRoot/LVMWebRoot';
import useAPICall from '@/src/hooks/use-api-call';
import useTask from '@/src/hooks/use-task';
import ConfirmationModal from '../../ConfirmationModal/ConfirmationModal';

type OverwatcherResponse = {
  running: boolean;
  enabled: boolean;
  observing: boolean;
  cancelling: boolean;
  calibrating: boolean;
  focusing: boolean;
  troubleshooting: boolean;
  allow_calibrations: boolean;
  safe: boolean | null;
  alerts: string[] | null;
  night: boolean | null;
  running_calibration: string | null;
  tile_id: number | null;
  dither_position: number | null;
  stage: string | null;
  standard_no: number | null;
};

type CalibrationsListResponse = {
  name: string;
  start_time: string | null;
  max_start_time: string | null;
  after: string | null;
  time_to_cal: number | null;
  status: string;
  requires_dome: 'open' | 'closed' | null;
  close_dome_after: boolean;
  disabled: boolean;
}[];

type OverwatcherPillProps = {
  value: boolean | string | null | undefined;
  nodata: boolean;
  useErrorColour?: boolean;
  noColor?: string;
  yesColor?: string;
  naColor?: string;
  customColour?: string;
  tooltipText?: string;
};

function OverwatcherPill(props: OverwatcherPillProps) {
  const {
    value,
    nodata,
    useErrorColour = false,
    yesColor = 'lime.9',
    noColor = 'dark.5',
    naColor = 'dark.5',
    customColour,
    tooltipText,
  } = props;

  let text: string;
  if (value === null || value === undefined) {
    text = 'N/A';
  } else if (typeof value === 'string') {
    text = value;
  } else {
    text = value ? 'Yes' : 'No';
  }

  let colour: string;
  if (useErrorColour && !value) {
    colour = 'red.9';
  } else if (text === 'N/A') {
    colour = naColor;
  } else if (customColour) {
    colour = customColour;
  } else {
    colour = value ? yesColor : noColor;
  }

  return (
    <Box style={{ flexGrow: 1, paddingLeft: 8 }}>
      <Tooltip label={tooltipText} hidden={tooltipText === undefined}>
        <Pill bg={colour} maw={70}>
          <APIStatusText nodata={nodata}>{text}</APIStatusText>
        </Pill>
      </Tooltip>
    </Box>
  );
}

type RunningGroupProps = {
  running?: boolean;
  nodata: boolean;
  refreshData?: () => void;
};

function RunningGroup(props: RunningGroupProps) {
  const { running, nodata } = props;

  const [resetRunning, setResetRunning] = React.useState(false);
  const [opened, { open: openModal, close: closeModal }] = useDisclosure();

  const [runner, taskRunning] = useTask<boolean>({ taskName: 'cleanup' });
  const authStatus = React.useContext(AuthContext);

  const runCleanup = React.useCallback(async () => {
    closeModal();
    runner('/macros/cleanup', true)
      .then(() => props.refreshData?.())
      .catch(() => {});
  }, [runner, closeModal]);

  const resetOverwatcher = React.useCallback(() => {
    setResetRunning(true);
    fetchFromAPI('/overwatcher/reset', {}, false)
      .then(() => props.refreshData?.())
      .catch(() => {})
      .finally(() => setResetRunning(false));
  }, []);

  return (
    <Group>
      <OverwatcherPill value={running} nodata={nodata} useErrorColour />
      <Group gap={8} style={{ paddingRight: 8 }}>
        <Tooltip label={authStatus.logged ? 'Run cleanup' : 'Authentication needed'}>
          <ActionIcon
            size="sm"
            onClick={openModal}
            loading={taskRunning}
            disabled={!authStatus.logged}
          >
            <IconSpray size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip
          label={authStatus.logged ? 'Reset Overwatcher' : 'Authentication needed'}
        >
          <ActionIcon
            size="sm"
            color="yellow.9"
            onClick={resetOverwatcher}
            loading={resetRunning}
            disabled={!authStatus.logged || taskRunning}
          >
            <IconExchange size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <ConfirmationModal
        opened={opened}
        close={closeModal}
        handleAction={runCleanup}
        title="Run cleanup recipe"
      />
    </Group>
  );
}

interface EnabledGroupProps {
  data: OverwatcherResponse | null;
  nodata: boolean;
  refreshData?: () => void;
}

function EnabledGroup(props: EnabledGroupProps) {
  const { data, nodata } = props;
  const { enabled = false, running = false, observing = false } = data || {};

  const authStatus = React.useContext(AuthContext);

  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure();

  const handleEnabledChange = React.useCallback(
    (newState: boolean) => {
      if (newState || !observing) {
        // Send API request to change value to enabled.
        const route = '/overwatcher/status';
        const fullRoute = newState ? `${route}/enable` : `${route}/disable`;
        fetchFromAPI(fullRoute, { method: 'PUT' }, true)
          .then(() => {})
          .catch(() => {})
          .finally(props.refreshData);
      } else {
        // Use modal to confirm disabling.
        openModal();
      }
    },
    [observing]
  );

  return (
    <Group>
      <OverwatcherPill value={enabled} nodata={nodata} />
      <Tooltip label="Enable/disable the Overwatcher">
        <Switch
          size="md"
          pr={8}
          checked={enabled}
          onChange={() => handleEnabledChange(!enabled)}
          onLabel="ON"
          offLabel="OFF"
          disabled={
            nodata ||
            enabled === null ||
            enabled === undefined ||
            !running ||
            !authStatus.logged
          }
        />
      </Tooltip>
      <DisableModal
        opened={modalOpened}
        close={closeModal}
        refreshData={props.refreshData}
      />
    </Group>
  );
}

function DisableModal(props: {
  opened: boolean;
  close: () => void;
  refreshData?: () => void;
}) {
  const { opened, close, refreshData } = props;
  const [closeDome, setCloseDome] = React.useState(false);
  const [isDisabling, setDisabling] = React.useState(false);

  const handleDisable = React.useCallback(
    (now: boolean) => {
      setDisabling(true);
      fetchFromAPI(
        `/overwatcher/status/disable?now=${now}&close_dome=${closeDome}`,
        { method: 'PUT' },
        true
      )
        .catch(() => {})
        .finally(() => {
          setDisabling(false);
          close();
          refreshData?.();
        });
    },
    [close, closeDome]
  );

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Are you sure that you want to disable the Overwatcher?"
      size="lg"
    >
      <Stack gap="md">
        <Checkbox
          label="Close dome after disabling"
          checked={closeDome}
          onChange={(event) => setCloseDome(event.target.checked)}
        />
        <Group justify="end" pt={16}>
          <Button
            variant="default"
            onClick={props.close}
            disabled={isDisabling}
            style={{ cursor: isDisabling ? 'no-drop' : undefined }}
          >
            Cancel
          </Button>
          {!closeDome && (
            <Button
              color="blue"
              onClick={() => handleDisable(false)}
              disabled={isDisabling}
              style={{ cursor: isDisabling ? 'no-drop' : undefined }}
            >
              After this tile
            </Button>
          )}
          <Button
            color="red"
            onClick={() => handleDisable(true)}
            disabled={isDisabling}
            style={{ cursor: isDisabling ? 'no-drop' : undefined }}
          >
            Immediately
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

interface AllowDomeCalibrationsGroupProps {
  nodata: boolean;
  allow?: boolean;
  running?: boolean;
  refreshData: () => void;
}

function AllowCalibrationsGroup(props: AllowDomeCalibrationsGroupProps) {
  const { nodata, allow, running = true } = props;

  const [isOn, setOn] = React.useState(allow || false);
  const authStatus = React.useContext(AuthContext);

  React.useEffect(() => {
    setOn(allow || false);
  }, [allow]);

  const handleAllowChange = React.useCallback(() => {
    // Send API request to change value
    const route = '/overwatcher/status/allow_calibrations';
    const fullRoute = isOn ? `${route}/disable` : `${route}/enable`;

    fetchFromAPI(fullRoute, { method: 'PUT' }, true)
      .then(() => setOn((prev) => !prev))
      .catch(() => {})
      .finally(props.refreshData);
  }, [isOn]);

  return (
    <Group>
      <OverwatcherPill value={allow} nodata={nodata} />
      <Tooltip label="Allow/disallow calibrations">
        <Switch
          size="md"
          pr={8}
          checked={isOn === true}
          onChange={handleAllowChange}
          onLabel="ON"
          offLabel="OFF"
          disabled={
            nodata ||
            allow === null ||
            allow === undefined ||
            !running ||
            !authStatus.logged
          }
        />
      </Tooltip>
    </Group>
  );
}

function ScheduleLongTermCalsModal(props: {
  opened: boolean;
  close: () => void;
  unschedule: boolean;
  refreshData: () => void;
}) {
  const { opened, close, unschedule, refreshData } = props;

  const [now, setNow] = React.useState(false);
  const [running, setRunning] = React.useState(false);

  const route = '/overwatcher/calibrations/schedule-long-term';

  const sendCommand = React.useCallback(() => {
    setRunning(true);
    fetchFromAPI(`${route}?remove=${unschedule}&now=${now}`)
      .then(() => refreshData())
      .catch(() => {})
      .finally(() => {
        setRunning(false);
        props.close();
      });
  }, [now, unschedule]);

  return (
    <Modal opened={opened} onClose={close} title="Long-term calibrations">
      <Stack gap="md" p={16}>
        <Box p={4}>
          {unschedule
            ? 'Do you want to unschedule the long-term calibrations?'
            : 'Do you want to schedule the long-term calibrations?'}
        </Box>
        <Group>
          <Checkbox
            label="Abort observations?"
            checked={now}
            onChange={(event) => setNow(event.target.checked)}
            pr={16}
          />
          <Button onClick={sendCommand} loading={running}>
            Yes
          </Button>
          <Button color="gray.7" onClick={close}>
            No
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function ScheduleLongTermCals() {
  const [calsList, , , calsRefresh] = useAPICall<CalibrationsListResponse>(
    '/overwatcher/calibrations/list',
    { interval: 60000 }
  );

  const [opened, { open: openModal, close: closeModal }] = useDisclosure();

  const longTermCal = calsList?.find((cal) => cal.name === 'long_term_calibrations');
  if (!longTermCal) {
    return null;
  }

  const isEnabled = !longTermCal.disabled;

  return (
    <>
      <Tooltip
        label={
          isEnabled
            ? 'Disable long-term calibrations'
            : 'Schedule long-term calibrations'
        }
      >
        <ActionIcon
          size="sm"
          color={isEnabled ? 'yellow.9' : 'blue'}
          onClick={openModal}
        >
          {isEnabled ? <IconRuler2Off size={18} /> : <IconRuler2 size={18} />}
        </ActionIcon>
      </Tooltip>
      <ScheduleLongTermCalsModal
        opened={opened}
        close={closeModal}
        unschedule={isEnabled}
        refreshData={calsRefresh}
      />
    </>
  );
}

function CalibrationGroup(props: {
  data: OverwatcherResponse | null;
  nodata: boolean;
}) {
  const { data, nodata } = props;

  const tooltipText = `Running calibration: ${data?.running_calibration || ''}`;

  return (
    <Group gap="xs">
      <OverwatcherPill value={data?.calibrating} nodata={nodata} />
      <Group gap={8} style={{ paddingRight: 8 }}>
        {data?.calibrating ? (
          <APIStatusText
            nodata={nodata}
            defaultTooltipText={tooltipText}
            size="xs"
            style={{
              maxWidth: 170,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              textAlign: 'right',
            }}
          >
            {data?.running_calibration}
          </APIStatusText>
        ) : (
          <ScheduleLongTermCals />
        )}
      </Group>
    </Group>
  );
}

function SafetyGroup(props: { data: OverwatcherResponse | null; nodata: boolean }) {
  const { data, nodata } = props;

  const alerts = props.data?.alerts || [];
  const alertsText = alerts.join(' | ');

  return (
    <Group gap="xs">
      <OverwatcherPill value={data?.safe} nodata={nodata} noColor="red.9" />
      <APIStatusText
        nodata={nodata}
        defaultTooltipText={alertsText}
        size="xs"
        style={{
          paddingRight: 16,
          maxWidth: 170,
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          textAlign: 'right',
        }}
      >
        {alertsText}
      </APIStatusText>
    </Group>
  );
}

function ObservingText(props: { data: OverwatcherResponse | null }) {
  const { data } = props;

  if (!data) {
    return null;
  }

  if (data.troubleshooting) {
    return (
      <APIStatusText
        size="xs"
        color="red.9"
        style={{
          paddingRight: 16,
          textAlign: 'right',
        }}
      >
        troubleshooting
      </APIStatusText>
    );
  }

  if (data.focusing) {
    return (
      <APIStatusText
        size="xs"
        style={{
          paddingRight: 16,
          textAlign: 'right',
        }}
      >
        focusing
      </APIStatusText>
    );
  }

  if (!data.observing || !data.tile_id) {
    return null;
  }

  const stage = data.stage || '?';
  let tileID: string;

  if (data.tile_id && data.dither_position !== null) {
    tileID = `${data.tile_id}-${data.dither_position}`;
  } else if (data.tile_id) {
    tileID = `${data.tile_id}`;
  } else {
    tileID = '?';
  }

  const standardNo = data.standard_no || '?';

  return (
    <Group
      gap={4}
      style={{
        paddingRight: 16,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        textAlign: 'right',
      }}
    >
      <APIStatusText defaultTooltipText="Stage" size="xs">
        {stage}
      </APIStatusText>
      <Divider orientation="vertical" />
      <APIStatusText defaultTooltipText="TileID-Dither" size="xs">
        {tileID}
      </APIStatusText>
      <Divider orientation="vertical" />
      <APIStatusText defaultTooltipText="Standard number" size="xs">
        {standardNo}
      </APIStatusText>
    </Group>
  );
}

function ObservingGroup(props: { data: OverwatcherResponse | null; nodata: boolean }) {
  const { data, nodata } = props;

  const tooltipText = data?.cancelling
    ? 'Cancelling'
    : data?.observing
      ? 'Observing'
      : 'Not observing';

  return (
    <Group gap={0}>
      <OverwatcherPill
        value={data?.cancelling ? 'Stop.' : data?.observing}
        nodata={nodata}
        customColour={data?.cancelling ? 'orange.9' : undefined}
        tooltipText={tooltipText}
      />
      <ObservingText data={data} />
    </Group>
  );
}

export default function OverwatcherTable() {
  const [data, , noData, refresh] = useAPICall<OverwatcherResponse>(
    '/overwatcher/status',
    { interval: 5000 }
  );

  const elements = [
    {
      key: 'running',
      label: 'Running',
      value: (
        <RunningGroup running={data?.running} nodata={noData} refreshData={refresh} />
      ),
    },
    {
      key: 'enabled',
      label: 'Enabled',
      value: <EnabledGroup data={data} nodata={noData} refreshData={refresh} />,
    },
    {
      key: 'observing',
      label: 'Observing',
      value: <ObservingGroup data={data} nodata={noData} />,
    },
    {
      key: 'calibrating',
      label: 'Calibrating',
      value: <CalibrationGroup data={data} nodata={noData} />,
    },
    {
      key: 'safe',
      label: 'Safe',
      value: <SafetyGroup data={data} nodata={noData} />,
    },
    {
      key: 'night',
      label: 'Night',
      value: <OverwatcherPill value={data?.night} nodata={noData} />,
    },
    {
      key: 'allow_calibrations',
      label: 'Allow calibrations',
      value: (
        <AllowCalibrationsGroup
          allow={data?.allow_calibrations}
          nodata={noData}
          running={data?.running}
          refreshData={refresh}
        />
      ),
    },
  ];

  return (
    <APITable
      title="Overwatcher"
      elements={elements}
      noData={noData}
      icon={<IconRobot />}
      refreshData={refresh}
      w={125}
    />
  );
}
