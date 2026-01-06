<div align="center">

# 📒 HesApp - Esnaf Dostu Dijital Veresiye Defteri

Geliştirici: Fehmi Göktuğ Katırcılar

### *KOBİ'ler ve Esnaflar İçin Yeni Nesil Cari Hesap Yönetimi*

[![React Native](https://img.shields.io/badge/React%20Native-0.74.0-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~51.0.0-000020?style=for-the-badge&logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)](LICENSE)

**Geleneksel veresiye defterlerini rafa kaldıran, çoklu para birimi destekli ve güvenli mobil cari takip platformu.**

[Özellikler](#-temel-özellikler) • [Kurulum](#-kurulum) • [Teknolojiler](#-teknolojiler) • [Mimari](#-mimari) • [Ekran Görüntüleri](#-ekran-görüntüleri)

</div>

---

## 📋 İçindekiler

- [Proje Hakkında](#-proje-hakkında)
- [Temel Özellikler](#-temel-özellikler)
- [Teknolojiler](#-teknolojiler)
- [Mimari](#-mimari)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [Ekran Görüntüleri](#-ekran-görüntüleri)
- [Commit Geçmişi](#-commit-geçmişi-development-timeline)
- [Geliştirme Notları](#-geliştirme-notları)

---

## 🎯 Proje Hakkında

**HesApp**, esnafların ve küçük işletmelerin alacak/verecek takiplerini dijitalleştiren, internet bağımlılığı olmadan (Offline-First) çalışan modern bir mobil uygulamadır. 

Müşteri ve Tedarikçi bakiyelerini ayrı ayrı yönetmenizi sağlarken, canlı döviz kurları entegrasyonu ile toplam varlığınızı anlık olarak TL cinsinden hesaplar ve raporlar.

---

## 🚀 Temel Özellikler

### 👥 Cari Hesap Yönetimi (Çift Yönlü)
- **Müşteri Takibi:** Perakende satışlar ve alacak takibi (Mor Tema).
- **Tedarikçi Takibi:** Toptan mal alımları ve borç takibi (Zümrüt Yeşili Tema).
- **Görsel Ayrıştırma:** Hesap türüne göre dinamik renk ve ikon değişimi.
- **Detaylı Profil:** İsim, Telefon, Para Birimi ve Hesap Türü kaydı.

### 💰 Finansal Yönetim & Döviz
- **Çoklu Para Birimi:** TL, USD ve EUR desteği.
- **Canlı Kur Takibi:** Frankfurter API entegrasyonu ile anlık döviz kurları.
- **Varlık Analizi:** Farklı dövizlerdeki tüm cari bakiyelerin güncel kurla TL karşılığını özetleme.
- **Akıllı Bakiye:** "Toplam Alacak" ve "Toplam Verecek" ayrımı.

### 📄 Raporlama & Entegrasyon
- **PDF Ekstre:** Tek tıkla profesyonel hesap dökümü oluşturma ve paylaşma.
- **WhatsApp Entegrasyonu:** - Müşterilere otomatik "Ödeme Hatırlatma" mesajı.
  - Tedarikçilere otomatik "Mutabakat" mesajı.
- **Hızlı İletişim:** Uygulama içinden direkt arama ve mesajlaşma.

### 🔐 Güvenlik & Veri
- **Offline-First:** AsyncStorage ile veriler cihazda güvenle saklanır.
- **Kimlik Doğrulama:** Kullanıcı adı ve şifre ile güvenli giriş.
- **Oturum Yönetimi:** Beni hatırla özelliği ve güvenli çıkış.

### 🎨 Modern UI/UX
- **Responsive Tasarım:** Hem Mobil (iOS/Android) hem Web tarayıcılarında sorunsuz çalışma.
- **Görsel Zenginlik:** Linear Gradient ile modern geçişler ve gölgelendirmeler.
- **Kullanıcı Dostu:** Kolay anlaşılır ikonlar ve akıcı animasyonlar.

---

## 🛠 Teknolojiler

### Frontend Framework & UI
- **React Native** - Mobil uygulama framework'ü
- **Expo SDK** `51` - Geliştirme platformu
- **TypeScript** - Tip güvenliği ve kod kalitesi
- **Expo Linear Gradient** - Modern arayüz tasarımı
- **Ionicons** (@expo/vector-icons) - İkon kütüphanesi

### Navigation & Routing
- **Expo Router** - Dosya tabanlı navigasyon (File-based routing)
- **Stack Navigation** - Sayfa geçişleri ve modal yönetimi

### Data & Storage
- **AsyncStorage** - Kalıcı yerel veri saklama (Local Storage)
- **React Context / Hooks** - State yönetimi

### External Services & APIs
- **Frankfurter API** - Canlı döviz kurları (USD/EUR)
- **Expo Print** - PDF oluşturma servisi
- **Expo Sharing** - Dosya paylaşım servisi
- **Linking API** - WhatsApp ve Telefon yönlendirmeleri

### Platform Support
- **Expo Go** - Mobil test ortamı
- **React Native Web** - Web tarayıcı desteği (KeyboardAvoidingView optimizasyonları ile)

---

## 🏗 Mimari

### Proje Yapısı

hesapp/ ├── app/ # Uygulama kaynak kodları (Expo Router) │ ├── (tabs)/ # Alt navigasyon (Tab Bar) │ │ ├── _layout.tsx # Tab konfigürasyonu │ │ └── index.tsx # Ana Sayfa (Dashboard & Liste) │ ├── _layout.tsx # Ana Stack navigasyonu ve Tema │ ├── index.tsx # Giriş (Login) Ekranı │ ├── register.tsx # Kayıt (Register) Ekranı │ ├── add-customer.tsx # Hesap Ekleme (Müşteri/Tedarikçi) │ ├── customer-detail.tsx # Hesap Detayı, İşlemler, PDF, WhatsApp │ └── modal.tsx # Yardımcı modallar │ ├── assets/ # Medya dosyaları │ ├── images/ # Logolar │ └── screenshots/ # README görselleri │ ├── components/ # Yeniden kullanılabilir bileşenler └── package.json # Bağımlılıklar


---

## 💻 Kurulum

### Gereksinimler

- **Node.js** (LTS sürümü)
- **npm** veya **yarn**
- **Expo Go** uygulaması (Mobil test için)

### Adımlar

1. **Projeyi klonlayın**

```bash
git clone [https://github.com/fgk568/MobileAppDEV-Project-Final.git](https://github.com/fgk568/MobileAppDEV-Project-Final.git)
cd hesapp
Bağımlılıkları yükleyin

Bash

npm install
# veya
yarn install
Uygulamayı başlatın

Bash

npx expo start
Çalıştırın

Mobil: Ekranda çıkan QR kodu telefonunuzdaki Expo Go uygulaması ile okutun.

Web: Terminalde w tuşuna basarak tarayıcıda açın.

📸 Ekran Görüntüleri
<div align="center">

🔐 Giriş & Güvenlik
Kullanıcı doğrulama ve güvenli kayıt sistemi <img src="./assets/screenshots/login.png" width="250" />

📊 Dashboard & Kur Takibi
Müşteri/Tedarikçi listesi, canlı kurlar ve özet tablo <img src="./assets/screenshots/home.png" width="250" />

📝 Hesap Yönetimi
Hesap türü seçimi ve yeni kayıt oluşturma <img src="./assets/screenshots/add.png" width="250" />

💼 Detay & İşlemler
Borç/Alacak ekleme, PDF raporlama ve WhatsApp butonu <img src="./assets/screenshots/detail.png" width="250" />

</div>

📅 Commit Geçmişi (Development Timeline)
Proje, çevik geliştirme yöntemleriyle 3 ana fazda tamamlanmıştır:

📌 Faz 1: Temel Yapı ve Kimlik Doğrulama
Proje iskeletinin Expo Router ile oluşturulması.

AsyncStorage tabanlı kullanıcı kayıt (Register) ve giriş (Login) sistemi.

Güvenli oturum yönetimi ve veri kalıcılığı.

📌 Faz 2: Cari Hesap ve Veri Yönetimi
CRUD İşlemleri: Müşteri ekleme, listeleme, güncelleme ve silme.

İşlem Mantığı: Hesap detay sayfası ve bakiye hesaplama (Borç/Ödeme).

Segmentasyon: "Müşteri" ve "Tedarikçi" ayrımının yapılması ve renk temalarının entegrasyonu.

📌 Faz 3: İleri Seviye Özellikler & Optimizasyon
Web Uyumluluğu: KeyboardAvoidingView ve buton tıklama sorunlarının (Pressable) giderilmesi.

Platform Kontrolü: Alert.alert (Mobil) ve window.confirm (Web) ayrımı.

Entegrasyonlar: Frankfurter API (Döviz), Expo Print (PDF), WhatsApp Linking.

UI Polish: Linear Gradient, özel ikonlar ve animasyonlu geçişler.

🔧 Geliştirme Notları
Web Platformu Desteği
Bu proje, React Native Web ile tarayıcı uyumlu hale getirilmiştir:

✅ TouchableOpacity yerine web dostu Pressable kullanıldı.

✅ Web ortamında çalışmayan Alert API'si yerine tarayıcı native dialogları entegre edildi.

✅ KeyboardAvoidingView bileşeni web ortamında layout sorunu yaratmaması için optimize edildi.

Veri Yapısı (AsyncStorage)
Veriler JSON formatında şu anahtarlarla saklanır:

users_db: Kayıtlı kullanıcıların listesi.

session_user: O an giriş yapmış aktif kullanıcı.

musteriler_{username}: Her kullanıcının kendine özel izole müşteri/tedarikçi veritabanı.

<div align="center">

© 2025 HesApp - Tüm Hakları Saklıdır

</div>