import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const ANA_RENK = '#470f46'; 

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (username === '' || email === '' || password === '') {
      const msg = 'Lütfen tüm alanları doldurun.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Hata', msg);
      return;
    }

    try {
      const newUser = {
        username: username.trim(),
        email: email.trim(),
        password: password
      };

      const existingUsersJson = await AsyncStorage.getItem('users_db');
      let users = existingUsersJson ? JSON.parse(existingUsersJson) : [];

      const userExists = users.some((u: any) => u.username === newUser.username || u.email === newUser.email);
      if (userExists) {
        const msg = 'Bu kullanıcı adı veya e-posta zaten kayıtlı.';
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Hata', msg);
        return;
      }

      users.push(newUser);
      await AsyncStorage.setItem('users_db', JSON.stringify(users));
      
      const successMsg = 'Kayıt oluşturuldu! Giriş yapabilirsiniz.';
      if (Platform.OS === 'web') {
        window.alert(successMsg);
        router.back();
      } else {
        Alert.alert('Başarılı', successMsg, [{ text: 'Tamam', onPress: () => router.back() }]);
      }

    } catch (error) {
      const msg = 'Kayıt sırasında bir sorun oluştu.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Hata', msg);
    }
  };

  const Wrapper = Platform.OS === 'web' ? View : KeyboardAvoidingView;
  const wrapperProps = Platform.OS === 'web' 
    ? { style: styles.container } 
    : { behavior: Platform.OS === 'ios' ? 'padding' : undefined, style: styles.container };

  return (
    <Wrapper {...(wrapperProps as any)}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.innerContainer}>
            <View style={styles.headerContainer}>
            <Text style={[styles.logoText, { color: ANA_RENK }]}>HesApp</Text>
            </View>

            <Text style={styles.title}>Yeni Hesap Oluştur</Text>
            <Text style={styles.subtitle}>Esnaf dostu dijital veresiye defteri.</Text>

            <View style={styles.form}>
            <Text style={styles.label}>Kullanıcı Adı</Text>
            <TextInput
                style={styles.input}
                placeholder="Kullanıcı adınızı giriniz"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />

            <Text style={styles.label}>E-posta Adresi</Text>
            <TextInput
                style={styles.input}
                placeholder="E-posta adresinizi giriniz"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <Text style={styles.label}>Şifre</Text>
            <TextInput
                style={styles.input}
                placeholder="Şifrenizi belirleyiniz"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <Pressable 
                style={({ pressed }) => [
                    styles.registerButton, 
                    { backgroundColor: ANA_RENK },
                    pressed && { opacity: 0.8 }
                ]} 
                onPress={handleRegister}
            >
                <Text style={styles.registerButtonText}>Kayıt Ol</Text>
            </Pressable>

            <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>Giriş Ekranına Dön</Text>
            </Pressable>
            </View>
        </View>
      </ScrollView>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  innerContainer: { padding: 20, justifyContent: 'center', width: '100%', maxWidth: 500, alignSelf: 'center' },
  headerContainer: { alignItems: 'flex-start', marginBottom: 20, marginTop: 10 },
  logoText: { fontSize: 32, fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#7f8c8d', marginBottom: 30 },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#2c3e50', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#F8F9FA', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E1E8ED', fontSize: 16, color: '#333' },
  
  registerButton: { 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 30, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.30, 
    shadowRadius: 4.65, 
    elevation: 8,
    zIndex: 999,
    cursor: 'pointer'
  } as any,

  registerButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  backButton: { marginTop: 20, alignItems: 'center', padding: 10, cursor: 'pointer' } as any,
  backButtonText: { color: '#7f8c8d', fontSize: 14, fontWeight: '600' },
});