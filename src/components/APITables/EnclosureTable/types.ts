/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-31
 *  @Filename: types.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

export type CalLampsResponse = {
  argon: boolean;
  neon: boolean;
  ldls: boolean;
  quartz: boolean;
  hgne: boolean;
  xenon: boolean;
};

export type EnclosureResponse = {
  dome_status: {
    labels: string[];
  };
  safety_status: {
    labels: string[];
  };
  lights_status: {
    labels: string[];
  };
  o2_status: {
    utilities_room: number;
    spectrograph_room: number;
  };
  cal_lamp_state: CalLampsResponse;
};
