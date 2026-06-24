// Branches data – edit here to update the site
export const branches = [
  {
    id: 'futbol',
    icon: '⚽',
    name: 'Futbol',
    emoji: '⚽',
    ageRange: '5-15 yaş',
    image: '/images/branch-futbol.jpg', // FOTOĞRAF: futbol branş görseli
    description: `5-15 yaş arası çocuklarımıza profesyonel futbol eğitimi sunuyoruz.
Yaş gruplarına uygun, çocuk gelişimini destekleyen antrenman programlarımızla; fiziksel, zihinsel ve sosyal gelişimi ön planda tutuyoruz.

Erken yaşta disiplin, özgüven, takım ruhu ve sporcu kimliği kazandırmayı hedefliyoruz.

Akademimizde yetişen sporcularımız, U-7'den itibaren U-18 ve A Takım seviyesine kadar gelişim sürecine dahil olmakta; resmi müsabakalarda tüm kategorilerde kulübümüzü başarıyla temsil etmektedir.`,
    highlight: '🏆 Geleceğin futbolcularını bugünden yetiştiriyoruz!',
    trainers: [
      { name: 'Muzaffer Uğur', role: 'UEFA C Futbol Antrenörü / UEFA Çocuk Gelişim Antrenörü', photo: '/images/trainer-muzaffer.jpg' },
      { name: 'Mümin Taş', role: 'UEFA C Futbol Antrenörü', photo: '' },
      { name: 'Gökhan Turan', role: 'Futbol Antrenörü', photo: '' },
      { name: 'Berkant Özyer', role: 'Yardımcı Antrenör', photo: '' },
      { name: 'Selimhan Kaya', role: 'Yardımcı Antrenör', photo: '' },
    ],
  },
  {
    id: 'voleybol',
    icon: '🏐',
    name: 'Voleybol',
    ageRange: '5-16 yaş',
    image: '/images/branch-voleybol.jpg', // FOTOĞRAF: voleybol branş görseli
    description: `5-16 yaş arası çocuklarımıza profesyonel voleybol eğitimi sunuyoruz.
Yaş gruplarına uygun, çocuk gelişimini destekleyen antrenman programlarımızla; fiziksel, zihinsel ve sosyal gelişimi ön planda tutuyoruz.

Erken yaşta disiplin, özgüven, takım ruhu ve sporcu kimliği kazandırmayı hedefliyoruz.
Geleceğin sporcularını yetiştirirken, çocuklarımızın mutlu, sağlıklı ve güçlü bireyler olarak yetişmesine katkı sağlıyoruz.`,
    trainers: [
      { name: 'Tuğba Uğur', role: '3. Kademe Kıdemli Voleybol Antrenörü', photo: '/images/trainer-tugba.jpg' },
      { name: 'Fatma Ceren Yılmaz', role: 'Voleybol Antrenörü', photo: '' },
      { name: 'Şeval Akurt', role: 'Voleybol Antrenörü', photo: '' },
      { name: 'Nipel Uluca', role: 'Voleybol Antrenörü', photo: '' },
      { name: 'İlayda Bulut', role: 'Yardımcı Antrenör', photo: '' },
      { name: 'Ayşegül Yolu', role: 'Yardımcı Antrenör', photo: '' },
    ],
  },
  {
    id: 'basketbol',
    icon: '🏀',
    name: 'Basketbol',
    ageRange: '5-16 yaş',
    image: '/images/branch-basketbol.jpg', // FOTOĞRAF: basketbol branş görseli
    description: `5-16 yaş arası sporcularımıza profesyonel basketbol eğitimi sunuyoruz.
Yaş gruplarına uygun antrenman programlarımızla; teknik gelişim, fiziksel dayanıklılık, disiplin ve takım ruhunu ön planda tutuyoruz.

Erken yaşta özgüvenli, mücadeleci ve sporcu kimliğine sahip bireyler yetiştirmeyi hedefliyoruz.`,
    trainers: [
      { name: 'Mehmet Dinçer', role: '3. Kademe Kıdemli Basketbol Antrenörü', photo: '' },
      { name: 'Fatma Gülten Özdil', role: '2. Kademe Basketbol Antrenörü', photo: '' },
    ],
  },
  {
    id: 'paten',
    icon: '🛼',
    name: 'Tekerlekli Paten',
    ageRange: 'Her yaş',
    image: '/images/branch-paten.jpg', // FOTOĞRAF: paten branş görseli
    description: `Sporcularımıza profesyonel tekerlekli paten eğitimi sunuyoruz.
Yaş gruplarına uygun antrenman programlarımızla; denge, koordinasyon, teknik gelişim, fiziksel dayanıklılık, disiplin ve özgüveni ön planda tutuyoruz.

Erken yaşta cesur, mücadeleci, özgüvenli ve sporcu kimliğine sahip bireyler yetiştirmeyi hedefliyoruz.`,
    trainers: [
      { name: 'Tuğba Uğur', role: '2. Kademe Tekerlekli Paten Antrenörü', photo: '/images/trainer-tugba.jpg' },
    ],
  },
  {
    id: 'yuzme',
    icon: '🏊',
    name: 'Yüzme',
    ageRange: 'Her yaş',
    image: '/images/branch-yuzme.jpg', // FOTOĞRAF: yüzme branş görseli
    description: `Sporcularımıza profesyonel yüzme eğitimi sunuyoruz.
Yaş gruplarına uygun antrenman programlarımızla; teknik gelişim, fiziksel dayanıklılık, su güvenliği, disiplin ve özgüveni ön planda tutuyoruz.

Her yaşta güvenli ve profesyonel yüzme eğitimi alabilirsiniz.`,
    trainers: [],
  },
  {
    id: 'tenis',
    icon: '🎾',
    name: 'Tenis',
    ageRange: 'Her yaş',
    image: '/images/branch-tenis.jpg', // FOTOĞRAF: tenis branş görseli
    description: `Sporcularımıza profesyonel tenis eğitimi sunuyoruz.
Yaş gruplarına uygun antrenman programlarımızla; denge, koordinasyon, teknik gelişim, fiziksel dayanıklılık, disiplin ve özgüveni ön planda tutuyoruz.

Erken yaşta cesur, mücadeleci, özgüvenli ve sporcu kimliğine sahip bireyler yetiştirmeyi hedefliyoruz.`,
    trainers: [
      { name: 'Musa Çimen', role: '3. Kademe Kıdemli Paten Antrenörü', photo: '' },
      { name: 'Ferhat Alpkaya', role: 'Yardımcı Antrenör', photo: '' },
    ],
  },
  {
    id: 'satranc',
    icon: '♟️',
    name: 'Satranç',
    ageRange: 'Her yaş',
    image: '/images/branch-satranc.jpg', // FOTOĞRAF: satranç branş görseli
    description: `Sporcularımıza profesyonel satranç eğitimi sunuyoruz.
Yaş gruplarına uygun eğitim programlarımızla; stratejik düşünme, dikkat gelişimi, problem çözme becerisi, disiplin ve özgüveni ön planda tutuyoruz.

Erken yaşta analitik düşünen, sabırlı, özgüvenli ve başarılı bireyler yetiştirmeyi hedefliyoruz.`,
    trainers: [
      { name: 'Beyza Ünüvar', role: '2. Kademe Satranç Antrenörü', photo: '' },
    ],
  },
];
