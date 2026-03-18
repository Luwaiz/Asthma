import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { useNearbyHospitals } from '@/hooks/useNearbyHospitals';

export const HospitalList = () => {
  const { hospitals, loading, error, refetch } = useNearbyHospitals();

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
        <Text style={styles.emptyText}>No hospitals found within 5km.</Text>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.listContainer}
        >
          {hospitals.map((hospital) => (
            <View key={hospital.id} style={styles.hospitalCard}>
              <View style={styles.iconWrapper}>
                <IconSymbol name="heart.text.square.fill" size={24} color="#087179" />
              </View>
              <View style={styles.infoWrapper}>
                <Text style={styles.hospitalName} numberOfLines={1}>{hospital.name}</Text>
                <Text style={styles.hospitalAddress} numberOfLines={2}>{hospital.address}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
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
});
