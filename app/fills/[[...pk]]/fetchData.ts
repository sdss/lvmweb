/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-09-18
 *  @Filename: plots.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import fetchFromAPI from '@/src/actions/fetch-from-API';
import { FillListType, FillMetadataType } from './types';

export async function fetchFillList(): Promise<FillListType> {
  const response = await fetchFromAPI<{ [key: number]: string }>(
    '/spectrographs/fills/list'
  );

  const fillList = new Map<number, string>();
  for (const [pk, fill] of Object.entries(response)) {
    fillList.set(Number(pk), fill);
  }

  return fillList;
}

export async function fetchFillData(pk: number): Promise<FillMetadataType> {
  const response = await fetchFromAPI<FillMetadataType>(
    `/spectrographs/fills/${pk}/metadata?transparent_plots=true`
  );

  return response;
}
