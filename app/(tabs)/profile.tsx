import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/firebaseConfig';
import { apiService } from '@/services/api';
import { router } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';


function Medication() {
  const [medications, setMedications] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const data = await apiService.getMedications();
      setMedications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = async () => {
    if (!newName.trim()) return Alert.alert('Error', 'Medication name is required');
    setIsSaving(true);
    try {
      const med = await apiService.addMedication({
        name: newName,
        description: newDesc
      });
      setMedications([...medications, med]);
      setModalVisible(false);
      setNewName('');
      setNewDesc('');
    } catch (e: any) {
      console.error('handleAddMedication error:', e);
      Alert.alert('Error', `Failed to add medication: ${e.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMedication = async (id: string) => {
    Alert.alert(
      "Delete Medication",
      "Are you sure you want to delete this medication?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiService.deleteMedication(id);
              setMedications(medications.filter(m => (m._id || m.id) !== id));
            } catch (e: any) {
              console.error('handleDeleteMedication error:', e);
              Alert.alert('Error', `Failed to delete medication: ${e.message || 'Unknown error'}`);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.medicationContainer}>
      <View style={styles.medicationHeader}>
        <Text style={styles.medicationText}>My Medication</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <IconSymbol name="plus.circle.fill" size={30} color="#087179" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#087179" style={{ marginVertical: 20 }} />
      ) : medications.length === 0 ? (
        <Text style={{ textAlign: 'center', color: 'gray', marginVertical: 10 }}>No medications added yet.</Text>
      ) : (
        medications.map((item, index) => (
          <View style={styles.medicationListContainer} key={item._id || item.id || index}>
            <View style={styles.medicationContainerLeft}>
              <IconSymbol name="pill.fill" size={24} color="#087179" />
            </View>
            <View style={styles.medicationContainerRight}>
              <Text style={styles.medicationContainerRightText}>{item.name}</Text>
              <Text style={styles.medicationContainerRightText2}>{item.description}</Text>
            </View>
            <TouchableOpacity
              style={styles.medicationContainerRight2}
              onPress={() => handleDeleteMedication(item._id || item.id)}
            >
              <IconSymbol name="trash.fill" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* Add Medication Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Medication</Text>

            <TextInput
              style={styles.input}
              placeholder="Medication Name (e.g., Ventolin)"
              value={newName}
              onChangeText={setNewName}
            />

            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Dosage & Frequency (e.g., 2 puffs daily)"
              multiline
              value={newDesc}
              onChangeText={setNewDesc}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddMedication}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}


const TRIGGER_ICONS: Record<string, string> = {
  "Dust": "sun.dust",
  "Pollen": "pollen",
  "Pets": "pawprint",
  "Smoke": "smoke",
  "Cold Air": "snowflake",
  "Exercise": "figure.run",
  "Stress": "brain.head.profile",
  "Perfume": "drop.fill",
  "Mold": "microbe.fill"
};

function Triggers({ triggers }: { triggers: string[] }) {
  if (!triggers || triggers.length === 0) {
    return (
      <View style={styles.triggersContainer}>
        <Text style={styles.triggersText}>Triggers</Text>
        <Text style={{ color: 'gray' }}>No triggers recorded.</Text>
      </View>
    )
  }

  return (
    <View style={styles.triggersContainer}>
      <Text style={styles.triggersText}>My Triggers</Text>
      <ScrollView contentContainerStyle={styles.triggersListContainer} horizontal={true} showsHorizontalScrollIndicator={false}>
        {triggers.map((trigger, index) => {
          const iconName = TRIGGER_ICONS[trigger] || "exclamationmark.triangle.fill";
          return (
            <View style={styles.triggersListContainerItem} key={index}>
              <IconSymbol name={iconName as any} size={24} color="#087179" />
              <Text style={styles.triggersListContainerItemText}>{trigger}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  )
}

function EmergencyContact({ contact }: { contact: { name: string, phone: string } | undefined }) {
  if (!contact || !contact.name) {
    return (
      <View style={styles.emergencyContactContainer}>
        <Text style={styles.emergencyContactText}>Emergency Contact</Text>
        <Text style={{ color: 'gray' }}>No emergency contact set.</Text>
      </View>
    )
  }

  return (
    <View style={styles.emergencyContactContainer}>
      <Text style={styles.emergencyContactText}>Emergency Contact</Text>
      <View style={styles.emergencyContactListContainer}>
        <View style={styles.emergencyContactListContainerItem}>
          <IconSymbol name="person.fill" size={24} color="#087179" />
          <View style={styles.emergencyContactListContainerItemInfo}>

            <View>
              <Text style={styles.emergencyContactListContainerItemText}>{contact.name}</Text>
              <Text style={styles.emergencyContactListContainerItemText2}>{contact.phone}</Text>
            </View>
            <View style={styles.emergencyContactListContainerItemRight}>
              <IconSymbol name="phone.fill" size={20} color="#087179" />
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

function Settings() {
  const { signOut, user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const settingsItems = [
    { id: '1', title: 'Language', value: 'English', icon: 'globe.americas.fill' },
    { id: '2', title: 'Privacy Settings', icon: 'lock.shield.fill' },
    { id: '3', title: 'Help & Support', icon: 'questionmark.circle.fill' },
    { id: '4', title: 'Terms of Service', icon: 'doc.plaintext.fill' },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ],
    );
  };

  return (
    <View style={styles.settingsSection}>
      <Text style={styles.settingsText}>Settings</Text>

      <View style={styles.settingsBody}>
        {/* Toggle Setting */}
        <View style={styles.settingCard}>
          <View style={styles.settingIconWrapper}>
            <IconSymbol name="bell.fill" size={22} color="#087179" />
          </View>
          <Text style={styles.settingTitle}>Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#e5e7eb", true: "#087179" }}
            thumbColor={"white"}
          />
        </View>

        {/* Regular Settings */}
        {settingsItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.settingCard}>
            <View style={styles.settingIconWrapper}>
              <IconSymbol name={item.icon as any} size={22} color="#087179" />
            </View>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
            <IconSymbol name="chevron.right" size={16} color="#9ca3af" />
          </TouchableOpacity>
        ))}

        {/* Danger Zone */}
        <TouchableOpacity
          style={[styles.settingCard, { borderBottomWidth: 0 }]}
          onPress={handleLogout}
        >
          <View style={[styles.settingIconWrapper, { backgroundColor: '#fef2f2' }]}>
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={22} color="#ef4444" />
          </View>
          <Text style={[styles.settingTitle, { color: '#ef4444' }]}>Log Out</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          style={[styles.settingCard, { borderBottomWidth: 0, borderTopWidth: 0.5, borderTopColor: '#f3f4f6' }]}
          onPress={() => {
            Alert.alert(
              'Delete Account',
              'Are you sure you want to delete your account? This action is irreversible and will delete all your data.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // 1. Delete backend data first
                      await apiService.deleteUser();

                      // 2. Delete Firebase Auth user
                      if (user) {
                        await user.delete();
                      }

                      // 3. Navigate away
                      router.replace('/login');
                      Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
                    } catch (e: any) {
                      console.error('Delete account error:', e);

                      if (e.code === 'auth/requires-recent-login') {
                        Alert.alert(
                          'Security Check Required',
                          'For security reasons, you need to have logged in recently to delete your account. Please log in again and try deleting your account.',
                          [{
                            text: 'Log In Again',
                            onPress: async () => {
                              await signOut();
                              router.replace('/login');
                            }
                          }]
                        );
                      } else {
                        Alert.alert('Error', `Failed to delete account: ${e.message || 'Unknown error'}`);
                      }
                    }
                  }
                }
              ]
            );
          }}
        >
          <View style={[styles.settingIconWrapper, { backgroundColor: '#fef2f2' }]}>
            <IconSymbol name="trash.fill" size={22} color="#ef4444" />
          </View>
          <Text style={[styles.settingTitle, { color: '#ef4444' }]}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedAsthmaLevel, setEditedAsthmaLevel] = useState('Mild');
  const [editedYearOfBirth, setEditedYearOfBirth] = useState('');
  const [editedGender, setEditedGender] = useState('');

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';
  const asthmaLevel = userProfile?.asthmaLevel || 'Mild';
  const memberSince = user?.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  const age = userProfile?.yearOfBirth ? new Date().getFullYear() - userProfile.yearOfBirth : null;
  const gender = userProfile?.gender ? userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1) : null;

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await apiService.getUserProfile();
      setUserProfile(profile);
      if (profile) {
        setEditedName(profile.displayName || '');
        setEditedAsthmaLevel(profile.asthmaLevel || 'Mild');
      }
    } catch (e) {
      console.error('Error fetching user profile:', e);
    }
  };

  const handleOpenEditModal = () => {
    setEditedName(displayName);
    setEditedAsthmaLevel(asthmaLevel);
    setEditedYearOfBirth(userProfile?.yearOfBirth?.toString() || '');
    setEditedGender(userProfile?.gender || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      return Alert.alert('Error', 'Display name is required');
    }
    setIsSavingProfile(true);
    try {
      const updated = await apiService.updateUserProfile({
        displayName: editedName,
        asthmaLevel: editedAsthmaLevel,
        yearOfBirth: editedYearOfBirth ? parseInt(editedYearOfBirth) : undefined,
        gender: editedGender || undefined,
      });
      setUserProfile(updated);

      // Also update Firebase user object so home page sees the new name
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: editedName });
      }
      // Refresh AuthContext so any component using useAuth() re-renders with new name
      await refreshProfile();

      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (e: any) {
      console.error('Error updating profile:', e);
      Alert.alert('Error', `Failed to update profile: ${e.message || 'Unknown error'}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>User Profile</Text>
        <TouchableOpacity style={styles.editBtn} onPress={handleOpenEditModal}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarCircleLarge}>
            <Text style={styles.avatarTextLarge}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <View style={styles.asthmaInfo}>
              <Text style={styles.asthmaInfoText}>Asthma level: {asthmaLevel}</Text>
            </View>

            {(age !== null || gender !== null) && (
              <View style={styles.demographicInfo}>
                {age !== null && <Text style={styles.demographicText}>{age} years old</Text>}
                {age !== null && gender !== null && <Text style={styles.demographicDivider}>•</Text>}
                {gender !== null && <Text style={styles.demographicText}>{gender}</Text>}
              </View>
            )}
            {userProfile?.yearsWithAsthma && (
              <Text style={styles.profileMemberSince}>Diagnosed {userProfile.yearsWithAsthma} ago</Text>
            )}
            <Text style={styles.profileMemberSince}>Member since {memberSince}</Text>
          </View>
        </View>
        <Medication />
        <Triggers triggers={userProfile?.triggers} />
        <EmergencyContact contact={userProfile?.emergencyContact} />
        <Settings />
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <TextInput
              style={styles.input}
              placeholder="Display Name"
              value={editedName}
              onChangeText={setEditedName}
            />

            <Text style={styles.inputLabel}>Asthma Level</Text>
            <View style={styles.asthmaLevelSelector}>
              {['Mild', 'Moderate', 'Severe'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.asthmaLevelButton,
                    editedAsthmaLevel === level && styles.asthmaLevelButtonActive,
                  ]}
                  onPress={() => setEditedAsthmaLevel(level)}
                >
                  <Text
                    style={[
                      styles.asthmaLevelButtonText,
                      editedAsthmaLevel === level && styles.asthmaLevelButtonTextActive,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Year of Birth</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 1995"
              value={editedYearOfBirth}
              onChangeText={setEditedYearOfBirth}
              keyboardType="numeric"
              maxLength={4}
            />

            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.genderEditContainer}>
              {['Male', 'Female', 'Other', 'Prefer not to say'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderEditChip,
                    editedGender === option && styles.genderEditChipActive,
                  ]}
                  onPress={() => setEditedGender(option)}
                >
                  <Text
                    style={[
                      styles.genderEditChipText,
                      editedGender === option && styles.genderEditChipTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={isSavingProfile}
              >
                {isSavingProfile ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default Profile

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
    marginBottom: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  editBtn: {
    backgroundColor: "#338b912c",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editBtnText: {
    color: "#087179",
    fontSize: 14,
    fontWeight: "600",
  },
  avatarCircleLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#087179",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarTextLarge: {
    color: "white",
    fontSize: 48,
    fontWeight: "bold",
  },
  profileContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  scrollView: {
    width: "100%",
    height: "100%",

  },
  profileInfo: {
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    fontSize: 24,
    marginTop: 10,
    fontWeight: "bold",
  },
  profileMemberSince: {
    fontSize: 14,
    marginTop: 5,
    color: "#666",
  },
  asthmaInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: "#338b912c",
    padding: 16,
    borderRadius: 30,
    marginBottom: 10,
  },
  asthmaInfoText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  demographicInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
    gap: 8,
  },
  demographicText: {
    fontSize: 15,
    color: "#4b5563",
    fontWeight: "500",
  },
  demographicDivider: {
    fontSize: 15,
    color: "#9ca3af",
  },
  medicationContainer: {
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  medicationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  medicationText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  medicationListContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "lightgray",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  medicationContainerLeft: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#338b912c",
    borderRadius: 10,
    height: 50,
    width: 50
  },
  medicationContainerRight: {
    gap: 5,
    marginLeft: 10
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
    marginLeft: "auto"
  },
  triggersContainer: {
    width: "100%",
    justifyContent: "space-between",
  },
  triggersText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
  },
  triggersListContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  triggersListContainerItem: {
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "lightgray",
    padding: 16,
    alignItems: "center",
    marginBottom: 10,
    minWidth: 100,
  },
  triggersListContainerItemText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emergencyContactContainer: {
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  emergencyContactText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
  },
  emergencyContactListContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emergencyContactListContainerItem: {
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "lightgray",
    padding: 16,
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  emergencyContactListContainerItemInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },
  emergencyContactListContainerItemText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emergencyContactListContainerItemText2: {
    fontSize: 12,
    fontWeight: "light",
    color: "gray",
  },
  emergencyContactListContainerItemRight: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#338b912c",
    borderRadius: 50,
    height: 50,
    width: 50,
  },
  settingsSection: {
    width: '100%',
    marginBottom: 20,
  },
  settingsText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 20,
    color: '#1f2937',
  },
  settingsBody: {
    backgroundColor: 'white',
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: 'lightgray',
    overflow: 'hidden',
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6',
  },
  settingIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f4f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  settingValue: {
    fontSize: 14,
    color: '#9ca3af',
    marginRight: 8,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  asthmaLevelSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  asthmaLevelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  asthmaLevelButtonActive: {
    backgroundColor: '#087179',
    borderColor: '#087179',
  },
  asthmaLevelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  asthmaLevelButtonTextActive: {
    color: 'white',
  },
  genderEditContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 20,
  },
  genderEditChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  genderEditChipActive: {
    backgroundColor: '#087179',
    borderColor: '#087179',
  },
  genderEditChipText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  genderEditChipTextActive: {
    color: 'white',
  },
})