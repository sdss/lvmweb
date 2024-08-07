/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-24
 *  @Filename: use-task.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import { rem } from '@mantine/core';
import { NotificationData, notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import React from 'react';
import fetchFromAPI from '../actions/fetch-from-API';
import useDeferredPromise from './use-deferred';

export type UseTaskOptions = {
  showNotifications?: boolean;
  checkInterval?: number;
  taskName?: string;
  notifyErrors?: boolean;
};

export type ResultType<ReturnT> = {
  is_err: boolean;
  is_ready: boolean;
  log?: string;
  return_value?: ReturnT;
  execution_time?: number;
  labels?: object;
  error?: string;
};

function updateNotification(
  show: boolean,
  id: string | undefined,
  update: boolean,
  data: NotificationData
): string | undefined {
  /** Updates the notification */

  if (!show) return undefined;

  if (id) {
    if (update) {
      return notifications.update({ ...data, id });
    }
    notifications.hide(id);
    return notifications.show(data);
  }

  return notifications.show(data);
}

export default function useTask<T = any>(
  options?: UseTaskOptions
): [Function, boolean] {
  /** Starts a task and returns a promise that resolves when the task is complete. */

  const {
    showNotifications = true,
    checkInterval = 1000,
    taskName = 'undefined',
    notifyErrors = true,
  } = options || {};

  const [isRunning, setIsRunning] = React.useState(false);
  const [taskID, setTaskID] = React.useState<string | null>(null);
  const [notifID, setNotifID] = React.useState<string | undefined>(undefined);

  const { defer, deferRef } = useDeferredPromise<T | undefined>();

  const xIcon = <IconX style={{ width: rem(20), height: rem(20) }} />;
  const checkIcon = <IconCheck style={{ width: rem(20), height: rem(20) }} />;

  const failTask = React.useCallback(
    (error: any) => {
      let message: string;
      if (notifyErrors && error) {
        message = `Task ${taskName} failed with error: ${error}`;
      } else {
        message = `Task ${taskName} failed.`;
      }

      updateNotification(showNotifications, notifID, true, {
        title: 'Task failed',
        message,
        icon: xIcon,
        color: 'red',
        autoClose: 10000,
        loading: false,
        withCloseButton: true,
      });
      setIsRunning(false);
      setTaskID(null);
      deferRef?.reject(new Error(message));
    },
    [notifID, showNotifications]
  );

  React.useEffect(() => {
    /** Monitor the running task until it's done. Resolve/fail promise and notify. */

    if (!isRunning || !taskID) return () => {};

    const id = setInterval(() => {
      fetchFromAPI<boolean>(`/tasks/${taskID}/ready`)
        .then((isReady) => {
          if (isReady) {
            fetchFromAPI<ResultType<T>>(`/tasks/${taskID}/result`)
              .then((result) => {
                if (result.is_err) {
                  failTask(result.error);
                } else {
                  deferRef?.resolve(result.return_value);

                  updateNotification(showNotifications, notifID, true, {
                    title: 'Task complete',
                    message: `Task "${taskName}" completed.`,
                    color: 'teal',
                    icon: checkIcon,
                    autoClose: 10000,
                    withCloseButton: true,
                    loading: false,
                  });
                }
              })
              .catch((err) => {
                failTask(err);
              })
              .finally(() => {
                setIsRunning(false);
                setTaskID(null);
              });
          }
        })
        .catch((err) => {
          failTask(err);
        });
    }, checkInterval);

    return () => clearInterval(id);
  }, [isRunning, taskID]);

  const runner = React.useCallback((route: string) => {
    /** Call the task API route and schedule the task for completion.
     * This should return quickly with the task ID.
     */

    setIsRunning(true);

    fetchFromAPI<string>(route)
      .then((tid) => {
        setTaskID(tid);

        const _nID = updateNotification(showNotifications, notifID, false, {
          title: 'Task started',
          message: `Task "${taskName || tid}" has started running.`,
          loading: true,
          autoClose: false,
          withCloseButton: false,
        });
        setNotifID(_nID);
      })
      .catch(() => {
        deferRef?.reject(new Error('Task failed to start.'));

        setIsRunning(false);
        setTaskID(null);

        updateNotification(showNotifications, notifID, false, {
          title: 'Task failed',
          message: `Task "${taskName}" failed while being scheduled.`,
          loading: false,
          icon: xIcon,
          color: 'red',
          autoClose: 10000,
        });
      });

    return defer().promise;
  }, []);

  return [runner, isRunning];
}
