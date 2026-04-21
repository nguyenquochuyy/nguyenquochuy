import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';

interface Order {
  id: string;
  customer: string;
  total: string;
  status: string;
}

const dummyOrders: Order[] = [
  { id: 'ORD-1234', customer: 'Nguyễn Văn A', total: '₫1,250,000', status: 'PENDING' },
  { id: 'ORD-1235', customer: 'Trần Thị B', total: '₫890,000', status: 'PROCESSING' },
  { id: 'ORD-1236', customer: 'Lê Văn C', total: '₫2,100,000', status: 'SHIPPED' },
];

export function OrdersScreen({ navigation }: any) {
  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
    >
      <Text style={styles.orderId}>{item.id}</Text>
      <Text style={styles.customer}>{item.customer}</Text>
      <View style={styles.row}>
        <Text style={styles.total}>{item.total}</Text>
        <Text style={[styles.status, getStatusColor(item.status)]}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => ({
    color: status === 'PENDING' ? '#f59e0b' : status === 'PROCESSING' ? '#3b82f6' : '#10b981',
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
    <View style={styles.container}>
      <Text style={styles.title}>Đơn Hàng</Text>
      <FlatList
        data={dummyOrders}
        renderItem={renderOrder}
        keyExtractor={(item: Order) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
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
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  customer: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
