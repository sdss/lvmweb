/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-09-18
 *  @Filename: plots.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

export type FillListType = Map<number, string>;

export type ValveTimesType = {
  [key: string]: {
    open_time: string | null;
    close_time: string | null;
    timed_out: boolean | null;
    thermistor_first_active: string | null;
  };
};

export type FillMetadataType = {
  pk: number;
  complete: boolean;
  action: string | null;
  start_time: string | null;
  end_time: string | null;
  purge_start: string | null;
  purge_complete: string | null;
  fill_start: string | null;
  fill_complete: string | null;
  fail_time: string | null;
  abort_time: string | null;
  failed: boolean;
  aborted: boolean;
  error: string | null;
  log_data: string | null;
  configuration: { [key: string]: string } | null;
  plot_data: { [key: string]: string } | null;
  valve_times: ValveTimesType | null;
};
