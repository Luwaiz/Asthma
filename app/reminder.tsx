import { IconSymbol } from "@/components/ui/icon-symbol"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import { apiService } from "@/services/api"
import DateTimePicker from '@react-native-community/datetimepicker'
import * as Notifications from 'expo-notifications'
import { Stack } from "expo-router"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"

interface ReminderItem {
    id: string
    _id?: string
    title: string
    time: string
    date?: string
    type: "medication" | "appointment"
    subtitle?: string
}

function SectionHeader({ title }: { title: string }) {
    return (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    )
}

function ReminderCard({ item, onDelete }: { item: ReminderItem, onDelete: (id: string) => void }) {
    const isMedication = item.type === "medication"

    const confirmDelete = () => {
        const idToDelete = item._id || item.id;
        Alert.alert(
            "Delete Reminder",
            "Are you sure you want to delete this reminder?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => onDelete(idToDelete) }
            ]
        )
    }

    return (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: isMedication ? "#338b912c" : "#e0f2f1" }]}>
                    <IconSymbol
                        name={isMedication ? "pill.fill" : "calendar"}
                        size={24}
                        color="#087179"
                    />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    {item.subtitle && <Text style={styles.cardSubtitle}>{item.subtitle}</Text>}
                    {item.date && <Text style={styles.cardDate}>{item.date}</Text>}
                </View>
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{item.time}</Text>
                    <TouchableOpacity onPress={confirmDelete} style={{ marginLeft: 10 }}>
                        <IconSymbol name="trash.fill" size={18} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const Reminder = () => {
    const [reminders, setReminders] = useState<ReminderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Time/Date Picker State
    const [date, setDate] = useState(new Date());
    const [appointmentDate, setAppointmentDate] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('');
    const [formattedDate, setFormattedDate] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [type, setType] = useState<'medication' | 'appointment'>('medication');

    // Time Picker Handler
    const onTimeChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowTimePicker(Platform.OS === 'ios');
        setDate(currentDate);

        if (event.type === "set" || Platform.OS === 'ios') {
            const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setTime(formattedTime);
        }

        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
    };

    // Date Picker Handler
    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || appointmentDate;
        setShowDatePicker(Platform.OS === 'ios');
        setAppointmentDate(currentDate);

        if (event.type === "set" || Platform.OS === 'ios') {
            const formatted = currentDate.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
            setFormattedDate(formatted);
        }

        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
    };

    const { expoPushToken } = usePushNotifications();

    useEffect(() => {
        if (expoPushToken) {
            apiService.updatePushToken(expoPushToken).catch(console.error);
        }
    }, [expoPushToken]);

    useEffect(() => {
        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            const data = await apiService.getReminders();
            setReminders(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddReminder = async () => {
        if (!title.trim() || !time.trim()) {
            return Alert.alert('Error', 'Title and Time are required');
        }
        if (type === 'appointment' && !formattedDate) {
            return Alert.alert('Error', 'Date is required for appointments');
        }

        setIsSaving(true);
        try {
            const newReminder = await apiService.addReminder({
                title,
                time,
                type,
                subtitle,
                date: type === 'appointment' ? formattedDate : undefined
            });
            setReminders([...reminders, newReminder]);

            // Schedule Local Notification
            try {
                const [timeStr, modifier] = time.split(' ');
                let [hours, minutes] = timeStr.split(':').map(Number);
                if (modifier === 'PM' && hours < 12) hours += 12;
                if (modifier === 'AM' && hours === 12) hours = 0;

                const trigger = new Date();
                if (type === 'appointment' && formattedDate) {
                    const appointmentDateObj = new Date(formattedDate);
                    trigger.setFullYear(appointmentDateObj.getFullYear());
                    trigger.setMonth(appointmentDateObj.getMonth());
                    trigger.setDate(appointmentDateObj.getDate());
                }
                trigger.setHours(hours, minutes, 0, 0);

                // If the time has already passed today and it's a medication, schedule for tomorrow
                if (trigger < new Date() && type === 'medication') {
                    trigger.setDate(trigger.getDate() + 1);
                }

                if (trigger > new Date()) {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: type === 'medication' ? 'Medication Reminder' : 'Appointment Reminder',
                            body: `${title}${subtitle ? `: ${subtitle}` : ''}`,
                            data: { reminderId: newReminder._id || newReminder.id },
                        },
                        trigger: trigger as any,
                    });
                    console.log(`Notification scheduled for: ${trigger.toLocaleString()}`);
                }
            } catch (notifyErr) {
                console.error("Failed to schedule notification:", notifyErr);
            }

            setModalVisible(false);
            // Reset form
            setTitle('');
            setTime('');
            setFormattedDate('');
            setSubtitle('');
            setType('medication');
        } catch (e: any) {
            console.error('handleAddReminder error:', e);
            Alert.alert('Error', `Failed to add reminder: ${e.message || 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteReminder = async (id: string) => {
        try {
            await apiService.deleteReminder(id);
            setReminders(reminders.filter(r => (r._id || r.id) !== id));
        } catch (e) {
            Alert.alert('Error', 'Failed to delete reminder');
        }
    };

    const medications = reminders.filter(r => r.type === 'medication');
    const appointments = reminders.filter(r => r.type === 'appointment');

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: "Reminders",
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: "#fafafa" }
                }}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.header}>
                    <Text style={styles.headerText}>Health Management</Text>
                    <Text style={styles.subHeaderText}>Never miss a dose or appointment</Text>
                </View>

                <SectionHeader title="Medications" />
                {loading ? (
                    <ActivityIndicator color="#087179" style={{ marginVertical: 20 }} />
                ) : medications.length === 0 ? (
                    <Text style={styles.emptyText}>No medications scheduled</Text>
                ) : (
                    medications.map(item => (
                        <ReminderCard key={item._id || item.id} item={item} onDelete={handleDeleteReminder} />
                    ))
                )}

                <SectionHeader title="Appointments" />
                {loading ? (
                    <ActivityIndicator color="#087179" style={{ marginVertical: 20 }} />
                ) : appointments.length === 0 ? (
                    <Text style={styles.emptyText}>No appointments scheduled</Text>
                ) : (
                    appointments.map(item => (
                        <ReminderCard key={item._id || item.id} item={item} onDelete={handleDeleteReminder} />
                    ))
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
                <IconSymbol name="plus" size={24} color="white" />
                <Text style={styles.addButtonText}>Add Reminder</Text>
            </Pressable>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.keyboardView}
                    >
                        <View style={styles.modalContent}>
                            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                                <Text style={styles.modalTitle}>Add New Reminder</Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Title (e.g., GP Check-up)"
                                    value={title}
                                    onChangeText={setTitle}
                                />

                                <Pressable onPress={() => setShowTimePicker(true)}>
                                    <View style={[styles.input, { justifyContent: 'center' }]}>
                                        <Text style={{ fontSize: 16, color: time ? '#000' : '#9ca3af' }}>
                                            {time || "Select Time (e.g., 10:30 AM)"}
                                        </Text>
                                    </View>
                                </Pressable>

                                {showTimePicker && (
                                    <View style={{ marginVertical: 10 }}>
                                        <DateTimePicker
                                            testID="timePicker"
                                            value={date}
                                            mode="time"
                                            is24Hour={false}
                                            display="default"
                                            onChange={onTimeChange}
                                        />
                                    </View>
                                )}

                                {type === 'appointment' && (
                                    <>
                                        <Pressable onPress={() => setShowDatePicker(true)}>
                                            <View style={[styles.input, { justifyContent: 'center' }]}>
                                                <Text style={{ fontSize: 16, color: formattedDate ? '#000' : '#9ca3af' }}>
                                                    {formattedDate || "Select Date"}
                                                </Text>
                                            </View>
                                        </Pressable>

                                        {showDatePicker && (
                                            <View style={{ marginVertical: 10 }}>
                                                <DateTimePicker
                                                    testID="datePicker"
                                                    value={appointmentDate}
                                                    mode="date"
                                                    display="default"
                                                    onChange={onDateChange}
                                                />
                                            </View>
                                        )}
                                    </>
                                )}

                                <TextInput
                                    style={styles.input}
                                    placeholder="Subtitle (Optional)"
                                    value={subtitle}
                                    onChangeText={setSubtitle}
                                />

                                <View style={styles.typeSelector}>
                                    <TouchableOpacity
                                        style={[styles.typeButton, type === 'medication' && styles.typeButtonActive]}
                                        onPress={() => setType('medication')}
                                    >
                                        <Text style={[styles.typeButtonText, type === 'medication' && styles.typeButtonTextActive]}>Medication</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.typeButton, type === 'appointment' && styles.typeButtonActive]}
                                        onPress={() => setType('appointment')}
                                    >
                                        <Text style={[styles.typeButtonText, type === 'appointment' && styles.typeButtonTextActive]}>Appointment</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.cancelButton]}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.saveButton]}
                                        onPress={handleAddReminder}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <Text style={styles.saveButtonText}>Add</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    )
}

export default Reminder

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fafafa",
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingTop: 10,
        paddingBottom: 20,
    },
    header: {
        marginBottom: 25,
        marginTop: 10,
    },
    headerText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1a1a1a",
    },
    subHeaderText: {
        fontSize: 16,
        color: "gray",
        marginTop: 5,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000000ff",
    },
    card: {
        backgroundColor: "white",
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: "lightgray",
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1a1a1a",
    },
    cardSubtitle: {
        fontSize: 14,
        color: "gray",
        marginTop: 2,
    },
    cardDate: {
        fontSize: 12,
        color: "#087179",
        marginTop: 2,
        fontWeight: '500',
    },
    timeContainer: {
        alignItems: "flex-end",
        flexDirection: "row",
        gap: 8,
    },
    timeText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#087179",
    },
    addButton: {
        backgroundColor: "#087179",
        flexDirection: "row",
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        bottom: 30,
        left: 20,
        right: 20,
        shadowColor: "#087179",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
        gap: 8,
    },
    addButtonText: {
        color: "white",
        fontSize: 17,
        fontWeight: "bold",
    },
    emptyText: {
        textAlign: 'center',
        color: 'gray',
        marginVertical: 10,
        fontSize: 15,
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
        width: '100%',
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        maxHeight: '90%',
    },
    keyboardView: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#1f2937',
    },
    input: {
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    typeButton: {
        flex: 1,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#087179',
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeButtonActive: {
        backgroundColor: '#087179',
    },
    typeButtonText: {
        color: '#087179',
        fontWeight: '600',
    },
    typeButtonTextActive: {
        color: 'white',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    modalButton: {
        flex: 1,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
    },
    saveButton: {
        backgroundColor: '#087179',
    },
    cancelButtonText: {
        color: '#4b5563',
        fontWeight: '600',
        fontSize: 16,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
})
