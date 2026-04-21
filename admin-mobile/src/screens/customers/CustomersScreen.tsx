import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';

const dummyCustomers = [
  { id: 'C001', name: 'Nguyễn Văn A', phone: '0123456789', orders: 5 },
  { id: 'C002', name: 'Trần Thị B', phone: '0987654321', orders: 3 },
  { id: 'C003', name: 'Lê Văn C', phone: '0111222333', orders: 8 },
];

export function CustomersScreen({ navigation }: any) {
  const renderCustomer = ({ item }: any) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
    >
      <Text style={styles.customerName}>{item.name}</Text>
      <Text style={styles.phone}>{item.phone}</Text>
      <Text style={styles.orders}>{item.orders} đơn hàng</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
    <View style={styles.container}>
      <Text style={styles.title}>Khách Hàng</Text>
      <FlatList
        data={dummyCustomers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id}
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
  customerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  orders: {
    fontSize: 14,
    color: '#6366f1',
  },
});
