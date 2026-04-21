import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export function ProductDetailScreen({ route, navigation }: any) {
  const { productId } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.productId}>{productId}</Text>
        <Text style={styles.status}>Đang bán</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông Tin Sản Phẩm</Text>
        <Text style={styles.label}>Tên:</Text>
        <Text style={styles.text}>Sản phẩm A</Text>
        <Text style={styles.label}>Giá:</Text>
        <Text style={styles.text}>₫500,000</Text>
        <Text style={styles.label}>Tồn kho:</Text>
        <Text style={styles.text}>50</Text>
        <Text style={styles.label}>Danh mục:</Text>
        <Text style={styles.text}>Điện tử</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mô Tả</Text>
        <Text style={styles.text}>Mô tả chi tiết sản phẩm...</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.editButton]}>
          <Text style={styles.buttonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deleteButton]}>
          <Text style={styles.buttonText}>Xóa</Text>
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
  productId: {
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
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
