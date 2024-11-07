/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-11-07
 *  @Filename: notifications.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Box, Stack, Table, Text, Title } from '@mantine/core';
import { NotificationType } from './page';
import classes from './night-logs.module.css';

type NotificationsProps = {
  notifications: NotificationType[];
};

function formatDate(date: string) {
  const [dd, time] = date.split('T');
  return `${dd} ${time.split('.')[0]}`;
}

function formatPayload(payload: object | null) {
  if (payload === null) {
    return null;
  }

  const chunks = Object.keys(payload).map((key) => {
    return `${key}: ${payload[key as keyof typeof payload]}`;
  });

  return chunks.join(', ');
}

function getStyle(level: string) {
  if (level === 'error') {
    return { color: 'var(--mantine-color-red-9)' };
  } else if (level === 'warning') {
    return { color: 'var(--mantine-color-yellow-9)' };
  } else if (level === 'debug') {
    return { color: 'var(--mantine-color-gray-6)' };
  }
}

function NotificationRow(props: { notification: NotificationType }) {
  const { notification } = props;

  return (
    <Table.Tr style={getStyle(notification.level)}>
      <Table.Td miw={200}>{formatDate(notification.date)}</Table.Td>
      <Table.Td miw={100}>{notification.level}</Table.Td>
      <Table.Td>{notification.message}</Table.Td>
      <Table.Td miw={200}>{formatPayload(notification.payload)}</Table.Td>
    </Table.Tr>
  );
}

function NotificationsTable(props: NotificationsProps) {
  const { notifications } = props;

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Date</Table.Th>
          <Table.Th>Level</Table.Th>
          <Table.Th>Message</Table.Th>
          <Table.Th>Payload</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {notifications.map((notification, index) => (
          <NotificationRow key={index} notification={notification} />
        ))}
      </Table.Tbody>
    </Table>
  );
}

export default function Notifications(props: NotificationsProps) {
  const { notifications } = props;

  return (
    <Stack gap="sm">
      <Box w="100%">
        <Title order={3}>Notifications</Title>
        <hr className={classes.line} />
      </Box>
      {notifications.length > 0 ? (
        <NotificationsTable notifications={notifications} />
      ) : (
        <Text size="sm" fs="italic">
          No notifications yet.
        </Text>
      )}
    </Stack>
  );
}
