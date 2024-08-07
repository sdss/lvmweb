/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-05
 *  @Filename: page.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import fetchFromAPI from '@/src/actions/fetch-from-API';
import fetchTask from '@/src/actions/fetch-task';
import {
  ActionIcon,
  Box,
  Code,
  Container,
  Group,
  LoadingOverlay,
  NativeSelect,
  ScrollArea,
  Skeleton,
  Stack,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import React from 'react';

async function fetchMJDs(): Promise<string[]> {
  const result = await fetchFromAPI<string[]>('/overwatcher/logs');
  return result.map((logPath) => logPath.split('.')[0]);
}

async function fetchLogData(mjd: string, n_lines: number = -1): Promise<string> {
  let route = `/overwatcher/logs/${mjd}?as_task=true`;
  if (n_lines > 0) {
    route += `&n_lines=${n_lines}`;
  }

  const response = await fetchTask<string>(route);
  return response;
}

function LogControls(props: {
  mjds: string[];
  forceRefresh: () => void;
  setCurrentMJD: (mjd: string) => void;
  setNLines: (nLines: number) => void;
}) {
  const [selected, setSelected] = React.useState<string | undefined>(undefined);
  const [nLinesSelect, setNLinesSelect] = React.useState<string>('1000');

  React.useEffect(() => {
    if (props.mjds.length === 0) return;

    if (!selected) {
      setSelected(props.mjds[props.mjds.length - 1].toString());
      props.setCurrentMJD(props.mjds[props.mjds.length - 1]);
      props.setNLines(1000);
    }
  }, [props.mjds]);

  if (props.mjds.length === 0) {
    return (
      <Group justify="flex-end" gap="lg">
        <Skeleton width={100} height={36} />
        <Skeleton width={100} height={36} />
        <Skeleton width={36} height={36} />
      </Group>
    );
  }

  return (
    <Group justify="flex-end" gap="lg">
      <NativeSelect
        value={selected}
        onChange={(event) => {
          setSelected(event.currentTarget.value);
          props.setCurrentMJD(event.currentTarget.value);
        }}
        data={props.mjds.map((m) => m.toString())}
        h={36}
      />
      <NativeSelect
        value={nLinesSelect}
        onChange={(event) => {
          setNLinesSelect(event.currentTarget.value);
          props.setNLines(parseInt(event.currentTarget.value, 10));
        }}
        data={[
          { label: '100', value: '100' },
          { label: '1000', value: '1000' },
          { label: '10000', value: '10000' },
          { label: '100000', value: '100000' },
          { label: 'Unlimited', value: '-1' },
        ]}
        h={36}
      />
      <Tooltip label="Refresh" position="right">
        <ActionIcon
          h={36}
          w={36}
          variant="transparent"
          color="dark.0"
          onClick={props.forceRefresh}
        >
          <IconRefresh />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}

function LogDisplay(props: { data: string | undefined; reloading: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current && !props.reloading) {
      ref.current.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
    }
  }, [props.reloading]);

  if (!props.data) {
    return <Skeleton height="80vh" w="100%" />;
  }

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={props.reloading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <ScrollArea h="80vh" viewportRef={ref}>
        <Code block style={{ padding: 16 }}>
          {props.data}
        </Code>
      </ScrollArea>
    </Box>
  );
}

export default function GortLogPage() {
  const [data, setData] = React.useState<string | undefined>(undefined);
  const [mjds, setMJDs] = React.useState<string[]>([]);
  const [currentMJD, setCurrentMJD] = React.useState<string | undefined>(undefined);
  const [nLines, setNLines] = React.useState<number>(1000);
  const [reloading, setReloading] = React.useState(false);

  const forceRefresh = React.useCallback(
    (showReloading: boolean = true) => {
      if (!currentMJD) return;

      if (showReloading) {
        setReloading(true);
      }

      fetchLogData(currentMJD, nLines)
        .then(setData)
        .then(() => setReloading(false));
    },
    [currentMJD, nLines]
  );

  React.useEffect(() => {
    fetchMJDs().then(setMJDs);
  }, []);

  React.useEffect(() => {
    forceRefresh();
    const interval = setInterval(forceRefresh, 60000);

    return () => clearInterval(interval);
  }, [currentMJD, nLines]);

  return (
    <>
      <Container size="xl">
        <Stack p={8} mt={2} gap="md">
          <Title order={1}>GORT Log</Title>
          <LogControls
            mjds={mjds}
            forceRefresh={forceRefresh}
            setCurrentMJD={setCurrentMJD}
            setNLines={setNLines}
          />
          <LogDisplay data={data} reloading={reloading} />
        </Stack>
      </Container>
    </>
  );
}
