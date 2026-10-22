import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  ArrowRight, Users, Zap, MessageCircle, Phone, MapPin, Flame, UserCheck, Shield, Headphones,
  CreditCard, Send, Heart, ChevronDown, Star, Lock, Mic, Sparkles,
} from 'lucide-react';
import g1 from '../assets/g1.webp'; import g2 from '../assets/g2.webp'; import g3 from '../assets/g3.webp';
import g4 from '../assets/g4.webp'; import g5 from '../assets/g5.webp'; import g6 from '../assets/g6.webp';
import p1 from '../assets/p1.webp'; import p2 from '../assets/p2.webp'; import p3 from '../assets/p3.webp'; import p4 from '../assets/p4.webp';
import LeadModal from './LeadModal';
import { PRICE, ORIG_PRICE, INSTAGRAM_URL, INSTAGRAM_HANDLE, store } from './lib';

// Modals / game load only when opened → smaller first load
const PaymentModal = lazy(() => import('./PaymentModal'));
const ChatSheet = lazy(() => import('./ChatSheet'));
const EasterEggGame = lazy(() => import('./EasterEggGame'));

const GALLERY = [g1, g2, g3, g4, g5, g6];
const PROOF = [p1, p2, p3, p4];

const FEATURES = [
  { icon: MessageCircle, title: 'Chatting', desc: 'Chat with daily active members' },
  { icon: Phone, title: 'Video Calls', desc: 'Talk before you meet' },
  { icon: MapPin, title: 'Direct Meets', desc: 'Meet genuine women in real life' },
  { icon: Flame, title: '18+ Exclusive', desc: 'Photos, videos & more', badge: '18+' },
];
const STEPS = [
  { icon: CreditCard, title: 'Pay entry fee', desc: `One-time ₹${PRICE} via UPI` },
  { icon: Send, title: 'Join Datespot', desc: 'Get the Telegram group link' },
  { icon: Heart, title: 'Start dating', desc: 'Chat, call & meet' },
];
const TRUST = [
  { icon: UserCheck, title: 'Manual profile verification', desc: 'Every member is checked by admin before getting access.' },
  { icon: Users, title: 'Active Bangalore community', desc: '548+ members, active daily.' },
  { icon: Shield, title: 'No fake profiles policy', desc: 'Fake or spam profiles are removed instantly.' },
  { icon: Headphones, title: 'Direct admin support', desc: 'Get help from Subhash directly.' },
];
const REVIEWS = [
  { name: 'Rahul M.', area: 'Koramangala', text: 'Avn akkun pysch group bro, Loved it!!.' },
  { name: 'Vikram Shetty', area: 'Indiranagar', text: 'Finally ondhu genuine group sikthu. Admin is very responsive and the women are real. Genuinely recommend.' },
  { name: 'Karan D.', area: 'HSR Layout', text: 'Liked how professional everything is, worth every rupee.' },
  { name: 'Aditya P.', area: 'Whitefield', text: "Modlu nambokke agilla but it's 100% worth it. After voice call I got trust before meeting." },
  { name: 'Rohan Gowda', area: 'JP Nagar', text: 'Already arranged a meet within my first week. Active group, daily new faces. Super recommend bro.' },
  { name: 'Suresh Naik', area: 'Marathahalli', text: 'Met my current partner here. Very organised, thanks Subhash bro for guiding me.' },
  { name: 'Arjun K.', area: 'Jayanagar', text: 'The group is always active now more than before, add more women from Bangalore.' },
  { name: 'Dev Menon', area: 'BTM Layout', text: 'Three meets in two months. Very different from regular dating — feels safe and premium.' },
  { name: 'Sagar R.', area: 'Electronic City', text: 'Legit group bro. Admin does proper verification so you know everyone is genuine. No nonsense.' },
  { name: 'Nikhil T.', area: 'Yelahanka', text: "Joined on a friend's suggestion and I'm glad I did. Good conversations and easy meets." },
];
const FAQS = [
  { q: 'Is this genuine?', a: 'Yes. Datespot has been running since 2021 with 548+ members. Every member is manually approved by Subhash Gowda before getting access.' },
  { q: 'How do I get access?', a: `Pay ₹${PRICE} via UPI, upload the payment screenshot and you receive the Telegram group link. The whole process takes under 2 minutes.` },
  { q: 'Is it a one-time payment?', a: `Yes. Pay ₹${PRICE} once for lifetime access. No renewals and no hidden fees.` },
  { q: 'Are profiles verified?', a: 'Every profile is manually verified by the admin. Fake profiles, bots and spam accounts are removed immediately.' },
  { q: 'Is my privacy protected?', a: 'Yes. Your details are never shared with other members and screenshots of members are prohibited in the group.' },
  { q: 'Do I need to share my photo?', a: 'No. You join through Telegram, and you only share what you choose to in chat.' },
  { q: 'I have another question', a: `Message us on Instagram @${INSTAGRAM_HANDLE} and we will reply.` },
];

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-2xl md:text-3xl">{title}</h2>
      {sub && <p className="text-xs md:text-sm font-semibold text-black/60 mt-0.5">{sub}</p>}
    </div>
  );
}

// 6-hour looping countdown
const CYCLE = 6 * 3600;
function useCountdown() {
  const calc = () => CYCLE - (Math.floor(Date.now() / 1000) % CYCLE);
  const [t, setT] = useState(calc);
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, []);
  return [Math.floor(t / 3600), Math.floor((t % 3600) / 60), t % 60].map(n => String(n).padStart(2, '0'));
}
function Banner() {
  const [h, m, s] = useCountdown();
  return (
    <div className="bg-[var(--ds-ink)] text-white">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-2">
        <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest"><Zap className="w-3 h-3 text-[var(--ds-orange)]" /> Flash sale · ends in</span>
        <span className="font-display text-xs tabular-nums text-[var(--ds-orange)]" aria-label="Time left">{h}:{m}:{s}</span>
      </div>
    </div>
  );
}

function Price({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <s className="text-xs font-bold opacity-60">₹{ORIG_PRICE}</s>
      <b className="font-display text-xl">₹{PRICE}</b>
    </span>
  );
}

export default function App() {
  const [modal, setModal] = useState<null | 'lead' | 'pay' | 'chat' | 'game'>(null);
  const [sticky, setSticky] = useState(false);
  const clicks = useRef<number[]>([]);

  useEffect(() => {
    const on = () => setSticky(window.scrollY > 380);
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { document.body.style.overflow = modal ? 'hidden' : ''; }, [modal]);

  const join = () => setModal(store.get('ds_lead_submitted') === '1' ? 'pay' : 'lead');
  const close = () => setModal(null);

  // Hidden easter egg: tap the logo 5x fast
  const logoTap = () => {
    const now = Date.now();
    clicks.current = [...clicks.current.filter(t => now - t < 1800), now];
    if (clicks.current.length >= 5) { clicks.current = []; setModal('game'); }
  };

  return (
    <div className="min-h-screen pb-24">
      <Banner />

      {/* ── Hero (compact) ── */}
      <header className="relative overflow-hidden border-b-[3px] border-[var(--ds-ink)]" style={{ background: 'var(--ds-orange)' }}>
        <div className="max-w-5xl mx-auto px-4 pt-5 pb-6 md:py-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div className="text-center md:text-left">
            <button onClick={logoTap} className="select-none inline-flex items-center gap-2 mb-3" aria-label="Datespot">
              <span className="w-7 h-7 grid place-items-center rounded-lg border-2 border-[var(--ds-ink)] bg-white"><Flame className="w-4 h-4" /></span>
              <span className="font-display text-lg">Datespot</span>
            </button>
            <h1 className="font-display sticker-text uppercase leading-[0.92] text-[44px] sm:text-6xl md:text-7xl">
              Wanna<br className="hidden md:block" /> date
            </h1>
            <p className="mt-2 inline-flex items-center gap-1.5 font-display uppercase text-sm tracking-wider"><MapPin className="w-4 h-4" /> Bangalore women</p>
            <p className="mt-2 text-[13px] md:text-base font-semibold max-w-md mx-auto md:mx-0">
              Private paid Telegram group to chat, call & meet. Join 548+ members.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 md:justify-start justify-center">
              <button onClick={join} className="ds-btn w-full sm:w-auto text-base">
                Join for <s className="opacity-60 font-bold text-xs">₹{ORIG_PRICE}</s> ₹{PRICE} <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-extrabold flex items-center gap-1"><Lock className="w-3 h-3" /> One-time · Lifetime · Private</span>
            </div>
          </div>
          <div className="hidden md:block w-[190px] -rotate-3">
            <div className="ds-card overflow-hidden !rounded-[26px] aspect-[9/16]"><img src={g1} alt="Group preview" className="w-full h-full object-cover" width={560} height={1251} fetchPriority="high" /></div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4">
        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 py-5" aria-label="Community stats">
          {[['548+', 'Members'], ['467', 'Online today'], ['1000+', 'Successful joins'], ['95%', 'Positive reviews']].map(([v, l]) => (
            <div key={l} className="ds-card px-3 py-3 text-center">
              <div className="font-display text-2xl" style={{ color: 'var(--ds-orange)', WebkitTextStroke: '1px var(--ds-ink)' }}>{v}</div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider mt-0.5">{l}</div>
            </div>
          ))}
        </section>

        {/* Group preview */}
        <section className="py-4">
          <SectionTitle title="Group preview" sub="Real screenshots · swipe" />
          <div className="snap-row md:grid md:grid-cols-6 md:overflow-visible">
            {GALLERY.map((src, i) => (
              <div key={i} className="ds-card overflow-hidden !rounded-2xl w-[150px] md:w-auto aspect-[9/16]">
                <img src={src} alt={`Group preview ${i + 1}`} loading="lazy" decoding="async" width={560} height={1251} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>

        {/* What you get */}
        <section className="py-4">
          <SectionTitle title="What you get" sub="Everything inside the group" />
          <div className="grid sm:grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, title, desc, badge }) => (
              <div key={title} className="ds-card flex items-center gap-3 p-3">
                <span className="w-10 h-10 shrink-0 grid place-items-center rounded-xl border-2 border-[var(--ds-ink)]" style={{ background: 'var(--ds-orange)' }}><Icon className="w-5 h-5" /></span>
                <div className="flex-1"><div className="font-extrabold text-sm">{title}</div><div className="text-xs font-semibold text-black/60">{desc}</div></div>
                {badge && <span className="ds-chip !bg-[var(--ds-ink)] !text-white">{badge}</span>}
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-4">
          <SectionTitle title="How it works" sub="3 simple steps" />
          <ol className="grid md:grid-cols-3 gap-3">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <li key={title} className="ds-card flex items-center gap-3 p-3">
                <span className="font-display w-10 h-10 shrink-0 grid place-items-center rounded-full border-2 border-[var(--ds-ink)] text-white" style={{ background: 'var(--ds-orange)', textShadow: '1.5px 1.5px 0 #111' }}>{i + 1}</span>
                <div className="flex-1"><div className="font-extrabold text-sm">{title}</div><div className="text-xs font-semibold text-black/60">{desc}</div></div>
                <Icon className="w-5 h-5 opacity-40" />
              </li>
            ))}
          </ol>
        </section>

        {/* Why trust */}
        <section className="py-4">
          <SectionTitle title="Why trust Datespot" sub="Built to keep the group genuine" />
          <div className="grid sm:grid-cols-2 gap-3">
            {TRUST.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="ds-card flex items-start gap-3 p-3">
                <span className="w-9 h-9 shrink-0 grid place-items-center rounded-xl border-2 border-[var(--ds-ink)] bg-[var(--ds-cream)]"><Icon className="w-4 h-4" /></span>
                <div><div className="font-extrabold text-sm">{title}</div><div className="text-xs font-semibold text-black/60">{desc}</div></div>
              </div>
            ))}
          </div>
        </section>

        {/* Proof + reviews */}
        <section className="py-4">
          <SectionTitle title="Proof it works" sub="Real activity, real results · swipe" />
          <div className="snap-row md:justify-center">
            {PROOF.map((src, i) => (
              <div key={i} className="ds-card overflow-hidden !rounded-2xl w-[140px] md:w-[160px] h-[200px]">
                <img src={src} alt={`Member proof ${i + 1}`} loading="lazy" decoding="async" width={560} height={1251} className="w-full h-full object-cover object-top" />
              </div>
            ))}
          </div>
        </section>
        <section className="py-4">
          <SectionTitle title="What members say" sub="Real reviews from Bangalore" />
          <div className="snap-row">
            {REVIEWS.map(r => (
              <figure key={r.name} className="ds-card p-4 w-[78%] sm:w-[300px] m-0">
                <div className="flex gap-0.5 mb-2" aria-label="5 stars">{Array.from({ length: 5 }, (_, i) => <Star key={i} className="w-3.5 h-3.5 fill-[var(--ds-orange)] stroke-[var(--ds-ink)]" />)}</div>
                <blockquote className="m-0 text-[13px] font-semibold leading-relaxed">"{r.text}"</blockquote>
                <figcaption className="mt-3 flex items-center gap-2 text-xs">
                  <span className="w-7 h-7 grid place-items-center rounded-full border-2 border-[var(--ds-ink)] font-display text-[10px]" style={{ background: 'var(--ds-orange)' }}>{r.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</span>
                  <b>{r.name}</b><span className="ml-auto flex items-center gap-0.5 font-semibold text-black/60"><MapPin className="w-3 h-3" />{r.area}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-4">
          <SectionTitle title="Got questions?" sub="Quick answers before you join" />
          <div className="flex flex-col gap-2.5 md:max-w-3xl">
            {FAQS.map(f => (
              <details key={f.q} className="faq-item ds-card !shadow-[3px_3px_0_var(--ds-ink)]">
                <summary className="flex items-center justify-between gap-3 px-4 py-3 font-extrabold text-sm">
                  {f.q}<ChevronDown className="faq-chev w-4 h-4 shrink-0 transition-transform" />
                </summary>
                <p className="px-4 pb-3.5 text-[13px] font-semibold text-black/70 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-6">
          <div className="ds-card text-center p-6 md:p-10 !shadow-[6px_6px_0_var(--ds-ink)]" style={{ background: 'var(--ds-orange)' }}>
            <span className="ds-chip mb-3"><Sparkles className="w-3 h-3" /> Biggest discount of the year</span>
            <h2 className="font-display sticker-text text-4xl md:text-5xl uppercase">Ready to join?</h2>
            <p className="mt-3 flex items-baseline justify-center gap-2"><s className="font-bold opacity-70">₹{ORIG_PRICE}</s><b className="font-display text-5xl">₹{PRICE}</b></p>
            <p className="text-xs font-extrabold mt-1">One-time fee · Lifetime membership</p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={join} className="ds-btn text-base">Join Datespot now <ArrowRight className="w-4 h-4" /></button>
              <button onClick={() => setModal('chat')} className="ds-btn ds-btn-light"><Mic className="w-4 h-4" /> Ask Komal</button>
            </div>
            <div className="mt-5 pt-4 border-t-2 border-dashed border-[var(--ds-ink)]/40">
              <p className="text-xs font-extrabold mb-2">Questions? Reach us on Instagram</p>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="ds-btn ds-btn-light"><InstagramIcon /> @{INSTAGRAM_HANDLE}</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-4 pb-6 text-center text-xs font-bold text-black/60">
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[var(--ds-ink)] mb-2"><InstagramIcon className="w-4 h-4" /> @{INSTAGRAM_HANDLE}</a>
        <p>© 2026 Datespot Bangalore · One-time payment · Lifetime access · 18+ only</p>
      </footer>

      {/* Sticky CTA */}
      <div className={`fixed inset-x-0 bottom-0 z-40 p-3 transition-transform duration-300 ${sticky && !modal ? 'translate-y-0' : 'translate-y-full'}`} aria-hidden={!sticky}>
        <button onClick={join} tabIndex={sticky ? 0 : -1} className="ds-btn mx-auto w-full max-w-md" style={{ background: 'var(--ds-ink)' }}>
          Join Datespot <s className="opacity-50 text-xs">₹{ORIG_PRICE}</s> <span style={{ color: 'var(--ds-orange)' }}>₹{PRICE}</span> <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {modal === 'lead' && <LeadModal onClose={close} onComplete={() => setModal('pay')} />}
      <Suspense fallback={null}>
        {modal === 'pay' && <PaymentModal onClose={close} />}
        {modal === 'chat' && <ChatSheet onClose={close} onJoin={join} />}
        {modal === 'game' && <EasterEggGame onClose={close} />}
      </Suspense>
    </div>
  );
}
