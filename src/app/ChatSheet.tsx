import { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, ArrowRight } from 'lucide-react';
import komal from '../assets/komal.webp';
import faqBangalore from '../assets/faq-bangalore.mp3';
import faqJoin from '../assets/faq-join.mp3';
import { PRICE } from './lib';

const QUESTIONS: { q: string; audio?: string }[] = [
  { q: 'Is this genuine?' }, { q: 'How much is entry fee?' }, { q: 'Refunds available?' },
  { q: 'Genuine Bangalore girls?', audio: faqBangalore }, { q: 'How to join?', audio: faqJoin },
];

function Voice({ src }: { src?: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    const a = ref.current; if (!a) return;
    if (playing) { a.pause(); setPlaying(false); } else { a.play().then(() => setPlaying(true)).catch(() => setPlaying(false)); }
  };
  return (
    <div className="flex items-center gap-2.5 min-w-[150px]">
      <audio ref={ref} src={src} preload="none" onEnded={() => setPlaying(false)} />
      <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play voice reply'} className="w-8 h-8 rounded-full border-2 border-[var(--ds-ink)] grid place-items-center" style={{ background: 'var(--ds-orange)' }}>
        {playing ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
      </button>
      <div className="flex items-end gap-0.5 h-4" aria-hidden>
        {Array.from({ length: 16 }, (_, i) => <span key={i} className="w-[3px] rounded-full bg-[var(--ds-ink)]" style={{ height: `${i % 3 === 0 ? 100 : i % 2 ? 45 : 70}%` }} />)}
      </div>
    </div>
  );
}

type Msg = { id: number; from: 'bot' | 'user'; text?: string; audio?: string | null; join?: boolean };

export default function ChatSheet({ onClose, onJoin }: { onClose: () => void; onJoin: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, from: 'bot', text: "Hi! I'm Komal. Tap a question to hear my answer." }]);
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  const ask = (q: string, audio?: string) => {
    const id = Date.now();
    setMsgs(m => [...m, { id, from: 'user', text: q }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { id: id + 1, from: 'bot', audio: audio ?? null, join: q === 'How to join?' }]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60" onClick={onClose} role="dialog" aria-modal="true" aria-label="Chat with Komal">
      <div className="ds-card ds-pop w-full max-w-md h-[80vh] flex flex-col overflow-hidden !rounded-b-none" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-3 border-b-[2.5px] border-[var(--ds-ink)]" style={{ background: 'var(--ds-orange)' }}>
          <img src={komal} alt="Komal" width={40} height={40} className="w-10 h-10 rounded-full object-cover border-2 border-[var(--ds-ink)]" />
          <div className="flex-1">
            <div className="font-display text-sm text-white" style={{ textShadow: '2px 2px 0 #111' }}>Komal</div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider">Admin · Online</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 grid place-items-center rounded-full border-2 border-[var(--ds-ink)] bg-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[var(--ds-cream)]">
          {msgs.map(m => (
            <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%] rounded-2xl border-2 border-[var(--ds-ink)] px-3 py-2 text-xs font-semibold"
                style={{ background: m.from === 'user' ? 'var(--ds-ink)' : '#fff', color: m.from === 'user' ? '#fff' : 'var(--ds-ink)' }}>
                {m.text && <p>{m.text}</p>}
                {m.audio !== undefined && (m.audio ? <Voice src={m.audio} /> : <p>Please message us on Instagram for this one.</p>)}
                {m.join && <button onClick={() => { onClose(); onJoin(); }} className="ds-btn mt-2 text-xs py-2 px-3 w-full" style={{ background: 'var(--ds-orange)' }}>Join for ₹{PRICE} <ArrowRight className="w-3.5 h-3.5" /></button>}
              </div>
            </div>
          ))}
          {typing && <div className="text-xs font-bold text-black/50 px-1">Komal is typing…</div>}
          <div ref={end} />
        </div>

        <div className="p-3 border-t-[2.5px] border-[var(--ds-ink)] bg-white">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-center mb-2">Tap to ask</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {QUESTIONS.map(({ q, audio }) => <button key={q} onClick={() => ask(q, audio)} className="ds-chip hover:bg-[var(--ds-cream)]">{q}</button>)}
          </div>
        </div>
      </div>
    </div>
  );
}
