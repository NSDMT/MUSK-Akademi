# Muzaffer Uğur Spor Kulübü — Yönetim Sistemi Kullanım Kılavuzu

---

## 🔐 Giriş Bilgileri

| Alan | Değer |
|------|-------|
| **Site Adresi** | https://musksporkulübü.com |
| **Admin Panel** | https://musksporkulübü.com/panel/login |
| **Admin E-posta** | admin@muzafferugur.com |
| **Admin Şifre** | Admin123! |

> ⚠️ **ÖNEMLİ:** İlk girişten sonra şifrenizi mutlaka değiştirin.  
> Bunun için şu an bir "şifre değiştir" ekranı bulunmuyor; şifrenizi değiştirmek isterseniz yazılımcınızdan yardım isteyin.

---

## 🌐 Genel Site (Ziyaretçi Tarafı)

Sitenin herkese açık kısmı şu sayfalardan oluşur:

| Sayfa | Adres | Açıklama |
|-------|-------|----------|
| Ana Sayfa | `/` | Slider, branşlar, antrenörler, sponsorlar |
| Hakkımızda | `/hakkimizda` | Kulüp hakkında bilgi |
| Branşlarımız | `/branslar` | Sunulan spor branşları ve antrenör listesi |
| Haberler | `/haberler` | Duyurular ve haberler |
| Galeri | `/galeri` | Fotoğraf galerisi |
| Sporcu Kaydı | `/kayit` | Genişletilmiş başvuru formu |
| İletişim | `/iletisim` | İletişim bilgileri, WhatsApp ve sosyal medya |

### Ana Sayfa Özellikleri

- **Fotoğraf Slider:** 6 fotoğraf 3 saniyede bir otomatik geçiş yapıyor. Noktalara tıklayarak manuel geçiş yapılabilir. Fotoğrafları değiştirmek için sunucudaki `/var/www/sporsite/public/images/homepage-slider/` klasöründeki `slide1.jpg` – `slide6.jpg` dosyalarını değiştirmeniz yeterlidir.
- **Antrenörlerimiz:** Tüm antrenörlerin adı, branşı ve rolü otomatik listeleniyor.
- **Sponsorlarımız:** Admin panelinden eklenen aktif sponsorlar otomatik görünüyor. Hiç sponsor eklenmemişse bu bölüm hiç gösterilmiyor.

---

## 👨‍💼 Admin Paneli

Admin olarak giriş yaptıktan sonra sol menüden aşağıdaki bölümlere erişebilirsiniz.

---

### 📊 Dashboard (Ana Sayfa)

Giriş yaptığınızda karşınıza çıkan özet ekranıdır.

- Toplam öğrenci sayısı
- Antrenör sayısı
- Veli sayısı
- Grup sayısı
- Haftalık ders sayısı
- **Bekleyen başvuru sayısı** (sarı renkte gösterilir, tıklayınca Başvurular sayfasına gider)

---

### 📋 Başvurular

Sitedeki "Sporcu Kaydı" formunu dolduran velilerin başvurularını buradan yönetirsiniz.

**Formda toplanan bilgiler (genişletilmiş):**

*Sporcu bilgileri:*
- Ad Soyad, TC Kimlik No, Doğum Tarihi (tam tarih)
- Boy (cm), Kilo (kg), Kan Grubu
- Okul, Ev Adresi, Branş

*Veli bilgileri:*
- Veli Ad Soyad, Anne Adı Soyadı, Baba Adı Soyadı
- Anne Mesleği, Baba Mesleği
- İletişim Telefonu, Acil Durum Telefonu, E-posta

**Filtreleme:**
- Bekleyenler / Onaylananlar / Reddedilenler / Tümü

**Başvuru Onaylama:**
1. İlgili başvurunun yanındaki **"Onayla"** butonuna tıklayın
2. Onay ekranı açılır, işlem tamamlanır
3. Sistem otomatik olarak:
   - Veliye bir kullanıcı hesabı oluşturur
   - Sporcuyu sisteme kaydeder (TC kimlik no ve doğum tarihi de aktarılır)
   - Veli hesap bilgilerini (e-posta + şifre) WhatsApp üzerinden veliye gönderir
4. Ekranda oluşturulan **e-posta ve şifre görünür** — WhatsApp gönderimi başarısız olursa bu bilgileri veliye manuel olarak iletin

**Başvuru Reddetme:**
1. **"Reddet"** butonuna tıklayın
2. İsteğe bağlı red notu yazın
3. Başvuru "Reddedildi" olarak işaretlenir

> 💡 **Not:** Onaylanan başvurudaki bilgiler (boy, kilo, okul, acil durum telefonu vb.) "Öğrenciler" sayfasındaki öğrenci kaydına otomatik aktarılmaz; gerekirse Öğrenciler sayfasından ekleyebilirsiniz.

---

### 👦 Öğrenciler

Sistemdeki tüm sporcuları görüntüler ve yönetirsiniz.

**Öğrenci Ekleme:**
- "+ Öğrenci Ekle" butonuna tıklayın
- Zorunlu alanlar: Ad, Soyad, TC Kimlik No, Doğum Tarihi, Veli Adı, Veli Telefonu
- İsteğe bağlı: Okul, Kan grubu, Dominant ayak, Adres, Grup, Veli kullanıcı hesabı bağlantısı

**Öğrenci Düzenleme:**
- İlgili öğrencinin "Düzenle" butonuna tıklayın

**Öğrenci Silme (Pasifleştirme):**
- Öğrenciler silinmez; "Pasifleştir" ile sistemden gizlenir, verileri korunur

**Veli bağlama:**
- Öğrenci düzenleme ekranında "Veli Hesabı" alanından daha önce oluşturulmuş veli kullanıcısını seçin
- Bu sayede veli, kendi panelinden sadece kendi çocuğunu görür

---

### 👤 Kullanıcılar

Admin, antrenör ve veli hesaplarını yönetirsiniz.

**Kullanıcı Rolleri:**

| Rol | Erişim |
|-----|--------|
| **Admin** | Tüm panel |
| **Antrenör** | Kendi takvimi ve yoklama |
| **Veli** | Kendi çocuğunun bilgileri, aidat ve ödeme |

**Kullanıcı Ekleme:**
- "+ Kullanıcı Ekle" butonuna tıklayın
- Ad, e-posta, şifre ve rol seçin
- **Şifre kuralı:** En az 8 karakter, bir büyük harf, bir küçük harf, bir rakam içermeli  
  Örnek: `Spor2024!`

**Kullanıcı Düzenleme:**
- Şifreyi boş bırakırsanız değişmez
- "Pasifleştir" ile hesabı geçici olarak kilitleyebilirsiniz

---

### 🏆 Gruplar

Spor branşlarına göre öğrenci gruplarını yönetirsiniz.

**Grup Ekleme:**
- Grup adı, branş ve antrenör seçin
- İsteğe bağlı: Yaş aralığı, açıklama, aylık aidat tutarı

**Öğrenci Görüntüleme:**
- Grup listesindeki "Öğrenciler" butonuna tıklayınca o gruptaki sporcular listelenir

---

### 📅 Antrenman Takvimi

Haftalık ders programını buradan oluşturursunuz.

**Ders Ekleme:**
- Grup, antrenör, gün, başlangıç saati, bitiş saati ve konum seçin
- Aynı grup için birden fazla günde ders eklenebilir

---

### 💰 Aidat Yönetimi

Aylık aidat takibi ve tahsilat işlemleri buradan yapılır.

**Aidat Oluşturma (Toplu):**
1. "Aidat Oluştur" butonuna tıklayın
2. Grup, yıl ve ay seçin
3. Tutar otomatik olarak grup aylık ücretinden gelir, değiştirilebilir
4. İlgili gruptaki tüm aktif sporcular için aidat kaydı oluşturulur

**Aidat Durumları:**

| Durum | Açıklama |
|-------|----------|
| Bekliyor | Henüz ödenmemiş |
| Ödendi | Tahsil edildi |
| Gecikmiş | Vadesi geçmiş |
| Muaf | Bu ay için muaf tutuldu |

**Nakit Tahsilat:**
- Ödeme türü "Nakit" seçildiğinde aidat durumu otomatik "Ödendi" olur, ödeme kaydı oluşturulur

**Gecikmiş Güncelleme:**
- "Gecikmiş Yap" butonu geçmiş ayların ödenmemişlerini otomatik "Gecikmiş" olarak işaretler

---

### 🏢 Sponsorlar *(Yeni)*

Ana sayfada "Sponsorlarımız" bölümünü buradan yönetirsiniz.

> 💡 Hiç aktif sponsor eklenmemişse ana sayfada bu bölüm hiç görünmüyor. En az bir aktif sponsor eklediğinizde bölüm otomatik belirir.

**Sponsor Ekleme:**
1. "+ Sponsor Ekle" butonuna tıklayın
2. Alanları doldurun:

| Alan | Açıklama |
|------|----------|
| **Sponsor Adı** | Firma veya kişi adı *(zorunlu)* |
| **Web Sitesi** | Sponsor URL'si (örn: `https://firma.com`) — tıklanabilir link olarak görünür |
| **Logo URL** | Logonun web adresi veya `/images/sponsor-logo.png` gibi sunucu yolu — form içinde önizleme görünür |
| **Açıklama** | Kısa tanıtım metni (isteğe bağlı) |
| **Görüntüleme Sırası** | Küçük sayı = daha önce gösterilir (0, 1, 2 …) |
| **Aktif** | İşaretli = ana sayfada göster, işaretsiz = gizle |

3. "Kaydet" butonuna tıklayın

**Sponsor Düzenleme:**
- "Düzenle" butonuyla tüm bilgileri güncelleyebilirsiniz

**Aktif / Pasif Geçiş:**
- Tablodaki "Aktif" / "Pasif" badge'ine tıklamak yeterlidir — formu açmadan hızlıca gizleyip gösterebilirsiniz

**Sponsor Silme:**
- "Sil" butonuyla sponsoru tamamen kaldırabilirsiniz

**Logo Ekleme — Önerilen Yöntem:**
1. Logo dosyasını (PNG veya JPEG, tercihen şeffaf arka planlı PNG) sunucuya yükleyin:
   - Klasör: `/var/www/sporsite/public/images/`
   - Örnek dosya adı: `sponsor-firma.png`
2. Logo URL alanına `/images/sponsor-firma.png` yazın

---

## 🏃 Antrenör Paneli

Antrenör olarak giriş yapıldığında tek bir ekran görünür: **Takvimim & Yoklama**

**Yoklama Alma:**
1. Tarih seçin
2. O güne ait dersleriniz listelenir
3. Derse tıklayın — öğrenci listesi açılır
4. Her öğrenci için durum seçin:
   - ✅ Katıldı
   - ❌ Gelmedi
   - ⏰ Geç Geldi
   - 📝 Mazeretli
5. "Kaydet" butonuna basın
6. "Gelmedi" işaretlenen öğrencilerin velilerine otomatik **WhatsApp bildirimi** gönderilir

---

## 👪 Veli Paneli

Veli olarak giriş yapıldığında **Çocuğum & Aidat** ekranı açılır.

**Görüntülenebilir bilgiler:**
- Çocuğun adı, grubu, branşı
- Son yoklama kayıtları (katıldı / gelmedi / geç geldi / mazeretli)
- Aidat listesi (bekleyen, gecikmiş, ödenmiş)

**Online Ödeme:**
1. Ödemek istediğiniz aidatları seçin (çoklu seçim yapılabilir)
2. "Öde" butonuna tıklayın
3. İyzico ödeme formu açılır (kart bilgileri girilir)
4. Ödeme tamamlanır, aidat durumu otomatik "Ödendi" olur

> 💡 **Not:** İyzico entegrasyonu şu an test modundadır. Gerçek ödemelerin işlenmesi için İyzico başvurusu yapılıp API bilgileri sisteme tanımlanmalıdır.

---

## 📱 WhatsApp Bildirimleri

Sistem, aşağıdaki durumlarda velilere otomatik WhatsApp mesajı gönderir:

1. **Yoklamada "Gelmedi"** işaretlenen öğrencilerin velilerine devamsızlık bildirimi
2. **Başvuru onaylandığında** veliye giriş bilgileri (e-posta + şifre)

**Kulüp WhatsApp Hattı:** +90 545 969 96 77

**Önemli Notlar:**
- WhatsApp servisi sunucuda arka planda çalışır
- Sunucu yeniden başlatılırsa WhatsApp oturumu otomatik devam eder (telefon taranmaya gerek kalmaz)
- Oturum geçersiz hale gelirse (telefon değişikliği vb.) yazılımcınıza başvurun — yeni QR kodu taratılacaktır
- WhatsApp hesabını değiştirmek istiyorsanız yazılımcınıza başvurun

---

## 💳 İyzico Ödeme Sistemi Kurulumu

Online ödeme almak için aşağıdaki adımları tamamlayın:

1. **https://merchant.iyzipay.com** adresine giderek başvuru yapın
2. Başvurunuz onaylandıktan sonra size **API Key** ve **Secret Key** verilir
3. Bu bilgileri yazılımcınıza iletin — sisteme tanımlanacak
4. Tanımlamadan sonra veliler kart ile ödeme yapabilir

---

## ❓ Sık Sorulan Sorular

**Veli şifremi unuttum, ne yapabilirim?**  
Admin paneli → Kullanıcılar → ilgili veli → Düzenle → Yeni şifre girin → Kaydet. Ardından veliye yeni şifreyi bildirin.

**Yeni antrenör nasıl eklerim?**  
Kullanıcılar → "+ Kullanıcı Ekle" → Rol: Antrenör → Kaydet. Ardından Gruplar sayfasından ilgili grubu antrenöre atayın.

**Sporcu grubunu değiştirmek istiyorum.**  
Öğrenciler → Düzenle → Grup alanını değiştirin → Kaydet.

**Yanlışlıkla öğrenci sildim.**  
Öğrenciler "pasifleştirilir", gerçekte silinmez. Yazılımcınız veritabanından geri aktif edebilir.

**Aidat tutarını nasıl değiştiririm?**  
Gruplar → Düzenle → "Aylık Aidat" alanını güncelleyin. Bu değer gelecekte oluşturulacak aidatlar için geçerlidir; geçmiş aidatlar etkilenmez.

**Ana sayfadaki sponsorlar görünmüyor, neden?**  
Admin paneli → Sponsorlar sayfasına gidin. Sponsor yoksa ekleyin; varsa "Aktif" sütununun ✅ işaretli olduğundan emin olun.

**Slider fotoğraflarını nasıl değiştiririm?**  
Sunucudaki `/var/www/sporsite/public/images/homepage-slider/` klasöründeki `slide1.jpg` – `slide6.jpg` dosyalarını yenileriyle değiştirin (aynı isimler korunmalı). Yazılımcınız bu işlemi yapabilir.

**Antrenör listesini nasıl güncellerim?**  
Bu liste kodda tanımlıdır; değişiklik için yazılımcınıza bilgi verin.

---

## 📞 Teknik Destek

Herhangi bir sorun yaşarsanız yazılımcınıza aşağıdaki bilgileri iletin:
- Sorunun oluştuğu sayfa/bölüm
- Yaptığınız işlem
- Ekran görüntüsü (varsa)

---

*Son güncelleme: Haziran 2026*


---

## 🔐 Giriş Bilgileri

| Alan | Değer |
|------|-------|
| **Site Adresi** | https://musksporkulübü.com |
| **Admin Panel** | https://musksporkulübü.com/panel/login |
| **Admin E-posta** | admin@muzafferugur.com |
| **Admin Şifre** | Admin123! |

> ⚠️ **ÖNEMLİ:** İlk girişten sonra şifrenizi mutlaka değiştirin.  
> Bunun için şu an bir "şifre değiştir" ekranı bulunmuyor; şifrenizi değiştirmek isterseniz yazılımcınızdan yardım isteyin.

---

## 🌐 Genel Site (Ziyaretçi Tarafı)

Sitenin herkese açık kısmı şu sayfalardan oluşur:

| Sayfa | Adres | Açıklama |
|-------|-------|----------|
| Ana Sayfa | `/` | Karşılama ve tanıtım |
| Hakkımızda | `/hakkimizda` | Kulüp hakkında bilgi |
| Branşlarımız | `/branslar` | Sunulan spor branşları |
| Haberler | `/haberler` | Duyurular ve haberler |
| Galeri | `/galeri` | Fotoğraf galerisi |
| Sporcu Kaydı | `/kayit` | Başvuru formu |
| İletişim | `/iletisim` | İletişim bilgileri |

---

## 👨‍💼 Admin Paneli

Admin olarak giriş yaptıktan sonra sol menüden aşağıdaki bölümlere erişebilirsiniz.

---

### 📊 Dashboard (Ana Sayfa)

Giriş yaptığınızda karşınıza çıkan özet ekranıdır.

- Toplam öğrenci sayısı
- Antrenör sayısı
- Veli sayısı
- Grup sayısı
- Haftalık ders sayısı
- **Bekleyen başvuru sayısı** (sarı renkte gösterilir, tıklayınca Başvurular sayfasına gider)

---

### 📋 Başvurular

Sitedeki "Sporcu Kaydı" formunu dolduran velilerin başvurularını buradan yönetirsiniz.

**Filtreleme:**
- Bekleyenler / Onaylananlar / Reddedilenler / Tümü

**Başvuru Onaylama:**
1. İlgili başvurunun yanındaki **"Onayla"** butonuna tıklayın
2. Onay ekranı açılır, işlem tamamlanır
3. Sistem otomatik olarak:
   - Veliye bir kullanıcı hesabı oluşturur
   - Sporcuyu sisteme kaydeder
   - Veli hesap bilgilerini (e-posta + şifre) WhatsApp üzerinden veliye gönderir
4. Ekranda oluşturulan **e-posta ve şifre görünür** — WhatsApp gönderimi başarısız olursa bu bilgileri veliye manuel olarak iletin

**Başvuru Reddetme:**
1. **"Reddet"** butonuna tıklayın
2. İsteğe bağlı red notu yazın
3. Başvuru "Reddedildi" olarak işaretlenir

> 💡 **Not:** Onaylanan başvuruda oluşturulan sporcu kaydı temel bilgilerle oluşur (TC kimlik numarası gibi eksik bilgiler "Öğrenciler" sayfasından tamamlanmalıdır).

---

### 👦 Öğrenciler

Sistemdeki tüm sporcuları görüntüler ve yönetirsiniz.

**Öğrenci Ekleme:**
- "+ Öğrenci Ekle" butonuna tıklayın
- Zorunlu alanlar: Ad, Soyad, TC Kimlik No, Doğum Tarihi, Veli Adı, Veli Telefonu
- İsteğe bağlı: Okul, Kan grubu, Dominant ayak, Adres, Grup, Veli kullanıcı hesabı bağlantısı

**Öğrenci Düzenleme:**
- İlgili öğrencinin "Düzenle" butonuna tıklayın

**Öğrenci Silme (Pasifleştirme):**
- Öğrenciler silinmez; "Pasifleştir" ile sistemden gizlenir, verileri korunur

**Veli bağlama:**
- Öğrenci düzenleme ekranında "Veli Hesabı" alanından daha önce oluşturulmuş veli kullanıcısını seçin
- Bu sayede veli, kendi panelinden sadece kendi çocuğunu görür

---

### 👤 Kullanıcılar

Admin, antrenör ve veli hesaplarını yönetirsiniz.

**Kullanıcı Rolleri:**

| Rol | Erişim |
|-----|--------|
| **Admin** | Tüm panel |
| **Antrenör** | Kendi takvimi ve yoklama |
| **Veli** | Kendi çocuğunun bilgileri, aidat ve ödeme |

**Kullanıcı Ekleme:**
- "+ Kullanıcı Ekle" butonuna tıklayın
- Ad, e-posta, şifre ve rol seçin
- **Şifre kuralı:** En az 8 karakter, bir büyük harf, bir küçük harf, bir rakam içermeli  
  Örnek: `Spor2024!`

**Kullanıcı Düzenleme:**
- Şifreyi boş bırakırsanız değişmez
- "Pasifleştir" ile hesabı geçici olarak kilitleyebilirsiniz

---

### 🏆 Gruplar

Spor branşlarına göre öğrenci gruplarını yönetirsiniz.

**Grup Ekleme:**
- Grup adı, branş ve antrenör seçin
- İsteğe bağlı: Yaş aralığı, açıklama, aylık aidat tutarı

**Öğrenci Görüntüleme:**
- Grup listesindeki "Öğrenciler" butonuna tıklayınca o gruptaki sporcular listelenir

---

### 📅 Antrenman Takvimi

Haftalık ders programını buradan oluşturursunuz.

**Ders Ekleme:**
- Grup, antrenör, gün, başlangıç saati, bitiş saati ve konum seçin
- Aynı grup için birden fazla günde ders eklenebilir

---

### 💰 Aidat Yönetimi

Aylık aidat takibi ve tahsilat işlemleri buradan yapılır.

**Aidat Oluşturma (Toplu):**
1. "Aidat Oluştur" butonuna tıklayın
2. Grup, yıl ve ay seçin
3. Tutar otomatik olarak grup aylık ücretinden gelir, değiştirilebilir
4. İlgili gruptaki tüm aktif sporcular için aidat kaydı oluşturulur

**Aidat Durumları:**

| Durum | Açıklama |
|-------|----------|
| Bekliyor | Henüz ödenmemiş |
| Ödendi | Tahsil edildi |
| Gecikmiş | Vadesi geçmiş |
| Muaf | Bu ay için muaf tutuldu |

**Nakit Tahsilat:**
- Ödeme türü "Nakit" seçildiğinde aidat durumu otomatik "Ödendi" olur, ödeme kaydı oluşturulur

**Gecikmiş Güncelleme:**
- "Gecikmiş Yap" butonu geçmiş ayların ödenmemişlerini otomatik "Gecikmiş" olarak işaretler

---

## 🏃 Antrenör Paneli

Antrenör olarak giriş yapıldığında tek bir ekran görünür: **Takvimim & Yoklama**

**Yoklama Alma:**
1. Tarih seçin
2. O güne ait dersleriniz listelenir
3. Derse tıklayın — öğrenci listesi açılır
4. Her öğrenci için durum seçin:
   - ✅ Katıldı
   - ❌ Gelmedi
   - ⏰ Geç Geldi
   - 📝 Mazeretli
5. "Kaydet" butonuna basın
6. "Gelmedi" işaretlenen öğrencilerin velilerine otomatik **WhatsApp bildirimi** gönderilir

---

## 👪 Veli Paneli

Veli olarak giriş yapıldığında **Çocuğum & Aidat** ekranı açılır.

**Görüntülenebilir bilgiler:**
- Çocuğun adı, grubu, branşı
- Son yoklama kayıtları (katıldı / gelmedi / geç geldi / mazeretli)
- Aidat listesi (bekleyen, gecikmiş, ödenmiş)

**Online Ödeme:**
1. Ödemek istediğiniz aidatları seçin (çoklu seçim yapılabilir)
2. "Öde" butonuna tıklayın
3. İyzico ödeme formu açılır (kart bilgileri girilir)
4. Ödeme tamamlanır, aidat durumu otomatik "Ödendi" olur

> 💡 **Not:** İyzico entegrasyonu şu an test modundadır. Gerçek ödemelerin işlenmesi için İyzico başvurusu yapılıp API bilgileri sisteme tanımlanmalıdır.

---

## 📱 WhatsApp Bildirimleri

Sistem, aşağıdaki durumlarda velilere otomatik WhatsApp mesajı gönderir:

1. **Yoklamada "Gelmedi"** işaretlenen öğrencilerin velilerine devamsızlık bildirimi
2. **Başvuru onaylandığında** veliye giriş bilgileri (e-posta + şifre)

**Önemli Notlar:**
- WhatsApp servisi sunucuda arka planda çalışır
- Sunucu yeniden başlatılırsa WhatsApp oturumu otomatik devam eder (telefon taranmaya gerek kalmaz)
- WhatsApp hesabını değiştirmek istiyorsanız yazılımcınıza başvurun

---

## 💳 İyzico Ödeme Sistemi Kurulumu

Online ödeme almak için aşağıdaki adımları tamamlayın:

1. **https://merchant.iyzipay.com** adresine giderek başvuru yapın
2. Başvurunuz onaylandıktan sonra size **API Key** ve **Secret Key** verilir
3. Bu bilgileri yazılımcınıza iletin — sisteme tanımlanacak
4. Tanımlamadan sonra veliler kart ile ödeme yapabilir

---

## ❓ Sık Sorulan Sorular

**Veli şifremi unuttum, ne yapabilirim?**  
Admin paneli → Kullanıcılar → ilgili veli → Düzenle → Yeni şifre girin → Kaydet. Ardından veliye yeni şifreyi bildirin.

**Yeni antrenör nasıl eklerim?**  
Kullanıcılar → "+ Kullanıcı Ekle" → Rol: Antrenör → Kaydet. Ardından Gruplar sayfasından ilgili grubu antrenöre atayın.

**Sporcu grubunu değiştirmek istiyorum.**  
Öğrenciler → Düzenle → Grup alanını değiştirin → Kaydet.

**Yanlışlıkla öğrenci sildim.**  
Öğrenciler "pasifleştirilir", gerçekte silinmez. Yazılımcınız veritabanından geri aktif edebilir.

**Aidat tutarını nasıl değiştiririm?**  
Gruplar → Düzenle → "Aylık Aidat" alanını güncelleyin. Bu değer gelecekte oluşturulacak aidatlar için geçerlidir; geçmiş aidatlar etkilenmez.

---

## 📞 Teknik Destek

Herhangi bir sorun yaşarsanız yazılımcınıza aşağıdaki bilgileri iletin:
- Sorunun oluştuğu sayfa/bölüm
- Yaptığınız işlem
- Ekran görüntüsü (varsa)

---

*Son güncelleme: Haziran 2026*
