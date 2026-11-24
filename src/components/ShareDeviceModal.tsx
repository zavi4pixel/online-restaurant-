import { Check, Copy, ExternalLink, QrCode, Share2, X } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useMemo, useState } from 'react';

export type ShareTarget = 'home' | 'menu' | 'reservations' | 'order';

interface ShareDeviceModalProps {
  open: boolean;
  baseUrl: string;
  initialTarget: ShareTarget;
  orderNumber?: string;
  onClose: () => void;
}

export function ShareDeviceModal({
  open,
  baseUrl,
  initialTarget,
  orderNumber,
  onClose,
}: ShareDeviceModalProps) {
  const [target, setTarget] = useState<ShareTarget>(initialTarget);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTarget(initialTarget);
    setCopied(false);
  }, [initialTarget, open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const shareUrl = useMemo(() => {
    const cleanBase = baseUrl.replace(/\/+$/, '');
    switch (target) {
      case 'menu':
        return `${cleanBase}/menu`;
      case 'reservations':
        return `${cleanBase}/reservations`;
      case 'order':
        return orderNumber
          ? `${cleanBase}/track-order?order=${encodeURIComponent(orderNumber)}`
          : `${cleanBase}/track-order`;
      default:
        return `${cleanBase}/`;
    }
  }, [baseUrl, target, orderNumber]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    QRCode.toDataURL(shareUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: '#1C3B2B',
        light: '#FAFAF8',
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });
    return () => {
      active = false;
    };
  }, [open, shareUrl]);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard API unavailable in restricted context
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator.share !== 'function') return;
    try {
      await navigator.share({
        title: 'Arden & Hearth — Wood-Fired Coastal Bistro',
        text:
          target === 'order' && orderNumber
            ? `Track order ${orderNumber} at Arden & Hearth`
            : 'Explore our seasonal menu, reserve a table, or order online.',
        url: shareUrl,
      });
    } catch {
      // User dismissed share sheet
    }
  };

  const targets: { id: ShareTarget; label: string }[] = [
    { id: 'home', label: 'Full Site' },
    { id: 'menu', label: 'Menu' },
    { id: 'reservations', label: 'Reservations' },
    { id: 'order', label: orderNumber ? `Order ${orderNumber}` : 'Track Order' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-device-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-lg border border-[#E5E3DD] bg-[#FAFAF8] p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E3DD] pb-4">
          <div>
            <p className="text-xs font-medium text-[#57554F]">
              Cross-Device Link &amp; QR Code
            </p>
            <h3
              id="share-device-title"
              className="mt-1 font-display text-2xl font-semibold text-[#141413]"
            >
              Open on Another Device
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="rounded-md p-1.5 text-[#57554F] hover:bg-[#EAE7DF] hover:text-[#141413] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-1 rounded-lg bg-[#EAE7DF] p-1">
          {targets.map((item) => {
            const active = target === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTarget(item.id);
                  setCopied(false);
                }}
                className={`truncate rounded-md px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-white text-[#141413] shadow-xs'
                    : 'text-[#57554F] hover:text-[#141413]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col items-center rounded-lg border border-[#E5E3DD] bg-white p-5">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR code to open ${shareUrl}`}
              className="h-48 w-48 rounded border border-[#EAE7DF]"
            />
          ) : (
            <div className="flex h-48 w-48 items-center justify-center rounded border border-[#EAE7DF] bg-[#F3F1EC] text-[#57554F]">
              <QrCode className="h-10 w-10" />
            </div>
          )}
          <p className="mt-3 text-center text-xs text-[#57554F]">
            Scan with a phone or tablet camera to open directly on that device.
          </p>
        </div>

        <div className="mt-4">
          <label htmlFor="share-url-field" className="sr-only">
            Shareable Website URL
          </label>
          <div className="flex gap-2">
            <input
              id="share-url-field"
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-md border border-[#D4D1C8] bg-white px-3 py-2 font-mono text-xs text-[#141413] focus:border-[#1C3B2B] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#1C3B2B] px-3.5 py-2 text-xs font-medium text-[#FAFAF8] hover:bg-[#142B1F] cursor-pointer whitespace-nowrap shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E5E3DD] pt-4 text-xs">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-[#1C3B2B] hover:underline underline-offset-4"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Open in New Tab</span>
          </a>

          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex items-center gap-1.5 font-medium text-[#141413] hover:text-[#1C3B2B] cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Share Sheet</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
