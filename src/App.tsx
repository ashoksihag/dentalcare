import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

// ---------- Images ----------
const HERO_IMAGE = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_113640_ccf3cf97-d447-425b-a134-d7b09fc743fc.png&w=1280&q=85';
const SECTION2_IMAGE = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_114219_414dfe80-f15c-4e25-bf52-b13721f4bd88.png&w=1280&q=85';
const SECTION3_IMG1 = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_115253_c19ab167-8dd5-48b4-967d-b9f0d9d6e8fb.png&w=1280&q=85';
const SECTION3_IMG2 = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_115237_fc519057-6e87-4abf-999a-9610b8b085b4.png&w=1280&q=85';
const SECTION3_BG = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_114355_752ba9e6-0942-4abb-9047-5d9bb16632e9.png&w=1280&q=85';

// ---------- Data ----------
const featureBars = ['Advanced Dentistry', 'High Quality Equipment', 'Friendly Staff'];

const services = [
  { name: 'Dental\nVeneers', num: '01', active: true },
  { name: 'Dental\nCrowns', num: '02', active: false },
  { name: 'Teeth\nWhitening', num: '03', active: false },
  { name: 'Dental\nImplants', num: null, active: false },
];

const mobileNavLinks = ['Home', 'Services', 'About', 'Gallery', 'Contact'];


// ---------- Hooks ----------
interface MaskPosition {
  x: number;
  y: number;
  sw: number;
  sh: number;
}

function useMaskPositions(
  sectionRef: React.RefObject<HTMLElement | null>,
  cardsRef: React.MutableRefObject<(HTMLDivElement | null)[]>,
  count: number,
): MaskPosition[] {
  const [positions, setPositions] = useState<MaskPosition[]>(
    () => Array.from({ length: count }, () => ({ x: 0, y: 0, sw: 0, sh: 0 })),
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const compute = () => {
      const rect = section.getBoundingClientRect();
      const next = cardsRef.current.map((card) => {
        if (!card) return { x: 0, y: 0, sw: rect.width, sh: rect.height };
        const r = card.getBoundingClientRect();
        return { x: r.left - rect.left, y: r.top - rect.top, sw: rect.width, sh: rect.height };
      });
      setPositions(next);
    };
    const ro = new ResizeObserver(compute);
    ro.observe(section);
    window.addEventListener('resize', compute);
    compute();
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [sectionRef, cardsRef, count]);

  return positions;
}

function useImageWidth(imageSrc: string): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setWidth(img.naturalWidth);
    };
    img.src = imageSrc;
    return () => {
      cancelled = true;
    };
  }, [imageSrc]);
  return width;
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

function useStaggeredReveal(count: number, threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);
  const firedRef = useRef(false);
  void count;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !firedRef.current) {
            firedRef.current = true;
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  const getAnimStyle = (index: number): CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms`,
  });

  return { containerRef, getAnimStyle };
}

// ---------- MaskedCard ----------
interface MaskedCardProps {
  bgImage: string;
  position: MaskPosition;
  imageWidth: number;
  focalX: number;
  className?: string;
  children?: ReactNode;
  cardRef?: (el: HTMLDivElement | null) => void;
  style?: CSSProperties;
}

function MaskedCard({ bgImage, position, imageWidth, focalX, className, children, cardRef, style }: MaskedCardProps) {
  const overflow = imageWidth > position.sw ? imageWidth - position.sw : 0;
  const focalOffset = overflow * focalX;
  const inlineStyle: CSSProperties = {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: `auto ${position.sh}px`,
    backgroundPosition: `-${position.x + focalOffset}px -${position.y}px`,
    backgroundRepeat: 'no-repeat',
    ...style,
  };
  return (
    <div ref={cardRef} className={className} style={inlineStyle}>
      {children}
    </div>
  );
}


// ---------- Splash ----------
function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let interval: number | undefined;
    let timeout2 = 0;
    let value = 0;
    interval = window.setInterval(() => {
      value += 1;
      setCount(value);
      if (value >= 100 && interval) {
        window.clearInterval(interval);
        interval = undefined;
        window.setTimeout(() => setExiting(true), 200);
        timeout2 = window.setTimeout(onComplete, 900);
      }
    }, 20);
    return () => {
      if (interval) window.clearInterval(interval);
      window.clearTimeout(timeout2);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-white flex items-end justify-start transition-opacity duration-700 ${exiting ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="text-7xl md:text-9xl font-bold tabular-nums p-6 md:p-10 leading-none text-black">
        {count}
      </div>
    </div>
  );
}

// ---------- Navbar ----------
function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-2 md:py-3 bg-white/80 backdrop-blur-md">
        <div className="flex flex-col">
          <span className="text-xl md:text-2xl font-extrabold uppercase tracking-tight leading-none text-black">Dental</span>
          <span className="text-xl md:text-2xl font-extrabold uppercase tracking-tight leading-none -mt-1.5 md:-mt-2 text-black">Health</span>
          <span className="text-[8px] md:text-[9px] font-medium leading-none mt-1.5 md:mt-2 text-black">quality healthcare</span>
        </div>

        <nav className="hidden md:block">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-black">Dental Emergency</span>
            <button className="px-6 py-3 bg-white rounded-full border border-black text-sm font-semibold text-black hover:bg-black hover:text-white transition-colors duration-200">
              Menu
            </button>
          </div>
        </nav>

        <button
          className="md:hidden w-10 h-10 flex items-center justify-center relative"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span
            className={`absolute h-0.5 w-6 bg-black rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? 'rotate-45 translate-y-0' : '-translate-y-2'}`}
          />
          <span
            className={`absolute h-0.5 w-6 bg-black rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'}`}
          />
          <span
            className={`absolute h-0.5 w-6 bg-black rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? '-rotate-45 translate-y-0' : 'translate-y-2'}`}
          />
        </button>
      </header>

      <div className={`md:hidden fixed inset-0 z-40 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex flex-col justify-center h-full px-8 gap-1">
            {mobileNavLinks.map((link, i) => (
              <a
                key={link}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-4xl font-bold text-black hover:text-neutral-500 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
                style={
                  open
                    ? { opacity: 1, transform: 'translateX(0)', transitionDelay: `${100 + i * 60}ms` }
                    : { opacity: 0, transform: 'translateX(32px)', transitionDelay: '0ms' }
                }
              >
                {link}
              </a>
            ))}
            <div
              className="mt-8 pt-8 border-t border-neutral-200 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
              style={open ? { opacity: 1, transform: 'translateX(0)', transitionDelay: '450ms' } : { opacity: 0, transform: 'translateX(32px)', transitionDelay: '0ms' }}
            >
              <p className="text-sm font-semibold text-black mb-4">Dental Emergency</p>
              <button className="w-full px-6 py-4 bg-black rounded-full text-white text-sm font-semibold hover:bg-neutral-800 transition-colors duration-200">
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


// ---------- Section 1: Hero ----------
function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imageWidth = useImageWidth(HERO_IMAGE);
  const isMobile = useIsMobile();
  const reveal = useStaggeredReveal(4);

  const positions = useMaskPositions(sectionRef, cardsRef, 4);

  const focalX = isMobile ? 0.7 : 0.8;

  const setSectionRef = (el: HTMLElement | null) => {
    sectionRef.current = el;
    reveal.containerRef.current = el;
  };

  return (
    <section
      ref={setSectionRef}
      className="h-screen w-full overflow-hidden flex flex-col pt-24 md:pt-24 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2"
    >
      {featureBars.map((bar, i) => (
        <MaskedCard
          key={bar}
          bgImage={HERO_IMAGE}
          position={positions[i]}
          imageWidth={imageWidth}
          focalX={focalX}
          cardRef={(el) => (cardsRef.current[i] = el)}
          className="w-full h-14 md:h-20 shrink-0 rounded-xl md:rounded-2xl overflow-hidden relative"
          style={reveal.getAnimStyle(i)}
        >
          <span className="flex items-center justify-center h-full text-black text-lg md:text-3xl font-bold text-center relative z-10">
            {bar}
          </span>
        </MaskedCard>
      ))}

      <MaskedCard
        bgImage={HERO_IMAGE}
        position={positions[3]}
        imageWidth={imageWidth}
        focalX={focalX}
        cardRef={(el) => (cardsRef.current[3] = el)}
        className="w-full flex-1 min-h-0 rounded-xl md:rounded-2xl overflow-hidden relative"
        style={reveal.getAnimStyle(3)}
      >
        <div className="absolute top-4 left-4 md:top-7 md:left-7 text-black text-xs md:text-sm font-semibold leading-4 md:leading-5 max-w-[200px] md:max-w-[300px] z-10">
          We wish to provide professional dental services
          <br />
          that match the current technologies
        </div>

        <div className="absolute bottom-5 left-3 md:bottom-8 md:left-4 z-10">
          <span className="block text-black text-xs md:text-sm font-semibold mb-1 md:mb-2">
            Trusted Dentist in West New York
          </span>
          <h1 className="text-black text-[clamp(3rem,11vw,11rem)] font-bold leading-[0.79] tracking-tight">
            Dental
            <br />
            Care
          </h1>
        </div>

        <div className="absolute bottom-6 right-4 md:bottom-10 md:right-8 text-white text-xs md:text-sm font-semibold z-10">
          Free Consultation
        </div>
      </MaskedCard>
    </section>
  );
}


// ---------- Section 2: Smile Gallery ----------
function SmileGallerySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imageWidth = useImageWidth(SECTION2_IMAGE);
  const isMobile = useIsMobile();
  const reveal = useStaggeredReveal(4);

  const positions = useMaskPositions(sectionRef, cardsRef, 4);

  const focalX = isMobile ? 0.65 : 0.8;

  const setSectionRef = (el: HTMLElement | null) => {
    sectionRef.current = el;
    reveal.containerRef.current = el;
  };

  return (
    <section
      ref={setSectionRef}
      className="min-h-screen md:h-screen w-full overflow-hidden flex flex-col pt-1.5 md:pt-2 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2"
    >
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 grid-rows-[auto_auto_auto_auto] md:grid-rows-[1fr_1fr_0.8fr] gap-1.5 md:gap-2">
        {/* Card 0 - Top Left */}
        <MaskedCard
          bgImage={SECTION2_IMAGE}
          position={positions[0]}
          imageWidth={imageWidth}
          focalX={focalX}
          cardRef={(el) => (cardsRef.current[0] = el)}
          className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[160px] md:min-h-0"
          style={reveal.getAnimStyle(0)}
        >
          <h2 className="absolute top-4 left-5 md:top-6 md:left-7 text-white md:text-black text-2xl md:text-3xl font-bold z-10">
            Smile Gallery
          </h2>
          <p className="absolute bottom-4 left-5 md:bottom-6 md:left-7 text-white md:text-black text-xs md:text-sm font-semibold z-10">
            Our cosmetic dental work
          </p>
        </MaskedCard>

        {/* Card 1 - Top Right, spans 2 rows on desktop */}
        <MaskedCard
          bgImage={SECTION2_IMAGE}
          position={positions[1]}
          imageWidth={imageWidth}
          focalX={focalX}
          cardRef={(el) => (cardsRef.current[1] = el)}
          className="md:row-span-2 rounded-xl md:rounded-2xl overflow-hidden relative min-h-[200px] md:min-h-0"
          style={reveal.getAnimStyle(1)}
        >
          <p className="absolute bottom-16 left-5 md:bottom-20 md:left-7 text-white text-xs md:text-sm font-semibold leading-4 md:leading-5 z-10">
            If you want a gorgeous smile,
            <br />
            call us to ask about a smile makeover.
          </p>
          <button className="absolute bottom-4 right-4 md:bottom-6 md:right-6 px-5 py-3 md:px-8 md:py-5 bg-white rounded-full text-black text-base md:text-xl font-bold z-10 hover:scale-105 transition-transform">
            Call Us
          </button>
        </MaskedCard>

        {/* Card 2 - Bottom Left */}
        <MaskedCard
          bgImage={SECTION2_IMAGE}
          position={positions[2]}
          imageWidth={imageWidth}
          focalX={focalX}
          cardRef={(el) => (cardsRef.current[2] = el)}
          className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[160px] md:min-h-0"
          style={reveal.getAnimStyle(2)}
        >
          <h2 className="absolute top-4 left-5 md:top-6 md:left-7 text-white md:text-black text-[clamp(3rem,7vw,6rem)] font-bold leading-[0.9] z-10">
            Smile
            <br />
            makeover
          </h2>
        </MaskedCard>

        {/* Card 3 - Bottom Full Width (Services) */}
        <MaskedCard
          bgImage={SECTION2_IMAGE}
          position={positions[3]}
          imageWidth={imageWidth}
          focalX={focalX}
          cardRef={(el) => (cardsRef.current[3] = el)}
          className="col-span-1 md:col-span-2 rounded-xl md:rounded-2xl overflow-hidden relative min-h-[200px] md:min-h-0"
          style={reveal.getAnimStyle(3)}
        >
          <div className="absolute inset-0 z-10 flex flex-wrap md:flex-nowrap gap-1.5 md:gap-2 p-2 md:p-3">
            {services.map((svc) => (
              <div
                key={svc.name}
                className={`flex-1 min-w-[calc(50%-4px)] md:min-w-0 rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col justify-between ${svc.active ? 'bg-white/90 backdrop-blur-md' : 'bg-white/20 backdrop-blur-xl'}`}
              >
                <h3 className={`text-xl md:text-4xl font-bold leading-[1.05] whitespace-pre-line ${svc.active ? 'text-black' : 'text-white'}`}>
                  {svc.name}
                </h3>
                {svc.num && (
                  <span
                    className={`self-end w-8 h-8 md:w-12 md:h-12 rounded-full border flex items-center justify-center text-xs md:text-sm font-semibold ${svc.active ? 'border-black text-black' : 'border-white text-white'}`}
                  >
                    {svc.num}
                  </span>
                )}
              </div>
            ))}
          </div>
        </MaskedCard>
      </div>
    </section>
  );
}


// ---------- Section 3: Implant Dentistry ----------
function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`rotate-[-45deg] ${className}`}>
      <path d="M1 7h12m0 0L8 2m5 5L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ImplantDentistrySection() {
  const reveal = useStaggeredReveal(4);

  return (
    <section
      ref={reveal.containerRef}
      className="min-h-screen md:h-screen w-full overflow-hidden flex flex-col pt-1.5 md:pt-2 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2"
    >
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-1.5 md:gap-2">
          {/* Heading card */}
          <div
            className="rounded-xl md:rounded-2xl bg-stone-50 p-5 md:p-7 flex flex-col justify-between flex-[1.2] min-h-[180px] md:min-h-0"
            style={reveal.getAnimStyle(0)}
          >
            <h2 className="text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[0.95] text-black">
              Implant
              <br />
              Dentistry
            </h2>
            <p className="text-xs md:text-sm font-semibold text-black">Restore Missing Teeth</p>
          </div>

          {/* Two image cards */}
          <div className="flex gap-1.5 md:gap-2 flex-1 min-h-[140px] md:min-h-0" style={reveal.getAnimStyle(1)}>
            <div className="flex-1 rounded-xl md:rounded-2xl overflow-hidden">
              <img src={SECTION3_IMG1} alt="Dental implant procedure" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 rounded-xl md:rounded-2xl overflow-hidden">
              <img src={SECTION3_IMG2} alt="Dental restoration" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Consultation card */}
          <div
            className="rounded-xl md:rounded-2xl bg-zinc-200 p-5 md:p-7 flex items-end justify-between flex-[0.8] min-h-[160px] md:min-h-0"
            style={reveal.getAnimStyle(2)}
          >
            <div>
              <p className="text-xs md:text-sm font-semibold text-black mb-2 md:mb-3">Consultation</p>
              <h3 className="text-xl md:text-3xl font-bold text-black leading-6 md:leading-8">
                Dental
                <br />
                Restoration
                <br />
                Services
              </h3>
            </div>
            <button className="px-5 py-3 md:px-8 md:py-5 bg-white rounded-full text-black text-base md:text-xl font-bold hover:scale-105 transition-transform">
              Book Online
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN - tall image card */}
        <div
          className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[350px] md:min-h-0"
          style={reveal.getAnimStyle(3)}
        >
          <img src={SECTION3_BG} alt="Smiling patient" className="w-full h-full object-cover" />

          <div className="absolute bottom-3 left-3 right-3 md:bottom-5 md:left-5 md:right-5 flex gap-1.5 md:gap-2">
            {/* Overlay Card 1 (white) */}
            <div className="flex-1 bg-white rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col justify-between h-36 md:h-52">
              <h4 className="text-lg md:text-2xl font-bold text-black leading-5 md:leading-7">
                The Process
                <br />
                of Installing
                <br />
                Implants
              </h4>
              <div className="self-end w-9 h-9 md:w-12 md:h-12 rounded-full border border-black flex items-center justify-center text-black">
                <ArrowIcon />
              </div>
            </div>

            {/* Overlay Card 2 (glass) */}
            <div className="flex-1 bg-white/20 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col justify-between h-36 md:h-52">
              <h4 className="text-lg md:text-2xl font-bold text-white leading-5 md:leading-7">
                Caring
                <br />
                for Dental
                <br />
                Implants
              </h4>
              <div className="self-end w-9 h-9 md:w-12 md:h-12 rounded-full border border-white flex items-center justify-center text-white">
                <ArrowIcon />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- App ----------
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashComplete = () => setShowSplash(false);

  return (
    <div className="bg-white">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <Navbar />
      <HeroSection />
      <SmileGallerySection />
      <ImplantDentistrySection />
    </div>
  );
}
