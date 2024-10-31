/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-05
 *  @Filename: page.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import { IconRefresh } from '@tabler/icons-react';
import {
  ActionIcon,
  Box,
  Container,
  Group,
  LoadingOverlay,
  NativeSelect,
  Skeleton,
  Stack,
  Table,
  Title,
  Tooltip,
} from '@mantine/core';
import fetchFromAPI from '@/src/actions/fetch-from-API';
import fetchTask from '@/src/actions/fetch-task';

type ExposureData = {
  exposure_no: number;
  mjd: number | null;
  obstime: string | null;
  image_type: string | null;
  exposure_time: number | null;
  ra: number | null;
  dec: number | null;
  airmass: number | null;
  lamps: { [k: string]: boolean } | null;
  n_standards: number | null;
  n_cameras: number | null;
  object: string | null;
};

async function fetchMJDs(): Promise<number[]> {
  const result = await fetchFromAPI<number[]>('/logs/exposures/mjds');
  return result;
}

async function fetchExposureListData(mjd: number): Promise<ExposureData[]> {
  const response = await fetchTask<{ [k: number]: ExposureData }>(
    `/logs/exposures/data/${mjd}?as_task=true`
  );

  return Object.values(response);
}

function ExposureListControls(props: {
  mjd: number | undefined;
  mjds: number[];
  forceRefresh: () => void;
  setCurrentMJD: (mjd: number) => void;
}) {
  const [selected, setSelected] = React.useState<string | undefined>(
    props.mjd?.toString()
  );

  const { mjds, setCurrentMJD, forceRefresh } = props;

  React.useEffect(() => {
    if (mjds.length === 0) {
      return;
    }

    if (!selected) {
      setSelected(mjds[mjds.length - 1].toString());
      setCurrentMJD(mjds[mjds.length - 1]);
    }
  }, [mjds, selected, setCurrentMJD]);

  if (mjds.length === 0) {
    return (
      <Group justify="flex-end" gap="lg">
        <Skeleton width={100} height={36} />
        <Skeleton width={36} height={36} />
      </Group>
    );
  }

  return (
    <Group justify="flex-end" gap="lg">
      <Tooltip label="Select MJD">
        <NativeSelect
          value={selected}
          onChange={(event) => {
            setSelected(event.currentTarget.value);
            setCurrentMJD(parseInt(event.currentTarget.value, 10));
          }}
          data={mjds.map((m) => m.toString())}
          h={36}
        />
      </Tooltip>
      <Tooltip label="Refresh" position="right">
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
  );
}

function ExposureDataTable(props: {
  data: ExposureData[] | undefined;
  reloading: boolean;
}) {
  if (!props.data) {
    return <Skeleton height="80vh" w="100%" />;
  }

  const { data, reloading = false } = props;

  const Header = [
    'Exp #',
    'MJD',
    'Obs. time',
    'Type',
    'Exp. time',
    'RA (sci)',
    'Dec (sci)',
    'Airmass',
    'Lamps',
    '# std',
    '# cameras',
    'Object',
  ].map((key) => <Table.Th key={key}>{key}</Table.Th>);

  const Rows = !data
    ? null
    : data.map((exp) => {
        const lamps: string[] = [];
        if (exp.lamps) {
          for (const [name, status] of Object.entries(exp.lamps)) {
            if (status) {
              lamps.push(name);
            }
          }
        }
        return (
          <Table.Tr key={exp.exposure_no}>
            <Table.Td>{exp.exposure_no}</Table.Td>
            <Table.Td>{exp.mjd}</Table.Td>
            <Table.Td>{exp.obstime?.split('T')[1]}</Table.Td>
            <Table.Td>{exp.image_type}</Table.Td>
            <Table.Td>{exp.exposure_time}</Table.Td>
            <Table.Td>{exp.ra}</Table.Td>
            <Table.Td>{exp.dec}</Table.Td>
            <Table.Td>{exp.airmass}</Table.Td>
            <Table.Td>{lamps.join(', ')}</Table.Td>
            <Table.Td>{exp.n_standards}</Table.Td>
            <Table.Td>{exp.n_cameras}</Table.Td>
            <Table.Td>{exp.object}</Table.Td>
          </Table.Tr>
        );
      });

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={reloading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <Table>
        <Table.Thead>
          <Table.Tr>{Header}</Table.Tr>
        </Table.Thead>
        <Table.Tbody>{Rows}</Table.Tbody>
      </Table>
    </Box>
  );
}

type ExposureListPageProps = {
  params: Promise<{ mjd: string[] }>;
};

export default function ExposureListPage(props: ExposureListPageProps) {
  const paramsUse = React.use(props.params);

  const [data, setData] = React.useState<ExposureData[] | undefined>(undefined);
  const [mjds, setMJDs] = React.useState<number[]>([]);
  const [currentMJD, setCurrentMJD] = React.useState<number | undefined>(
    paramsUse.mjd ? parseInt(paramsUse.mjd[0], 10) : undefined
  );
  const [reloading, setReloading] = React.useState(false);

  const forceRefresh = React.useCallback(
    (showReloading: boolean = true) => {
      if (!currentMJD) {
        return;
      }

      if (showReloading) {
        setReloading(true);
      }

      fetchExposureListData(currentMJD)
        .then(setData)
        .then(() => setReloading(false));
    },
    [currentMJD]
  );

  React.useEffect(() => {
    fetchMJDs().then(setMJDs);
  }, []);

  React.useEffect(() => {
    forceRefresh(true);
    const interval = setInterval(() => forceRefresh(false), 60000);

    return () => clearInterval(interval);
  }, [currentMJD, forceRefresh]);

  return (
    <>
      <Container size="xl">
        <Stack p={8} mt={2} gap="md">
          <Title order={1}>Exposure List</Title>
          <ExposureListControls
            mjd={currentMJD}
            mjds={mjds}
            forceRefresh={forceRefresh}
            setCurrentMJD={setCurrentMJD}
          />
          <ExposureDataTable data={data} reloading={reloading} />
        </Stack>
      </Container>
    </>
  );
}
