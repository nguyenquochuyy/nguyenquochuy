import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardStack } from './stacks/DashboardStack';
import { OrdersStack } from './stacks/OrdersStack';
import { ProductsStack } from './stacks/ProductsStack';
import { CustomersStack } from './stacks/CustomersStack';
import { MoreStack } from './stacks/MoreStack';

export type MainTabParamList = {
  Dashboard: undefined;
  Orders: undefined;
  Products: undefined;
  Customers: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStack}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersStack}
        options={{ title: 'Đơn hàng' }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsStack}
        options={{ title: 'Sản phẩm' }}
      />
      <Tab.Screen 
        name="Customers" 
        component={CustomersStack}
        options={{ title: 'Khách hàng' }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreStack}
        options={{ title: 'Thêm' }}
      />
    </Tab.Navigator>
  );
}
