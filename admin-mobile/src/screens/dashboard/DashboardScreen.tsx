import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

export function DashboardScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Doanh Thu</Text>
          <Text style={styles.kpiValue}>₫125.5M</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Đơn Hàng</Text>
          <Text style={styles.kpiValue}>1,234</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Khách Hàng</Text>
          <Text style={styles.kpiValue}>567</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Sản Phẩm</Text>
          <Text style={styles.kpiValue}>892</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hoạt Động Gần Đây</Text>
        <View style={styles.activityItem}>
          <Text style={styles.activityText}>Đơn hàng #ORD-1234 đã được tạo</Text>
          <Text style={styles.activityTime}>5 phút trước</Text>
        </View>
        <View style={styles.activityItem}>
          <Text style={styles.activityText}>Khách hàng Nguyễn Văn A đã đăng ký</Text>
          <Text style={styles.activityTime}>15 phút trước</Text>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  kpiLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  activityItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
