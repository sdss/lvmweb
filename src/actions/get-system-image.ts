/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-09-21
 *  @Filename: get-system-image.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use server';

import { existsSync, readFileSync } from 'fs';
import path from 'path';

export default async function getSystemFile(imagePath: string) {
  // Reads the file and returns it as a base64 string.

  if (!existsSync(imagePath)) {
    return null;
  }

  const filePath = path.resolve(imagePath);
  return readFileSync(filePath, { encoding: 'base64' });
}
