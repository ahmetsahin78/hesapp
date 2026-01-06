import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ANA_RENK_KOYU = '#470f46';
const ANA_RENK_ACIK = '#7a297a'; 
const ALACAK_RENK = '#2ecc71'; 
const ODEME_RENK = '#e74c3c'; 
const ARKA_PLAN = '#f8f9fd';

// YENİ RENKLER (Tedarikçi İçin Zümrüt Yeşili Tonları)
const TEDARIKCI_KOYU = '#004d40';
const TEDARIKCI_ACIK = '#4db6ac';

export default function HomeScreen() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('all');

  const [dolarRate, setDolarRate] = useState(43); 
  const [euroRate, setEuroRate] = useState(50);
  const [isRatesLoaded, setIsRatesLoaded] = useState(false);
  const [totalReceivable, setTotalReceivable] = useState(0); 
  const [totalPayable, setTotalPayable] = useState(0);       

  useEffect(() => { fetchRates(); }, []);

  const fetchRates = async () => {
    try {
      const resUSD = await fetch('https://api.frankfurter.app/latest?from=USD&to=TRY');
      const dataUSD = await resUSD.json();
      const resEUR = await fetch('https://api.frankfurter.app/latest?from=EUR&to=TRY');
      const dataEUR = await resEUR.json();
      if (dataUSD?.rates?.TRY && dataEUR?.rates?.TRY) {
        setDolarRate(dataUSD.rates.TRY);
        setEuroRate(dataEUR.rates.TRY);
        setIsRatesLoaded(true);
      }
    } catch (error) { console.log('Kur hatası', error); }
  };

  useFocusEffect(
    useCallback(() => { loadCustomers(); }, [])
  );

  useEffect(() => {
    applyFilters(searchText, filterType);
  }, [customers, searchText, filterType]);

  useEffect(() => { calculateTotals(customers); }, [customers, dolarRate, euroRate]);

  const calculateCustomerBalance = (islemler: any[]) => {
    if (!islemler) return 0;
    let total = 0;
    islemler.forEach((t: any) => {
      if (t.type === 'borc') total += t.amount;
      else total -= t.amount;
    });
    return total;
  };

  const calculateTotals = (list: any[]) => {
    let alcTL = 0;
    let brcTL = 0;
    list.forEach((c: any) => {
      const orjinalBakiye = calculateCustomerBalance(c.islemler);
      let tlKarsiligi = 0;
      if (c.paraBirimi === 'USD') tlKarsiligi = orjinalBakiye * dolarRate;
      else if (c.paraBirimi === 'EUR') tlKarsiligi = orjinalBakiye * euroRate;
      else tlKarsiligi = orjinalBakiye;

      if (tlKarsiligi > 0) alcTL += tlKarsiligi;
      else brcTL += Math.abs(tlKarsiligi);
    });
    setTotalReceivable(alcTL);
    setTotalPayable(brcTL);
  };

  const loadCustomers = async () => {
    try {
      const user = await AsyncStorage.getItem('session_user');
      if (!user) return;
      setCurrentUser(user);
      const storageKey = `musteriler_${user}`;
      const json = await AsyncStorage.getItem(storageKey);
      if (json) {
        const list = JSON.parse(json);
        setCustomers(list.reverse());
      } else {
        setCustomers([]);
      }
    } catch (e) { console.error(e); }
  };

  const applyFilters = (text: string, type: string) => {
    let result = customers;
    if (type !== 'all') {
        result = result.filter(c => c.hesapTuru === type);
    }
    if (text !== '') {
        const lowerText = text.toLowerCase();
        result = result.filter((c) => 
            c.isim.toLowerCase().includes(lowerText) || (c.tel && c.tel.includes(text))
        );
    }
    setFilteredCustomers(result);
  };

  const getSymbol = (currency: string) => {
    if (currency === 'USD') return '$';
    if (currency === 'EUR') return '€';
    return '₺';
  };

  const renderItem = ({ item }: { item: any }) => {
    const bakiye = calculateCustomerBalance(item.islemler);
    const isPositive = bakiye >= 0;
    
    // Tedarikçi mi Müşteri mi?
    const isSupplier = item.hesapTuru === 'tedarikci';
    
    // RENK AYARLARI: Tedarikçi ise Zümrüt, Müşteri ise Mor
    const gradientColors = isSupplier 
        ? [TEDARIKCI_ACIK, TEDARIKCI_KOYU] 
        : [ANA_RENK_ACIK, ANA_RENK_KOYU];

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: '/customer-detail', params: { id: item.id } })}
      >
        <LinearGradient colors={[isPositive ? '#eafaf1' : '#fdedec', '#fff']} start={[0,0]} end={[1,0]} style={styles.cardGradientBorder}>
           <View style={styles.cardContent}>
              
              {/* AVATAR: Sadece Baş Harf */}
              <View style={[styles.avatarContainer, { shadowColor: isSupplier ? TEDARIKCI_KOYU : ANA_RENK_KOYU }]}>
                <LinearGradient colors={gradientColors as any} style={styles.avatarGradient}>
                   {/* İKON YOK, HARF VAR */}
                   <Text style={styles.avatarText}>
                       {item.isim ? item.isim.charAt(0).toUpperCase() : '?'}
                   </Text>
                </LinearGradient>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.name}>{item.isim}</Text>
                <Text style={styles.typeLabel}>{isSupplier ? 'Tedarikçi' : 'Müşteri'}</Text>
              </View>

              <View style={styles.amountContainer}>
                <Text style={[styles.amount, { color: isPositive ? ALACAK_RENK : ODEME_RENK }]}>
                  {bakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} <Text style={styles.currencySymbol}>{getSymbol(item.paraBirimi)}</Text>
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: isPositive ? '#d5f5e3' : '#fadbd8' }]}>
                    <Text style={[styles.statusText, { color: isPositive ? ALACAK_RENK : ODEME_RENK }]}>{isPositive ? 'Alacak' : 'Verecek'}</Text>
                </View>
              </View>
           </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <LinearGradient colors={[ANA_RENK_KOYU, ANA_RENK_ACIK]} style={styles.headerBackground}>
        <View style={styles.headerContent}>
            <View style={styles.headerTopRow}>
                <View>
                    <Text style={styles.greetingText}>Merhaba,</Text>
                    <Text style={styles.userText}>{currentUser || 'Esnaf Dostu'}</Text>
                </View>
                <View style={styles.ratesPillContainer}>
                    <View style={styles.ratePill}><Text style={styles.ratePillText}>$ {dolarRate.toFixed(2)}</Text></View>
                    <View style={styles.ratePill}><Text style={styles.ratePillText}>€ {euroRate.toFixed(2)}</Text></View>
                    <View style={[styles.liveDot, { backgroundColor: isRatesLoaded ? '#2ecc71' : '#e74c3c' }]} />
                </View>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={22} color="#999" style={{ marginRight: 10 }} />
                <TextInput 
                    placeholder="Ara..." 
                    placeholderTextColor="#aaa"
                    style={styles.searchInput} 
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>
        </View>
      </LinearGradient>

      {/* ÖZET KUTUSU */}
      <View style={styles.summaryFloatingContainer}>
        <View style={styles.summaryBox}>
            <View style={[styles.summaryIconContainer, { backgroundColor: '#d5f5e3' }]}>
                <Ionicons name="trending-up" size={24} color={ALACAK_RENK} />
            </View>
            <View>
                <Text style={styles.summaryLabel}>Toplam Alacak</Text>
                <Text style={[styles.summaryValue, { color: ALACAK_RENK }]}>
                    {totalReceivable.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                </Text>
            </View>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryBox}>
            <View style={[styles.summaryIconContainer, { backgroundColor: '#fadbd8' }]}>
                <Ionicons name="trending-down" size={24} color={ODEME_RENK} />
            </View>
            <View>
                <Text style={styles.summaryLabel}>Toplam Verecek</Text>
                <Text style={[styles.summaryValue, { color: ODEME_RENK }]}>
                    {totalPayable.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                </Text>
            </View>
        </View>
      </View>

      {/* FİLTRE BUTONLARI - İKONSUZ */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
            style={[styles.filterBtn, filterType === 'all' && { backgroundColor: ANA_RENK_KOYU }]} 
            onPress={() => setFilterType('all')}
        >
            <Text style={[styles.filterText, filterType === 'all' && styles.activeFilterText]}>Tümü</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
            style={[styles.filterBtn, filterType === 'musteri' && { backgroundColor: ANA_RENK_KOYU }]} 
            onPress={() => setFilterType('musteri')}
        >
            <Text style={[styles.filterText, filterType === 'musteri' && styles.activeFilterText]}>Müşteriler</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
            style={[styles.filterBtn, filterType === 'tedarikci' && { backgroundColor: TEDARIKCI_KOYU }]} 
            onPress={() => setFilterType('tedarikci')}
        >
            <Text style={[styles.filterText, filterType === 'tedarikci' && styles.activeFilterText]}>Tedarikçiler</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={80} color="#ddd" />
            <Text style={styles.emptyText}>Kayıt bulunamadı.</Text>
          </View>
        }
      />

      <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/add-customer')}>
        <LinearGradient colors={[ANA_RENK_ACIK, ANA_RENK_KOYU]} style={styles.fabGradient}>
            <Ionicons name="add" size={36} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ARKA_PLAN },
  headerBackground: { paddingTop: Platform.OS === 'android' ? 50 : 60, paddingBottom: 80, paddingHorizontal: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: {},
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
  greetingText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  userText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  ratesPillContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: 5 },
  ratePill: { paddingHorizontal: 8, paddingVertical: 4 },
  ratePillText: { color: 'white', fontSize: 12, fontWeight: '600' },
  liveDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5, marginLeft: 2 },
  searchContainer: { backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },

  summaryFloatingContainer: { flexDirection: 'row', backgroundColor: 'white', marginHorizontal: 25, marginTop: -50, borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 10 },
  summaryBox: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  summaryIconContainer: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  summaryDivider: { width: 1, backgroundColor: '#f0f0f0', height: '80%', marginHorizontal: 15 },
  summaryLabel: { fontSize: 11, color: '#999', fontWeight: '600', marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: 'bold' },

  filterContainer: { flexDirection: 'row', paddingHorizontal: 25, marginTop: 20, marginBottom: 10 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#e0e0e0', marginRight: 10 },
  filterText: { color: '#555', fontWeight: '600', fontSize: 13 },
  activeFilterText: { color: 'white' },

  listContainer: { paddingHorizontal: 25, paddingBottom: 100 },
  card: { marginBottom: 15, borderRadius: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, backgroundColor: 'white' },
  cardGradientBorder: { borderRadius: 18, paddingLeft: 6 },
  cardContent: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderTopRightRadius: 18, borderBottomRightRadius: 18 },
  avatarContainer: { width: 55, height: 55, borderRadius: 20, marginRight: 15, shadowOffset: {width:0, height:4}, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  avatarGradient: { flex:1, justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  avatarText: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  infoContainer: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  typeLabel: { fontSize: 11, color: '#888' },
  amountContainer: { alignItems: 'flex-end' },
  amount: { fontSize: 16, fontWeight: 'bold' },
  currencySymbol: { fontSize: 12, color: '#777' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginTop: 5 },
  statusText: { fontSize: 10, fontWeight: 'bold' },

  fabGradient: { position: 'absolute', bottom: 30, right: 25, width: 65, height: 65, borderRadius: 35, justifyContent: 'center', alignItems: 'center', shadowColor: ANA_RENK_KOYU, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 10 },
  emptyContainer: { alignItems: 'center', marginTop: 60, opacity: 0.6 },
  emptyText: { color: '#555', marginTop: 15, fontSize: 18, fontWeight: 'bold' },
});