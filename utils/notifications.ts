import { apiService } from '@/services/api';
import * as Notifications from 'expo-notifications';

export const scheduleDailyLogReminder = async (): Promise<boolean> => {
    try {
        // Save to backend so it shows up in the Reminders tab
        const newReminder = await apiService.addReminder({
            title: "Daily Asthma Log",
            time: "8:00 AM",
            type: "medication", // 'medication' implies a recurring daily schedule in the current app logic
            subtitle: "Please take a moment to log your symptoms and PEF.",
        });

        // Schedule locally
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Time for your Daily Log",
                body: "Please take a moment to log your symptoms and PEF.",
                data: { reminderId: newReminder._id || newReminder.id },
                android: { channelId: 'default' },
                // @ts-ignore
                interruptionLevel: 'timeSensitive',
            } as any,
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: 8,
                minute: 0,
            } as Notifications.DailyTriggerInput,
        });

        return true;
    } catch (error) {
        console.error("Failed to schedule daily log reminder", error);
        return false;
    }
};
