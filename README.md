<div align="center">

# 📒 HesApp - Esnaf Dostu Dijital Veresiye Defteri

Geliştirici: Ahmet Şahin

### *KOBİ'ler ve Esnaflar İçin Yeni Nesil Cari Hesap Yönetimi*

[![React Native](https://img.shields.io/badge/React%20Native-0.74.0-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~51.0.0-000020?style=for-the-badge&logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)](LICENSE)

**Geleneksel veresiye defterlerini rafa kaldıran, offline çalışan, çoklu para birimi destekli ve güvenli mobil cari takip platformu.**

[Proje Hakkında](#proje-hakkında-) • [Özellikler](#temel-özellikler-) • [Teknolojiler](#teknolojiler-) • [Mimari](#mimari-) • [Kurulum](#kurulum-) 

</div>

---

## Proje Hakkında 🎯

**HesApp**, esnafların ve küçük işletmelerin alacak/verecek takip süreçlerini dijitalleştirmek amacıyla geliştirilmiş modern bir mobil uygulamadır.

- İnternet bağımlılığı olmadan **Offline-First** mimaride çalışır  
- Müşteri ve tedarikçi bakiyelerini ayrı ayrı yönetir  
- Canlı döviz kurları ile toplam varlığın TL karşılığını anlık hesaplar  
- WhatsApp ve PDF ekstre paylaşımıyla iletişimi kolaylaştırır

---

## Temel Özellikler 🚀

### 👥 Cari Hesap Yönetimi (Çift Yönlü)

- **Müşteri Takibi:** Perakende satışlar ve alacak takibi — *Mor Tema*  
- **Tedarikçi Takibi:** Toptan mal alımları ve borç takibi — *Zümrüt Yeşili Tema*  
- Hesap türüne göre dinamik renk ve ikon değişimi  
- İsim, telefon, para birimi ve hesap türü kaydı  
- Detaylı işlem geçmişi görüntüleme

---

### 💰 Finansal Yönetim & Döviz

- TL, USD ve EUR olmak üzere **çoklu para birimi desteği**  
- Frankfurter API ile **anlık kur takibi**  
- Farklı dövizlerdeki bakiyelerin TL karşılığını özetleme  
- “Toplam Alacak” ve “Toplam Verecek” ayrıştırması

---

### 📄 Raporlama & Entegrasyon

- Tek tıkla profesyonel **PDF ekstre oluşturma**  
- WhatsApp üzerinden:  
  - Otomatik ödeme hatırlatma mesajı (müşteri)  
  - Otomatik mutabakat mesajı (tedarikçi)
- Uygulama içinden direkt arama ve mesajlaşma

---

### 🔐 Güvenlik & Veri

- Veriler **AsyncStorage** ile cihazda güvenle saklanır  
- Kullanıcı adı ve şifre ile kimlik doğrulama  
- “Beni Hatırla” özelliği  
- Güvenli oturum yönetimi

---

### 🎨 Modern UI/UX

- iOS, Android ve Web tarayıcılarında uyumlu çalışma  
- Linear Gradient ile modern arayüz  
- Kolay anlaşılır ikonlar  
- Akıcı animasyonlu kullanıcı deneyimi

---

## Teknolojiler 🛠

### Framework & UI

- React Native  
- Expo SDK 51  
- TypeScript  
- Expo Linear Gradient  
- Ionicons (@expo/vector-icons)

### Navigasyon

- Expo Router — Dosya tabanlı routing  
- Stack Navigation

### Veri Saklama

- AsyncStorage  
- React Context & Hooks

### Harici Servisler

- Frankfurter API (Döviz Kurları)  
- Expo Print (PDF Oluşturma)  
- Expo Sharing  
- React Native Linking API

### Platform Desteği

- Expo Go  
- React Native Web

---

## Mimari 🏗

### Proje Yapısı

```
hesapp/
├── app/                  # Expo Router sayfaları
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── _layout.tsx
│   ├── index.tsx         # Login ekranı
│   ├── register.tsx
│   ├── add-customer.tsx
│   └── customer-detail.tsx
├── assets/
│   └── screenshots/
├── components/
└── package.json
```

---

## Kurulum 💻

### Gereksinimler

- Node.js (LTS sürümü)  
- npm veya yarn  
- Expo Go uygulaması (mobil test için)

### Adımlar

1. **Projeyi klonlayın**

```bash
git clone https://github.com/ahmetsahin78/hesapp
cd hesapp
```

2. **Bağımlılıkları yükleyin**

```bash
npm install
# veya
yarn install
```

3. **Uygulamayı başlatın**

```bash
npx expo start
```

4. **Çalıştırma**

- 📱 **Mobil:** QR kodu Expo Go ile okutun  
- 🌐 **Web:** Terminalde `w` tuşuna basarak tarayıcıda açın

---

## Kullanım 🎮

- Uygulama açılışında yerel hesap oluşturun  
- (+) butonuyla Müşteri veya Tedarikçi ekleyin  
- Detay ekranından borç ve ödeme işlemleri yapın  
- PDF ekstre oluşturun veya WhatsApp üzerinden paylaşın

---

## Geliştirme Notları 🔧

### Web Platformu Desteği

- TouchableOpacity yerine web dostu **Pressable** kullanıldı  
- Web ortamında `window.confirm` entegrasyonu yapıldı  
- KeyboardAvoidingView bileşeni web’de layout sorunu yaratmaması için optimize edildi

### AsyncStorage Veri Anahtarları

- `users_db` — kayıtlı kullanıcı listesi  
- `session_user` — aktif oturum  
- `musteriler_{username}` — kullanıcıya özel izole cari veriler

---

<div align="center">

© 2025 HesApp - Tüm Hakları Saklıdır

</div>