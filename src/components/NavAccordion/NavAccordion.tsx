/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-06
 *  @Filename: NavAccordion.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Accordion, Title } from '@mantine/core';
import { IconProps } from '@tabler/icons-react';
import React from 'react';
import classes from './NacAccordion.module.css';

type NavAccordionProps = {
  value: string;
  children: React.ReactNode;
  open?: boolean;
  icon?: React.FunctionComponent<IconProps>;
};

export default function NavAccordion(
  props: React.PropsWithChildren<NavAccordionProps>
) {
  const { value, children, open = false, icon } = props;

  return (
    <Accordion
      defaultValue={open ? value : null}
      chevronPosition="left"
      variant="filled"
      multiple={false}
      classNames={{ chevron: classes.chevron }}
    >
      <Accordion.Item key={value} value={value}>
        <Accordion.Control
          icon={icon ? React.createElement(icon, { width: 20 }) : undefined}
        >
          <Title order={6} c="gray.4">
            {value.toUpperCase()}
          </Title>
        </Accordion.Control>
        <Accordion.Panel>{children}</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
