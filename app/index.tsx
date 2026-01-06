import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const ANA_RENK = '#470f46';

export default function LoginScreen() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (inputValue === '' || password === '') {
      if (Platform.OS === 'web') {
        window.alert('Uyarı: Lütfen kullanıcı bilgilerinizi giriniz.');
      } else {
        Alert.alert('Uyarı', 'Lütfen kullanıcı bilgilerinizi giriniz.');
      }
      return;
    }

    try {
      const json = await AsyncStorage.getItem('users_db');
      const users = json ? JSON.parse(json) : [];

      if (users.length === 0) {
        const msg = 'Kayıtlı kullanıcı bulunamadı. Lütfen önce kayıt olun.';
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Hata', msg);
        return;
      }

      const foundUser = users.find((u: any) => 
        (u.username === inputValue.trim() || u.email === inputValue.trim()) && 
        u.password === password
      );

      if (foundUser) {
        await AsyncStorage.setItem('session_user', foundUser.username);
        router.replace('/(tabs)');
      } else {
        const msg = 'Kullanıcı adı veya şifre hatalı!';
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Hata', msg);
      }

    } catch (error) {
      console.log(error);
      const msg = 'Giriş işlemi sırasında hata oluştu.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Hata', msg);
    }
  };

  // Web ve Mobil için farklı kapsayıcı davranışı
  const Wrapper = Platform.OS === 'web' ? View : KeyboardAvoidingView;
  const wrapperProps = Platform.OS === 'web' 
    ? { style: styles.container } 
    : { behavior: Platform.OS === 'ios' ? 'padding' : undefined, style: styles.container };

  return (
    <Wrapper {...(wrapperProps as any)}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled" // Klavye açıkken tıklamaya izin ver
      >
        <View style={styles.innerContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>HesApp</Text>
            <Text style={styles.slogan}>Esnaf Dostu Hesabı</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Kullanıcı Adı veya E-posta</Text>
            <TextInput
              style={styles.input}
              placeholder="Kullanıcı adı veya e-posta"
              placeholderTextColor="#999"
              value={inputValue}
              onChangeText={setInputValue}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="Şifrenizi giriniz"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            {/* TouchableOpacity yerine Pressable kullanıyoruz */}
            <Pressable 
                style={({ pressed }) => [
                    styles.loginButton, 
                    pressed && { opacity: 0.8 }
                ]} 
                onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Giriş Yap</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Hesabın yok mu?</Text>
            <Pressable onPress={() => router.push('/register')} style={{ marginLeft: 5 }}>
              <Text style={styles.registerLink}>Kayıt Ol</Text>
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
  innerContainer: { 
    padding: 20, 
    justifyContent: 'center', 
    width: '100%', 
    maxWidth: 500, // Web'de çok genişlemesini engeller
    alignSelf: 'center' 
  },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoText: { fontSize: 40, fontWeight: 'bold', color: ANA_RENK },
  slogan: { fontSize: 16, color: '#7f8c8d', marginTop: 5 },
  inputContainer: { width: '100%' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 10, marginLeft: 2 },
  input: { backgroundColor: '#f5f6fa', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#dcdde1', fontSize: 16, color:'#333' },
  
  loginButton: { 
    backgroundColor: ANA_RENK, 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 20,
    zIndex: 999, // Web için kritik: En üstte olmasını sağlar
    cursor: 'pointer' // Web'de el işareti çıkması için (React Native Web bunu anlar)
  } as any, // TypeScript hatasını susturmak için 'as any' (cursor özelliği web'e özel)

  loginButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#7f8c8d' },
  registerLink: { color: ANA_RENK, fontWeight: 'bold' },
});