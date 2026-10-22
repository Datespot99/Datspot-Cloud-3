import { useState } from 'react';
import { X, Upload, Copy, ExternalLink, CheckCircle, Loader2, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PRICE, ORIG_PRICE, SHEET_URL, TELEGRAM_URL, UPI_ID, store } from './lib';

type UploadState = 'idle' | 'verifying' | 'success';
const upiUrl = `upi://pay?pa=${UPI_ID}&pn=Datespot&am=${PRICE}&cu=INR`;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 900 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.75).split(',')[1]);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
    img.src = url;
  });
}

export default function PaymentModal({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<UploadState>('idle');
  const [tab, setTab] = useState<'qr' | 'upi'>('qr');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const copy = async () => {
    try { await navigator.clipboard.writeText(UPI_ID); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please upload an image screenshot.'); return; }
    setError(''); setState('verifying');
    try {
      const image = await compressImage(file);
      await fetch(SHEET_URL, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'screenshot', name: store.get('ds_lead_name') ?? '', phone: store.get('ds_lead_phone') ?? '',
          mimeType: 'image/jpeg', fileName: `payment_${Date.now()}.jpg`, image }),
      });
    } catch { /* opaque no-cors response; continue */ }
    setTimeout(async () => {
      setState('success');
      try { const { default: confetti } = await import('canvas-confetti'); confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, colors: ['#FF6A1F', '#111111', '#ffffff'] }); } catch { /* ignore */ }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60" onClick={state === 'idle' ? onClose : undefined} role="dialog" aria-modal="true" aria-label="Payment">
      <div className="ds-card ds-pop relative w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b-[2.5px] border-[var(--ds-ink)]" style={{ background: 'var(--ds-orange)' }}>
          <div>
            <div className="font-display text-lg leading-none text-white" style={{ textShadow: '2px 2px 0 #111' }}>Join Datespot</div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider mt-1">Lifetime access · Telegram</div>
          </div>
          <div className="text-right leading-none">
            <div className="text-xs line-through font-bold opacity-70">₹{ORIG_PRICE}</div>
            <div className="font-display text-2xl">₹{PRICE}</div>
          </div>
          {state === 'idle' && (
            <button onClick={onClose} aria-label="Close" className="w-8 h-8 shrink-0 grid place-items-center rounded-full border-2 border-[var(--ds-ink)] bg-white"><X className="w-4 h-4" /></button>
          )}
        </div>

        <div className="p-4">
          {state === 'idle' && (
            <>
              <ol className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider mb-3">
                <li>1 Pay</li><li aria-hidden>→</li><li>2 Upload</li><li aria-hidden>→</li><li>3 Get link</li>
              </ol>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {(['qr', 'upi'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} className="rounded-xl border-2 border-[var(--ds-ink)] py-2 text-xs font-extrabold"
                    style={{ background: tab === t ? 'var(--ds-ink)' : '#fff', color: tab === t ? '#fff' : 'var(--ds-ink)' }}>
                    {t === 'qr' ? 'Scan QR' : 'UPI ID'}
                  </button>
                ))}
              </div>

              {tab === 'qr' ? (
                <div className="text-center">
                  <div className="inline-block rounded-xl border-2 border-[var(--ds-ink)] p-3 bg-white"><QRCodeSVG value={upiUrl} size={148} level="H" /></div>
                  <p className="text-[11px] font-semibold text-black/60 mt-2 mb-2">Scan with any UPI app</p>
                  <a href={upiUrl} className="md:hidden ds-btn ds-btn-light w-full text-xs py-2.5"><ExternalLink className="w-3.5 h-3.5" /> On mobile? Pay in your UPI app</a>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-[var(--ds-ink)] bg-[var(--ds-cream)] p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider mb-1">UPI ID</p>
                  <p className="font-mono text-sm font-bold break-all mb-3">{UPI_ID}</p>
                  <div className="flex gap-2">
                    <button onClick={copy} className="ds-btn ds-btn-light flex-1 text-xs py-2.5">{copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}</button>
                    <a href={upiUrl} className="ds-btn flex-1 text-xs py-2.5"><ExternalLink className="w-3.5 h-3.5" /> Pay</a>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t-2 border-dashed border-black/25">
                <p className="text-center text-[11px] font-semibold text-black/60 mb-2">After paying, upload the screenshot</p>
                <input type="file" id="ss-upload" className="sr-only" accept="image/*" onChange={onFile} />
                <label htmlFor="ss-upload" className="ds-btn w-full" style={{ background: 'var(--ds-orange)' }}><Upload className="w-4 h-4" /> Upload screenshot</label>
                {error && <p role="alert" className="text-xs font-bold text-red-600 mt-2 text-center">{error}</p>}
              </div>
            </>
          )}

          {state === 'verifying' && (
            <div className="text-center py-8" role="status">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" style={{ color: 'var(--ds-orange)' }} />
              <p className="font-display text-lg">Verifying payment</p>
              <p className="text-xs font-semibold text-black/60">Please wait a moment...</p>
            </div>
          )}

          {state === 'success' && (
            <div className="text-center py-6">
              <CheckCircle className="w-14 h-14 mx-auto mb-3" style={{ color: 'var(--ds-orange)' }} />
              <p className="font-display text-xl mb-1">Payment verified!</p>
              <p className="text-xs font-semibold text-black/60 mb-4">Tap below to join the Datespot group.</p>
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="ds-btn w-full" style={{ background: 'var(--ds-orange)' }}>Open Telegram group <ExternalLink className="w-4 h-4" /></a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
