/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-16
 *  @Filename: NavBar.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import NavAccordion from '@/src/components/NavAccordion/NavAccordion';
import NavAccordionItem from '@/src/components/NavAccordionItem/NavAccordionItem';
import { Box, Stack } from '@mantine/core';
import {
  IconCloudRain,
  IconHome,
  IconLink,
  IconLogs,
  IconNotebook,
  IconTelescope,
} from '@tabler/icons-react';
import NavBarItem from './NavBarItem/NavBarItem';

export default function NavBar() {
  return (
    <Stack p={16} mt={2} gap="xs">
      <NavBarItem path="/overview" icon={<IconHome />} text="Overview" />
      <NavBarItem path="/gort-log" icon={<IconNotebook />} text="GORT Log" />
      <NavBarItem path="/exposure-list" icon={<IconLogs />} text="Exposure List" />
      <NavBarItem
        path="https://weather.lco.cl"
        icon={<IconCloudRain />}
        text="Weather"
        external
        newWindow
      />

      <Box p={8} />
      <NavAccordion value="Telescopes" open icon={IconTelescope}>
        <NavAccordionItem value="Position" href="/telescopes/position" />
        <NavAccordionItem value="Science" href="/telescopes/sci" />
        <NavAccordionItem value="Spec" href="/telescopes/spec" />
        <NavAccordionItem value="Sky-E" href="/telescopes/skye" />
        <NavAccordionItem value="Sky-W" href="/telescopes/skyw" />
        <NavAccordionItem value="MoTAN" href="/telescopes/motan" />
      </NavAccordion>

      <Box p={4} />
      <NavAccordion value="Links" icon={IconLink}>
        <NavAccordionItem value="Grafana" href="https://lvm-grafana.lco.cl" external />
        <NavAccordionItem
          value="Kubernetes"
          href="https://localhost:8443/#/pod?namespace=_all"
          external
        />
        <NavAccordionItem
          value="RabbitMQ"
          href="http://localhost:8080/rabbitmq"
          external
        />
        <NavAccordionItem
          value="Obs. guide"
          href="'https://lvmgort.readthedocs.io/en/latest/"
          external
        />
        <NavAccordionItem
          value="GORT docs"
          href="'https://lvmgort.readthedocs.io/en/latest/"
          external
        />
      </NavAccordion>
    </Stack>
  );
}
