import { Menu, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  currentPath: string;
  bagCount: number;
  onNavigate: (path: string) => void;
  onOpenBag: () => void;
}

export function Navbar({
  currentPath,
  bagCount,
  onNavigate,
  onOpenBag,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const primaryNavLinks = [
    { path: '/menu', label: 'Menu' },
    { path: '/dining-area', label: 'Dining Area' },
    { path: '/hours', label: 'Hours' },
    { path: '/reservations', label: 'Reservations' },
    { path: '/track-order', label: 'Track Order' },
  ];

  const mobileAllLinks = [
    { path: '/', label: 'Home' },
    ...primaryNavLinks,
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact Us' },
  ];

  const isActive = (path: string) => {
    if (path === '/menu') return currentPath === '/menu' || currentPath.startsWith('/menu/');
    return currentPath === path;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E3DD] bg-[#FAFAF8]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-6 py-4">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/');
            setMobileMenuOpen(false);
          }}
          className="font-display text-2xl font-semibold tracking-tight text-[#141413] whitespace-nowrap shrink-0"
        >
          Arden &amp; Hearth
        </a>

        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-8 text-sm font-medium text-[#57554F]"
        >
          {primaryNavLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(link.path);
                }}
                aria-current={active ? 'page' : undefined}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors duration-150 underline-offset-4 decoration-[#1C3B2B] ${
                  active
                    ? 'text-[#141413] underline font-semibold'
                    : 'hover:text-[#141413] hover:underline'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenBag}
            className="inline-flex items-center gap-2 rounded-md bg-[#1C3B2B] px-4 py-2.5 text-sm font-medium text-[#FAFAF8] transition-colors duration-150 hover:bg-[#142B1F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C3B2B] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span>Order Bag</span>
            <span className="tabular-nums font-mono text-xs opacity-90">({bagCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="inline-flex md:hidden items-center justify-center rounded-md border border-[#E5E3DD] p-2.5 text-[#141413] hover:bg-[#F3F1EC] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="border-t border-[#E5E3DD] bg-[#FAFAF8] px-6 py-4 md:hidden"
        >
          <div className="grid grid-cols-2 gap-2">
            {mobileAllLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    active
                      ? 'bg-[#F3F1EC] text-[#1C3B2B] font-semibold'
                      : 'text-[#141413] hover:bg-[#F3F1EC]'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
