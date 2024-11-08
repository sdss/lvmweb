/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-05
 *  @Filename: page.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import { IconDownload, IconRefresh } from '@tabler/icons-react';
import {
  ActionIcon,
  Box,
  Code,
  Container,
  Group,
  LoadingOverlay,
  NativeSelect,
  rem,
  ScrollArea,
  Skeleton,
  Stack,
  Switch,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import fetchFromAPI from '@/src/actions/fetch-from-API';
import fetchTask from '@/src/actions/fetch-task';

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

async function downloadLog(mjd: string | undefined): Promise<void> {
  if (!mjd) {
    // This function won't be called with an undefined mjd, but just in case.
    return;
  }

  const data = await fetchLogData(mjd, -1);

  // See https://stackoverflow.com/questions/72706000/nextjs-api-download-buffer-into-browser
  const dataBlob = new Blob([data], { type: 'text/utf-8' });
  const url = URL.createObjectURL(dataBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lvmgort_${mjd}.log`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function LogControls(props: {
  mjd: string | undefined;
  mjds: string[];
  autorefresh: boolean;
  nLines: number;
  forceRefresh: () => void;
  setCurrentMJD: (mjd: string) => void;
  setAutorefresh: (autorefresh: boolean) => void;
  setNLines: (nLines: number) => void;
}) {
  const [selected, setSelected] = React.useState<string | undefined>(props.mjd);
  const [nLinesSelect, setNLinesSelect] = React.useState<string>('1000');
  const [downloading, setDownloading] = React.useState(false);

  const {
    mjds,
    autorefresh,
    setCurrentMJD,
    setAutorefresh,
    nLines,
    setNLines,
    forceRefresh,
  } = props;

  React.useEffect(() => {
    if (mjds.length === 0) {
      return;
    }

    if (!selected) {
      setSelected(mjds[mjds.length - 1].toString());
      setCurrentMJD(mjds[mjds.length - 1]);
      setNLines(1000);
    }
  }, [mjds, selected, setCurrentMJD, setNLines]);

  if (mjds.length === 0) {
    return (
      <Group justify="flex-end" gap="lg">
        <Skeleton width={100} height={36} />
        <Skeleton width={100} height={36} />
        <Skeleton width={36} height={36} />
      </Group>
    );
  }

  return (
    <Group justify="flex-start" gap="lg">
      <Tooltip label="Enable/disable auto-refresh">
        <Switch
          label={autorefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          style={{ top: rem(8) }}
          size="md"
          checked={autorefresh}
          onChange={(event) => setAutorefresh(event.currentTarget.checked)}
          disabled={nLines >= 10000 || nLines === -1}
        />
      </Tooltip>
      <Box style={{ flexGrow: 1 }} />
      <Group gap="xs">
        <Tooltip label="Select MJD">
          <NativeSelect
            value={selected}
            onChange={(event) => {
              setSelected(event.currentTarget.value);
              setCurrentMJD(event.currentTarget.value);
            }}
            data={mjds.map((m) => m.toString())}
            h={36}
          />
        </Tooltip>
        <Tooltip label="Number of lines to show">
          <NativeSelect
            value={nLinesSelect}
            onChange={(event) => {
              setNLinesSelect(event.currentTarget.value);
              setNLines(parseInt(event.currentTarget.value, 10));
            }}
            ml={8}
            data={[
              { label: '100', value: '100' },
              { label: '1000', value: '1000' },
              { label: '10000', value: '10000' },
              { label: '100000', value: '100000' },
              { label: 'Unlimited', value: '-1' },
            ]}
            h={36}
          />
        </Tooltip>
        <Tooltip label={downloading ? 'Downloading log' : 'Download log'}>
          <ActionIcon
            h={36}
            w={36}
            ml={8}
            mr={-4}
            variant="transparent"
            color="dark.0"
            disabled={props.mjd === undefined}
            onClick={() => {
              setDownloading(true);
              downloadLog(props.mjd).finally(() => setDownloading(false));
            }}
            loading={downloading}
          >
            <IconDownload />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Refresh log" position="right">
          <ActionIcon
            h={36}
            w={36}
            variant="transparent"
            color="dark.0"
            onClick={forceRefresh}
          >
            <IconRefresh />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
}

function formatLine(line: string, key: number): React.ReactElement {
  let bgColor = 'inherit';
  if (line.includes('- ERROR -') || line.includes('- CRITICAL -')) {
    bgColor = 'red.9';
  }

  let color = 'inherit';
  if (line.includes('- DEBUG -')) {
    color = 'gray.6';
  } else if (line.includes('- WARNING -')) {
    color = 'yellow.7';
  }

  return (
    <Text key={key} size="xs" c={color} bg={bgColor} px={16}>
      {line}
    </Text>
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
      <ScrollArea h="80vh" mih="80vh" viewportRef={ref}>
        <Code block px={0} py={16}>
          {props.data.split('\n').map((line, index) => formatLine(line, index))}
        </Code>
      </ScrollArea>
    </Box>
  );
}

export default function GortLogPage({
  params,
}: {
  params: Promise<{ mjd: string[] }>;
}) {
  const paramsUse = React.use(params);

  const [data, setData] = React.useState<string | undefined>(undefined);
  const [mjds, setMJDs] = React.useState<string[]>([]);
  const [currentMJD, setCurrentMJD] = React.useState<string | undefined>(
    paramsUse.mjd ? paramsUse.mjd[0] : undefined
  );
  const [nLines, setNLines] = React.useState<number>(1000);
  const [reloading, setReloading] = React.useState(false);
  const [autorefresh, setAutorefresh] = React.useState(true);

  const forceRefresh = React.useCallback(
    async (showReloading: boolean = true) => {
      if (!currentMJD) {
        return;
      }

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
    forceRefresh().then(() =>
      setAutorefresh(() => {
        if (nLines >= 10000 || nLines === -1) {
          return false;
        }
        return true;
      })
    );
  }, [nLines, forceRefresh]);

  React.useEffect(() => {
    if (!autorefresh) {
      return () => {};
    }

    forceRefresh();
    const interval = setInterval(forceRefresh, 30000);

    return () => clearInterval(interval);
  }, [currentMJD, forceRefresh, autorefresh]);

  return (
    <>
      <Container size="xl">
        <Stack p={8} mt={2} gap="md">
          <Title order={1}>GORT Log</Title>
          <LogControls
            mjd={currentMJD}
            mjds={mjds}
            autorefresh={autorefresh}
            nLines={nLines}
            forceRefresh={forceRefresh}
            setCurrentMJD={setCurrentMJD}
            setAutorefresh={setAutorefresh}
            setNLines={setNLines}
          />
          <LogDisplay data={data} reloading={reloading} />
        </Stack>
      </Container>
    </>
  );
}
