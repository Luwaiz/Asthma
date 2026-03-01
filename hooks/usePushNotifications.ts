import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

export interface PushNotification {
    notification?: Notifications.Notification;
    expoPushToken?: string;
    refreshRegistration: () => Promise<void>;
}

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const usePushNotifications = (): PushNotification => {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
    const [notification, setNotification] = useState<Notifications.Notification | undefined>();

    const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
    const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

    async function registerForPushNotificationsAsync() {
        let token;
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.warn('Failed to get push token for push notification!');
                return;
            }
            
            const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
            
            if (!projectId) {
                console.warn("No EAS Project ID found in app.json. Remote push notifications will not work. Local notifications are still supported.");
                return;
            }
            
            try {
                const expoToken = await Notifications.getExpoPushTokenAsync({
                    projectId
                });
                token = expoToken.data;
                console.log("Expo Push Token obtained:", token);
            } catch (e: any) {
                console.error("Error getting push token:", e);
                if (Platform.OS === 'android' && e.message?.includes('FirebaseApp is not initialized')) {
                    console.warn("FCM is not configured for Android. Have you added google-services.json to your project and app.json?");
                }
            }

            if (Platform.OS === 'android') {
                Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 200, 200, 200],
                    lightColor: '#087179',
                });
            }
        } else {
            console.log('Must use physical device for Remote Push Notifications');
        }
        return token;
    }

    const refreshRegistration = async () => {
        const token = await registerForPushNotificationsAsync();
        setExpoPushToken(token);
    };

    useEffect(() => {
        refreshRegistration();

        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log("Notification Response:", response);
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    return { expoPushToken, notification, refreshRegistration };
};