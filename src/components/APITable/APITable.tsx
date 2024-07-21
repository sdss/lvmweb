/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-20
 *  @Filename: APITable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import { APICallStatus } from '@/src/hooks/use-api-call';
import { Box, Group, Paper, Skeleton, Table, Text, Title, Tooltip } from '@mantine/core';
import { IconAlertTriangle, IconSunrise } from '@tabler/icons-react';
import React from 'react';
import APIStatusText from '../APIStatusText/APIStatusText';
import classses from './APITable.module.css';

type Elements = { key: string; label: string; value: any | undefined }[];

function WarningIcon() {
  return (
    <Tooltip label="Error retrieving data">
      <IconAlertTriangle color="var(--mantine-color-yellow-9)" />
    </Tooltip>
  );
}

export default function APITable(props: {
  title: string;
  elements: Elements;
  status: APICallStatus;
}) {
  const { title, elements, status } = props;

  const [isError, setIsError] = React.useState(false);

  React.useEffect(() => {
    // Once the status changes to ERROR, do not change it back until a explicit OK.
    if (status === APICallStatus.ERROR) {
      setIsError(true);
      return;
    }

    if (status === APICallStatus.OK) {
      setIsError(false);
      return;
    }
  }, [status]);

  const getValue = React.useCallback(
    (value: any) => {
      if (status === APICallStatus.NODATA || value === undefined) {
        return <Skeleton height={10} mr={10} miw={100} />;
      }

      if (value === undefined) {
        return '';
      }

      if (React.isValidElement(value)) {
        return value;
      }

      return <APIStatusText error={isError}>{value}</APIStatusText>;
    },
    [status]
  );

  const rows = elements.map((element) => (
    <Table.Tr key={element.key}>
      <Table.Td>
        <Text size="sm">{element.label}</Text>
      </Table.Td>
      <Table.Td>{getValue(element.value)}</Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Paper shadow="sm" className={classses.paper} radius="5px">
        <Group className={classses.header}>
          <IconSunrise />
          <Title order={4} className={classses.title}>
            {title}
          </Title>
          <Box style={{ flexGrow: 1 }} />
          {isError && <WarningIcon />}
        </Group>
        <Table withRowBorders={false} horizontalSpacing="sm">
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>
    </>
  );
}
