/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-08-07
 *  @Filename: fetch-task.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import fetchFromAPI from './fetch-from-API';

export default async function fetchTask<T>(
  route: string,
  checkInterval: number = 1000
): Promise<T> {
  const task_id = await fetchFromAPI<T>(route);

  let data: T;

  while (true) {
    const result = await fetchFromAPI<boolean>(`/tasks/${task_id}/ready`);
    if (result) {
      const response = await fetchFromAPI<any>(`/tasks/${task_id}/result`);
      data = response.return_value;
      break;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, checkInterval);
    });
  }

  return data;
}
