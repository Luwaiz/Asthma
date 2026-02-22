import { IconSymbol } from '@/components/ui/icon-symbol';
import { apiService } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const SEVERITY_LEVELS = [
    { label: 'Mild', color: '#10b981' },
    { label: 'Moderate', color: '#f59e0b' },
    { label: 'Severe', color: '#ef4444' },
];

const getSeverityLevel = (severity: number) => {
    const safeSeverity = Math.max(0, Math.min(Math.floor(severity), 2));
    if (severity >= 0 && severity <= 2) {
        return SEVERITY_LEVELS[safeSeverity];
    }
    // Map 1-10 scale from onboarding to 0-2
    if (severity >= 1 && severity <= 3) return SEVERITY_LEVELS[0];
    if (severity >= 4 && severity <= 7) return SEVERITY_LEVELS[1];
    if (severity >= 8 && severity <= 10) return SEVERITY_LEVELS[2];

    return SEVERITY_LEVELS[0];
};

interface Symptom {
    id: string;
    name: string;
    description: string;
    severity: number;
}

interface Log {
    id: string;
    date: string; // ISO String
    symptoms: Symptom[];
    peakFlow: string;
    notes: string;
}

export default function HistoryScreen() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            // 1. Try local first
            const storedLogs = await AsyncStorage.getItem('ASTHMA_DAILY_LOGS');
            if (storedLogs) {
                const parsedLogs: Log[] = JSON.parse(storedLogs);
                const sortedLogs = parsedLogs.sort((a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                setLogs(sortedLogs);
                setFilteredLogs(sortedLogs);
            }

            // 2. Sync with backend
            const remoteLogs = await apiService.getLogs();
            if (remoteLogs && Array.isArray(remoteLogs)) {
                setLogs(remoteLogs);
                setFilteredLogs(remoteLogs);
                await AsyncStorage.setItem('ASTHMA_DAILY_LOGS', JSON.stringify(remoteLogs));
            }
        } catch (error) {
            console.error('Failed to load logs:', error);
        }
    };

    useEffect(() => {
        const filtered = logs.filter(log => {
            const symptomsMatch = log.symptoms.some(s =>
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
            const notesMatch = log.notes.toLowerCase().includes(searchQuery.toLowerCase());
            const dateMatch = new Date(log.date).toLocaleDateString().includes(searchQuery);

            return symptomsMatch || notesMatch || dateMatch;
        });
        setFilteredLogs(filtered);
    }, [searchQuery, logs]);

    const renderLogItem = ({ item }: { item: Log }) => {
        const date = new Date(item.date);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });

        return (
            <View style={styles.logCard}>
                <View style={styles.dateBadge}>
                    <Text style={styles.dateDay}>{day}</Text>
                    <Text style={styles.dateNum}>{dayNum}</Text>
                    <Text style={styles.dateMonth}>{month}</Text>
                </View>

                <View style={styles.logContent}>
                    <View style={styles.logHeader}>
                        <Text style={styles.peakFlowText}>
                            PEF: <Text style={styles.peakFlowValue}>{item.peakFlow || 'N/A'} L/min</Text>
                        </Text>
                    </View>

                    {item.symptoms?.map((s, index) => (
                        <View key={s.id || `symptom-${index}`} style={styles.symptomRow}>
                            <View style={[styles.severityDot, { backgroundColor: getSeverityLevel(s.severity).color }]} />
                            <Text style={styles.symptomName}>{s.name || 'Unnamed Symptom'}</Text>
                        </View>
                    ))}

                    {item.notes ? (
                        <Text style={styles.notesPreview} numberOfLines={1}>
                            "{item.notes}"
                        </Text>
                    ) : null}
                </View>

                <TouchableOpacity
                    style={styles.viewBtn}
                    onPress={() => {
                        // In a real app, we might navigate to a detail screen or back to tracker with this date
                        router.push({
                            pathname: '/(tabs)/tracker',
                            params: { date: item.date }
                        });
                    }}
                >
                    <IconSymbol name="chevron.right" size={20} color="#087179" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <IconSymbol name="chevron.left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Log History</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                    <IconSymbol name="magnifyingglass" size={20} color="#9ca3af" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search symptoms, notes, or dates..."
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <FlatList
                data={filteredLogs}
                keyExtractor={(item, index) => item.id || item._id || String(index)}
                renderItem={renderLogItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <IconSymbol name="calendar.badge.exclamationmark" size={60} color="#e5e7eb" />
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'No matching logs found.' : 'No logs saved yet.'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
        paddingTop: StatusBar.currentHeight || 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        paddingHorizontal: 15,
        height: 50,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#1f2937',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    logCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 15,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    dateBadge: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f4f9f9',
        borderRadius: 16,
        padding: 10,
        width: 60,
    },
    dateDay: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#087179',
        textTransform: 'uppercase',
    },
    dateNum: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    dateMonth: {
        fontSize: 10,
        color: '#9ca3af',
        textTransform: 'uppercase',
    },
    logContent: {
        flex: 1,
        marginLeft: 15,
    },
    logHeader: {
        marginBottom: 5,
    },
    peakFlowText: {
        fontSize: 12,
        color: '#6b7280',
    },
    peakFlowValue: {
        fontWeight: '700',
        color: '#1f2937',
    },
    symptomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    severityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    symptomName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    notesPreview: {
        fontSize: 12,
        color: '#9ca3af',
        fontStyle: 'italic',
        marginTop: 6,
    },
    viewBtn: {
        padding: 5,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#9ca3af',
        fontWeight: '500',
    },
});
