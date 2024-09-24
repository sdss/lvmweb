/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-09-23
 *  @Filename: page.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Container, Group, rem, Skeleton, Stack, Title } from '@mantine/core';
import fetchFromAPI from '@/src/actions/fetch-from-API';
import Exposures from './exposures';
import Header from './header';
import Observers from './observers';
import Sections from './sections';

export type NightLogMode = 'tonight' | 'history';

export type NightLogComment = {
  pk: number;
  date: string;
  comment: string;
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
  exposure_table: string | null;
};

async function fetchNightLogMJDs() {
  const mjds = await fetchFromAPI<number[]>('/logs/night-logs');
  return mjds;
}

async function ensureMJD() {
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

export default function NightLogsPage({ params }: { params: { mjd: string[] } }) {
  const [mjd, setMJD] = React.useState<number | null>(null);
  const [mjds, setMJDs] = React.useState<number[]>([]);
  const [data, setData] = React.useState<NightLogData | null>(null);

  const [mode, setMode] = React.useState<NightLogMode | null>(null);
  const [notFound, setNotFound] = React.useState<boolean>(false);
  const [pageLoading, setPageLoading] = React.useState<boolean>(true);
  const [dataLoading, setDataLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    fetchNightLogMJDs().then((mjds) => setMJDs(mjds));

    if (params.mjd && params.mjd.length > 0) {
      setMJD(parseInt(params.mjd[0], 10));
      setMode('history');
    } else {
      setMode('tonight');
    }
  }, [params.mjd]);

  React.useEffect(() => {
    if (mjd && mjds.length > 0 && mjds.indexOf(mjd) === -1) {
      setNotFound(true);
    }

    if (mjds.length > 0 && mjd !== null) {
      setPageLoading(false);
    }
  }, [mjds, mjd]);

  React.useEffect(() => {
    getMJDData(mjd)
      .then((data) => {
        setData(data);
        return data !== null;
      })
      .then((result) => setDataLoading(!result));
  }, [mjd]);

  React.useEffect(() => {
    if (!mode) {
      return;
    }

    if (mode === 'tonight') {
      ensureMJD()
        .then((mjd) => setMJD(mjd))
        .then(() => fetchNightLogMJDs().then((mjds) => setMJDs(mjds)));
      return;
    }

    if (!mjd && mjds) {
      setMJD(mjds[mjds.length - 1]);
    }
  }, [mode, mjd]);

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

  const refresh = React.useCallback(() => {
    getMJDData(mjd).then((data) => setData(data));
  }, [mjd]);

  if (pageLoading || dataLoading) {
    return (
      <Container size="xl">
        <Stack gap="xl" p={8} mt={2}>
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
        <Group>
          <Title order={1}>Night log for {mjd}</Title>
          <Box style={{ flexGrow: 1 }} />
          <Header mjds={mjds} mjd={mjd} mode={mode} setMode={setMode} setMJD={setMJD} />
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
            </>
          )}
        </Stack>
      </Stack>
    </Container>
  );
}
