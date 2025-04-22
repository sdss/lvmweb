/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-26
 *  @Filename: AlertsModal.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';
import { IconInfoCircle } from '@tabler/icons-react';
import {
  Alert,
  Box,
  Button,
  Group,
  List,
  Modal,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import useAlertsContext from '@/src/hooks/use-alerts-context';
import useAPICall from '@/src/hooks/use-api-call';
import useTask from '@/src/hooks/use-task';
import { EnclosureResponse } from '../../APITables/EnclosureTable/types';
import classes from './AlertModal.module.css';

export type AlertsModalProps = {
  opened: boolean;
  close: () => void;
};

export default function AlertsModal(props: AlertsModalProps) {
  // Get status of the enclosure so that we can disable the emergency shutdown button.
  const [enclosure, , noData, refresh] = useAPICall<EnclosureResponse>('/enclosure', {
    interval: 30000,
  });

  const { opened, close } = props;

  const alerts = useAlertsContext();
  const [activeAlerts, setActiveAlerts] = React.useState<string[]>([]);

  const domeClosed =
    (enclosure?.dome_status.labels.includes('CLOSED') && !noData) || false;

  const [runner] = useTask();

  React.useEffect(() => {
    if (opened) {
      refresh();
    }
  }, [opened]);

  React.useEffect(() => {
    if (!alerts) {
      return;
    }

    const tempAlerts: string[] = [];

    if (alerts.camera_temperature_alert) {
      tempAlerts.push('Spectrograph temperature alert');
    }

    alerts.camera_active_alerts.forEach((camera) => {
      tempAlerts.push(`Camera ${camera} alert.`);
    });

    if (alerts.o2_active_alerts.includes('o2_util_room')) {
      tempAlerts.push('Oxygen utility room alert.');
    }

    if (alerts.o2_active_alerts.includes('o2_spec_room')) {
      tempAlerts.push('Oxygen spectrograph room alert.');
    }

    if (alerts.rain) {
      tempAlerts.push('Rain detected.');
    } else if (alerts.humidity_alert) {
      tempAlerts.push('Humidity is above 80%.');
    } else if (alerts.dew_point_alert) {
      tempAlerts.push('Ambient temperature is below dew point. Risk of condensation.');
    }

    if (alerts.wind_alert) {
      tempAlerts.push('Wind levels are unsafe.');
    }

    if (alerts.overwatcher_alerts?.idle) {
      tempAlerts.push('Overwatcher has been idle for over 10 minutes.');
    }

    if (alerts.test_alert) {
      tempAlerts.push('Test alert.');
    }

    setActiveAlerts(tempAlerts);
  }, [alerts]);

  const shutDown = React.useCallback(() => {
    close();
    runner('/macros/shutdown?disable_overwatcher=1').catch(() => {});
  }, [close, runner]);

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
        {domeClosed && (
          <Alert variant="filled" color="blue" radius={5} icon={<IconInfoCircle />}>
            The dome is closed. This alert is for informational purposes only.
          </Alert>
        )}
        <Box>
          <Text pb={10}>The following alerts are active:</Text>
          <List withPadding>
            {activeAlerts.map((alert) => (
              <List.Item key={alert}>{alert}</List.Item>
            ))}
          </List>
        </Box>
        <Group justify="flex-end">
          <Tooltip
            label={domeClosed ? 'The dome is already closed' : 'Closes the dome'}
          >
            <Button onClick={shutDown} disabled={domeClosed}>
              Emergency shutdown
            </Button>
          </Tooltip>
          <Button variant="default" onClick={close}>
            Dismiss
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
