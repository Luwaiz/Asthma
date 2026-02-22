import { StreakModal } from "@/components/StreakModal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/services/api";
import { fetchAIHealthStatus, HealthStatus } from "@/utils/aiInsights";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
	ActivityIndicator,
	Dimensions,
	Modal,
	Pressable,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import { LineChart } from "react-native-gifted-charts";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function InfoModal({ visible, onClose, title, content }: { visible: boolean, onClose: () => void, title: string, content: string }) {
	return (
		<Modal
			animationType="fade"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<Pressable style={styles.modalOverlay} onPress={onClose}>
				<View style={styles.modalContent}>
					<View style={styles.modalHeader}>
						<Text style={styles.modalTitle}>{title}</Text>
						<TouchableOpacity onPress={onClose}>
							<IconSymbol name="xmark.circle.fill" size={24} color="#9ca3af" />
						</TouchableOpacity>
					</View>
					<Text style={styles.modalDescription}>{content}</Text>
					<TouchableOpacity style={styles.modalButton} onPress={onClose}>
						<Text style={styles.modalButtonText}>Got it</Text>
					</TouchableOpacity>
				</View>
			</Pressable>
		</Modal>
	);
}

function Box({ healthStatus, loading, onRefresh, onShowInfo }: { healthStatus: HealthStatus | null, loading: boolean, onRefresh: () => void, onShowInfo: () => void }) {
	const statusLabel = loading ? "Updating..." : (healthStatus?.label || "Daily Tip");
	const description = loading ? "Refreshing your tips..." : (healthStatus?.description || "Log your symptoms to see personalized tips.");
	const color = healthStatus?.color || "#087179";

	return (
		<View style={[styles.boxContainer, { backgroundColor: color }]}>
			<View style={styles.boxHeader}>
				<View style={styles.boxHeaderLeft}>
					<Text style={styles.boxHeaderText}>HEALTH TIPS</Text>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
					<TouchableOpacity onPress={onRefresh} disabled={loading} style={{ opacity: loading ? 0.5 : 1 }}>
						<IconSymbol name="arrow.clockwise" size={20} color="white" />
					</TouchableOpacity>
					{loading ? (
						<ActivityIndicator size="small" color="white" />
					) : (
						<TouchableOpacity onPress={onShowInfo}>
							<IconSymbol name="info.circle.fill" size={24} color="white" />
						</TouchableOpacity>
					)}
				</View>
			</View>
			<View style={{ marginTop: 2 }}>
				<Text style={[styles.boxText2, { fontWeight: '700', fontSize: 17, marginBottom: 4 }]} numberOfLines={1}>{statusLabel}</Text>
				<Text style={styles.boxText2} numberOfLines={4} ellipsizeMode="tail">{description}</Text>
			</View>
		</View>
	);
}

function HealthTrend({ logs, loading, onShowInfo }: { logs: Log[], loading: boolean, onShowInfo: () => void }) {
	// Process logs for the last 7 days
	const getChartData = () => {
		const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		const data = [];
		const today = new Date();

		for (let i = 6; i >= 0; i--) {
			const d = new Date();
			d.setDate(today.getDate() - i);
			const dateStr = d.toISOString().split('T')[0];
			const dayLabel = days[d.getDay()];

			const log = logs.find(l => l.date.startsWith(dateStr));
			const pefValue = log ? parseInt(log.peakFlow) : null;

			data.push({
				value: pefValue || 0,
				label: dayLabel,
				dataPointText: pefValue ? pefValue.toString() : '',
				hideDataPoint: !pefValue,
			});
		}
		return data;
	};

	const chartData = getChartData();
	const hasData = chartData.some(d => d.value > 0);

	// Calculate max value for headroom
	const maxPef = Math.max(...chartData.map(d => d.value), 0);
	const maxValue = maxPef > 0 ? Math.ceil(maxPef * 1.25) : 100; // 25% buffer

	// Reduction: Screen (full) - Page Padding (20*2) - Box Padding (20*2) - Solid Buffer (20)
	const chartWidth = SCREEN_WIDTH - 100;
	const horizontalPadding = 15;

	return (
		<View style={styles.trendChartContainer}>
			<View style={styles.medicationReminderContainerLeft}>
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
					<Text style={styles.medicationReminderText}>Health Trend (7D)</Text>
					<TouchableOpacity onPress={onShowInfo}>
						<IconSymbol name="info.circle.fill" size={18} color="#9ca3af" />
					</TouchableOpacity>
				</View>
				<IconSymbol name="chart.line.uptrend.xyaxis" size={20} color="#6b7280" />
			</View>

			<View style={styles.chartWrapper}>
				<LineChart
					data={chartData}
					height={140} // Increased height for better headroom
					width={chartWidth}
					maxValue={maxValue}
					noOfSections={3}
					disableScroll={true}
					initialSpacing={horizontalPadding}
					endSpacing={horizontalPadding}
					spacing={(chartWidth - (horizontalPadding * 2)) / 6}
					color="#087179"
					thickness={3}
					startFillColor="rgba(8, 113, 121, 0.3)"
					endFillColor="rgba(8, 113, 121, 0.01)"
					startOpacity={0.4}
					endOpacity={0.1}
					areaChart
					curved
					hideDataPoints={false}
					dataPointsColor="#087179"
					dataPointsRadius={4}
					focusedDataPointColor="#ffd700"
					xAxisColor="#e5e7eb"
					xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 10 }}
					yAxisColor="transparent"
					yAxisThickness={0}
					hideYAxisText
					hideRules
					pointerConfig={{
						pointerStripHeight: 140,
						pointerStripColor: 'rgba(8, 113, 121, 0.2)',
						pointerStripWidth: 2,
						pointerColor: '#087179',
						radius: 6,
						pointerLabelComponent: (items: any) => {
							return (
								<View style={styles.pointerLabel}>
									<Text style={{ color: '#087179', fontWeight: 'bold' }}>{items[0].value} L/min</Text>
								</View>
							);
						},
					}}
				/>
				{!hasData && !loading && (
					<View style={styles.noDataOverlay}>
						<Text style={styles.noDataText}>Start logging PEF to see trends</Text>
					</View>
				)}
				{loading && (
					<View style={styles.noDataOverlay}>
						<ActivityIndicator size="small" color="#087179" />
					</View>
				)}
			</View>
		</View>
	);
}
function MedicationReminder({ reminders, loading }: { reminders: any[], loading: boolean }) {
	if (loading) {
		return (
			<View style={[styles.medicationContainer, { justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }]}>
				<Text style={{ color: '#9ca3af' }}>Loading reminders...</Text>
			</View>
		);
	}

	const medicationReminders = reminders.filter(r => r.type === 'medication');

	if (medicationReminders.length === 0) {
		return (
			<View style={[styles.medicationContainer, { justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }]}>
				<IconSymbol name="pill" size={30} color="#e5e7eb" />
				<Text style={[styles.medicationContainerRightText2, { marginTop: 8, color: '#9ca3af' }]}>No medication reminders set</Text>
			</View>
		);
	}

	// Display up to 2 reminders
	return (
		<>
			{medicationReminders.slice(0, 2).map((item, index) => (
				<View key={item._id || item.id || index} style={styles.medicationContainer}>
					<View style={styles.medicationContainerLeft}>
						<IconSymbol name="pill.fill" size={24} color="#087179" />
					</View>
					<View style={styles.medicationContainerRight}>
						<Text style={styles.medicationContainerRightText}>{item.title}</Text>
						<Text style={styles.medicationContainerRightText2}>
							{item.time} {item.subtitle ? `• ${item.subtitle}` : ''}
						</Text>
					</View>
					<View style={styles.medicationContainerRight2}>
						<IconSymbol name="checkmark.circle" size={30} color="#087179" />
					</View>
				</View>
			))}
		</>
	);
}

interface Symptom {
	id: string;
	name: string;
	description: string;
	severity: number;
}

interface Log {
	id: string;
	_id?: string;
	date: string;
	symptoms: Symptom[];
	peakFlow: string;
	notes: string;
}

const SEVERITY_LEVELS = [
	{ label: 'Mild', color: '#10b981' },
	{ label: 'Moderate', color: '#f59e0b' },
	{ label: 'Severe', color: '#ef4444' },
];

const getSeverityLevel = (severity: number) => {
	// If severity is on 0-2 scale
	if (severity >= 0 && severity <= 2) {
		return SEVERITY_LEVELS[severity];
	}
	// Map 1-10 scale from onboarding to 0-2
	if (severity >= 1 && severity <= 3) return SEVERITY_LEVELS[0]; // Mild
	if (severity >= 4 && severity <= 7) return SEVERITY_LEVELS[1]; // Moderate
	if (severity >= 8 && severity <= 10) return SEVERITY_LEVELS[2]; // Severe

	return SEVERITY_LEVELS[0]; // Default to Mild
};

function RecentActivity({ logs }: { logs: Log[] }) {
	if (logs.length === 0) {
		return (
			<View style={[styles.medicalHistoryContainerItem, { alignItems: 'center', paddingVertical: 30 }]}>
				<IconSymbol name="calendar.badge.plus" size={40} color="#e5e7eb" />
				<Text style={[styles.medicalHistoryContainerRightText2, { marginTop: 10 }]}>No logs yet. Start tracking today!</Text>
			</View>
		);
	}

	return (
		<View style={styles.medicalHistoryContainerItem}>
			{logs.map((log, index) => {
				const date = new Date(log.date);
				const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
				// Get highest severity symptom
				const maxSeverity = Math.max(...(log.symptoms?.map(s => s.severity) || [0]), 0);
				const severityLevel = getSeverityLevel(maxSeverity);
				const symptomCount = log.symptoms?.length || 0;

				return (
					<Pressable
						key={log.id || log._id || index}
						style={styles.medicationHistoryItem}
						onPress={() => router.push({ pathname: '/(tabs)/tracker', params: { date: log.date } })}
					>
						<View style={styles.medicalHistoryContainerRight2}>
							<View style={[styles.severityIndicator, { backgroundColor: severityLevel.color }]} />
						</View>
						<View style={styles.medicalHistoryContainerRight}>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
								<Text style={styles.medicalHistoryContainerRightText}>
									{formattedDate}
								</Text>
								{symptomCount > 0 && (
									<View style={[styles.symptomBadge, { backgroundColor: severityLevel.color }]}>
										<Text style={styles.symptomBadgeText}>{symptomCount}</Text>
									</View>
								)}
							</View>
							<Text style={styles.medicalHistoryContainerRightText2}>
								PEF: {log.peakFlow || '--'} L/min • {log.symptoms?.[0]?.name || 'Routine check'}
							</Text>
						</View>
						<IconSymbol name="chevron.right" size={16} color="#9ca3af" style={{ marginLeft: 'auto' }} />
					</Pressable>
				);
			})}
		</View>
	);
}

export default function HomeScreen() {
	const [recentLogs, setRecentLogs] = useState<Log[]>([]);
	const [allLogs, setAllLogs] = useState<Log[]>([]);
	const [reminders, setReminders] = useState<any[]>([]);
	const [loadingReminders, setLoadingReminders] = useState(true);
	const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
	const [isHealthStatusLoading, setIsHealthStatusLoading] = useState(false);
	const [streakModalVisible, setStreakModalVisible] = useState(false);
	const [infoModal, setInfoModal] = useState({ visible: false, title: '', content: '' });
	const isInitialMount = useRef(true);

	useFocusEffect(
		useCallback(() => {
			loadRecentLogs();
			loadReminders();
			checkStreakModal();

			const checkAndRefresh = async () => {
				// Load from cache first
				await loadHealthStatusFromCache();

				// Only fetch fresh data if this is initial mount or data is stale
				const isStale = await AsyncStorage.getItem('HEALTH_STATUS_STALE');

				if (isInitialMount.current || isStale === 'true') {
					await loadHealthStatus();
					await AsyncStorage.removeItem('HEALTH_STATUS_STALE');
					isInitialMount.current = false;
				}
			};

			checkAndRefresh();
		}, [])
	);

	const { user, streakCount } = useAuth();

	const checkStreakModal = async () => {
		try {
			const lastShown = await AsyncStorage.getItem('LAST_STREAK_MODAL_DATE');
			const today = new Date().toISOString().split('T')[0];

			if (streakCount > 0 && lastShown !== today) {
				setStreakModalVisible(true);
				await AsyncStorage.setItem('LAST_STREAK_MODAL_DATE', today);
			}
		} catch (error) {
			console.error('Error checking streak modal:', error);
		}
	};

	const loadHealthStatusFromCache = async () => {
		try {
			const cached = await AsyncStorage.getItem('HEALTH_STATUS_CACHE');
			if (cached) {
				const { data } = JSON.parse(cached);
				setHealthStatus(data);
			}
		} catch (error) {
			console.error('Error loading cached health status:', error);
		}
	};

	const loadHealthStatus = async () => {
		setIsHealthStatusLoading(true);
		try {
			const status = await fetchAIHealthStatus();
			setHealthStatus(status);

			// Save to cache with timestamp
			await AsyncStorage.setItem('HEALTH_STATUS_CACHE', JSON.stringify({
				data: status,
				timestamp: Date.now()
			}));
		} catch (error) {
			console.error('Error loading health status:', error);
		} finally {
			setIsHealthStatusLoading(false);
		}
	};

	const loadReminders = async () => {
		try {
			const data = await apiService.getReminders();
			setReminders(data);
		} catch (error) {
			console.error('Error loading reminders on dashboard:', error);
		} finally {
			setLoadingReminders(false);
		}
	};

	const loadRecentLogs = async () => {
		try {
			// Try local first
			const stored = await AsyncStorage.getItem('ASTHMA_DAILY_LOGS');
			if (stored) {
				const parsed = JSON.parse(stored);
				// Ensure sorted by date descending
				parsed.sort((a: Log, b: Log) => new Date(b.date).getTime() - new Date(a.date).getTime());
				setAllLogs(parsed);
				setRecentLogs(parsed.slice(0, 5));
			}

			// Then sync with backend
			const remoteLogs = await apiService.getLogs();
			if (remoteLogs && Array.isArray(remoteLogs)) {
				// Sort by date descending
				remoteLogs.sort((a: Log, b: Log) => new Date(b.date).getTime() - new Date(a.date).getTime());
				setAllLogs(remoteLogs);
				setRecentLogs(remoteLogs.slice(0, 5));
				await AsyncStorage.setItem('ASTHMA_DAILY_LOGS', JSON.stringify(remoteLogs));
			}
		} catch (error) {
			console.error('Error loading logs on dashboard:', error);
		}
	};

	const showInfo = (type: 'status' | 'trend') => {
		if (type === 'status') {
			setInfoModal({
				visible: true,
				title: 'Health Status',
				content: 'Your Health Status is calculated by our AI based on your symptoms and Peak Flow (PEF) logs over the last 7 days. It helps you understand how well your asthma is controlled.'
			});
		} else {
			setInfoModal({
				visible: true,
				title: 'PEF Trend Graph',
				content: 'The trend graph shows your Peak Flow (PEF) values over the last week. Peak Flow measures how fast you can breathe out. A steady or rising line indicates stable lung function, while a drop may signal an upcoming flare-up.'
			});
		}
	};

	const today = new Date();
	const formattedToday = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

	const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View style={styles.leftHeader}>
					<Text style={styles.date}>{formattedToday}</Text>
					<Text style={styles.indexText}>Good Morning, {displayName}</Text>
				</View>
				<View style={styles.rightHeader}>
					<View style={styles.streakContainer}>
						<IconSymbol name="flame.fill" size={20} color="#ff4500" />
						<Text style={styles.streakCountText}>{streakCount}</Text>
					</View>
					<Pressable style={styles.notificationContainer} onPress={() => { router.push("/reminder") }}>
						<IconSymbol name="bell.fill" size={28} color="#087179" />
					</Pressable>
				</View>
			</View>
			<ScrollView
				showsVerticalScrollIndicator={false}
				alwaysBounceHorizontal={false}
				horizontal={false}
				contentContainerStyle={{ width: '100%' }}
			>
				<Box
					healthStatus={healthStatus}
					loading={isHealthStatusLoading}
					onRefresh={() => loadHealthStatus()}
					onShowInfo={() => showInfo('status')}
				/>
				<HealthTrend
					logs={allLogs}
					loading={isHealthStatusLoading}
					onShowInfo={() => showInfo('trend')}
				/>
				<View style={styles.medicationReminderContainer}>
					<View style={styles.medicationReminderContainerLeft}>
						<Text style={styles.medicationReminderText}>Medication Reminder</Text>
						<Pressable onPress={() => router.push("/reminder")}>
							<Text style={styles.viewAllText}>View All</Text>
						</Pressable>
					</View>
					<MedicationReminder reminders={reminders} loading={loadingReminders} />

					<View style={styles.medicalHistoryContainer}>
						<View style={styles.medicationReminderContainerLeft}>
							<Text style={styles.medicalHistoryText}>Recent Activity</Text>
							<Pressable onPress={() => router.push("/history")}>
								<Text style={styles.viewAllText}>View All</Text>
							</Pressable>
						</View>
						<RecentActivity logs={recentLogs} />
					</View>
				</View>
			</ScrollView>

			<InfoModal
				visible={infoModal.visible}
				title={infoModal.title}
				content={infoModal.content}
				onClose={() => setInfoModal(prev => ({ ...prev, visible: false }))}
			/>

			<StreakModal
				visible={streakModalVisible}
				streakCount={streakCount}
				onClose={() => setStreakModalVisible(false)}
			/>
		</View>
	);
}


const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		backgroundColor: "#fafafa",
		paddingTop: StatusBar.currentHeight || 70,
		paddingHorizontal: 20,
	},
	header: {
		width: "100%",
		height: "10%",
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
	},
	leftHeader: {
		width: "70%",
		height: "100%",
		justifyContent: "center",
	},
	rightHeader: {
		width: "30%",
		height: "100%",
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "center",
		gap: 12,
	},
	streakContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: '#e5e7eb',
		gap: 4,
	},
	streakCountText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#1f2937',
	},
	notificationContainer: {
		width: "50%",
		height: "80%",
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 50,
		backgroundColor: "lightgray",

	},
	imageBackground: {
		flex: 1,
		width: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	indexText: {
		fontSize: 25,
		fontWeight: "bold",
	},
	date: {
		fontSize: 18,
		marginBottom: 5,
	},
	boxContainer: {
		width: "100%",
		backgroundColor: "#087179",
		borderRadius: 20,
		borderWidth: 0.5,
		borderColor: "lightgray",
		padding: 20
	},
	boxHeader: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 10,
	},
	boxHeaderLeft: {
		justifyContent: "center",
		backgroundColor: "#338a91",
		padding: 5,
		borderRadius: 25,
	},
	boxHeaderText: {
		fontSize: 12,
		fontWeight: "light",
		color: "white",
	},
	boxText2: {
		fontSize: 16,
		fontWeight: "light",
		color: "white",
		opacity: 0.9,
	},
	trendChartContainer: {
		width: "100%",
		backgroundColor: "white",
		borderRadius: 20,
		borderWidth: 0.5,
		borderColor: "lightgray",
		padding: 20,
		marginTop: 20,
		overflow: 'hidden',
	},
	chartWrapper: {
		width: '100%',
		height: 180,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 10,
	},
	pointerLabel: {
		backgroundColor: 'white',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: '#087179',
	},
	noDataOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(255, 255, 255, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 10,
	},
	noDataText: {
		color: '#6b7280',
		fontSize: 14,
		fontWeight: '600',
	},
	medicationReminderContainer: {
		marginBottom: 20,
		marginTop: 20,
	},
	medicationReminderText: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 10,
	},
	medicationReminderContainerLeft: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	medicationContainer: {
		width: "100%",
		backgroundColor: "white",
		borderRadius: 20,
		borderWidth: 0.5,
		borderColor: "lightgray",
		padding: 20,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
	},
	medicationContainerLeft: {
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#338b912c",
		borderRadius: 50,
		height: 40,
		width: 40
	},
	medicationContainerRight: {
		gap: 5
	},
	medicationContainerRightText: {
		fontSize: 16,
		fontWeight: "bold",
	},
	medicationContainerRightText2: {
		fontSize: 12,
		fontWeight: "light",
		color: "gray",
	},
	medicationContainerRight2: {
		justifyContent: "center",
		alignItems: "center",
	},
	medicalHistoryContainer: {
		width: "100%",
		marginBottom: 30,
	},
	medicalHistoryText: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 10,
		marginTop: 10,
	},
	medicalHistoryContainerItem: {
		width: "100%",
		backgroundColor: "white",
		borderRadius: 20,
		borderWidth: 0.5,
		borderColor: "lightgray",
		padding: 20,
		marginBottom: 10,
	},
	medicationHistoryItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		marginBottom: 10,
	},
	medicalHistoryContainerRight: {
		gap: 5
	},
	medicalHistoryContainerRightText: {
		fontSize: 15,
		fontWeight: "bold",
		color: "#1f2937",
	},
	medicalHistoryContainerRightText2: {
		fontSize: 13,
		fontWeight: "500",
		color: "#6b7280",
	},
	medicalHistoryContainerRight2: {
		justifyContent: "center",
		alignItems: "center",
	},
	severityIndicator: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	symptomBadge: {
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 12,
		minWidth: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	symptomBadgeText: {
		color: 'white',
		fontSize: 12,
		fontWeight: '700',
	},
	viewAllText: {
		color: "#087179",
		fontWeight: "600",
		fontSize: 14,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	modalContent: {
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 24,
		width: '90%',
		maxWidth: 400,
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#1f2937',
	},
	modalDescription: {
		fontSize: 16,
		color: '#4b5563',
		lineHeight: 24,
		marginBottom: 24,
	},
	modalButton: {
		backgroundColor: '#087179',
		borderRadius: 12,
		paddingVertical: 12,
		alignItems: 'center',
	},
	modalButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
});
