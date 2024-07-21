/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-20
 *  @Filename: EphemerisTable.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import useAPICall from '@/src/hooks/use-api-call';
import useNow from '@/src/hooks/use-now';
import booleanYesNo from '@/src/tools/boolean-yes-no';
import JDToISO from '@/src/tools/jd-to-iso';
import APITable from '../../APITable/APITable';

type EphemerisResponse = {
  SJD: number;
  request_jd: number;
  date: string;
  sunset: number;
  twilight_end: number;
  twilight_start: number;
  sunrise: number;
  is_night: boolean;
  is_twilight: boolean;
  time_to_sunset: number;
  time_to_sunrise: number;
  moon_illumination: number;
  from_file: boolean;
};

export default function EphemerisTable() {
  const [ephemeris, ephemerisStatus] = useAPICall<EphemerisResponse>('/ephemeris', {
    interval: 30000,
  });

  const now = useNow();

  const elements = [
    { key: 'sjd', label: 'SJD', value: ephemeris?.SJD },
    { key: 'request_jd', label: 'Request JD', value: ephemeris?.request_jd },
    { key: 'iso_date', label: 'ISO Date', value: now },
    { key: 'sunset', label: 'Sunset', value: JDToISO(ephemeris?.sunset) },
    {
      key: 'twilight_end',
      label: 'Sunset Twilight (-15\u00B0)',
      value: JDToISO(ephemeris?.twilight_end),
    },
    {
      key: 'twilight_start',
      label: 'Sunrise Twilight (-15\u00B0)',
      value: JDToISO(ephemeris?.twilight_start),
    },
    {
      key: 'sunrise',
      label: 'Sunrise',
      value: JDToISO(ephemeris?.sunrise),
    },
    { key: 'is_night', label: 'Is Night?', value: booleanYesNo(ephemeris?.is_night) },
    { key: 'is_twilight', label: 'Is Twilight?', value: booleanYesNo(ephemeris?.is_twilight) },
    { key: 'time_to_sunset', label: 'Time to Sunset (hours)', value: ephemeris?.time_to_sunset },
    { key: 'time_to_sunrise', label: 'Time to Sunrise (hours)', value: ephemeris?.time_to_sunrise },
    {
      key: 'moon_illumination',
      label: 'Moon Illumination',
      value: ephemeris?.moon_illumination,
    },
  ];

  return <APITable title="Ephemeris" elements={elements} status={ephemerisStatus} />;
}
