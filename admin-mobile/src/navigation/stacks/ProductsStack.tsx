import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductsScreen } from '../../screens/products/ProductsScreen';
import { ProductDetailScreen } from '../../screens/products/ProductDetailScreen';

export type ProductsStackParamList = {
  ProductsList: undefined;
  ProductDetail: { productId: string };
};

const Stack = createNativeStackNavigator<ProductsStackParamList>();

export function ProductsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProductsList" component={ProductsScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}
