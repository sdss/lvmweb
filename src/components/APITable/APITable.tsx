/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-20
 *  @Filename: APITable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import {
  ActionIcon,
  Box,
  Group,
  Paper,
  Skeleton,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconAlertTriangle, IconReload, IconSettings } from '@tabler/icons-react';
import React from 'react';
import APIStatusText from './APIStatusText/APIStatusText';
import classses from './APITable.module.css';

type Element = {
  key: string;
  label: string | undefined;
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

function RefreshData(props: { onClick: () => void }) {
  return (
    <Tooltip label="Refresh data">
      <ActionIcon
        variant="transparent"
        className={classses['refresh-button']}
        size="sm"
      >
        <IconReload onClick={props.onClick} />
      </ActionIcon>
    </Tooltip>
  );
}

export default function APITable(props: {
  title: string;
  elements: Elements;
  noData?: boolean;
  icon?: JSX.Element;
  refreshData?: () => void;
}) {
  const {
    title,
    elements,
    noData = false,
    icon = <IconSettings />,
    refreshData,
  } = props;

  const [initialised, setInitialised] = React.useState(false);

  const getValue = React.useCallback(
    (element: Element) => {
      if (!initialised && noData) {
        return <Skeleton height={10} mr={10} miw={100} />;
      }

      if (element === undefined) {
        return '';
      }

      if (
        element.value &&
        typeof element.value === 'object' &&
        React.isValidElement(element.value)
      ) {
        return element.value;
      }

      const unit = element.unit || '';
      return (
        <APIStatusText nodata={noData}>
          {element.value}
          {unit}
        </APIStatusText>
      );
    },
    [noData, initialised]
  );

  React.useEffect(() => {
    if (!initialised && !noData) {
      setInitialised(true);
    }
  }, [noData]);

  const rows = elements.map((element) => {
    let value = getValue(element);
    let colspan = 1;
    let isSpan = false;

    if (!element.label) {
      colspan = 2;
      isSpan = true;
      value = element.value;
    }

    return (
      <Table.Tr key={element.key}>
        <Table.Td
          valign={(element.valign as (typeof Table.Td)['valign']) || 'top'}
          colSpan={colspan}
          ta={isSpan ? 'center' : undefined}
          autoFocus={false}
          maw={isSpan ? undefined : 160}
        >
          <Text size="sm">{isSpan ? value : element.label}</Text>
        </Table.Td>
        {!isSpan && (
          <Table.Td miw={isSpan ? undefined : 200}>{getValue(element)}</Table.Td>
        )}
      </Table.Tr>
    );
  });

  return (
    <>
      <Paper shadow="sm" className={classses.paper} radius={5}>
        <Group className={classses.header}>
          {icon}
          <Title order={4} className={classses.title}>
            {title}
          </Title>
          <Box style={{ flexGrow: 1 }} />
          {noData && <WarningIcon />}
          {refreshData && <RefreshData onClick={refreshData} />}
        </Group>
        <Table withRowBorders={false} horizontalSpacing="sm" mb={4}>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>
    </>
  );
}
