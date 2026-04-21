import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CustomersScreen } from '../../screens/customers/CustomersScreen';
import { CustomerDetailScreen } from '../../screens/customers/CustomerDetailScreen';

export type CustomersStackParamList = {
  CustomersList: undefined;
  CustomerDetail: { customerId: string };
};

const Stack = createNativeStackNavigator<CustomersStackParamList>();

export function CustomersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomersList" component={CustomersScreen} />
      <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
    </Stack.Navigator>
  );
}
