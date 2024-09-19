/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-09-18
 *  @Filename: plots.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Stack, Table, Title } from '@mantine/core';
import { ValveTimesType } from './types';

function toTime(date: string | null) {
  if (!date) {
    return null;
  }

  return date.split('T')[1].split('.')[0];
}

export function EventTimesTable(props: {
  start_time: string | null;
  end_time: string | null;
  purge_start: string | null;
  purge_complete: string | null;
  fill_start: string | null;
  fill_complete: string | null;
  fail_time: string | null;
  abort_time: string | null;
}) {
  const elements = [
    { name: 'Start time', value: toTime(props.start_time) },
    { name: 'End time', value: toTime(props.end_time) },
    { name: 'Purge start', value: toTime(props.purge_start) },
    { name: 'Purge complete', value: toTime(props.purge_complete) },
    { name: 'Fill start', value: toTime(props.fill_start) },
    { name: 'Fill complete', value: toTime(props.fill_complete) },
    { name: 'Fail time', value: toTime(props.fail_time) },
    { name: 'Abort time', value: toTime(props.abort_time) },
  ];

  const rows = elements.map((element) => (
    <Table.Tr key={element.name}>
      <Table.Td>{element.name}</Table.Td>
      <Table.Td>{element.value}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Box>
      <Stack gap="sm">
        <Title order={2} c="dark.2">
          Event times
        </Title>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Event</Table.Th>
              <Table.Th>Time</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Stack>
    </Box>
  );
}

export function OpenTimesTable(props: { valve_times: ValveTimesType | null }) {
  const elements: {
    valve: string;
    open_time: string | null;
    close_time: string | null;
    elapsed: string | null;
    timeout: string | null;
  }[] = [];

  for (const cam of ['purge', 'b1', 'r1', 'z1', 'b2', 'r2', 'z2', 'b3', 'r3', 'z3']) {
    if (props.valve_times && cam in props.valve_times) {
      const { open_time, close_time } = props.valve_times[cam];

      if (open_time && close_time) {
        const open_time_date = new Date(open_time);
        const close_time_date = new Date(close_time);
        const elapsed = (Number(close_time_date) - Number(open_time_date)) / 1000;
        elements.push({
          valve: cam,
          open_time: toTime(open_time),
          close_time: toTime(close_time),
          elapsed: elapsed.toFixed(1),
          timeout: props.valve_times[cam].timed_out ? 'Y' : '',
        });
      }
    }
  }

  const rows = elements.map((element) => (
    <Table.Tr key={element.valve}>
      <Table.Td>{element.valve}</Table.Td>
      <Table.Td>{element.open_time}</Table.Td>
      <Table.Td>{element.close_time}</Table.Td>
      <Table.Td ta="right">{element.elapsed}</Table.Td>
      <Table.Td ta="center">{element.timeout}</Table.Td>
    </Table.Tr>
  ));

  if (!props.valve_times) {
    return null;
  }

  return (
    <Box>
      <Stack gap="sm">
        <Title order={2} c="dark.2">
          Valve open/close times
        </Title>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Valve</Table.Th>
              <Table.Th>Open</Table.Th>
              <Table.Th>Close</Table.Th>
              <Table.Th ta="right">Elapsed (s)</Table.Th>
              <Table.Th ta="center">Timeout?</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Stack>
    </Box>
  );
}
