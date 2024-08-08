/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-26
 *  @Filename: AlertsModal.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import useAlertsContext from '@/src/hooks/use-alerts-context';
import useTask from '@/src/hooks/use-task';
import { Box, Button, Group, List, Modal, Stack, Text } from '@mantine/core';
import React from 'react';
import classes from './AlertModal.module.css';

export type AlertsModalProps = {
  opened: boolean;
  close: () => void;
};

export default function AlertsModal(props: AlertsModalProps) {
  const { opened, close } = props;

  const alerts = useAlertsContext();
  const [activeAlerts, setActiveAlerts] = React.useState<string[]>([]);

  const [runner] = useTask();

  React.useEffect(() => {
    if (!alerts) return;

    const tempAlerts: string[] = [];

    if (alerts.temperature_alert) {
      tempAlerts.push('Spectrograph temperature alert');
    }

    alerts.camera_active_alerts.forEach((camera) => {
      tempAlerts.push(`Camera ${camera} alert`);
    });

    if (alerts.o2_active_alerts.includes('o2_util_room')) {
      tempAlerts.push('Oxygen utility room alert');
    }

    if (alerts.o2_active_alerts.includes('o2_spec_room')) {
      tempAlerts.push('Oxygen spectrograph room alert');
    }

    if (alerts.rain) {
      tempAlerts.push('Rain detected');
    }

    setActiveAlerts(tempAlerts);
  }, [alerts]);

  const shutDown = React.useCallback(() => {
    close();
    runner('/macros/shutdown/').catch(() => {});
  }, []);

  return (
    <Modal
      title="Alerts"
      size="lg"
      opened={opened}
      onClose={close}
      classNames={{
        content: classes.content,
        header: classes.header,
        body: classes.body,
      }}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <Stack gap="lg">
        <Box>
          <Text pb={10}>The following alerts are active:</Text>
          <List withPadding>
            {activeAlerts.map((alert) => (
              <List.Item key={alert}>{alert}</List.Item>
            ))}
          </List>
        </Box>
        <Group justify="flex-end">
          <Button onClick={shutDown}>Emergency shutdown</Button>
          <Button variant="default" onClick={close}>
            Dismiss
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}