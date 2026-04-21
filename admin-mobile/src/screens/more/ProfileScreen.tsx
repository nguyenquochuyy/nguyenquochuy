import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';

export function ProfileScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
        <Text style={styles.name}>Admin User</Text>
        <Text style={styles.email}>admin@unishop.com</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        
        <Text style={styles.label}>Họ tên</Text>
        <TextInput style={styles.input} defaultValue="Admin User" />
        
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} defaultValue="admin@unishop.com" editable={false} />
        
        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput style={styles.input} defaultValue="0123456789" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
        
        <Text style={styles.label}>Mật khẩu hiện tại</Text>
        <TextInput style={styles.input} secureTextEntry placeholder="Nhập mật khẩu hiện tại" />
        
        <Text style={styles.label}>Mật khẩu mới</Text>
        <TextInput style={styles.input} secureTextEntry placeholder="Nhập mật khẩu mới" />
        
        <Text style={styles.label}>Xác nhận mật khẩu</Text>
        <TextInput style={styles.input} secureTextEntry placeholder="Xác nhận mật khẩu mới" />
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Lưu thay đổi</Text>
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
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
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
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
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
