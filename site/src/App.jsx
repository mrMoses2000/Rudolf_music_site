import React from 'react';

const App = () => {
  return (
    <div className="min-h-screen bg-midnight text-cloud font-inter">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center font-outfit font-bold text-midnight">
            CMS
          </div>
          <span className="font-outfit text-xl font-bold tracking-tight hidden sm:block">
            Musikschule CMS Bielefeld
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a href="tel:+495213367416" className="text-gold font-bold hover:text-white transition-colors">
            +49 (0) 521 3367416
          </a>
          <button className="bg-gold text-midnight px-6 py-2 rounded-full font-bold hover:bg-white hover:scale-105 transition-all">
            Anmelden
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/music_school_hero_1766743329644.png"
            alt="Musikschule"
            className="w-full h-full object-cover opacity-40 scale-105 animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-midnight/10 via-midnight/60 to-midnight"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h2 className="text-gold font-outfit uppercase tracking-[0.3em] mb-4 text-sm md:text-base animate-fade-in">
            "Lobe den Herrn meine Seele..."
          </h2>
          <h1 className="text-5xl md:text-7xl font-outfit font-bold mb-8 leading-tight animate-slide-up">
            Dein Weg zur <span className="text-gold">Musik</span> beginnt hier
          </h1>
          <p className="text-lg md:text-xl text-cloud/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Christliche Musikschule Bielefeld. Qualifizierter Unterricht für alle Altersgruppen in einer inspirierenden Atmosphäre.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gold text-midnight px-10 py-4 rounded-full font-bold text-lg hover:bg-white transition-all shadow-xl shadow-gold/20">
              Unser Angebot
            </button>
            <button className="glass px-10 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all border-white/20">
              Über uns
            </button>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-24 px-6 md:px-12 bg-midnight shadow-[0_-50px_100px_rgba(0,0,0,0.5)]">
        <div className="max-w-77xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h3 className="text-gold font-outfit uppercase tracking-wider mb-2">Aktuelles</h3>
              <h2 className="text-4xl md:text-5xl font-outfit font-bold">Anstehende Konzerte</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-gold p-8 rounded-3xl relative overflow-hidden group">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <div className="text-4xl font-outfit font-bold text-gold">09</div>
                  <div className="text-cloud/60 uppercase tracking-widest text-sm">Juli 2025</div>
                </div>
                <div className="bg-gold/20 px-4 py-1 rounded-full text-gold text-xs font-bold uppercase tracking-wider">
                  Konzert
                </div>
              </div>
              <h4 className="text-2xl font-bold mb-4">JeKits-Abschlusskonzert</h4>
              <p className="text-cloud/70 mb-8">
                Am 09.07.2025 um 17.00 Uhr in der Sporthalle der Georg-Müller-Grundschule. Wir laden dazu alle herzlich ein!
              </p>
              <div className="flex items-center gap-2 text-gold font-bold cursor-pointer group-hover:gap-4 transition-all">
                Mehr erfahren <span>→</span>
              </div>
            </div>

            <div className="glass p-8 rounded-3xl border-white/10 opacity-60">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <div className="text-4xl font-outfit font-bold text-white/40">--</div>
                  <div className="text-cloud/40 uppercase tracking-widest text-sm">Folgt Kürze</div>
                </div>
              </div>
              <h4 className="text-2xl font-bold mb-4 text-white/40">Weitere Termine folgen</h4>
              <p className="text-cloud/40 mb-8">
                Wir veranstalten regelmäßig Vorspielabende и Konzerte. Bleiben Sie auf dem Laufenden!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 opacity-50 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm">
            © 2014-2025 Christliche Musikschule Bielefeld e. V.
          </div>
          <div className="flex gap-8 text-sm lowercase tracking-widest">
            <a href="#" className="hover:text-gold transition-colors">Impressum</a>
            <a href="#" className="hover:text-gold transition-colors">Datenschutz</a>
            <a href="#" className="hover:text-gold transition-colors">Agb</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
