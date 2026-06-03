import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://10.0.2.2:3001/api';

export default function DashboardScreen() {
  const [user, setUser] = useState<any>(null);
  const [clockedIn, setClockedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [itemsProcessed, setItemsProcessed] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadUser();
    // Ideally we would fetch attendance status here
  }, []);

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.replace('/');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    router.replace('/');
  };

  const toggleClock = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const endpoint = clockedIn ? '/attendance/clock-out' : '/attendance/clock-in';
      
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update attendance');
      
      setClockedIn(!clockedIn);
      Alert.alert('Success', clockedIn ? 'Clocked out successfully' : 'Clocked in successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogPerformance = async () => {
    if (!itemsProcessed || isNaN(Number(itemsProcessed))) {
      Alert.alert('Invalid Input', 'Please enter a valid number of items.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/performance/log`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ itemsProcessed: Number(itemsProcessed) })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to log performance');
      
      Alert.alert('Logged Successfully', `${itemsProcessed} items processed.`);
      setShowLogModal(false);
      setItemsProcessed('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.firstName[0]}</Text>
          </View>
          <View>
            <Text style={styles.greeting}>Hello, {user.firstName}</Text>
            <Text style={styles.role}>{user.role} Portal</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Clock In/Out Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={24} color="#10b981" />
            <Text style={styles.cardTitle}>Shift Status</Text>
          </View>
          <Text style={styles.statusText}>
            Currently: <Text style={{ color: clockedIn ? '#10b981' : '#ef4444' }}>
              {clockedIn ? 'Clocked In' : 'Clocked Out'}
            </Text>
          </Text>
          
          <TouchableOpacity 
            style={[styles.clockBtn, clockedIn ? styles.clockBtnOut : styles.clockBtnIn]} 
            onPress={toggleClock}
            disabled={loading}
          >
            <Text style={styles.clockBtnText}>
              {clockedIn ? 'Clock Out' : 'Clock In Now'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Performance Log Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="stats-chart-outline" size={24} color="#6366f1" />
            <Text style={styles.cardTitle}>Performance</Text>
          </View>
          <Text style={styles.statusText}>
            Log the items you have processed in this shift to track your metrics.
          </Text>
          
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => setShowLogModal(true)}
            disabled={!clockedIn}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.actionBtnText}>
              {clockedIn ? 'Log Processed Items' : 'Clock in first to log items'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Log Modal */}
      <Modal visible={showLogModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Performance</Text>
              <TouchableOpacity onPress={() => setShowLogModal(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalLabel}>Number of clothing items processed:</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              value={itemsProcessed}
              onChangeText={setItemsProcessed}
              placeholder="e.g. 45"
              placeholderTextColor="#64748b"
            />
            
            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={handleLogPerformance}
              disabled={loading}
            >
              <Text style={styles.submitBtnText}>Save Log</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: 'rgba(30, 33, 40, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  avatarText: {
    color: '#818cf8',
    fontSize: 20,
    fontWeight: 'bold',
  },
  greeting: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  role: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 2,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
    gap: 24,
  },
  card: {
    backgroundColor: 'rgba(30, 33, 40, 0.6)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  statusText: {
    color: '#cbd5e1',
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  clockBtn: {
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockBtnIn: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  clockBtnOut: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  clockBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionBtn: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    opacity: 0.9,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e2128',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalLabel: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: 'rgba(15, 17, 21, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 12,
    color: '#ffffff',
    fontSize: 24,
    padding: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  submitBtn: {
    backgroundColor: '#6366f1',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
