import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { shareAsync } from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Linking, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ANA_RENK = '#470f46';
const POZITIF_RENK = '#2ecc71'; 
const NEGATIF_RENK = '#e74c3c'; 

export default function CustomerDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDebt, setIsDebt] = useState(true);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const isSupplier = customer?.hesapTuru === 'tedarikci';

  const getSymbol = () => {
    if (customer?.paraBirimi === 'USD') return '$';
    if (customer?.paraBirimi === 'EUR') return '€';
    return '₺';
  };

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      const currentUser = await AsyncStorage.getItem('session_user');
      if (!currentUser) return;
      
      const storageKey = `musteriler_${currentUser}`;
      const json = await AsyncStorage.getItem(storageKey);
      
      if (json) {
        const list = JSON.parse(json);
        const found = list.find((c: any) => c.id === customerId);
        if (found) {
          setCustomer(found);
          setTransactions((found.islemler || []).reverse());
        }
      }
    } catch (e) { console.error(e); }
  };

  const calculateBalance = () => {
    if (!customer || !customer.islemler) return 0;
    let total = 0;
    customer.islemler.forEach((t: any) => {
      if (t.type === 'borc') total += t.amount;
      else total -= t.amount;
    });
    return total;
  };

  // --- SİLME MANTIĞI (WEB İÇİN AYRI) ---
  const performDelete = async () => {
    try {
      const currentUser = await AsyncStorage.getItem('session_user');
      if (!currentUser) return;
      const storageKey = `musteriler_${currentUser}`;
      const json = await AsyncStorage.getItem(storageKey);
      if (json) {
        let list = JSON.parse(json);
        list = list.filter((c: any) => c.id !== customerId);
        await AsyncStorage.setItem(storageKey, JSON.stringify(list));
        router.back();
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteCustomer = () => {
    const message = `"${customer?.isim}" kaydını silmek istediğinize emin misiniz?`;
    
    if (Platform.OS === 'web') {
      // WEB: Tarayıcı onay kutusu kullan
      if (window.confirm(message)) {
        performDelete();
      }
    } else {
      // MOBİL: Native Alert kullan
      Alert.alert(
        'Kaydı Sil', 
        message,
        [
          { text: 'Vazgeç', style: 'cancel' },
          { text: 'SİL', style: 'destructive', onPress: performDelete }
        ]
      );
    }
  };
  // -------------------------------------

  const handleWhatsapp = () => {
    if (!customer?.tel) {
      const msg = 'Telefon numarası kayıtlı değil.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Hata', msg);
      return;
    }
    let cleanPhone = customer.tel.replace(/[^0-9]/g, '');
    if (!cleanPhone.startsWith('90')) cleanPhone = '90' + cleanPhone;

    const bakiye = formatMoney(calculateBalance());
    const sembol = getSymbol();
    
    let msg = '';
    if (isSupplier) {
        msg = `Sayın ${customer.isim}, HesApp üzerindeki kayıtlara göre güncel bakiyemiz: *${bakiye} ${sembol}* olarak görünmektedir. Mutabakat için bilgilerinize sunarız.`;
    } else {
        msg = `Sayın ${customer.isim}, HesApp üzerindeki cari hesabınızda güncel bakiyeniz: *${bakiye} ${sembol}* olarak görünmektedir. Ödemenizi rica ederiz.`;
    }

    const url = `whatsapp://send?text=${msg}&phone=${cleanPhone}`;
    Linking.openURL(url).catch(() => Alert.alert('Hata', 'WhatsApp açılamadı.'));
  };

  const handlePdf = async () => {
    try {
        const bakiye = formatMoney(calculateBalance());
        const sembol = getSymbol();
        
        const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
                body { font-family: Helvetica, Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; color: ${ANA_RENK}; }
                .header { margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background-color: #f2f2f2; text-align: left; padding: 10px; border: 1px solid #ddd; }
                td { padding: 10px; border: 1px solid #ddd; }
                .plus { color: ${POZITIF_RENK}; }
                .minus { color: ${NEGATIF_RENK}; }
                .balance { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
                <h1>HESAP EKSTRESİ</h1>
                <p><strong>Cari:</strong> ${customer.isim} (${isSupplier ? 'Tedarikçi' : 'Müşteri'})</p>
                <p><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
            </div>
            <table>
                <tr><th>Tarih</th><th>Açıklama</th><th>İşlem</th><th style="text-align: right;">Tutar</th></tr>
                ${transactions.map(t => {
                    let typeText = '';
                    if (t.type === 'borc') {
                        typeText = isSupplier ? 'Mal/Hizmet Alımı' : 'Borç Eklendi';
                    } else {
                        typeText = isSupplier ? 'Ödeme Yapıldı' : 'Ödeme Alındı';
                    }
                    return `
                    <tr>
                        <td>${t.date}</td>
                        <td>${t.note || '-'}</td>
                        <td class="${t.type === 'borc' ? 'plus' : 'minus'}">${typeText}</td>
                        <td style="text-align: right; font-weight: bold;" class="${t.type === 'borc' ? 'plus' : 'minus'}">
                            ${t.type === 'borc' ? '+' : '-'} ${formatMoney(t.amount)} ${sembol}
                        </td>
                    </tr>
                `}).join('')}
            </table>
            <div class="balance">TOPLAM BAKİYE: ${bakiye} ${sembol}</div>
          </body>
        </html>
        `;
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) { Alert.alert('Hata', 'PDF oluşturulamadı.'); }
  };

  const formatMoney = (val: number) => val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatInputMoney = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    if (!clean) return '';
    return Number(clean).toLocaleString('tr-TR');
  };

  const handleAddTransaction = async () => {
    if (!amount) return;
    const rawAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    
    const newTransaction = {
      id: Date.now().toString(),
      type: isDebt ? 'borc' : 'odeme',
      amount: rawAmount,
      note: note,
      date: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'}),
    };

    try {
      const currentUser = await AsyncStorage.getItem('session_user');
      if (!currentUser) return;
      const storageKey = `musteriler_${currentUser}`;
      const json = await AsyncStorage.getItem(storageKey);
      if (json) {
        let list = JSON.parse(json);
        list = list.map((c: any) => {
          if (c.id === customerId) {
            const updatedTransactions = [...(c.islemler || []), newTransaction];
            return { ...c, islemler: updatedTransactions };
          }
          return c;
        });
        await AsyncStorage.setItem(storageKey, JSON.stringify(list));
        setModalVisible(false);
        setAmount('');
        setNote('');
        loadCustomerData();
      }
    } catch (e) { Alert.alert('Hata', 'Kaydedilemedi'); }
  };

  const deleteTransaction = async (transId: string) => {
    const performTransDelete = async () => {
        const currentUser = await AsyncStorage.getItem('session_user');
        if (!currentUser) return;
        const storageKey = `musteriler_${currentUser}`;
        const json = await AsyncStorage.getItem(storageKey);
        if (json) {
            let list = JSON.parse(json);
            list = list.map((c: any) => {
              if (c.id === customerId) {
                const filtered = c.islemler.filter((t: any) => t.id !== transId);
                return { ...c, islemler: filtered };
              }
              return c;
            });
            await AsyncStorage.setItem(storageKey, JSON.stringify(list));
            loadCustomerData();
        }
    };

    if (Platform.OS === 'web') {
        if (window.confirm('Bu işlemi silmek istiyor musunuz?')) {
            performTransDelete();
        }
    } else {
        Alert.alert('İşlemi Sil', 'Silmek istiyor musunuz?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Sil', style: 'destructive', onPress: performTransDelete }
        ]);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    let titleText = '';
    if (item.type === 'borc') {
        titleText = isSupplier ? 'Ödeme Yapıldı' : 'Borç Eklendi';
    } else {
        titleText = isSupplier ? 'Mal Alımı' : 'Ödeme Alındı';
    }

    return (
        <TouchableOpacity onLongPress={() => deleteTransaction(item.id)} style={styles.card} activeOpacity={0.7}>
        <View style={styles.cardLeft}>
            <View style={[styles.iconBox, { backgroundColor: item.type === 'borc' ? '#eafaf1' : '#fadbd8' }]}>
            <Ionicons 
                name={item.type === 'borc' ? "add" : "remove"} 
                size={20} 
                color={item.type === 'borc' ? POZITIF_RENK : NEGATIF_RENK} 
            />
            </View>
            <View>
            <Text style={styles.note}>{item.note || titleText}</Text>
            <Text style={styles.date}>{item.date}</Text>
            </View>
        </View>
        <Text style={[styles.amount, { color: item.type === 'borc' ? POZITIF_RENK : NEGATIF_RENK }]}>
            {item.type === 'borc' ? '+' : '-'} {formatMoney(item.amount)} {getSymbol()}
        </Text>
        </TouchableOpacity>
    );
  };

  const getModalTitle = () => {
      if (isDebt) {
          return isSupplier ? `Tedarikçiye Ödeme Yap (${getSymbol()})` : `Borç Ekle (${getSymbol()})`;
      } else {
          return isSupplier ? `Mal/Hizmet Alımı Ekle (${getSymbol()})` : `Müşteriden Ödeme Al (${getSymbol()})`;
      }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
            {/* GERİ BUTONU */}
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            
            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.customerName} numberOfLines={1}>{customer?.isim}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{isSupplier ? 'TEDARİKÇİ' : 'MÜŞTERİ'}</Text>
                </View>
            </View>

            {/* SİLME BUTONU (PRESSABLE YAPILDI - WEB UYUMLU) */}
            <Pressable onPress={handleDeleteCustomer} style={({pressed}) => [styles.deleteBtn, {opacity: pressed ? 0.7 : 1}]}>
                <Ionicons name="trash-outline" size={24} color="rgba(255,255,255,0.9)" />
            </Pressable>
        </View>

        <Text style={styles.balanceLabel}>Güncel Bakiye</Text>
        <Text style={styles.balanceAmount}>{formatMoney(calculateBalance())} {getSymbol()}</Text>
        
        <View style={styles.quickActions}>
            <Pressable style={styles.quickBtn} onPress={handleWhatsapp}>
                <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                <Text style={styles.quickBtnText}>Hatırlat</Text>
            </Pressable>

            <Pressable style={[styles.quickBtn, { marginLeft: 10, backgroundColor: 'rgba(255,255,255,0.2)' }]} onPress={handlePdf}>
                <Ionicons name="document-text" size={20} color="#fff" />
                <Text style={styles.quickBtnText}>PDF Ekstre</Text>
            </Pressable>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <Pressable 
            style={({pressed}) => [styles.actionBtn, { backgroundColor: POZITIF_RENK, opacity: pressed ? 0.8 : 1 }]} 
            onPress={() => { setIsDebt(true); setModalVisible(true); }}
        >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.btnText}>
                {isSupplier ? 'ÖDEME YAP' : 'BORÇ EKLE'}
            </Text>
        </Pressable>
        
        <Pressable 
            style={({pressed}) => [styles.actionBtn, { backgroundColor: NEGATIF_RENK, opacity: pressed ? 0.8 : 1 }]} 
            onPress={() => { setIsDebt(false); setModalVisible(true); }}
        >
            <Ionicons name="remove-circle" size={24} color="white" />
            <Text style={styles.btnText}>
                {isSupplier ? 'MAL ALIMI EKLE' : 'ÖDEME AL'}
            </Text>
        </Pressable>
      </View>

      <FlatList data={transactions} keyExtractor={item => item.id} renderItem={renderItem} contentContainerStyle={{ padding: 20 }} ListEmptyComponent={<Text style={styles.emptyText}>Henüz hareket yok.</Text>} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={[styles.modalTitle, { color: isDebt ? POZITIF_RENK : NEGATIF_RENK }]}>
                    {getModalTitle()}
                </Text>
                
                <Text style={styles.inputLabel}>Tutar</Text>
                <TextInput style={styles.modalInput} placeholder="0" keyboardType="numeric" value={amount} onChangeText={t => setAmount(formatInputMoney(t))} />
                
                <Text style={styles.inputLabel}>Açıklama</Text>
                <TextInput style={styles.modalInput} placeholder="Not (Opsiyonel)..." value={note} onChangeText={setNote} />

                <View style={styles.modalButtons}>
                    <Pressable style={styles.modalCancel} onPress={() => setModalVisible(false)}><Text style={{color: '#666'}}>İptal</Text></Pressable>
                    <Pressable style={[styles.modalSave, { backgroundColor: isDebt ? POZITIF_RENK : NEGATIF_RENK }]} onPress={handleAddTransaction}><Text style={{color: 'white', fontWeight: 'bold'}}>KAYDET</Text></Pressable>
                </View>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: ANA_RENK, paddingTop: 50, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  backBtn: { marginRight: 10, cursor: 'pointer' } as any,
  deleteBtn: { padding: 5, marginLeft: 10, cursor: 'pointer' } as any, // WEB İÇİN POINTER EKLENDİ
  customerName: { color: 'white', fontSize: 20, fontWeight: 'bold', marginRight: 8, maxWidth: '60%' },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  badgeText: { color: 'white', fontWeight: 'bold', fontSize: 10 },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center' },
  balanceAmount: { color: 'white', fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  
  quickActions: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  quickBtn: { flexDirection: 'row', backgroundColor: '#25D366', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, alignItems: 'center', cursor: 'pointer' } as any,
  quickBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 5, fontSize: 12 },

  actionContainer: { flexDirection: 'row', padding: 20, justifyContent: 'space-between', marginTop: -25 },
  actionBtn: { flex: 0.48, flexDirection: 'row', padding: 15, borderRadius: 15, alignItems: 'center', justifyContent: 'center', shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, elevation: 4, cursor: 'pointer' } as any,
  btnText: { color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 14 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' } as any,
  cardLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  note: { fontWeight: 'bold', color: '#333' },
  date: { fontSize: 12, color: '#999', marginTop: 2 },
  amount: { fontSize: 16, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  inputLabel: { fontWeight: 'bold', color: '#555', marginBottom: 5 },
  modalInput: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalCancel: { padding: 15, flex: 0.45, alignItems: 'center', backgroundColor: '#eee', borderRadius: 10, cursor: 'pointer' } as any,
  modalSave: { padding: 15, flex: 0.45, alignItems: 'center', borderRadius: 10, cursor: 'pointer' } as any,
});