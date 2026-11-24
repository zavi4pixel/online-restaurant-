interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenShare?: () => void;
}

export function Footer({ onNavigate, onOpenShare }: FooterProps) {
  const exploreLinks = [
    { path: '/menu', label: 'Seasonal Dining Menu' },
    { path: '/dining-area', label: 'The Dining Area' },
    { path: '/hours', label: 'Opening & Closing Hours' },
    { path: '/reservations', label: 'Table Reservations' },
    { path: '/track-order', label: 'Live Order Tracking' },
  ];

  const bistroLinks = [
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact Us' },
  ];

  return (
    <footer className="border-t border-[#E5E3DD] bg-[#F3F1EC]">
      <div className="mx-auto max-w-[1280px] px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/');
              }}
              className="font-display text-2xl font-semibold text-[#141413]"
            >
              Arden &amp; Hearth
            </a>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#57554F]">
              418 Jackson Street, San Francisco, CA 94111. Wood-fired Pacific seafood,
              hand-folded pasta, and dry-aged cuts prepared nightly over white oak.
            </p>
            <p className="mt-3 text-xs text-[#737068] tabular-nums">
              Host Desk: (415) 555-0140 · hospitality@ardenandhearth.com
            </p>
          </div>

          <div className="md:col-span-4">
            <p className="text-xs font-semibold text-[#141413]">Explore Pages</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-[#57554F]">
              {exploreLinks.map((link) => (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(link.path);
                  }}
                  className="w-fit hover:text-[#141413]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-4">
            <p className="text-xs font-semibold text-[#141413]">The Bistro &amp; Sharing</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-[#57554F]">
              {bistroLinks.map((link) => (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(link.path);
                  }}
                  className="w-fit hover:text-[#141413]"
                >
                  {link.label}
                </a>
              ))}
              {onOpenShare && (
                <button
                  type="button"
                  onClick={onOpenShare}
                  className="mt-1 w-fit text-left font-medium text-[#1C3B2B] underline underline-offset-4 hover:text-[#142B1F] cursor-pointer"
                >
                  Open on Other Devices (Link &amp; QR)
                </button>
              )}
              <p className="pt-2 text-xs text-[#737068] tabular-nums">
                Tue–Sun · 5:00 PM – 10:30 PM (Closed Mondays)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-[#E0DDD5] pt-6 text-xs text-[#737068] sm:flex-row sm:items-center">
          <p>© 2026 Arden &amp; Hearth San Francisco. All rights reserved.</p>
          <p>Seasonal menu subject to daily coastal market availability.</p>
        </div>
      </div>
    </footer>
  );
}
