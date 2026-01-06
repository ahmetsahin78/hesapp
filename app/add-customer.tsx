import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const ANA_RENK = '#470f46';
const TEDARIKCI_RENK = '#00695c'; 

export default function AddCustomerScreen() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState<'TL' | 'USD' | 'EUR'>('TL'); 
  const [accountType, setAccountType] = useState<'musteri' | 'tedarikci'>('musteri');

  const handlePhoneChange = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 10) cleaned = cleaned.substring(0, 10);
    let formatted = cleaned;
    if (cleaned.length > 3) formatted = `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length > 6) formatted = `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    if (cleaned.length > 8) formatted = `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
    setPhone(formatted);
  };

  const handleSave = async () => {
    if (!name) {
      const msg = 'Lütfen isim giriniz.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Eksik Bilgi', msg);
      return;
    }

    try {
      const currentUser = await AsyncStorage.getItem('session_user');
      if (!currentUser) {
        const msg = 'Oturum bulunamadı, lütfen tekrar giriş yapın.';
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Hata', msg);
        return;
      }
      const storageKey = `musteriler_${currentUser}`;

      const newCustomer = {
        id: Date.now().toString(),
        isim: name,
        tel: phone,
        paraBirimi: currency,
        hesapTuru: accountType,
        islemler: [],
        tarih: new Date().toLocaleDateString('tr-TR'),
      };

      const existingData = await AsyncStorage.getItem(storageKey);
      let musteriler = existingData ? JSON.parse(existingData) : [];
      musteriler.push(newCustomer);
      
      await AsyncStorage.setItem(storageKey, JSON.stringify(musteriler));

      const typeLabel = accountType === 'musteri' ? 'Müşteri' : 'Tedarikçi';
      const successMsg = `${typeLabel} kartı başarıyla oluşturuldu!`;

      if (Platform.OS === 'web') {
        window.alert(successMsg);
        router.back();
      } else {
        Alert.alert('Başarılı', successMsg, [
          { text: 'Tamam', onPress: () => router.back() }
        ]);
      }

    } catch (error) {
      const msg = 'Kayıt sırasında hata oluştu.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Hata', msg);
    }
  };

  // Web ve Mobil uyumlu kapsayıcı ayarı
  const Wrapper = Platform.OS === 'web' ? View : KeyboardAvoidingView;
  const wrapperProps = Platform.OS === 'web' 
    ? { style: styles.container } 
    : { behavior: Platform.OS === 'ios' ? 'padding' : undefined, style: styles.container };

  return (
    <Wrapper {...(wrapperProps as any)}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Yeni Hesap Kartı</Text>
        </View>

        <View style={styles.form}>
          
          {/* HESAP TÜRÜ SEÇİMİ */}
          <Text style={styles.label}>Hesap Türü</Text>
          <View style={styles.typeContainer}>
              <Pressable 
                  style={[
                      styles.typeBtn, 
                      accountType === 'musteri' && { backgroundColor: ANA_RENK, borderColor: ANA_RENK }
                  ]}
                  onPress={() => setAccountType('musteri')}
              >
                  <Text style={[styles.typeText, accountType === 'musteri' && styles.activeTypeText]}>Müşteri</Text>
              </Pressable>

              <Pressable 
                  style={[
                      styles.typeBtn, 
                      accountType === 'tedarikci' && { backgroundColor: TEDARIKCI_RENK, borderColor: TEDARIKCI_RENK }
                  ]}
                  onPress={() => setAccountType('tedarikci')}
              >
                  <Text style={[styles.typeText, accountType === 'tedarikci' && styles.activeTypeText]}>Tedarikçi</Text>
              </Pressable>
          </View>

          {/* PARA BİRİMİ SEÇİMİ */}
          <Text style={styles.label}>Para Birimi</Text>
          <View style={styles.currencyContainer}>
              {['TL', 'USD', 'EUR'].map((item) => (
                  <Pressable 
                      key={item}
                      style={[styles.currencyBtn, currency === item && styles.activeCurrencyBtn]}
                      onPress={() => setCurrency(item as any)}
                  >
                      <Text style={[styles.currencyText, currency === item && styles.activeCurrencyText]}>{item}</Text>
                  </Pressable>
              ))}
          </View>

          <Text style={styles.label}>Kişi / Firma Adı</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Örn: Ahmet Bey veya ABC Toptan" 
            placeholderTextColor="#999"
            value={name} 
            onChangeText={setName} 
          />

          <Text style={styles.label}>Telefon Numarası</Text>
          <View style={styles.phoneRow}>
            <View style={styles.prefixContainer}>
              <Text style={styles.prefixText}>+90</Text>
            </View>
            <TextInput 
              style={[styles.input, styles.phoneInput]} 
              placeholder="5XX XXX XX XX" 
              placeholderTextColor="#999"
              keyboardType="phone-pad" 
              value={phone} 
              onChangeText={handlePhoneChange} 
              maxLength={13} 
            />
          </View>

          <Pressable 
            style={({pressed}) => [
                styles.saveButton, 
                { opacity: pressed ? 0.8 : 1 }
            ]} 
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>KAYDET</Text>
          </Pressable>

          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>İptal</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1 },
  header: { backgroundColor: ANA_RENK, paddingTop: 50, paddingBottom: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, padding: 15, fontSize: 16, color: '#333' },
  
  typeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  typeBtn: { flex: 0.48, padding: 14, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, alignItems: 'center', backgroundColor: '#f9f9f9', cursor: 'pointer' } as any,
  typeText: { fontWeight: 'bold', color: '#555', fontSize: 15 },
  activeTypeText: { color: 'white' },

  currencyContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  currencyBtn: { flex: 0.3, padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, alignItems: 'center', backgroundColor: '#f9f9f9', cursor: 'pointer' } as any,
  activeCurrencyBtn: { backgroundColor: ANA_RENK, borderColor: ANA_RENK },
  currencyText: { fontWeight: 'bold', color: '#555' },
  activeCurrencyText: { color: 'white' },

  phoneRow: { flexDirection: 'row', alignItems: 'center' },
  prefixContainer: { backgroundColor: '#E0E0E0', paddingVertical: 16, paddingHorizontal: 15, borderTopLeftRadius: 10, borderBottomLeftRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', marginRight: -1 },
  prefixText: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  phoneInput: { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
  
  saveButton: { backgroundColor: ANA_RENK, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30, cursor: 'pointer' } as any,
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  cancelButton: { marginTop: 15, alignItems: 'center', padding: 10, cursor: 'pointer' } as any,
  cancelButtonText: { color: '#888', fontSize: 14, fontWeight: '600' },
});