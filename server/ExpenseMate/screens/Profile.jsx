import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getStats } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getStats();
        setStats(res.data);
      } catch (err) {
        console.log('Stats error:', err);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Avatar & Name */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>💚</Text>
          <Text style={styles.statAmount}>₹{stats?.income?.toLocaleString() || 0}</Text>
          <Text style={styles.statLabel}>Total Income</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>❤️</Text>
          <Text style={styles.statAmount}>₹{stats?.expense?.toLocaleString() || 0}</Text>
          <Text style={styles.statLabel}>Total Expense</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>💰</Text>
          <Text style={styles.statAmount}>₹{stats?.total?.toLocaleString() || 0}</Text>
          <Text style={styles.statLabel}>Balance</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('AnalyticsModal')}
        >
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={styles.menuText}>Analytics</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('AIChat')}
        >
          <Text style={styles.menuIcon}>🤖</Text>
          <Text style={styles.menuText}>AI Assistant</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Expenses')}
        >
          <Text style={styles.menuIcon}>📋</Text>
          <Text style={styles.menuText}>All Transactions</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

      </View>

      {/* App Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>About</Text>
        <View style={styles.menuItem}>
          <Text style={styles.menuIcon}>💸</Text>
          <Text style={styles.menuText}>ExpenseMate</Text>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 24,
    backgroundColor: '#1E1E2E',
    borderRadius: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: '#999',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 6,
  },
  statAmount: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    color: '#999',
    fontSize: 10,
    textAlign: 'center',
  },
  menuContainer: {
    marginHorizontal: 24,
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  infoContainer: {
    marginHorizontal: 24,
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    padding: 16,
  },
  infoTitle: {
    color: '#999',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2E2E3E',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  menuArrow: {
    color: '#666',
    fontSize: 20,
  },
  versionText: {
    color: '#666',
    fontSize: 13,
  },
  logoutBtn: {
    marginHorizontal: 24,
    backgroundColor: '#FF525220',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF5252',
  },
  logoutText: {
    color: '#FF5252',
    fontSize: 16,
    fontWeight: 'bold',
  },
});