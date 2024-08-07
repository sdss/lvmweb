/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-05
 *  @Filename: page.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import fetchFromAPI from '@/src/actions/fetchFromAPI';
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
import { IconRefresh } from '@tabler/icons-react';
import React from 'react';

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
  const result = await fetchFromAPI<number[]>('/log/mjds');
  return result;
}

async function fetchNightLogData(mjd: number): Promise<ExposureData[]> {
  const task_id = await fetchFromAPI<string>(`/log/exposures/data/${mjd}?as_task=true`);

  let data: ExposureData[];

  while (true) {
    const result = await fetchFromAPI<boolean>(`/tasks/${task_id}/ready`);
    if (result) {
      const response = await fetchFromAPI<any>(`/tasks/${task_id}/result`);
      data = Object.values(response.return_value);
      break;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }

  return data;
}

function NightLogControls(props: {
  mjds: number[];
  forceRefresh: () => void;
  setCurrentMJD: (mjd: number) => void;
}) {
  const [selected, setSelected] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (props.mjds.length === 0) return;

    if (!selected) {
      setSelected(props.mjds[props.mjds.length - 1].toString());
    }
  }, [props.mjds]);

  if (props.mjds.length === 0) {
    return (
      <Group justify="flex-end" gap="lg">
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
          props.setCurrentMJD(parseInt(event.currentTarget.value, 10));
        }}
        data={props.mjds.map((m) => m.toString())}
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

function ExposureDataTable(props: {
  data: ExposureData[] | undefined;
  reloading: boolean;
}) {
  if (!props.data) {
    return <Skeleton height={600} w="100%" />;
  }

  const { data, reloading = false } = props;

  const Header = [
    'Exp #',
    'MJD',
    'Obs. time',
    'Type',
    'Exp. time',
    'RA',
    'Dec',
    'Airmass',
    'Lamps',
    '# std',
    '# cameras',
    'Object',
  ].map((key) => <Table.Th key={key}>{key}</Table.Th>);

  const Rows = !data
    ? null
    : data.map((exp) => {
        // const lamps = exp.lamps ? exp.lamps.forEach((name, status)) : [];
        // console.log(lamps);
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

export default function NightLogPage() {
  const [data, setData] = React.useState<ExposureData[] | undefined>(undefined);
  const [mjds, setMJDs] = React.useState<number[]>([]);
  const [currentMJD, setCurrentMJD] = React.useState<number | undefined>(undefined);
  const [reloading, setReloading] = React.useState(false);

  const forceRefresh = React.useCallback(
    (showReloading: boolean = true) => {
      if (!currentMJD) return;

      if (showReloading) {
        setReloading(true);
      }

      fetchNightLogData(currentMJD)
        .then(setData)
        .then(() => setReloading(false));
    },
    [currentMJD]
  );

  React.useEffect(() => {
    fetchMJDs().then(setMJDs);
  }, []);

  React.useEffect(() => {
    if (!currentMJD) {
      setCurrentMJD(mjds[mjds.length - 1]);
    }
  }, [mjds]);

  React.useEffect(forceRefresh, [currentMJD]);

  React.useEffect(() => {
    const interval = setInterval(() => forceRefresh(false), 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Container size="xl">
        <Stack p={8} mt={2} gap="md">
          <Title order={1}>Night Log</Title>
          <NightLogControls
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
