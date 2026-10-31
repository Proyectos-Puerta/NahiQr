const App = () => {
  return (
    <main className="flex h-screen w-full flex-col items-center overflow-hidden bg-brand-dark bg-teaser-fade px-6 pb-6 pt-16 text-brand-light">
      <h1 className="animate-pulse-slow font-mono text-3xl tracking-widest">CARGANDO MUESTRA...</h1>

      {/* Center gap: battery graphic goes here (Stage 3) */}
      <div className="flex w-full flex-1 items-center justify-center" aria-hidden="true" />

      <section className="flex flex-col items-center">
        <p className="font-mono text-3xl tracking-widest">AGENDÁ LA FECHA</p>
        {/* Censored date + yellow brush stroke goes here */}
      </section>

      <footer className="mt-auto pt-10">
        <span className="footer-logo font-marker text-4xl">PUERTA 18</span>
      </footer>
    </main>
  );
};

export default App;
