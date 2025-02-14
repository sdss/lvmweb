/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-09-18
 *  @Filename: page.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Grid,
  rem,
  Skeleton,
  Stack,
  Title,
  useMatches,
} from '@mantine/core';
import ErrorAlert from './error-alert';
import { fetchFillData, fetchFillList } from './fetchData';
import { Header } from './header';
import { LogDisplay } from './log';
import { Plots } from './plots';
import { EventTimesTable, OpenTimesTable } from './tables';
import { FillListType, FillMetadataType } from './types';

function DataSkeleton() {
  return (
    <Stack gap="md">
      <Skeleton h="20vh" />
      <Skeleton h="80vh" />
    </Stack>
  );
}

function FillData(props: { data: FillMetadataType }) {
  const twoCol = useMatches({
    md: false,
    lg: true,
  });

  return (
    <Stack gap="md" pt={12}>
      <ErrorAlert error={props.data.error} />
      <Grid>
        <Grid.Col span={twoCol ? 5 : 12} px={12}>
          <EventTimesTable
            start_time={props.data.start_time}
            end_time={props.data.end_time}
            purge_start={props.data.purge_start}
            purge_complete={props.data.purge_complete}
            fill_start={props.data.fill_start}
            fill_complete={props.data.fill_complete}
            fail_time={props.data.fail_time}
            abort_time={props.data.abort_time}
          />
        </Grid.Col>
        <Grid.Col span={twoCol ? 7 : 12} pt={twoCol ? undefined : 12} px={12}>
          <OpenTimesTable valve_times={props.data.valve_times} />
        </Grid.Col>
      </Grid>
      <LogDisplay data={props.data.log_data} />
      <Plots plot_data={props.data.plot_data} />
    </Stack>
  );
}

type FillPageProps = {
  params: Promise<{ pk: string[] }>;
};

export default function FillPage(props: FillPageProps) {
  const paramsUse = React.use(props.params);

  const [pk, setPK] = React.useState<number | null>(null);

  const [pks, setPKs] = React.useState<number[]>([]);
  const [records, setRecords] = React.useState<FillListType>(new Map());

  const [fillData, setFillData] = React.useState<FillMetadataType | null>(null);

  const [notFound, setNotFound] = React.useState<boolean>(false);

  const router = useRouter();

  React.useEffect(() => {
    if (pks.length === 0) {
      fetchFillList().then((response) => {
        setRecords(response);
        setPKs(Array.from(response.keys()));
      });
      return;
    }

    if (!paramsUse.pk || paramsUse.pk.length === 0) {
      router.push(`/fills/${pks[pks.length - 1]}`);
      return;
    }

    const paramPK = Number(paramsUse.pk[0]);
    if (!pks.includes(paramPK)) {
      setNotFound(true);
      setPK(paramPK);
      return;
    }

    setPK(paramPK);
    setNotFound(false);
  }, [paramsUse.pk, pks]);

  React.useEffect(() => {
    if (pk === null || notFound) {
      return;
    }

    fetchFillData(pk).then((response) => {
      setFillData(response);
    });

    setFillData(null);
  }, [pk, notFound]);

  if (!pk) {
    return;
  }

  if (notFound) {
    return (
      <Box>
        <Title order={3} ta="center" pt="40vh">
          Fill record {pk} not found in database. Go to{' '}
          <Link
            href="/fills/"
            style={{ textDecoration: 'underline', textUnderlineOffset: rem(2) }}
          >
            last record
          </Link>
          .
        </Title>
      </Box>
    );
  }

  return (
    <Container size="xl">
      <Stack p={8} mt={2} gap="xl">
        <Title order={1}>
          LN<sub>2</sub> fill log
        </Title>
        <Header
          pk={pk}
          records={records}
          complete={fillData ? fillData.complete : false}
          status={
            !fillData
              ? null
              : !fillData.failed && !fillData.aborted && fillData.error === null
          }
        />
        {!fillData ? <DataSkeleton /> : <FillData data={fillData} />}
      </Stack>
    </Container>
  );
}
