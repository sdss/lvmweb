/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-20
 *  @Filename: APITable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import { APICallStatus } from '@/src/hooks/use-api-call';
import {
  Box,
  Group,
  Paper,
  Skeleton,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconAlertTriangle, IconSettings } from '@tabler/icons-react';
import React from 'react';
import APIStatusText from '../APIStatusText/APIStatusText';
import classses from './APITable.module.css';

type Element = {
  key: string;
  label: string;
  value: any | undefined;
  unit?: string;
  valign?: string;
};

type Elements = Element[];

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
  icon?: JSX.Element;
}) {
  const { title, elements, status, icon = <IconSettings /> } = props;

  const [noData, setNoData] = React.useState(false);

  React.useEffect(() => {
    // Once the status changes to ERROR, do not change it back until a explicit OK.

    if (status === APICallStatus.ERROR) {
      setNoData(true);
    } else if (status === APICallStatus.OK) {
      setNoData(false);
    }
  }, [status]);

  const getValue = React.useCallback(
    (element: Element) => {
      if (status === APICallStatus.NODATA || element === undefined) {
        return <Skeleton height={10} mr={10} miw={100} />;
      }

      if (element === undefined) {
        return '';
      }

      if (React.isValidElement(element)) {
        return element;
      }

      const unit = element.unit || '';
      return (
        <APIStatusText nodata={noData}>
          {element.value}
          {unit}
        </APIStatusText>
      );
    },
    [status, noData]
  );

  const rows = elements.map((element) => (
    <Table.Tr key={element.key}>
      <Table.Td
        w="35%"
        valign={(element.valign as (typeof Table.Td)['valign']) || 'top'}
      >
        <Text size="sm">{element.label}</Text>
      </Table.Td>
      <Table.Td>{getValue(element)}</Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Paper shadow="sm" className={classses.paper} radius="5px">
        <Group className={classses.header}>
          {icon}
          <Title order={4} className={classses.title}>
            {title}
          </Title>
          <Box style={{ flexGrow: 1 }} />
          {noData && <WarningIcon />}
        </Group>
        <Table withRowBorders={false} horizontalSpacing="sm" mb={4}>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>
    </>
  );
}
