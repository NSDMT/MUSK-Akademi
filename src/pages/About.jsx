import './About.css';

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

      {/* BİZ KİMİZ */}
      <section className="section">
        <div className="container about-intro">
          {/* FOTOĞRAF: kulüp/tesis görseli için public/images/about-team.jpg ekleyin */}
          <div className="about-intro__image">
            <div className="why-image__placeholder">
              <span>🏟️</span>
              <p>Kulüp / Tesis Görseli</p>
              <small>about-team.jpg</small>
            </div>
          </div>
          <div className="about-intro__text">
            <p className="section-subtitle" style={{textAlign:'left'}}>Biz Kimiz?</p>
            <h2 className="section-title" style={{textAlign:'left'}}>MUSK Spor Kulübü</h2>
            <div className="section-divider" style={{margin:'10px 0 28px'}} />
            <p>
              MUSK Spor Kulübü, <strong>2023 yılından bu yana</strong> Karaman'da sporun
              gelişimine katkı sağlamak amacıyla faaliyet göstermektedir.
            </p>
            <p>
              Amacımız; çocuklarımızın ve gençlerimizin fiziksel, zihinsel ve sosyal gelişimini
              destekleyerek onları hem sporcu hem de güçlü bireyler olarak yetiştirmektir.
            </p>
            <p>
              Kulübümüz bünyesinde futbol, voleybol, basketbol, tekerlekli paten, yüzme, tenis
              ve satranç branşlarının yanı sıra BESYO ve POMEM hazırlık eğitimleri başta olmak
              üzere birçok alanda aktif olarak hizmet verilmektedir.
            </p>
            <p>
              Geniş branş yelpazesi ve güçlü eğitim kadrosuyla <strong>Karaman'ın en büyük spor
              akademilerinden biri</strong> olarak sporcularımıza kaliteli ve disiplinli bir eğitim
              sunuyoruz.
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
            <div className="why-image__placeholder" style={{height:'320px'}}>
              <span>👤</span>
              <p>Kurucu Fotoğrafı</p>
              <small>founder.jpg</small>
            </div>
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
