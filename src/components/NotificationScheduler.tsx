
import { useEffect } from 'react';
import { useBills } from '@/hooks/useBills';
import { useSimpleCalendarEvents } from '@/hooks/useSimpleCalendarEvents';
import { useAuth } from '@/hooks/useAuth';
import { pushNotificationService } from '@/lib/push-notifications';

interface NotificationSchedulerProps {
  householdId: string | null;
}

export default function NotificationScheduler({ householdId }: NotificationSchedulerProps) {
  const { user } = useAuth();
  const { bills } = useBills(householdId);
  const { events } = useSimpleCalendarEvents(householdId);

  useEffect(() => {
    if (!householdId || !user) return;

    // Check for reminders every 30 minutes
    const reminderInterval = setInterval(async () => {
      try {
        // Send bill reminders
        if (bills.length > 0) {
          await pushNotificationService.sendUpcomingBillReminders(bills);
        }

        // Send event reminders
        if (events.length > 0) {
          await pushNotificationService.sendUpcomingEventReminders(events);
        }
      } catch (error) {
        console.warn('Failed to send automatic reminders:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes

    // Initial check after 5 seconds
    const initialTimeout = setTimeout(async () => {
      try {
        if (bills.length > 0) {
          await pushNotificationService.sendUpcomingBillReminders(bills);
        }
        if (events.length > 0) {
          await pushNotificationService.sendUpcomingEventReminders(events);
        }
      } catch (error) {
        console.warn('Failed to send initial reminders:', error);
      }
    }, 5000);

    return () => {
      clearInterval(reminderInterval);
      clearTimeout(initialTimeout);
    };
  }, [householdId, user, bills, events]);

  // This component doesn't render anything visible
  return null;
}
