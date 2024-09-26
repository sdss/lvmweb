/*
 *  @Author: Jose Sanchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2024-07-24
 *  @Filename: use-task.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

'use client';

import React from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { rem } from '@mantine/core';
import { NotificationData, notifications } from '@mantine/notifications';
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

  if (!show) {
    return undefined;
  }

  if (id) {
    if (update) {
      return notifications.update({ ...data, id });
    }
    notifications.hide(id);
    return notifications.show(data);
  }

  return notifications.show(data);
}

const checkIcon = <IconCheck style={{ width: rem(20), height: rem(20) }} />;
const xIcon = <IconX style={{ width: rem(20), height: rem(20) }} />;

export default function useTask<T>(
  options?: UseTaskOptions
): [(route: string, needs_auth?: boolean) => Promise<T | undefined>, boolean] {
  /** Starts a task and returns a promise that resolves when the task is complete. */

  const {
    showNotifications = true,
    checkInterval = 1000,
    taskName = 'undefined',
    notifyErrors = true,
  } = options || {};

  const [isRunning, setIsRunning] = React.useState(false);

  const taskID = React.useRef<string | null>(null);
  const notifID = React.useRef<string | undefined>(undefined);

  const { defer, deferRef } = useDeferredPromise<T | undefined>();

  const failTask = React.useCallback(
    (error: unknown) => {
      let message: string;
      if (notifyErrors && error) {
        message = `Task ${taskName} failed with error: ${error}`;
      } else {
        message = `Task ${taskName} failed.`;
      }

      updateNotification(showNotifications, notifID.current, true, {
        title: 'Task failed',
        message,
        icon: xIcon,
        color: 'red',
        autoClose: 10000,
        loading: false,
        withCloseButton: true,
      });
      setIsRunning(false);
      taskID.current = null;
      deferRef?.reject(new Error(message));
    },
    [showNotifications, taskName, notifyErrors, deferRef]
  );

  React.useEffect(() => {
    /** Monitor the running task until it's done. Resolve/fail promise and notify. */

    if (!isRunning || !taskID.current) {
      return () => {};
    }

    let isReady = false;
    let isGettingResult = false;

    const id = setInterval(() => {
      // Prevent multiple checks from running at the same time.
      if (isGettingResult) {
        return;
      }

      if (!isReady) {
        fetchFromAPI<boolean>(`/tasks/${taskID.current}/ready`)
          .then((response) => {
            isReady = response;
          })
          .catch((err) => {
            failTask(err);
            setIsRunning(false);
            taskID.current = null;
          });
      } else {
        isGettingResult = true;

        fetchFromAPI<ResultType<T>>(`/tasks/${taskID.current}/result`)
          .then((result) => {
            if (result.is_err) {
              failTask(result.error);
            } else {
              deferRef?.resolve(result.return_value);

              updateNotification(showNotifications, notifID.current, true, {
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
            taskID.current = null;
          });
      }
    }, checkInterval);

    return () => {
      return clearInterval(id);
    };
  }, [isRunning, checkInterval, showNotifications, taskName, deferRef, failTask]);

  const runner = React.useCallback(
    (route: string, needs_auth: boolean = false) => {
      /** Call the task API route and schedule the task for completion.
       *  This should return quickly with the task ID.
       */

      fetchFromAPI<string>(route, {}, needs_auth)
        .then((tid) => {
          taskID.current = tid;
          notifID.current = updateNotification(
            showNotifications,
            notifID.current,
            false,
            {
              title: 'Task started',
              message: `Task "${taskName || tid}" has started running.`,
              loading: true,
              autoClose: false,
              withCloseButton: false,
            }
          );

          setIsRunning(true);
        })
        .catch(() => {
          deferRef?.reject(new Error('Task failed to start.'));

          setIsRunning(false);
          taskID.current = null;

          updateNotification(showNotifications, notifID.current, false, {
            title: 'Task failed',
            message: `Task "${taskName}" failed while being scheduled.`,
            loading: false,
            icon: xIcon,
            color: 'red',
            autoClose: 10000,
          });
        });

      return defer().promise;
    },
    [defer, deferRef, showNotifications, taskName]
  );

  return [runner, isRunning];
}
