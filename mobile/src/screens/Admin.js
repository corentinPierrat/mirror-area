import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../config';
import { useTranslation } from 'react-i18next';


export default function AdminScreen({ navigation }) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user' });

  const withAuth = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      navigation.replace('Login');
      throw new Error('No token');
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const cfg = await withAuth();
      const res = await axios.get(`${API_URL}/admin/users`, cfg);
      setUsers(res.data?.users || res.data || []);
    } catch (e) {
      console.log('Load users error:', e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const cfg = await withAuth();
      const res = await axios.get(`${API_URL}/admin/stats`, cfg);
      setStats(res.data || {});
    } catch (e) {
      console.log('Load stats error:', e?.response?.data || e.message);
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm({ username: '', email: '', password: '', role: 'user' });
    setModalVisible(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({ username: user.username || '', email: user.email || '', password: '', role: user.role || (user.is_admin ? 'admin' : 'user') });
    setModalVisible(true);
  };

  const saveUser = async () => {
    try {
      const cfg = await withAuth();
      if (editingUser) {
        const payload = { username: form.username, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await axios.patch(`${API_URL}/admin/users/${editingUser.id}`, payload, cfg);
      } else {
        await axios.post(`${API_URL}/admin/users`, form, cfg);
      }
      setModalVisible(false);
      await loadUsers();
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to save user');
    }
  };

  const deleteUser = async (user) => {
    Alert.alert(t('Delete'), t('Are you sure you want to delete this user?'), [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Delete'), style: 'destructive', onPress: async () => {
        try {
          const cfg = await withAuth();
          await axios.delete(`${API_URL}/admin/users/${user.id}`, cfg);
          await loadUsers();
        } catch (e) {
          Alert.alert('Error', e?.response?.data?.message || 'Failed to delete user');
        }
      }}
    ]);
  };

  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  const StatCard = ({ icon, label, value, colors = ['#1e293b', '#334155'] }) => (
    <LinearGradient colors={colors} style={styles.statCard}>
      <Ionicons name={icon} size={22} color="#93c5fd" />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </LinearGradient>
  );

  return (
    <LinearGradient colors={['#171542', '#2f339e']} style={styles.container}>
      <TouchableOpacity
        style={{ position: 'absolute', top: 40, left: 16, zIndex: 10, flexDirection: 'row', alignItems: 'center' }}
        onPress={() => navigation.replace('Main')}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.contentWrapper}>

        <View style={styles.statsRow}>
          <StatCard icon="people-outline" label={t('Total Users')} value={stats?.total_users ?? users.length} />
          <StatCard icon="flash-outline" label={t('Active Workflows')} value={stats?.active_workflows ?? 0} colors={["#1f2937","#374151"]} />
        </View>
        <View style={styles.statsRow}>
          <StatCard icon="construct-outline" label={t('Services Connected')} value={stats?.services_connected ?? 0} colors={["#0f172a","#1e293b"]} />
          <StatCard icon="person-add-outline" label={t('New signups (7d)')} value={stats?.recent_signups ?? 0} colors={["#1e293b","#334155"]} />
        </View>

        <View style={styles.usersHeader}>
          <Text style={styles.sectionTitle}>{t('Users')}</Text>
          <TouchableOpacity style={styles.addButton} onPress={openCreate}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addButtonText}>{t('Add')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {users.map((u) => (
            <View key={u.id} style={styles.userRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{u.username || u.email}</Text>
                <Text style={styles.userSub}>{u.email}</Text>
              </View>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{(u.role || (u.is_admin ? 'admin' : 'user')).toUpperCase()}</Text>
              </View>
              <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(u)}>
                <Ionicons name="create-outline" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, styles.deleteBtn]} onPress={() => deleteUser(u)}>
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
          {!users?.length && (
            <Text style={styles.emptyText}>{t('No users found')}</Text>
          )}
        </ScrollView>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentWrapper}>
            <BlurView style={styles.modalBlur} intensity={90} tint="systemUltraThinMaterialDark" />
            <View style={styles.modalBorder} />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingUser ? t('Edit user') : t('Create user')}</Text>
              <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>{t('Username')}</Text>
                <TextInput value={form.username} onChangeText={(v) => setForm({ ...form, username: v })} style={styles.input} placeholder={t('Username')} placeholderTextColor="rgba(255,255,255,0.5)" />
                <Text style={styles.label}>Email</Text>
                <TextInput autoCapitalize='none' keyboardType='email-address' value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} style={styles.input} placeholder="email@example.com" placeholderTextColor="rgba(255,255,255,0.5)" />
                <Text style={styles.label}>{t('Password')} {editingUser ? `(${t('optional')})` : ''}</Text>
                <TextInput value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} style={styles.input} placeholder={t('Password')} placeholderTextColor="rgba(255,255,255,0.5)" secureTextEntry />
                <Text style={styles.label}>{t('Role')}</Text>
                <View style={styles.roleRow}>
                  {['user', 'admin'].map((r) => (
                    <TouchableOpacity key={r} style={[styles.rolePill, form.role === r && styles.rolePillActive]} onPress={() => setForm({ ...form, role: r })}>
                      <Text style={[styles.rolePillText, form.role === r && styles.rolePillTextActive]}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>{t('Cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={saveUser}>
                  <Text style={styles.buttonText}>{t('Save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: { 
    flex: 1, 
    paddingTop: 65, 
    paddingBottom: 20, 
    paddingHorizontal: 16 
  },
  title: { color: '#fff', fontSize: 26, fontWeight: '700', marginBottom: 18, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12, marginTop: 12 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 6 },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 8 },
  usersHeader: { marginTop: 6, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(99,102,241,0.4)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(99,102,241,0.6)' },
  addButtonText: { color: '#fff', fontWeight: '700' },
  listContainer: { 
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.15)', 
    padding: 6,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 8 },
  userName: { color: '#fff', fontWeight: '700', marginBottom: 2 },
  userSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  roleBadge: { backgroundColor: 'rgba(59,130,246,0.15)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.35)', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 10, marginRight: 8 },
  roleText: { color: '#93c5fd', fontSize: 10, fontWeight: '800' },
  iconBtn: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginLeft: 4 },
  deleteBtn: { borderColor: 'rgba(239,68,68,0.5)', backgroundColor: 'rgba(239,68,68,0.08)' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  modalContentWrapper: { width: '100%', maxHeight: '80%', borderRadius: 24, overflow: 'hidden' },
  modalBlur: { ...StyleSheet.absoluteFillObject, borderRadius: 24 },
  modalBorder: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(30,30,60,0.85)', borderRadius: 24, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)' },
  modalContent: { padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 12 },
  label: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 12, color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', marginBottom: 6 },
  roleRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  rolePill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  rolePillActive: { backgroundColor: 'rgba(59,130,246,0.16)', borderColor: 'rgba(59,130,246,0.5)' },
  rolePillText: { color: 'rgba(255,255,255,0.8)', fontWeight: '700', textTransform: 'uppercase', fontSize: 11 },
  rolePillTextActive: { color: '#93c5fd' },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 12 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancelButton: { backgroundColor: 'rgba(148,163,184,0.3)', borderWidth: 1, borderColor: 'rgba(148,163,184,0.5)' },
  saveButton: { backgroundColor: 'rgba(59,130,246,0.8)', borderWidth: 1, borderColor: 'rgba(59,130,246,1)' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  emptyText: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', paddingVertical: 16 }
});