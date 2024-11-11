/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-09-23
 *  @Filename: page.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconExclamationCircle, IconInfoCircle } from '@tabler/icons-react';
import {
  Alert,
  Box,
  Container,
  Group,
  rem,
  Skeleton,
  Stack,
  Title,
} from '@mantine/core';
import { useForceUpdate, useInterval } from '@mantine/hooks';
import fetchFromAPI from '@/src/actions/fetch-from-API';
import CopySend, { EmailButton } from './copy-send';
import Exposures from './exposures';
import Header from './header';
import Notifications from './notifications';
import Observers from './observers';
import Sections from './sections';

export type NightLogMode = 'tonight' | 'history';

export type NightLogComment = {
  pk: number;
  date: string;
  comment: string;
};

export type NotificationType = {
  date: string;
  message: string;
  level: string;
  payload: object | null;
};

export type NightMetrics = {
  sjd: number;
  twilight_start: number;
  twilight_end: number;
  night_length: number;
  n_object_exps: number;
  total_exp_time: number;
  time_lost: number;
  efficiency_no_readout: number;
  efficiency_readout: number;
  efficiency_nominal: number;
  night_started: boolean;
  night_ended: boolean;
};

export type NightLogData = {
  mjd: number;
  current: boolean;
  exists: boolean;
  sent: boolean;
  observers: string | null;
  comments: {
    issues: NightLogComment[];
    weather: NightLogComment[];
    other: NightLogComment[];
  };
  metrics: NightMetrics;
  exposure_table: string | null;
  notifications: NotificationType[];
};

async function fetchNightLogMJDs() {
  const mjds = await fetchFromAPI<number[]>('/logs/night-logs');
  return mjds;
}

async function createMJD() {
  const current_mjd = await fetchFromAPI<number>('/logs/night-logs/create');
  return current_mjd;
}

async function getMJDData(mjd: number | null) {
  if (!mjd) {
    return null;
  }

  const data = await fetchFromAPI<NightLogData>(`/logs/night-logs/${mjd}`);

  return data;
}

type NightLogsPageProps = {
  params: Promise<{ mjd: string[] }>;
};

export default function NightLogsPage(props: NightLogsPageProps) {
  const paramsUse = React.use(props.params);

  const [mjd, setMJD] = React.useState<number | null>(null);
  const [data, setData] = React.useState<NightLogData | null>(null);

  const mjds = React.useRef<number[]>([]);

  const [mode, setMode] = React.useState<NightLogMode | null>(null);
  const [notFound, setNotFound] = React.useState<boolean>(false);

  const [mjdsLoading, setMJDsLoading] = React.useState<boolean>(true);
  const [pageLoading, setPageLoading] = React.useState<boolean>(true);
  const [dataLoading, setDataLoading] = React.useState<boolean>(true);

  const pathname = usePathname();

  const forceUpdate = useForceUpdate();
  useInterval(
    () => {
      refresh().then(forceUpdate);
    },
    600000,
    { autoInvoke: true }
  );

  React.useEffect(() => {
    fetchNightLogMJDs().then((newMJDs) => {
      mjds.current = newMJDs;
      setMJDsLoading(false);
    });
  }, []);

  React.useEffect(() => {
    if (paramsUse.mjd && paramsUse.mjd.length > 0) {
      const newMJD = Number(paramsUse.mjd[0]);
      setMJD(newMJD);
    }
  }, [paramsUse.mjd]);

  React.useEffect(() => {
    if (mjdsLoading) {
      return;
    }

    if (!mjd) {
      createMJD().then((newMJD) => {
        setMJD(newMJD);
        if (mjds.current.length > 0 && mjds.current.indexOf(newMJD) === -1) {
          mjds.current.push(newMJD);
        }
      });
      return;
    }

    if (mjd && mjds.current.length > 0 && mjds.current.indexOf(mjd) === -1) {
      setNotFound(true);
      return;
    }

    setPageLoading(false);

    if (!pathname.startsWith(`/night-logs/${mjd}`)) {
      window.history.pushState(null, '', `/night-logs/${mjd}`);
    }

    getMJDData(mjd)
      .then((data) => {
        setData(data);
        if (data !== null && data.current) {
          setMode('tonight');
        } else {
          setMode('history');
        }
        return data !== null;
      })
      .then((result) => setDataLoading(!result));
  }, [mjdsLoading, mjd]);

  React.useEffect(() => {
    if (mjdsLoading) {
      return;
    }

    if (mode === 'tonight') {
      setMJD(mjds.current[mjds.current.length - 1]);
    }
  }, [mjdsLoading, mode]);

  if (notFound && !pageLoading && mjd) {
    return (
      <Box>
        <Title order={3} ta="center" pt="40vh">
          Night log for MJD {mjd} not found in database. Go to the{' '}
          <Link
            href="/night-logs/"
            style={{ textDecoration: 'underline', textUnderlineOffset: rem(2) }}
          >
            last record
          </Link>
          .
        </Title>
      </Box>
    );
  }

  const refresh = React.useCallback(async () => {
    getMJDData(mjd).then((data) => setData(data));
  }, [mjd]);

  if (pageLoading || dataLoading) {
    return (
      <Container size="xl">
        <Stack gap="xl" p={8} mt={2}>
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={400} />
          <Skeleton height="80vh" />
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Stack p={8} mt={2} gap="xl">
        <Alert
          variant="light"
          color={data && data.sent ? 'blue.6' : 'yellow.8'}
          icon={data && data.sent ? <IconInfoCircle /> : <IconExclamationCircle />}
        >
          <Group>
            <Box>
              {data && data.sent
                ? 'This night log has already been emailed.'
                : 'This night log has not been emailed yet.'}
            </Box>
            <Box style={{ flexGrow: 1 }} />
            {data && !data.sent && (
              <EmailButton mjd={mjd} variant="subtle" label="Email" refresh={refresh} />
            )}
          </Group>
        </Alert>

        <Group>
          <Title order={1}>Night log for {mjd}</Title>
          <Box style={{ flexGrow: 1 }} />
          <Header
            mjds={mjds.current}
            mjd={mjd}
            mode={mode}
            setMode={setMode}
            setMJD={setMJD}
          />
        </Group>
        <Observers data={data} mjd={mjd} current={data !== null && data.current} />
        <Stack gap={50}>
          {data && (
            <>
              <Sections
                data={data}
                mjd={mjd}
                refresh={refresh}
                current={data !== null && data.current}
              />
              <Exposures exposure_data={data.exposure_table} />
              <Notifications notifications={data.notifications} />
            </>
          )}
        </Stack>
        <CopySend mjd={mjd} refresh={refresh} sent={data !== null && data.sent} />
      </Stack>
    </Container>
  );
}
