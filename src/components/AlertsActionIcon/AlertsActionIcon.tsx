/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-23
 *  @Filename: AlertsActionIcon.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import { IconCircleCheck, IconExclamationCircle } from '@tabler/icons-react';
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  rem,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import useAlertsContext from '@/src/hooks/use-alerts-context';
import AlertsModal from '../LVMWebRoot/AlertsModal/AlertsModal';

export type AllesIstGutModalProps = {
  opened: boolean;
  close: () => void;
};

function AllesIstGutModal(props: AllesIstGutModalProps) {
  const { opened, close } = props;

  return (
    <Modal
      title="There are no active alerts"
      size="lg"
      opened={opened}
      onClose={close}
      styles={{ title: { fontSize: 20, padding: 10 } }}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <Stack gap="lg">
        <Text pb={10} />
        <Text style={{ fontSize: 100 }} ta="center">
          😌
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={close}>
            Dismiss
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default function AlertsActionIcon() {
  const alerts = useAlertsContext();

  const [isAlert, setIsAlert] = React.useState(false);
  const [alertsOpened, { open: openAlerts, close: closeAlerts }] = useDisclosure(false);

  const iconStyle = { width: rem(24), height: rem(24) };
  const Icon = isAlert ? (
    <IconExclamationCircle style={iconStyle} />
  ) : (
    <IconCircleCheck style={iconStyle} />
  );

  React.useEffect(() => {
    if (!alerts) {
      return;
    }

    setIsAlert(alerts.global_alert);
  }, [alerts]);

  const label = isAlert ? 'See alerts' : 'Alles ist gut';

  return (
    <>
      <Tooltip label={label} position="bottom">
        <ActionIcon
          size="lg"
          variant="transparent"
          color={isAlert ? 'white' : 'lime.9'}
          onClick={openAlerts}
          styles={{ root: { '&:active': isAlert ? undefined : 'none' } }}
        >
          {Icon}
        </ActionIcon>
      </Tooltip>
      {isAlert ? (
        <AlertsModal opened={alertsOpened} close={closeAlerts} />
      ) : (
        <AllesIstGutModal opened={alertsOpened} close={closeAlerts} />
      )}
    </>
  );
}
