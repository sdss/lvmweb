/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-25
 *  @Filename: ActorsTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import useAPICall from '@/src/hooks/use-api-call';
import useTask from '@/src/hooks/use-task';
import { ActionIcon, Box, Group, Pill, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHeartRateMonitor, IconRefresh } from '@tabler/icons-react';
import React from 'react';
import APIStatusText from '../../APIStatusText/APIStatusText';
import APITable from '../../APITable/APITable';
import ConfirmationModal from '../../ConfirmationModal/ConfirmationModal';
import classes from './ActorsTable.module.css';

type ActorHealthResponse = {
  actor: string;
  deployment_name: string;
  is_deployed: boolean;
  ping: boolean;
};

function HealthPills(props: { data: ActorHealthResponse; noData: boolean }) {
  const { data, noData } = props;

  return (
    <Group gap="xs">
      <Pill bg={data.is_deployed ? 'lime.9' : 'red.8'}>
        <APIStatusText size="xs" nodata={noData}>
          {data.is_deployed ? 'deployed' : 'not deployed'}
        </APIStatusText>
      </Pill>
      <Pill bg={data.ping ? 'lime.9' : 'red.8'}>
        <APIStatusText size="xs" nodata={noData}>
          {data.ping ? 'alive' : 'dead'}
        </APIStatusText>
      </Pill>
      <Pill bg="blue">
        <APIStatusText size="xs" nodata={noData}>
          Ready
        </APIStatusText>
      </Pill>
    </Group>
  );
}

function RetartActor(props: { actor: string; refreshData: () => void }) {
  const { actor, refreshData } = props;

  const [opened, { open, close }] = useDisclosure();
  const [runner, isRunning] = useTask({
    taskName: 'restart actor',
    notifyErrors: false,
  });

  const handleRestart = React.useCallback(() => {
    close();
    runner(`/actors/restart/${actor}`)
      .catch(() => {})
      .finally(refreshData);
  }, [actor]);

  return (
    <>
      <Tooltip label="Restart actor">
        <ActionIcon
          size="sm"
          onClick={open}
          disabled={isRunning}
          color="gray"
          className={classes.root}
        >
          <IconRefresh size={18} />
        </ActionIcon>
      </Tooltip>
      <ConfirmationModal
        opened={opened}
        close={close}
        title="Restart actor"
        handleAction={handleRestart}
        message={`Are you sure you want to restart ${actor}?`}
      />
    </>
  );
}

function HealthRow(props: {
  data: ActorHealthResponse;
  noData: boolean;
  refreshData: () => void;
}) {
  return (
    <Group>
      <HealthPills data={props.data} noData={props.noData} />
      <Box style={{ flexGrow: 1 }} />
      <RetartActor actor={props.data.actor} refreshData={props.refreshData} />
    </Group>
  );
}

export default function ActorsTable() {
  const [health, , noData, refresh] = useAPICall<ActorHealthResponse[]>(
    '/actors/health',
    {
      interval: 30000,
    }
  );

  if (!health) {
    // Just a few actors to make the skeleton look more realistic.
    return (
      <APITable
        title="Actors"
        elements={[
          { key: 'lvmecp', label: 'lvmecp', value: '' },
          { key: 'lvmtan', label: 'lvmtan', value: '' },
          { key: 'lvm.sci.agcam', label: 'lvm.sci.agcam', value: '' },
          { key: 'lvm.spec.agcam', label: 'lvm.spec.agcam', value: '' },
          { key: 'lvm.skye.agcam', label: 'lvm.skye.agcam', value: '' },
          { key: 'lvm.skyw.agcam', label: 'lvm.skyw.agcam', value: '' },
        ]}
        noData={noData}
        icon={<IconHeartRateMonitor />}
      />
    );
  }

  const elements = health?.map((actor) => ({
    key: actor.actor,
    label: actor.actor,
    value: <HealthRow data={actor} noData={noData} refreshData={refresh} />,
  }));

  return (
    <APITable
      title="Actors"
      elements={elements || []}
      noData={noData}
      icon={<IconHeartRateMonitor />}
    />
  );
}
