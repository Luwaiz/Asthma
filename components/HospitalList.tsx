import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  Linking, 
  Platform 
} from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { useNearbyHospitals, Hospital } from '@/hooks/useNearbyHospitals';

export const HospitalList = () => {
  const { hospitals, loading, error, refetch } = useNearbyHospitals();
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  const openInMaps = (hospital: Hospital) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${hospital.name}, ${hospital.address}`;
    const label = hospital.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Nearest Hospitals</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#087179" />
          <Text style={styles.loadingText}>Finding nearby hospitals...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Nearest Hospitals</Text>
            <TouchableOpacity onPress={refetch}>
                <IconSymbol name="arrow.clockwise" size={20} color="#087179" />
            </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearest Hospitals</Text>
        <TouchableOpacity onPress={refetch}>
          <IconSymbol name="arrow.clockwise" size={20} color="#087179" />
        </TouchableOpacity>
      </View>
      
      {hospitals.length === 0 ? (
        <Text style={styles.emptyText}>No hospitals found within 15km.</Text>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.listContainer}
        >
          {hospitals.map((hospital) => (
            <TouchableOpacity 
              key={hospital.id} 
              style={styles.hospitalCard}
              onPress={() => setSelectedHospital(hospital)}
            >
              <View style={styles.iconWrapper}>
                <IconSymbol name="heart.text.square.fill" size={24} color="#087179" />
              </View>
              <View style={styles.infoWrapper}>
                <Text style={styles.hospitalName} numberOfLines={1}>{hospital.name}</Text>
                <Text style={styles.hospitalAddress} numberOfLines={2}>{hospital.address}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Hospital Details Modal */}
      <Modal
        visible={!!selectedHospital}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedHospital(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setSelectedHospital(null)}
        >
          <View style={styles.modalContent}>
            {selectedHospital && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalIconBg}>
                    <IconSymbol name="heart.text.square.fill" size={32} color="#087179" />
                  </View>
                  <TouchableOpacity onPress={() => setSelectedHospital(null)} style={styles.closeBtn}>
                    <IconSymbol name="xmark" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalTitle}>{selectedHospital.name}</Text>
                
                <View style={styles.detailRow}>
                  <IconSymbol name="mappin.and.ellipse" size={18} color="#087179" />
                  <Text style={styles.modalAddress}>{selectedHospital.address}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.mapsButton} 
                  onPress={() => openInMaps(selectedHospital)}
                >
                  <IconSymbol name="map" size={18} color="white" />
                  <Text style={styles.mapsButtonText}>Open in Maps</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.doneButton} 
                  onPress={() => setSelectedHospital(null)}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'lightgray',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#fee2e2',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#087179',
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyText: {
    color: 'gray',
    textAlign: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'lightgray',
  },
  listContainer: {
    paddingRight: 20,
    gap: 12,
  },
  hospitalCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'lightgray',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: 250,
  },
  iconWrapper: {
    backgroundColor: '#338b912c',
    borderRadius: 12,
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  hospitalAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
    width: '100%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalIconBg: {
    backgroundColor: '#338b912c',
    borderRadius: 16,
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 24,
  },
  modalAddress: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  mapsButton: {
    backgroundColor: '#087179',
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  mapsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  doneButton: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  doneButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
