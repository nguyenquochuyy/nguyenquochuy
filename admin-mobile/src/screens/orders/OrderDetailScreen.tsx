import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export function OrderDetailScreen({ route, navigation }: any) {
  const { orderId } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orderId}>{orderId}</Text>
        <Text style={styles.status}>PENDING</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông Tin Khách Hàng</Text>
        <Text style={styles.text}>Nguyễn Văn A</Text>
        <Text style={styles.text}>0123456789</Text>
        <Text style={styles.text}>email@example.com</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sản Phẩm</Text>
        <View style={styles.item}>
          <Text style={styles.itemName}>Sản phẩm A</Text>
          <Text style={styles.itemQty}>x2</Text>
          <Text style={styles.itemPrice}>₫500,000</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tổng Cộng</Text>
        <Text style={styles.total}>₫1,250,000</Text>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Cập Nhật Trạng Thái</Text>
      </TouchableOpacity>
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
  orderId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e0b',
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
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  itemName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  itemQty: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
