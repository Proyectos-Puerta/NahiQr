const Battery = () => {
  return (
    <div className="flex flex-col items-center" role="img" aria-label="Cargando">
      {/* Terminal cap */}
      <div className="h-3 w-10 rounded-t-sm bg-brand-light" />

      {/* Body outline */}
      <div className="relative h-48 w-28 rounded-xl border-4 border-brand-light p-1.5">
        <div className="relative h-full w-full overflow-hidden rounded-md">
          <div className="absolute inset-0 origin-bottom animate-battery-fill bg-brand-light" />
        </div>

        {/* Lightning bolt: yellow with a dark edge so it reads on both the empty and filled states */}
        <svg
          className="absolute inset-0 m-auto h-16 w-16"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"
            className="fill-brand-yellow stroke-brand-dark"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

const CensoredDate = () => {
  return (
    <div className="relative mt-4 px-4 py-2">
      {/* Placeholder "date" peeking out under the paint; the real date is never in the DOM */}
      <span aria-hidden="true" className="select-none font-mono text-4xl tracking-widest text-brand-light/40">
        XX · XX · XX
      </span>
      <span className="sr-only">Fecha por revelar</span>

      {/* Brush stroke painted over the date, overflowing its box like a quick spray/roller pass */}
      <div className="pointer-events-none absolute -inset-x-8 -bottom-8 -top-2 -rotate-3" aria-hidden="true">
        <svg className="h-full w-full" viewBox="0 0 300 100" preserveAspectRatio="none">
          <defs>
            <filter id="rough-paint">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="18" />
              <feDisplacementMap in="SourceGraphic" scale="6" />
            </filter>
          </defs>

          <g className="fill-brand-yellow" filter="url(#rough-paint)">
            {/* Main stroke: wavy top/bottom edges, ragged bristle ends */}
            <path d="M8 30C20 18 60 14 100 16s80-6 130-2l25-2 7 5 18-2-8 7 20 2-14 6 18 6-20 4 12 8-20 2 6 8-24-2c-40 6-80 2-120 6s-80-2-110 0l-8-6-8-4 10-6-12-6 10-6z" />
            {/* Dry-brush streaks trailing off the right end */}
            <path className="opacity-70" d="M240 20c20-1 40 0 58 2l-1 3c-18-1-38-1-57-2zM236 44c22 0 44 2 62 5l-1 3c-20-2-40-4-61-4z" />
            {/* Drips running down from the bottom edge */}
            <path d="M118 58c3 0 5 0 6 1 1 9 0 17 2 24 1 4-5 5-6 1-2-8 0-17-2-26zM196 56c3 0 4 1 5 1 0 6 0 10 1 14 1 3-4 4-5 1-1-5 0-10-1-16z" />
            {/* Splatter */}
            <circle cx="24" cy="76" r="3" />
            <circle cx="40" cy="84" r="1.5" />
            <circle cx="284" cy="66" r="2.5" />
            <circle cx="160" cy="8" r="2" />
            <circle cx="268" cy="82" r="1.5" />
            <circle cx="78" cy="74" r="2" />
          </g>
        </svg>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <main className="flex h-screen w-full flex-col items-center overflow-hidden bg-brand-dark bg-teaser-fade px-6 pb-6 pt-16 text-brand-light">
      <h1 className="animate-pulse-slow font-mono text-3xl tracking-widest">CARGANDO MUESTRA...</h1>

      <div className="flex w-full flex-1 items-center justify-center">
        <Battery />
      </div>

      <section className="flex flex-col items-center">
        <p className="font-mono text-3xl tracking-widest">AGENDÁ LA FECHA</p>
        <CensoredDate />
      </section>

      <footer className="mt-auto pt-10">
        <span className="footer-logo font-marker text-4xl">PUERTA 18</span>
      </footer>
    </main>
  );
};

export default App;
