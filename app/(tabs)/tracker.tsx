import { IconSymbol } from '@/components/ui/icon-symbol';
import { apiService } from '@/services/api';
import { fetchAIInsights, Insight } from '@/utils/aiInsights';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


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

function AISuggestion({ insight, loading, onRefresh, onShowInfo }: { insight: Insight | null, loading: boolean, onRefresh: () => void, onShowInfo: () => void }) {
  if (loading) {
    return (
      <View style={styles.AISuggestionContainer}>
        <View style={styles.AISuggestionHeader}>
          <View style={styles.AISuggestionContainerLeft}>
            <ActivityIndicator size="small" color="#087179" />
          </View>
          <Text style={styles.AISuggestionText}>UPDATING AI INSIGHTS...</Text>
          <TouchableOpacity onPress={onRefresh} disabled={loading} style={{ marginLeft: 'auto', opacity: loading ? 0.5 : 1 }}>
            <IconSymbol name="arrow.clockwise" size={20} color="#087179" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!insight) return null;

  return (
    <View style={styles.AISuggestionContainer}>
      <View style={styles.AISuggestionHeader}>
        <View style={styles.AISuggestionContainerLeft}>
          <IconSymbol name="sparkles" size={24} color="#087179" />
        </View>
        <Text style={styles.AISuggestionText}>AI INSIGHTS</Text>
        <TouchableOpacity onPress={onShowInfo}>
          <IconSymbol name="info.circle.fill" size={18} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onRefresh} style={{ marginLeft: 'auto' }}>
          <IconSymbol name="arrow.clockwise" size={20} color="#087179" />
        </TouchableOpacity>
      </View>
      <View>

        <Text style={[styles.AISuggestionText1, { color: insight.color }]}>
          {insight.status}
        </Text>
        <Text style={styles.AISuggestionText2}>
          Trend : {insight.trend}
        </Text>
      </View>
    </View>
  )
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function WeeklyCalendar({
  selectedDate,
  onDateChange,
  logDates
}: {
  selectedDate: Date,
  onDateChange: (date: Date) => void,
  logDates: string[]
}) {
  const [currentDate, setCurrentDate] = React.useState(new Date(selectedDate));

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Go to Sunday

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };

  const weekDates = getWeekDays(currentDate);

  const navigateWeek = (direction: 'next' | 'prev') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const renderWeekDates = () => {
    return weekDates.map((date, index) => {
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      const hasLog = logDates.includes(date.toDateString());

      return (
        <View key={date.toISOString()} style={styles.dayColumn}>
          <Text style={styles.weekDayText}>{DAYS[index]}</Text>
          <TouchableOpacity
            onPress={() => onDateChange(date)}
            style={[
              styles.weekDateContainer,
              isToday && !isSelected && styles.todayContainer,
              isSelected && styles.selectedWeekDateContainer,
            ]}
          >
            <Text style={[
              styles.weekDateText,
              isSelected && styles.weekDateTextSelected
            ]}>
              {date.getDate()}
            </Text>
            {hasLog && (
              <View style={[
                styles.logIndicator,
                isSelected && { backgroundColor: 'white' }
              ]} />
            )}
          </TouchableOpacity>
        </View>
      );
    });
  };

  return (
    <View style={styles.weekCalendarContainer}>
      <View style={styles.weekCalendarHeader}>
        <View>
          <Text style={styles.monthText}>{MONTHS[currentDate.getMonth()]}</Text>
          <Text style={styles.yearText}>{currentDate.getFullYear()}</Text>
        </View>
        <View style={styles.navButtons}>
          <TouchableOpacity onPress={() => navigateWeek('prev')} style={styles.navButton}>
            <IconSymbol name="chevron.left" size={20} color="#087179" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateWeek('next')} style={styles.navButton}>
            <IconSymbol name="chevron.right" size={20} color="#087179" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.weekCalendarDates}>
        {renderWeekDates()}
      </View>
    </View>
  )
}

const SEVERITY_LEVELS = [
  { label: 'Mild', color: '#10b981' },
  { label: 'Moderate', color: '#f59e0b' },
  { label: 'Severe', color: '#ef4444' },
];

interface Symptom {
  id: string;
  _id?: string;
  name: string;
  description: string;
  severity: number;
}

interface Log {
  id: string;
  date: string;
  symptoms: Symptom[];
  peakFlow: string;
  notes: string;
}

function SymptomCard({
  symptom,
  onUpdate,
  onRemove,
  showRemove,
  onShowInfo
}: {
  symptom: Symptom;
  onUpdate: (data: Partial<Symptom>) => void;
  onRemove: () => void;
  showRemove: boolean;
  onShowInfo: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.cardTitle}>Symptom Details</Text>
          <TouchableOpacity onPress={onShowInfo}>
            <IconSymbol name="info.circle.fill" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>
        {showRemove && (
          <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
            <IconSymbol name="minus.circle.fill" size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.formRow}>
        <Text style={styles.formLabel}>Symptom Name</Text>
        <TextInput
          placeholder="e.g. Coughing, Wheezing"
          placeholderTextColor={"lightgray"}
          style={styles.textInput}
          value={symptom.name}
          onChangeText={(val) => onUpdate({ name: val })}
        />
      </View>

      <View style={styles.formRow}>
        <Text style={styles.formLabel}>Description</Text>
        <TextInput
          placeholder="Describe how it feels..."
          placeholderTextColor={"lightgray"}

          style={[styles.textInput, { height: 60 }]}
          multiline
          value={symptom.description}
          onChangeText={(val) => onUpdate({ description: val })}
        />
      </View>

      <View style={styles.formRow}>
        <Text style={styles.formLabel}>Severity</Text>
        <View style={styles.chipContainer}>
          {SEVERITY_LEVELS.map((level, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => onUpdate({ severity: idx })}
              style={[
                styles.chip,
                symptom.severity === idx && { backgroundColor: level.color, borderColor: level.color }
              ]}
            >
              <Text style={[styles.chipText, symptom.severity === idx && styles.chipTextSelected]}>
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const tracker = () => {
  const { date: paramDate } = useLocalSearchParams<{ date?: string }>();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [symptoms, setSymptoms] = useState<Symptom[]>([
    { id: Date.now().toString(), name: '', description: '', severity: 0 }
  ]);
  const [peakFlow, setPeakFlow] = useState('');
  const [notes, setNotes] = useState('');
  const [allLogs, setAllLogs] = useState<Log[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [infoModal, setInfoModal] = useState({ visible: false, title: '', content: '' });
  const isInitialMount = useRef(true);

  useEffect(() => {
    loadAllLogs();
  }, []);

  useEffect(() => {
    if (paramDate) {
      setSelectedDate(new Date(paramDate));
    }
  }, [paramDate]);

  useEffect(() => {
    // Load log for selected date
    const logForDate = allLogs.find(l => new Date(l.date).toDateString() === selectedDate.toDateString());
    if (logForDate) {
      setSymptoms(logForDate.symptoms);
      setPeakFlow(logForDate.peakFlow);
      setNotes(logForDate.notes);
    } else {
      // Reset form for fresh date
      setSymptoms([{ id: Date.now().toString(), name: '', description: '', severity: 0 }]);
      setPeakFlow('');
      setNotes('');
    }
  }, [selectedDate, allLogs]);

  const loadInsightFromCache = async () => {
    try {
      const cached = await AsyncStorage.getItem('AI_INSIGHTS_CACHE');
      if (cached) {
        const { data } = JSON.parse(cached);
        setInsight(data);
      }
    } catch (error) {
      console.error('Error loading cached insights:', error);
    }
  };

  const loadInsight = async (force = false) => {
    if (allLogs.length === 0) return;

    // Only fetch if forced (after saving a log)
    if (force) {
      setIsInsightLoading(true);
      try {
        const newInsight = await fetchAIInsights();
        setInsight(newInsight);

        // Save to cache with timestamp
        await AsyncStorage.setItem('AI_INSIGHTS_CACHE', JSON.stringify({
          data: newInsight,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Error fetching AI insights:', e);
      } finally {
        setIsInsightLoading(false);
      }
    }
  };

  useEffect(() => {
    const initializeInsights = async () => {
      // Load from cache first
      await loadInsightFromCache();

      // Only fetch fresh data on initial mount and if we have logs
      if (isInitialMount.current && allLogs.length > 0) {
        await loadInsight(true);
        isInitialMount.current = false;
      }
    };

    initializeInsights();
  }, [allLogs.length]); // Only watch logs count, not the entire array

  const loadAllLogs = async () => {
    try {
      // 1. Load from local first for speed
      const stored = await AsyncStorage.getItem('ASTHMA_DAILY_LOGS');
      if (stored) {
        setAllLogs(JSON.parse(stored));
      }

      // 2. Load from backend to sync
      const remoteLogs = await apiService.getLogs();
      if (remoteLogs && Array.isArray(remoteLogs)) {
        setAllLogs(remoteLogs);
        await AsyncStorage.setItem('ASTHMA_DAILY_LOGS', JSON.stringify(remoteLogs));
      }
    } catch (e) {
      console.error('Error loading logs:', e);
    }
  };

  const addSymptom = () => {
    setSymptoms([
      ...symptoms,
      { id: Date.now().toString(), name: '', description: '', severity: 0 }
    ]);
  };

  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter(s => s.id !== id));
  };

  const updateSymptom = (id: string, data: Partial<Symptom>) => {
    setSymptoms(symptoms.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    const logId = allLogs.find(l => new Date(l.date).toDateString() === selectedDate.toDateString())?.id || Date.now().toString();

    const newLog: Log = {
      id: logId,
      date: selectedDate.toISOString(),
      symptoms,
      peakFlow,
      notes
    };

    try {
      // 1. Save to backend
      await apiService.saveLog(newLog);

      // 2. Save locally as fallback/cache
      const updatedLogs = allLogs.filter(l => new Date(l.date).toDateString() !== selectedDate.toDateString());
      updatedLogs.push(newLog);
      await AsyncStorage.setItem('ASTHMA_DAILY_LOGS', JSON.stringify(updatedLogs));
      setAllLogs(updatedLogs);

      // Set health status as stale so Home page refreshes it
      await AsyncStorage.setItem('HEALTH_STATUS_STALE', 'true');

      // 3. Reset form
      setSymptoms([{ id: Date.now().toString(), name: '', description: '', severity: 0 }]);
      setPeakFlow('');
      setNotes('');

      alert('Log saved successfully!');

      // 4. Trigger AI update immediately
      loadInsight(true);
    } catch (e) {
      console.error('Save error:', e);
      alert('Log saved locally. Sync with server failed.');

      // Still save locally if backend fails
      const updatedLogs = allLogs.filter(l => new Date(l.date).toDateString() !== selectedDate.toDateString());
      updatedLogs.push(newLog);
      await AsyncStorage.setItem('ASTHMA_DAILY_LOGS', JSON.stringify(updatedLogs));
      setAllLogs(updatedLogs);
    } finally {
      setIsSaving(false);
    }
  };

  const showInfo = (type: 'insights' | 'symptoms' | 'pef' | 'notes') => {
    switch (type) {
      case 'insights':
        setInfoModal({
          visible: true,
          title: 'AI Insights',
          content: 'These insights are generated by our AI based on your historical logs. They help identify potential asthma triggers and overall symptom trends.'
        });
        break;
      case 'symptoms':
        setInfoModal({
          visible: true,
          title: 'Symptoms & Severity',
          content: 'Log your symptoms and rate their severity:\n\n• Mild: Only slightly bothersome.\n• Moderate: Harder to perform regular tasks.\n• Severe: Cannot carry out normal daily activities.'
        });
        break;
      case 'pef':
        setInfoModal({
          visible: true,
          title: 'Peak Flow (PEF)',
          content: 'Peak Expiratory Flow (PEF) measures how fast you can breathe out. Tracking this daily helps monitor your lung health and detect potential flare-ups before they get serious.'
        });
        break;
      case 'notes':
        setInfoModal({
          visible: true,
          title: 'Daily Notes',
          content: 'Use this section to record any information that might be relevant to your asthma, such as potential triggers (dust, pollen), medication changes, or specific environmental factors.'
        });
        break;
    }
  };

  const logDates = allLogs.map(l => new Date(l.date).toDateString());

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            <Text style={styles.headerText}>Vital Tracker</Text>
          </View>
          <TouchableOpacity style={styles.rightHeader} onPress={() => router.push('/history')}>
            <IconSymbol name="calendar" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <AISuggestion
            insight={insight}
            loading={isInsightLoading}
            onRefresh={() => loadInsight(true)}
            onShowInfo={() => showInfo('insights')}
          />
          <WeeklyCalendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            logDates={logDates}
          />

          <View style={styles.logSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daily Log</Text>
              <TouchableOpacity onPress={addSymptom} style={styles.addSymptomBtn}>
                <IconSymbol name="plus.circle.fill" size={20} color="#087179" />
                <Text style={styles.addSymptomText}>Add Symptom</Text>
              </TouchableOpacity>
            </View>

            {symptoms.map((s, index) => (
              <SymptomCard
                key={s.id || s._id || index}
                symptom={s}
                showRemove={symptoms.length > 1}
                onUpdate={(data) => updateSymptom(s.id, data)}
                onRemove={() => removeSymptom(s.id)}
                onShowInfo={() => showInfo('symptoms')}
              />
            ))}

            <View style={styles.inputGroup}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Text style={styles.inputLabelNoMargin}>Peak Expiratory Flow (PEF)</Text>
                <TouchableOpacity onPress={() => showInfo('pef')}>
                  <IconSymbol name="info.circle.fill" size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={peakFlow}
                  onChangeText={setPeakFlow}
                />
                <Text style={styles.unitText}>L/min</Text>
              </View>
            </View>

            <View style={[styles.inputGroup, { marginTop: 20 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Text style={styles.inputLabelNoMargin}>Additional Notes</Text>
                <TouchableOpacity onPress={() => showInfo('notes')}>
                  <IconSymbol name="info.circle.fill" size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.textArea}
                placeholder="How are you feeling overall today?"
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        <InfoModal
          visible={infoModal.visible}
          title={infoModal.title}
          content={infoModal.content}
          onClose={() => setInfoModal(prev => ({ ...prev, visible: false }))}
        />

        <Pressable
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save Daily Log</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

export default tracker

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
    justifyContent: "space-between",
  },
  leftHeader: {
    justifyContent: "center",
  },
  rightHeader: {
    justifyContent: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  AISuggestionContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "lightgray",
    padding: 20,
    marginBottom: 20,
  },
  AISuggestionContainerLeft: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#338b912c",
    borderRadius: 50,
    height: 40,
    width: 40
  },
  AISuggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  AISuggestionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#338b91",
  },
  AISuggestionText1: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  AISuggestionText2: {
    fontSize: 14,
    fontWeight: "regular",
    color: "gray",
  },
  weekCalendarContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  weekCalendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2d2d2d",
  },
  yearText: {
    fontSize: 14,
    color: "gray",
  },
  navButtons: {
    flexDirection: "row",
    gap: 10,
  },
  navButton: {
    backgroundColor: "#f4f9f9",
    padding: 8,
    borderRadius: 12,
  },
  weekCalendarDates: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayColumn: {
    alignItems: "center",
    gap: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
  },
  weekDateContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    height: 40,
    width: 40,
  },
  todayContainer: {
    borderWidth: 1,
    borderColor: "#087179",
  },
  selectedWeekDateContainer: {
    backgroundColor: "#087179",
    shadowColor: "#087179",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  weekDateText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4b5563",
  },
  weekDateTextSelected: {
    color: "white",
  },
  logIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#10b981",
    marginTop: 2,
  },
  scrollView: {
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  logSection: {
    width: "100%",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2d2d2d",
  },
  addSymptomBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f4f9f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addSymptomText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#087179",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4b5563",
  },
  removeBtn: {
    padding: 2,
  },
  formRow: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  chipTextSelected: {
    color: "white",
  },
  inputGroup: {
    width: "100%",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 15,
  },
  textInput: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: "#1f2937",
    fontWeight: "600",
    borderWidth: 0.5,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 15
  },
  textArea: {
    height: 100,
    paddingTop: 15,
    textAlignVertical: "top",
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 15,
  },
  unitText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9ca3af",
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: "#087179",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    position: "absolute",
    bottom: 20,
    height: 56,
    justifyContent: "center",
    shadowColor: "#087179",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "white",
  },
  saveButtonDisabled: {
    backgroundColor: "#065a61",
    opacity: 0.8,
  },
  inputLabelNoMargin: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
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
