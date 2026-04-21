import React from 'react';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { ForgotPasswordScreen } from './src/screens/auth/ForgotPasswordScreen';
import { DashboardScreen } from './src/screens/dashboard/DashboardScreen';
import { OrdersScreen } from './src/screens/orders/OrdersScreen';
import { OrderDetailScreen } from './src/screens/orders/OrderDetailScreen';
import { ProductsScreen } from './src/screens/products/ProductsScreen';
import { ProductDetailScreen } from './src/screens/products/ProductDetailScreen';
import { CustomersScreen } from './src/screens/customers/CustomersScreen';
import { CustomerDetailScreen } from './src/screens/customers/CustomerDetailScreen';
import { MoreScreen } from './src/screens/more/MoreScreen';
import { ProfileScreen } from './src/screens/more/ProfileScreen';
import { SettingsScreen } from './src/screens/more/SettingsScreen';

const DashboardStack = createNativeStackNavigator({
  screenOptions: { headerShown: false },
  screens: {
    DashboardMain: DashboardScreen,
  },
});

const OrdersStack = createNativeStackNavigator({
  screenOptions: { headerShown: false },
  screens: {
    OrdersList: OrdersScreen,
    OrderDetail: OrderDetailScreen,
  },
});

const ProductsStack = createNativeStackNavigator({
  screenOptions: { headerShown: false },
  screens: {
    ProductsList: ProductsScreen,
    ProductDetail: ProductDetailScreen,
  },
});

const CustomersStack = createNativeStackNavigator({
  screenOptions: { headerShown: false },
  screens: {
    CustomersList: CustomersScreen,
    CustomerDetail: CustomerDetailScreen,
  },
});

const MoreStackNav = createNativeStackNavigator({
  screenOptions: { headerShown: false },
  screens: {
    MoreMain: MoreScreen,
    Profile: ProfileScreen,
    Settings: SettingsScreen,
  },
});

const TabNavigator = createBottomTabNavigator({
  screenOptions: {
    headerShown: false,
    tabBarActiveTintColor: '#6366f1',
    tabBarInactiveTintColor: '#9ca3af',
    tabBarStyle: {
      paddingBottom: 5,
      paddingTop: 5,
      height: 60,
    },
  },
  screens: {
    Dashboard: {
      screen: DashboardStack,
      options: {
        title: 'Dashboard',
        tabBarIcon: ({ color }: { color: string }) => <Ionicons name="grid-outline" size={22} color={color} />,
      },
    },
    Orders: {
      screen: OrdersStack,
      options: {
        title: 'Đơn hàng',
        tabBarIcon: ({ color }: { color: string }) => <Ionicons name="cart-outline" size={22} color={color} />,
      },
    },
    Products: {
      screen: ProductsStack,
      options: {
        title: 'Sản phẩm',
        tabBarIcon: ({ color }: { color: string }) => <Ionicons name="cube-outline" size={22} color={color} />,
      },
    },
    Customers: {
      screen: CustomersStack,
      options: {
        title: 'Khách hàng',
        tabBarIcon: ({ color }: { color: string }) => <Ionicons name="people-outline" size={22} color={color} />,
      },
    },
    More: {
      screen: MoreStackNav,
      options: {
        title: 'Thêm',
        tabBarIcon: ({ color }: { color: string }) => <Ionicons name="ellipsis-horizontal" size={22} color={color} />,
      },
    },
  },
});

const RootStack = createNativeStackNavigator({
  screenOptions: { headerShown: false },
  screens: {
    MainTabs: TabNavigator,
  },
});

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  return <Navigation />;
}
