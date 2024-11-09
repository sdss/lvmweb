/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-06
 *  @Filename: Header.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';
import Link from 'next/link';
import {
  IconExclamationCircle,
  IconLayoutSidebarRightFilled,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Box,
  Group,
  Image,
  rem,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import AlertsActionIcon from '@/src/components/AlertsActionIcon/AlertsActionIcon';
import AuthenticatedIcon from '@/src/components/AuthenticatedIcon/AuthenticatedIcon';
import useAlertsContext from '@/src/hooks/use-alerts-context';
import ShutdownActionIcon from '../../../ShutdownActionIcon/ShutdownActionIcon';
import AlertsModal from '../../AlertsModal/AlertsModal';
import classes from './Header.module.css';

const eIcon = <IconExclamationCircle style={{ width: rem(24), height: rem(24) }} />;

type AsideCollapseProps = {
  collapsedAside: boolean;
  toggleAside: () => void;
};

function ToggleAside(props: AsideCollapseProps) {
  const color = props.collapsedAside ? 'gray-3' : 'blue-6';

  return (
    <Tooltip label="Toggle notifications" position="bottom">
      <ActionIcon
        size="lg"
        color="white"
        variant="transparent"
        onClick={props.toggleAside}
      >
        <IconLayoutSidebarRightFilled color={`var(--mantine-color-${color})`} />
      </ActionIcon>
    </Tooltip>
  );
}

export default function Header(props: AsideCollapseProps) {
  const alerts = useAlertsContext();

  const [isAlert, setIsAlert] = React.useState(false);

  const notifID = React.useRef<string | undefined>(undefined);

  const [alertsOpened, { open: openAlerts, close: closeAlerts }] = useDisclosure(false);

  React.useEffect(() => {
    if (!alerts) {
      return;
    }

    setIsAlert(alerts.global_alert);
  }, [alerts]);

  React.useEffect(() => {
    if (isAlert) {
      const func = notifID.current ? notifications.update : notifications.show;
      const newNotifID = func({
        title: 'There are active alerts',
        message: (
          <Text
            size="sm"
            onClick={() => {
              openAlerts();
            }}
          >
            Click here for more information.
          </Text>
        ),
        color: 'red.9',
        icon: eIcon,
        autoClose: false,
        withCloseButton: true,
        radius: 6,
        classNames: {
          root: classes.notification,
          description: classes['notification-description'],
          icon: classes['notification-icon'],
          closeButton: classes['notification-close-button'],
        },
      });

      if (!notifID.current) {
        openAlerts();
      }

      notifID.current = newNotifID;
    } else if (notifID.current) {
      notifications.hide(notifID.current);
      notifID.current = undefined;
      closeAlerts();
    }
  }, [isAlert, openAlerts, closeAlerts]);

  return (
    <>
      <Box className={classes.root} bg={isAlert ? 'red.9' : undefined}>
        <Group w="100%">
          <Box component={Link} href="/">
            <Image
              src="/lvm_logo.png"
              alt="LVM logo"
              w={44}
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <Box component={Link} href="/" visibleFrom="sm">
            <Title order={3} className={classes.title}>
              LVM Web
            </Title>
          </Box>
          <Box style={{ flex: 1 }} />
          <Group gap="sm" align="flex-end">
            <AlertsActionIcon />
            <ShutdownActionIcon />
            <ToggleAside {...props} />
            <AuthenticatedIcon />
          </Group>
        </Group>
      </Box>
      <AlertsModal opened={alertsOpened} close={closeAlerts} />
    </>
  );
}
