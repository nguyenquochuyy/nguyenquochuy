import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';

const dummyProducts = [
  { id: 'P001', name: 'Sản phẩm A', price: '₫500,000', stock: 50 },
  { id: 'P002', name: 'Sản phẩm B', price: '₫890,000', stock: 30 },
  { id: 'P003', name: 'Sản phẩm C', price: '₫1,200,000', stock: 15 },
];

export function ProductsScreen({ navigation }: any) {
  const renderProduct = ({ item }: any) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <Text style={styles.productName}>{item.name}</Text>
      <View style={styles.row}>
        <Text style={styles.price}>{item.price}</Text>
        <Text style={styles.stock}>Tồn: {item.stock}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
    <View style={styles.container}>
      <Text style={styles.title}>Sản Phẩm</Text>
      <FlatList
        data={dummyProducts}
        renderItem={renderProduct}
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
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  stock: {
    fontSize: 14,
    color: '#6b7280',
  },
});
