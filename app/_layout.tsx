import { AuthProvider } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export default function RootLayout() {
	const colorScheme = useColorScheme();

	return (
		<AuthProvider>
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				<Stack screenOptions={{ headerBackTitle: "" }}>
					<Stack.Screen name="index" options={{ headerShown: false }} />
					<Stack.Screen name="login" options={{ headerShown: false }} />
					<Stack.Screen name="register" options={{ headerShown: false }} />
					<Stack.Screen name="intro-survey" options={{ headerShown: false }} />
					<Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Home" }} />
					<Stack.Screen name="reminder" options={{ title: "Reminders", headerBackTitle: "Back" }} />
					<Stack.Screen name="education-content" options={{ title: "Education Content", headerShown: false }} />
					<Stack.Screen name="history" options={{ title: "Log History", headerShown: false }} />
					<Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
				</Stack>
				<StatusBar style="auto" />
			</ThemeProvider>
		</AuthProvider>
	);
}
