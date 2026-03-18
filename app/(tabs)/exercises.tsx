import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width } = Dimensions.get('window');

interface Exercise {
  id: string;
  name: string;
  duration: number; // in seconds
  description: string;
  instructions: string[];
  icon: string;
}

const EXERCISES: Exercise[] = [
  {
    id: '1',
    name: 'Pursed Lip Breathing',
    duration: 120, // 2 min
    description: 'Reduces the amount of work you need to do to breathe.',
    instructions: [
      'Relax your neck and shoulder muscles.',
      'Inhale slowly through your nose for 2 counts, keeping your mouth closed.',
      'Pucker or purse your lips as if you were going to whistle.',
      'Exhale slowly by blowing air through your pursed lips for a count of 4.',
    ],
    icon: 'wind',
  },
  {
    id: '2',
    name: 'Diaphragmatic Breathing',
    duration: 180, // 3 min
    description: 'Also known as belly breathing, it helps the lungs expand.',
    instructions: [
      'Lie on your back with knees bent or sit in a comfortable chair.',
      'Place one hand on your upper chest and the other on your belly.',
      'Inhale slowly through your nose; your belly should move out against your hand.',
      'Tighten your stomach muscles and let them fall inward as you exhale through pursed lips.',
    ],
    icon: 'pollen',
  },
  {
    id: '3',
    name: 'Buteyko Breathing',
    duration: 300, // 5 min
    description: 'Helps prevent hyperventilation and improves nasal breathing.',
    instructions: [
      'Sit upright and relax.',
      'Take a small, silent breath in and out through your nose.',
      'Hold your nose with your fingers to keep your mouth closed.',
      'Hold your breath for as long as you comfortably can.',
      'When you need to breathe, take a small breath through your nose.',
    ],
    icon: 'cloud',
  },
  {
    id: '4',
    name: 'Papworth Method',
    duration: 240, // 4 min
    description: 'Focuses on using your diaphragm and nose for breathing.',
    instructions: [
      'Sit comfortably upright.',
      'Take slow, steady breaths in through your nose.',
      'Focus on the movement of your abdomen rather than your chest.',
      'Exhale slowly and completely through your mouth.',
      'Try to make each breath as quiet and rhythmic as possible.',
    ],
    icon: 'sparkles',
  },
];

export default function ExercisesScreen() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for the timer
  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      // Auto-close modal after a short delay when finished
      setTimeout(() => setSelectedExercise(null), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setTimeLeft(exercise.duration);
    setIsActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Breathing Exercises</Text>
        <Text style={styles.headerSubtitle}>Techniques to help manage your asthma</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {EXERCISES.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={styles.card}
            onPress={() => startExercise(exercise)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconBackground}>
                <IconSymbol name={exercise.icon as any} size={24} color="#087179" />
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>{exercise.name}</Text>
                <Text style={styles.cardDuration}>{exercise.duration / 60} min</Text>
              </View>
            </View>
            <Text style={styles.cardDescription}>{exercise.description}</Text>
            
            <View style={styles.instructionsPreview}>
                <Text style={styles.instructionsHeader}>How to do it:</Text>
                {exercise.instructions.slice(0, 2).map((instruction, idx) => (
                    <Text key={idx} style={styles.instructionText}>• {instruction}</Text>
                ))}
                <Text style={styles.moreText}>Tap to see full steps and start timer...</Text>
            </View>
            
            <View style={styles.startButton}>
              <Text style={styles.startButtonText}>Start Exercise</Text>
              <IconSymbol name="chevron.right" size={16} color="white" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Timer Modal */}
      <Modal
        visible={!!selectedExercise}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedExercise(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setSelectedExercise(null)}
            >
              <IconSymbol name="xmark.circle.fill" size={32} color="#9ca3af" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>{selectedExercise?.name}</Text>
            
            <View style={styles.timerContainer}>
              <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />
              <View style={styles.timerCircle}>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                <Text style={styles.timerLabel}>{isActive ? 'Breathe...' : 'Done!'}</Text>
              </View>
            </View>

            <View style={styles.modalInstructionsContainer}>
                <Text style={styles.modalInstructionsHeader}>Step-by-Step Guide:</Text>
                <ScrollView style={styles.modalInstructionsScroll}>
                    {selectedExercise?.instructions.map((step, index) => (
                        <View key={index} style={styles.stepRow}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.stepText}>{step}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.modalControls}>
              <TouchableOpacity
                style={[styles.controlButton, isActive ? styles.pauseButton : styles.resumeButton]}
                onPress={() => setIsActive(!isActive)}
              >
                <Text style={styles.controlButtonText}>
                  {timeLeft === 0 ? 'Restart' : isActive ? 'Pause' : 'Resume'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setSelectedExercise(null)}
              >
                <Text style={styles.cancelButtonText}>Finish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: StatusBar.currentHeight || 70,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#338b912c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  cardDuration: {
    fontSize: 14,
    color: '#087179',
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  instructionsPreview: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  instructionsHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  instructionText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  moreText: {
    fontSize: 12,
    color: '#087179',
    marginTop: 6,
    fontStyle: 'italic',
  },
  startButton: {
    backgroundColor: '#087179',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    height: '90%',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  timerContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  pulseCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#0871792a',
  },
  timerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'white',
    borderWidth: 8,
    borderColor: '#087179',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  timerText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#111',
  },
  timerLabel: {
    fontSize: 16,
    color: '#087179',
    fontWeight: '600',
  },
  modalInstructionsContainer: {
      flex: 1,
      width: '100%',
      backgroundColor: '#f9fafb',
      borderRadius: 24,
      padding: 20,
      marginBottom: 24,
  },
  modalInstructionsHeader: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#111',
      marginBottom: 16,
  },
  modalInstructionsScroll: {
      width: '100%',
  },
  stepRow: {
      flexDirection: 'row',
      marginBottom: 16,
      alignItems: 'flex-start',
  },
  stepNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#087179',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      marginTop: 2,
  },
  stepNumberText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
  },
  stepText: {
      flex: 1,
      fontSize: 15,
      color: '#4b5563',
      lineHeight: 22,
  },
  modalControls: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  controlButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#f59e0b',
  },
  resumeButton: {
    backgroundColor: '#087179',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
