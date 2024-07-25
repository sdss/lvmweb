/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-21
 *  @Filename: use-alerts.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import useAPICall, { APICallStatus } from './use-api-call';

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
  temperature_alert: boolean;
  camera_alerts: { [key in CameraAlerts]: boolean };
  o2_alert: boolean;
  o2_room_alerts: { [key in O2Rooms]: boolean };
  rain: boolean;
  door_alert: boolean;
}

export interface AlertsModel extends AlertsResponse {
  camera_active_alerts: CameraAlerts[];
  o2_active_alerts: O2Rooms[];
}

export default function useAlerts(interval: number = 15000): AlertsModel | undefined {
  /** Returns active alerts from the API. */

  const [alerts, status] = useAPICall<AlertsResponse>('/alerts/', { interval });

  if (!alerts || status === APICallStatus.ERROR || status === APICallStatus.NODATA) {
    return undefined;
  }

  const tempAlerts = Object.keys(alerts.camera_alerts || []).filter(
    (alert) => alerts.camera_alerts[alert as CameraAlerts]
  );

  const o2Alerts = Object.keys(alerts.o2_room_alerts || []).filter(
    (alert) => alerts.o2_room_alerts[alert as O2Rooms]
  );

  return {
    ...alerts,
    camera_active_alerts: tempAlerts as CameraAlerts[],
    o2_active_alerts: o2Alerts as O2Rooms[],
  };
}
