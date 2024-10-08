/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-16
 *  @Filename: NavBar.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import {
  IconCloudRain,
  IconDeviceComputerCamera,
  IconHome,
  IconLink,
  IconLogs,
  IconNotebook,
  IconPencil,
  IconSnowflake,
  IconTelescope,
} from '@tabler/icons-react';
import { Box, ScrollArea, Stack } from '@mantine/core';
import NavAccordion from '@/src/components/NavAccordion/NavAccordion';
import NavAccordionItem from '@/src/components/NavAccordionItem/NavAccordionItem';
import NavBarItem from './NavBarItem/NavBarItem';

export default function NavBar() {
  return (
    <ScrollArea type="never">
      <Stack p={16} mt={2} gap="xs">
        <NavBarItem path="/overview" icon={<IconHome />} text="Overview" />
        <NavBarItem path="/night-logs" icon={<IconPencil />} text="Night Log" />
        <NavBarItem path="/gort-log" icon={<IconNotebook />} text="GORT Log" />
        <NavBarItem path="/exposure-list" icon={<IconLogs />} text="Exposure List" />
        <NavBarItem path="/fills" icon={<IconSnowflake />} text="LN₂ fills" />
        <NavBarItem
          path="https://localhost:18888/"
          icon={<IconDeviceComputerCamera />}
          text="Webcams"
          external
          newWindow
        />
        <NavBarItem
          path="https://weather.lco.cl"
          icon={<IconCloudRain />}
          text="Weather"
          external
          newWindow
        />

        <Box pt={8} />
        <NavAccordion value="Telescopes" open icon={IconTelescope}>
          <NavAccordionItem value="Position" href="/telescopes/position" />
          <NavAccordionItem value="Science" href="/telescopes/sci" />
          <NavAccordionItem value="Spec" href="/telescopes/spec" />
          <NavAccordionItem value="Sky-E" href="/telescopes/skye" />
          <NavAccordionItem value="Sky-W" href="/telescopes/skyw" />
          <NavAccordionItem value="MoTAN" href="/telescopes/motan" />
        </NavAccordion>

        <NavAccordion value="Links" icon={IconLink}>
          <NavAccordionItem value="QA pages" href="https://lvm-web.lco.cl/qa/" />
          <NavAccordionItem
            value="Grafana"
            href="https://lvm-grafana.lco.cl"
            external
          />
          <NavAccordionItem
            value="Kubernetes"
            href="https://localhost:8443/#/pod?namespace=_all"
            external
          />
          <NavAccordionItem
            value="RabbitMQ"
            href="http://localhost:8090/rabbitmq"
            external
          />
          <NavAccordionItem
            value="Obs. guide"
            href="https://sdss-wiki.atlassian.net/wiki/x/xajc"
            external
          />
          <NavAccordionItem
            value="Ops. manual"
            href="https://sdss-wiki.atlassian.net/wiki/x/pKfc"
            external
          />
          <NavAccordionItem
            value="GORT docs"
            href="https://lvmgort.readthedocs.io/en/latest/"
            external
          />
        </NavAccordion>
      </Stack>
    </ScrollArea>
  );
}
