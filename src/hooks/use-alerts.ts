/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-21
 *  @Filename: use-alerts.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import React from 'react';
import useAPICall from './use-api-call';

export type Cameras = 'b1' | 'b2' | 'b3' | 'r1' | 'r2' | 'r3' | 'z1' | 'z2' | 'z3';
export type CameraAlerts =
  | 'b1_ccd'
  | 'b1_ln2'
  | 'b2_ccd'
  | 'b2_ln2'
  | 'b3_ccd'
  | 'b3_ln2'
  | 'r1_ccd'
  | 'r1_ln2'
  | 'r2_ccd'
  | 'r2_ln2'
  | 'r3_ccd'
  | 'r3_ln2'
  | 'z1_ccd'
  | 'z1_ln2'
  | 'z2_ccd'
  | 'z2_ln2'
  | 'z3_ccd'
  | 'z3_ln2';
export type O2Rooms = 'o2_util_room' | 'o2_spec_room';

export interface AlertsResponse {
  camera_temperature_alert: boolean;
  camera_alerts: { [key in CameraAlerts]: boolean };
  o2_alert: boolean;
  o2_room_alerts: { [key in O2Rooms]: boolean };
  wind_alert: boolean | null;
  humidity_alert: boolean | null;
  dew_point_alert: boolean | null;
  rain: boolean;
  door_alert: boolean;
}

export interface AlertsModel extends AlertsResponse {
  global_alert: boolean;
  camera_active_alerts: CameraAlerts[];
  o2_active_alerts: O2Rooms[];
  test_alert: boolean;
}

export default function useAlerts(interval: number = 15000): AlertsModel | undefined {
  /** Returns active alerts from the API. */

  const [alertsAPI, , noData] = useAPICall<AlertsResponse>('/alerts/', { interval });

  const [alerts, setAlerts] = React.useState<AlertsModel | undefined>(undefined);

  React.useEffect(() => {
    if (!alertsAPI || noData) {
      setAlerts(undefined);
      return;
    }

    const tempAlerts = Object.keys(alertsAPI.camera_alerts || []).filter(
      (alert) => alertsAPI.camera_alerts[alert as CameraAlerts]
    );

    const o2Alerts = Object.keys(alertsAPI.o2_room_alerts || []).filter(
      (alert) => alertsAPI.o2_room_alerts[alert as O2Rooms]
    );

    const test_alert: boolean = false; // Just for testing.

    const newAlerts = {
      ...alertsAPI,
      global_alert:
        alertsAPI.camera_temperature_alert === true ||
        alertsAPI.rain === true ||
        alertsAPI.wind_alert === true ||
        alertsAPI.dew_point_alert === true ||
        alertsAPI.humidity_alert === true ||
        test_alert,
      camera_active_alerts: tempAlerts as CameraAlerts[],
      o2_active_alerts: o2Alerts as O2Rooms[],
      test_alert,
    };

    setAlerts((a) => {
      // Quick check to avoid re-rendering if the alerts have not changed.
      if (JSON.stringify(a) === JSON.stringify(newAlerts)) {
        return a;
      }
      return newAlerts;
    });
  }, [alertsAPI, noData]);

  return alerts;
}
