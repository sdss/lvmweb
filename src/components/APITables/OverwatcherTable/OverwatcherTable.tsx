/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-19
 *  @Filename: OverwatcherTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import { IconRobot } from '@tabler/icons-react';
import {
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Pill,
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
  allow_calibrations: boolean;
  safe: boolean | null;
  night: boolean | null;
  running_calibration: string | null;
  tile_id: number | null;
  dither_position: number | null;
  stage: string | null;
  standard_no: number | null;
};

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
};

function RunningGroup(props: RunningGroupProps) {
  const { running, nodata } = props;

  const [opened, { open: openModal, close: closeModal }] = useDisclosure();

  const [runner, taskRunning] = useTask<boolean>({ taskName: 'cleanup' });
  const authStatus = React.useContext(AuthContext);

  const runCleanup = React.useCallback(async () => {
    closeModal();
    runner('/macros/cleanup', true).catch(() => {});
  }, [runner, closeModal]);

  return (
    <Group>
      <OverwatcherPill value={running} nodata={nodata} useErrorColour />
      <Tooltip label={authStatus.logged ? 'Run cleanup' : 'Authentication needed'}>
        <Button
          size="compact-xs"
          variant="light"
          disabled={!authStatus.logged || taskRunning}
          onClick={openModal}
          mr={8}
        >
          Run cleanup
        </Button>
      </Tooltip>
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

  const [isOn, setOn] = React.useState(data?.enabled || false);
  const authStatus = React.useContext(AuthContext);

  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure();

  React.useEffect(() => {
    setOn(enabled || false);
  }, [enabled]);

  const handleEnabledChange = React.useCallback(() => {
    if (!isOn || !observing) {
      // Send API request to change value to enabled.
      const route = '/overwatcher/status';
      const fullRoute = isOn ? `${route}/disable` : `${route}/enable`;
      fetchFromAPI(fullRoute, { method: 'PUT' }, true)
        .then(() => setOn((prev) => !prev))
        .catch(() => {})
        .finally(props.refreshData);
    } else {
      // Use modal to confirm disabling.
      openModal();
    }
  }, [isOn]);

  return (
    <Group>
      <OverwatcherPill value={enabled} nodata={nodata} />
      <Tooltip label="Enable/disable the Overwatcher">
        <Switch
          size="md"
          pr={8}
          checked={isOn === true}
          onChange={handleEnabledChange}
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
  const [isDisabling, setDisabling] = React.useState(false);

  const handleDisable = React.useCallback(
    (now: boolean) => {
      setDisabling(true);
      fetchFromAPI(`/overwatcher/status/disable?now=${now}`, { method: 'PUT' }, true)
        .catch(() => {})
        .finally(() => {
          setDisabling(false);
          close();
          refreshData?.();
        });
    },
    [close]
  );

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Are you sure that you want to disable the Overwatcher?"
      size="lg"
    >
      <Group justify="end" pt={16}>
        <Button
          variant="default"
          onClick={props.close}
          disabled={isDisabling}
          style={{ cursor: isDisabling ? 'no-drop' : undefined }}
        >
          Cancel
        </Button>
        <Button
          color="blue"
          onClick={() => handleDisable(false)}
          disabled={isDisabling}
          style={{ cursor: isDisabling ? 'no-drop' : undefined }}
        >
          After this tile
        </Button>
        <Button
          color="red"
          onClick={() => handleDisable(true)}
          disabled={isDisabling}
          style={{ cursor: isDisabling ? 'no-drop' : undefined }}
        >
          Immediately
        </Button>
      </Group>
    </Modal>
  );
}

interface DomeCalibrationsGroupProps {
  nodata: boolean;
  allow?: boolean;
  running?: boolean;
  refreshData: () => void;
}

function CalibrationsGroup(props: DomeCalibrationsGroupProps) {
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

function CalibrationGroup(props: {
  data: OverwatcherResponse | null;
  nodata: boolean;
}) {
  const { data, nodata } = props;

  const tooltipText = `Running calibration: ${data?.running_calibration || ''}`;

  return (
    <Group gap="xs">
      <OverwatcherPill value={data?.calibrating} nodata={nodata} />
      <APIStatusText
        nodata={nodata}
        defaultTooltipText={tooltipText}
        size="xs"
        style={{
          paddingRight: 16,
          maxWidth: 190,
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          textAlign: 'right',
        }}
      >
        {data?.running_calibration}
      </APIStatusText>
    </Group>
  );
}

function ObservingText(props: { data: OverwatcherResponse | null }) {
  const { data } = props;

  if (!data || !data?.observing || !data.tile_id) {
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
      gap={5}
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
    <Group gap="xs">
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
      value: <RunningGroup running={data?.running} nodata={noData} />,
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
      value: <OverwatcherPill value={data?.safe} nodata={noData} noColor="red.9" />,
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
        <CalibrationsGroup
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
      w={120}
    />
  );
}
