import './About.css';

const clubDesc = [
  'Karaman MUSK Spor Akademi, 2023 yılında çocuklarımızın ve gençlerimizin sporla tanışmasını, sağlıklı bireyler olarak yetişmesini ve yeteneklerini en üst seviyeye taşımasını hedefleyerek kurulmuştur.',
  'Kulübümüzde Futbol, Voleybol, Basketbol, Tekerlekli Paten, Yüzme, Tenis ve Satranç branşlarında eğitim verilmektedir. Alanında uzman, federasyon onaylı ve lisanslı antrenör kadromuzla sporcularımıza yaş ve gelişim düzeylerine uygun, bilimsel temellere dayalı antrenman programları sunuyoruz.',
  'Karaman MUSK Spor Akademi olarak hedefimiz; yalnızca başarılı sporcular yetiştirmek değil, aynı zamanda özgüvenli, disiplinli, sorumluluk sahibi, takım ruhunu benimseyen ve spor ahlakına bağlı bireyler yetiştirmektir. Sporcularımızın teknik, fiziksel, zihinsel ve sosyal gelişimlerini bütüncül bir eğitim anlayışıyla destekliyor, her çocuğun potansiyelini ortaya çıkarmayı amaçlıyoruz.',
  'Modern eğitim anlayışımız, güçlü antrenör kadromuz ve güvenli spor ortamımızla çocuklarımızın hayallerine ulaşmalarına rehberlik ediyor; onları geleceğin başarılı sporcuları ve örnek bireyleri olarak yetiştiriyoruz.',
];

const values = [
  { icon: '🏆', title: 'Başarı', desc: 'Sporcularımızı ulusal ve uluslararası arenada temsil edecek düzeye taşıyoruz.' },
  { icon: '❤️', title: 'Tutku', desc: 'Sporun bir yaşam biçimi haline gelmesi için çalışıyoruz.' },
  { icon: '🤝', title: 'Takım Ruhu', desc: 'Birlikte başarmak, ayrı başarmaktan daha değerlidir.' },
  { icon: '📚', title: 'Disiplin', desc: 'Düzenli antrenman ve disiplinli çalışma başarının temelidir.' },
];

export default function About() {
  return (
    <div className="page-wrapper">

      {/* HERO */}
      <div className="page-hero">
        <h1>Hakkımızda</h1>
        <p>Karaman'ın Spor Akademisi – 2023'ten Bugüne</p>
      </div>

      {/* KULÜP HAKKINDA */}
      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <p className="section-subtitle" style={{ textAlign: 'center' }}>Kulübümüz</p>
          <h2 className="section-title" style={{ textAlign: 'center' }}>Karaman MUSK Spor Akademi</h2>
          <div className="section-divider" />
          {clubDesc.map((p, i) => (
            <p key={i} style={{ marginBottom: 18, lineHeight: 1.85, color: '#ccc' }}>{p}</p>
          ))}
          <p style={{ fontStyle: 'italic', color: '#c9a84c', marginTop: 24, textAlign: 'center', fontSize: '1.05rem' }}>
            "Karaman'ın Çocukları" anlayışıyla çıktığımız bu yolda, sporu bir yaşam biçimi haline getirerek Karaman'da sporun gelişimine katkı sağlamaya ve geleceğin şampiyonlarını yetiştirmeye kararlılıkla devam ediyoruz.
          </p>
        </div>
      </section>

      {/* BİZ KİMİZ */}
      <section className="section">
        <div className="container about-intro">
          {/* FOTOĞRAF: kulüp/tesis görseli için public/images/about-team.jpg ekleyin */}
          <div className="about-intro__image">
            <img src="/images/kurucu.jpeg" alt="Muzaffer Uğur" className="about-intro__img" />
          </div>
          <div className="about-intro__text">
            <p className="section-subtitle" style={{ textAlign: 'left' }}>Biz Kimiz?</p>
            <h2 className="section-title" style={{ textAlign: 'left' }}>MUSK Spor Kulübü</h2>
            <div className="section-divider" style={{ margin: '10px 0 28px' }} />
            <p>
              20 Temmuz 1997 doğumlu olan Muzaffer Uğur, 2019 yılında <strong>Selçuk Üniversitesi Spor Bilimleri Fakültesi'nden</strong> mezun olmuştur. Sporun yalnızca fiziksel bir aktivite değil; disiplin, karakter, özgüven ve yaşam kültürü kazandıran önemli bir eğitim aracı olduğuna inanarak antrenörlük kariyerini bu anlayış üzerine inşa etmiştir.
            </p>
            <p>
              17 yıllık aktif lisanslı sporculuk geçmişine sahip olan Muzaffer Uğur, edindiği saha deneyimini akademik bilgisiyle birleştirerek çocukların ve gençlerin gelişimine katkı sağlamayı amaçlamaktadır. Sporcuların sadece müsabakalara değil, hayata da en iyi şekilde hazırlanması için modern antrenman yöntemlerini, bilimsel yaklaşımı ve eğitim odaklı çalışmaları esas almaktadır.
            </p>
            <p>
              <strong>UEFA C Futbol Antrenörü</strong> ve <strong>UEFA Çocuk Gelişim Antrenörü</strong> belgelerine sahip olan Muzaffer Uğur; aynı zamanda <strong>1. Kademe Hentbol Antrenörü</strong> ve <strong>1. Kademe Floor Curling Antrenörüdür.</strong> Farklı branşlardaki bilgi ve deneyimi sayesinde çocukların yaş gruplarına uygun, güvenli ve gelişim odaklı antrenman programları hazırlamaktadır.
            </p>
            <p>
              Kurucusu olduğu <strong>Muzaffer Uğur Spor Kulübü</strong> bünyesinde yüzlerce çocuğun sporla tanışmasına öncülük etmiş, onların fiziksel, zihinsel ve sosyal gelişimlerine katkı sağlamıştır. Temel hedefi; spor ahlakına sahip, özgüveni yüksek, disiplinli, sağlıklı ve başarılı bireyler yetiştirirken, yetenekli sporcuları da Türk sporuna kazandırmaktır.
            </p>
            <p>
              Mesleğini büyük bir tutkuyla sürdüren Muzaffer Uğur, kendisini sürekli geliştirmeyi ilke edinmiş; eğitimlere katılarak, güncel antrenman metotlarını takip ederek ve spor bilimindeki yenilikleri uygulamalarına yansıtarak her geçen gün daha donanımlı bir antrenör olmayı hedeflemektedir.
            </p>
            <p style={{ fontStyle: 'italic', color: '#c9a84c', marginTop: 8 }}>
              "Spora aşık, gelişime açık." anlayışıyla çıktığı bu yolda, geleceğin başarılı sporcularını ve örnek bireylerini yetiştirmek için aynı azim ve kararlılıkla çalışmalarına devam etmektedir.
            </p>
          </div>
        </div>
      </section>

      {/* VİZYON & MİSYON */}
      <section className="section vm-section">
        <div className="container">
          <h2 className="section-title">Vizyon & Misyon</h2>
          <div className="section-divider" />
          <div className="vm-grid">
            <div className="vm-card card">
              <div className="vm-card__icon">🔭</div>
              <h3>Vizyonumuz</h3>
              <p>
                Karaman'da sporun merkezi haline gelerek her yaştan gencin ilk tercihi olan,
                yetiştirdiği sporcularla hem bölgesel hem de ulusal düzeyde başarılar elde eden
                <strong> öncü bir spor akademisi olmaktır.</strong>
              </p>
              <p>
                Geniş branş yapımız ve modern eğitim anlayışımızla, Karaman'ın en büyük ve
                en güçlü spor kulübü olma yolunda kararlılıkla ilerliyoruz.
              </p>
            </div>
            <div className="vm-card card">
              <div className="vm-card__icon">🎯</div>
              <h3>Misyonumuz</h3>
              <p>
                Çocuklarımızın ve gençlerimizin fiziksel, zihinsel ve sosyal gelişimlerini
                destekleyerek onları <strong>disiplinli, özgüvenli ve ahlaklı bireyler</strong> olarak
                yetiştirmektir.
              </p>
              <p>
                Alanında uzman kadromuzla 7 farklı branşta kaliteli eğitim sunarak sporun bir
                yaşam biçimi haline gelmesini sağlıyoruz. Her bir sporcumuzu bireysel olarak
                geliştirirken, hayallerine ulaşmaları için her zaman yanlarındayız.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DEĞERLERİMİZ */}
      <section className="section values-section">
        <div className="container">
          <h2 className="section-title">Değerlerimiz</h2>
          <div className="section-divider" />
          <div className="values-grid">
            {values.map(({ icon, title, desc }) => (
              <div key={title} className="value-card card">
                <span className="value-card__icon">{icon}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KURUCU */}
      <section className="section founder-section">
        <div className="container founder-inner">
          {/* FOTOĞRAF: kurucu fotoğrafı için public/images/founder.jpg ekleyin */}
          <div className="founder-image">
            <img src="/images/kurucu.jpeg" alt="Muzaffer Uğur" className="founder-photo" />
          </div>
          <div className="founder-text">
            <span className="founder-text__tag">Kulüp Kurucusu</span>
            <h2>Muzaffer Uğur</h2>
            <p>
              Yıllarca sporda edindiği deneyim ve bilgi birikimini gençlere aktarmak amacıyla
              2023 yılında MUSK Spor Kulübü'nü kurdu. UEFA lisanslı antrenör
              olarak futbol branşında aktif görev yaparken kulübün vizyonunu şekillendiriyor.
            </p>
            <ul className="founder-text__badges">
              <li>✔ UEFA C Futbol Antrenörü</li>
              <li>✔ UEFA Çocuk Gelişim Antrenörü</li>
              <li>✔ Kulüp Kurucusu & Genel Koordinatör</li>
            </ul>
          </div>
        </div>
      </section>

    </div>
  );
}
