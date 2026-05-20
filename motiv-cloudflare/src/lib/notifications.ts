/**
 * Client-side push notification helpers.
 * Uses the Push API with service worker.
 */

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });
    return subscription;
  } catch {
    return null;
  }
}

export function sendLocalNotification(title: string, body: string) {
  if (Notification.permission !== "granted") return;
  new Notification(title, {
    body,
    icon: "/icons/icon-192.svg",
    badge: "/icons/icon-192.svg",
  });
}

/**
 * Schedule a daily reminder notification.
 * Falls back to setTimeout-based reminders since
 * the Notification Triggers API isn't widely supported.
 */
export function scheduleDailyReminder(hour: number, minute: number) {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);

  if (target <= now) target.setDate(target.getDate() + 1);

  const delay = target.getTime() - now.getTime();

  setTimeout(() => {
    sendLocalNotification(
      "Time to prove yourself",
      "Your daily stake is on the line. Submit your proof before the clock runs out."
    );
    // Reschedule for next day
    scheduleDailyReminder(hour, minute);
  }, delay);
}
