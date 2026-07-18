"use server";

import { authFetchGraphQL, handleActionError } from "../fetchGraphQL";
import {
  MY_NOTIFICATIONS,
  UNREAD_NOTIFICATIONS_COUNT,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
} from "../gqlQueries";
import { print } from "graphql";
import { revalidatePath } from "next/cache";

export async function fetchMyNotifications(skip = 0, take = 20) {
  try {
    const data = await authFetchGraphQL(print(MY_NOTIFICATIONS), { skip, take });
    return data?.myNotifications ?? [];
  } catch (error) {
    return handleActionError(error, "Failed to fetch notifications:", []);
  }
}

export async function fetchUnreadNotificationsCount() {
  try {
    const data = await authFetchGraphQL(print(UNREAD_NOTIFICATIONS_COUNT));
    return (data?.unreadNotificationsCount ?? 0) as number;
  } catch (error) {
    return handleActionError(error, "Failed to fetch unread notifications count:", 0);
  }
}

export async function markNotificationAsRead(notificationId: number) {
  try {
    const data = await authFetchGraphQL(print(MARK_NOTIFICATION_READ), {
      notificationId,
    });
    revalidatePath("/notifications");
    return !!data?.markNotificationRead;
  } catch (error) {
    return handleActionError(error, "Failed to mark notification as read:", false);
  }
}

export async function markAllNotificationsAsReadAction() {
  try {
    const data = await authFetchGraphQL(print(MARK_ALL_NOTIFICATIONS_READ));
    revalidatePath("/notifications");
    return !!data?.markAllNotificationsRead;
  } catch (error) {
    return handleActionError(error, "Failed to mark all notifications as read:", false);
  }
}
