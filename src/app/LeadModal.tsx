import { useState } from 'react';
import { X, ArrowRight, Loader2, Lock } from 'lucide-react';
import { PRICE, SHEET_URL, store } from './lib';

export default function LeadModal({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    if (!name.trim()) return setError('Please enter your name.');
    if (!/^[6-9]\d{9}$/.test(phone)) return setError('Enter a valid 10-digit Indian mobile number.');
    setLoading(true);
    try {
      const params = new URLSearchParams({ name: name.trim(), phone });
      await fetch(`${SHEET_URL}?${params}`, { mode: 'no-cors' });
    } catch { /* lead capture is best-effort; never block payment */ }
    store.set('ds_lead_submitted', '1');
    store.set('ds_lead_name', name.trim());
    store.set('ds_lead_phone', phone);
    setLoading(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60" onClick={onClose} role="dialog" aria-modal="true" aria-label="Enter your details">
      <div className="ds-card ds-pop relative w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full border-2 border-[var(--ds-ink)]">
          <X className="w-4 h-4" />
        </button>
        <h2 className="font-display text-xl mb-1">Almost there</h2>
        <p className="text-xs font-semibold text-black/60 mb-4">Just your name & number. Then pay ₹{PRICE} once.</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="text-[11px] font-extrabold uppercase tracking-wider">
            Name
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name"
              className="mt-1 w-full rounded-xl border-2 border-[var(--ds-ink)] bg-[var(--ds-cream)] px-3 py-3 text-sm font-semibold outline-none focus:bg-white" />
          </label>
          <label className="text-[11px] font-extrabold uppercase tracking-wider">
            Phone
            <div className="mt-1 flex items-center rounded-xl border-2 border-[var(--ds-ink)] bg-[var(--ds-cream)] focus-within:bg-white">
              <span className="px-3 text-sm font-extrabold border-r-2 border-[var(--ds-ink)] py-3">+91</span>
              <input value={phone} inputMode="numeric" maxLength={10} autoComplete="tel-national" placeholder="10-digit number"
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                className="flex-1 min-w-0 bg-transparent px-3 py-3 text-sm font-semibold outline-none" />
            </div>
          </label>
          {error && <p role="alert" className="text-xs font-bold text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="ds-btn mt-1" style={{ background: 'var(--ds-orange)' }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue to payment <ArrowRight className="w-4 h-4" /></>}
          </button>
          <p className="text-center text-[10px] font-bold text-black/50 flex items-center justify-center gap-1"><Lock className="w-3 h-3" /> Private, never shared</p>
        </form>
      </div>
    </div>
  );
}
