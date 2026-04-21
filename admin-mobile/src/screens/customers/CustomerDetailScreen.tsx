import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export function CustomerDetailScreen({ route, navigation }: any) {
  const { customerId } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.customerId}>{customerId}</Text>
        <Text style={styles.status}>ACTIVE</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông Tin Khách Hàng</Text>
        <Text style={styles.label}>Tên:</Text>
        <Text style={styles.text}>Nguyễn Văn A</Text>
        <Text style={styles.label}>SĐT:</Text>
        <Text style={styles.text}>0123456789</Text>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.text}>email@example.com</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thống Kê</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Tổng đơn hàng:</Text>
          <Text style={styles.statValue}>5</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Tổng chi tiêu:</Text>
          <Text style={styles.statValue}>₫6,250,000</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Điểm tích lũy:</Text>
          <Text style={styles.statValue}>1,250</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ghi Chú</Text>
        <Text style={styles.text}>Chưa có ghi chú</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.editButton]}>
          <Text style={styles.buttonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.callButton]}>
          <Text style={styles.buttonText}>Gọi</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#6366f1',
  },
  callButton: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
