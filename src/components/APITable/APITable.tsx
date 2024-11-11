/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-20
 *  @Filename: APITable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import { IconAlertTriangle, IconReload, IconSettings } from '@tabler/icons-react';
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
import APIStatusText from './APIStatusText/APIStatusText';
import classses from './APITable.module.css';

type ValueType = React.JSX.Element | number | string | null | undefined;

type Element = {
  key: string;
  label: string | undefined;
  value: ValueType;
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
  title: string | React.ReactNode;
  elements: Elements;
  midsection?: React.ReactNode;
  noData?: boolean;
  icon?: JSX.Element;
  refreshData?: () => void;
}) {
  const {
    title,
    elements,
    midsection,
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
    setInitialised((prevValue) => {
      if (!prevValue && !noData) {
        return true;
      }
      return prevValue;
    });
  }, [noData]);

  const rows = elements.map((element) => {
    let value: ValueType = getValue(element);
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
          miw={isSpan ? undefined : 135}
          maw={isSpan ? undefined : 135}
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
          <Box style={{ flexGrow: 1, textAlign: 'center' }}>{midsection}</Box>
          {noData && <WarningIcon />}
          {refreshData && <RefreshData onClick={refreshData} />}
        </Group>
        <Table
          withRowBorders={false}
          horizontalSpacing="sm"
          verticalSpacing={5}
          mt={4}
          mb={4}
        >
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>
    </>
  );
}
