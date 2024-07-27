'use client';

import useAlertsContext from '@/src/hooks/use-alerts-context';
import { Box, Group, Image, rem, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconExclamationCircle } from '@tabler/icons-react';
import Link from 'next/link';
import React from 'react';
import ShutdownActionIcon from '../../../ShutdownActionIcon/ShutdownActionIcon';
import AlertsModal from '../../AlertsModal/AlertsModal';
import classes from './Header.module.css';

export default function Header() {
  const alerts = useAlertsContext();

  const [isAlert, setIsAlert] = React.useState(false);
  const [notifID, setNotifID] = React.useState<string | undefined>(undefined);

  const [alertsOpened, { open: openAlerts, close: closeAlerts }] = useDisclosure(false);

  const eIcon = <IconExclamationCircle style={{ width: rem(24), height: rem(24) }} />;

  React.useEffect(() => {
    if (!alerts) return;

    setIsAlert(alerts.global_alert);
  }, [alerts]);

  React.useEffect(() => {
    if (isAlert) {
      const func = notifID ? notifications.update : notifications.show;
      const newNotifID = func({
        title: 'There are active alerts',
        message: 'Click here for more information.',
        color: 'red.9',
        icon: eIcon,
        autoClose: false,
        withCloseButton: false,
        radius: 6,
        classNames: {
          root: classes.notification,
          description: classes['notification-description'],
          icon: classes['notification-icon'],
        },
        onClick: () => {
          openAlerts();
        },
      });

      if (!notifID) {
        openAlerts();
      }

      setNotifID(newNotifID);
    } else if (notifID) {
      notifications.hide(notifID);
      setNotifID(undefined);
    }
  }, [isAlert]);

  return (
    <>
      <Box className={classes.root} bg={isAlert ? 'red.9' : undefined}>
        <Group className={classes.group}>
          <Link href="/">
            <Group>
              <Image src="/lvm_logo.png" h={50} />
              <Title order={3} className={classes.title}>
                LVM Web
              </Title>
            </Group>
          </Link>
          <div style={{ flexGrow: 1 }} />
          <ShutdownActionIcon />
        </Group>
      </Box>
      <AlertsModal opened={alertsOpened} close={closeAlerts} />
    </>
  );
}
