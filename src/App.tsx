import { CheckCircle2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AboutPage } from './components/AboutPage.tsx';
import { CheckoutDrawer } from './components/CheckoutDrawer.tsx';
import { ContactPage } from './components/ContactPage.tsx';
import { DiningAreaPage } from './components/DiningAreaPage.tsx';
import { DishCustomizeModal } from './components/DishCustomizeModal.tsx';
import { DishDetailPage } from './components/DishDetailPage.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './components/HomePage.tsx';
import { HoursPage } from './components/HoursPage.tsx';
import { MenuSection } from './components/MenuSection.tsx';
import { Navbar } from './components/Navbar.tsx';
import { OrderTrackingSection } from './components/OrderTrackingSection.tsx';
import { ReservationSection } from './components/ReservationSection.tsx';
import { ShareDeviceModal, type ShareTarget } from './components/ShareDeviceModal.tsx';
import { MENU_ITEMS } from './data/menu.ts';
import type { CartItem, MenuItem, OrderRecord, SeatingZone } from './types/restaurant.ts';

interface TrackedOrderRef {
  orderNumber: string;
  trackingToken?: string;
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    const params = new URLSearchParams(window.location.search);
    const urlOrder = params.get('order')?.trim().toUpperCase();
    if (urlOrder && /^ORD-\d{4}$/.test(urlOrder) && window.location.pathname === '/') {
      return '/track-order';
    }
    return normalizePath(window.location.pathname);
  });

  const [reservationZoneHint, setReservationZoneHint] = useState<SeatingZone | undefined>(
    undefined
  );

  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [activeOrderRef, setActiveOrderRef] = useState<TrackedOrderRef | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlOrder = params.get('order')?.trim().toUpperCase();
      if (urlOrder && /^ORD-\d{4}$/.test(urlOrder)) {
        return { orderNumber: urlOrder };
      }
    }
    return { orderNumber: 'ORD-4092' };
  });
  const [recentOrderRefs, setRecentOrderRefs] = useState<TrackedOrderRef[]>([
    { orderNumber: 'ORD-4092' },
  ]);

  const [shareBaseUrl, setShareBaseUrl] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.origin : ''
  );
  const [shareModal, setShareModal] = useState<{
    open: boolean;
    target: ShareTarget;
    orderNumber?: string;
  }>({ open: false, target: 'home' });

  const navigate = useCallback((to: string, zoneHint?: SeatingZone) => {
    const [rawPath] = to.split('?');
    const cleanPath = normalizePath(rawPath);
    if (zoneHint) {
      setReservationZoneHint(zoneHint);
    }
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== cleanPath || to.includes('?')) {
        window.history.pushState({}, '', to);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setCurrentPath(cleanPath);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPopState = () => {
      const next = normalizePath(window.location.pathname);
      setCurrentPath(next);
      const params = new URLSearchParams(window.location.search);
      const urlOrder = params.get('order')?.trim().toUpperCase();
      if (urlOrder && /^ORD-\d{4}$/.test(urlOrder)) {
        setActiveOrderRef({ orderNumber: urlOrder });
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/menu')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.items && Array.isArray(data.items)) {
          setMenuItems(data.items);
        }
      })
      .catch(() => {
        // Keep bundled menu catalog as resilient fallback
      });

    fetch('/api/app-url')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && typeof data?.appUrl === 'string' && data.appUrl.length > 0) {
          setShareBaseUrl(data.appUrl);
        }
      })
      .catch(() => {
        // Keep window.location.origin fallback
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const addToCart = (
    item: MenuItem,
    selectedOptionIds: string[],
    selectedOptions: { groupLabel: string; choiceLabel: string; priceDelta: number }[],
    specialInstructions: string,
    quantity: number
  ) => {
    const unitPrice =
      Math.round(
        (item.price + selectedOptions.reduce((sum, o) => sum + o.priceDelta, 0)) * 100
      ) / 100;
    const cartKey = [
      item.id,
      selectedOptionIds.slice().sort().join(','),
      specialInstructions,
    ].join('|');

    setCart((prev) => {
      const existing = prev.find((c) => c.cartKey === cartKey);
      if (existing) {
        return prev.map((c) =>
          c.cartKey === cartKey
            ? { ...c, quantity: Math.min(20, c.quantity + quantity) }
            : c
        );
      }
      return [
        ...prev,
        {
          cartKey,
          menuItemId: item.id,
          name: item.name,
          unitPrice,
          quantity,
          selectedOptionIds,
          selectedOptions,
          specialInstructions: specialInstructions || undefined,
          imageUrl: item.imageUrl,
        },
      ];
    });
    setToastMessage(`Added ${item.name} to Order Bag`);
  };

  const handleQuickAdd = (item: MenuItem) => {
    const defaultOptionIds: string[] = [];
    const defaultOptions =
      item.options?.map((group) => {
        const first = group.choices[0];
        defaultOptionIds.push(first.id);
        return {
          groupLabel: group.label,
          choiceLabel: first.label,
          priceDelta: first.priceDelta,
        };
      }) ?? [];
    addToCart(item, defaultOptionIds, defaultOptions, '', 1);
  };

  const handleUpdateQty = (cartKey: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.cartKey === cartKey ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const handleRemoveItem = (cartKey: string) => {
    setCart((prev) => prev.filter((c) => c.cartKey !== cartKey));
  };

  const handleOrderComplete = (order: OrderRecord, trackingToken: string) => {
    const ref: TrackedOrderRef = {
      orderNumber: order.orderNumber,
      trackingToken,
    };
    setCart([]);
    setDrawerOpen(false);
    setActiveOrderRef(ref);
    setRecentOrderRefs((prev) => [
      ref,
      ...prev.filter((r) => r.orderNumber !== ref.orderNumber),
    ]);
    setToastMessage(`Order ${order.orderNumber} confirmed and sent to kitchen`);
    navigate(`/track-order?order=${encodeURIComponent(order.orderNumber)}`);
  };

  const bagCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const featuredItems = menuItems.filter((item) => item.featured);

  const renderPage = () => {
    if (currentPath === '/menu') {
      return (
        <MenuSection
          items={menuItems}
          cart={cart}
          onQuickAdd={handleQuickAdd}
          onCustomize={(item) => setCustomizingItem(item)}
          onSelectDish={(itemId) => navigate(`/menu/${itemId}`)}
        />
      );
    }

    if (currentPath.startsWith('/menu/')) {
      const dishId = currentPath.slice('/menu/'.length);
      const dish = menuItems.find((m) => m.id === dishId);
      const related = dish
        ? menuItems
            .filter((m) => m.category === dish.category && m.id !== dish.id)
            .slice(0, 3)
        : [];
      return (
        <DishDetailPage
          item={dish}
          relatedItems={related}
          onNavigate={(path) => navigate(path)}
          onAddToCart={addToCart}
        />
      );
    }

    if (currentPath === '/dining-area') {
      return (
        <DiningAreaPage
          onReserveZone={(zone) => navigate('/reservations', zone)}
          onNavigate={(path) => navigate(path)}
        />
      );
    }

    if (currentPath === '/hours') {
      return <HoursPage onNavigate={(path) => navigate(path)} />;
    }

    if (currentPath === '/reservations') {
      return <ReservationSection initialZone={reservationZoneHint} />;
    }

    if (currentPath === '/track-order') {
      return (
        <OrderTrackingSection
          activeOrderRef={activeOrderRef}
          recentOrderRefs={recentOrderRefs}
          onSelectOrderRef={(ref) => setActiveOrderRef(ref)}
          onShareOrder={(ordNum) =>
            setShareModal({ open: true, target: 'order', orderNumber: ordNum })
          }
        />
      );
    }

    if (currentPath === '/about') {
      return <AboutPage onNavigate={(path) => navigate(path)} />;
    }

    if (currentPath === '/contact') {
      return <ContactPage onNavigate={(path) => navigate(path)} />;
    }

    return (
      <HomePage
        featuredItems={featuredItems}
        onNavigate={(path) => navigate(path)}
        onQuickAdd={handleQuickAdd}
      />
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8] text-[#141413]">
      <Navbar
        currentPath={currentPath}
        bagCount={bagCount}
        onNavigate={(path) => navigate(path)}
        onOpenBag={() => setDrawerOpen(true)}
      />

      <main className="flex-1">{renderPage()}</main>

      <Footer
        onNavigate={(path) => navigate(path)}
        onOpenShare={() =>
          setShareModal({
            open: true,
            target:
              currentPath === '/menu'
                ? 'menu'
                : currentPath === '/reservations'
                ? 'reservations'
                : currentPath === '/track-order'
                ? 'order'
                : 'home',
            orderNumber: activeOrderRef?.orderNumber,
          })
        }
      />

      <ShareDeviceModal
        open={shareModal.open}
        baseUrl={shareBaseUrl}
        initialTarget={shareModal.target}
        orderNumber={shareModal.orderNumber}
        onClose={() => setShareModal((prev) => ({ ...prev, open: false }))}
      />

      <DishCustomizeModal
        item={customizingItem}
        onClose={() => setCustomizingItem(null)}
        onConfirmAdd={addToCart}
      />

      <CheckoutDrawer
        open={drawerOpen}
        cart={cart}
        onClose={() => setDrawerOpen(false)}
        onBrowseMenu={() => navigate('/menu')}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onOrderComplete={handleOrderComplete}
      />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-lg border border-[#D4D1C8] bg-white px-4 py-3 text-sm shadow-lg"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1C3B2B]" aria-hidden="true" />
          <span className="font-medium text-[#141413]">{toastMessage}</span>
          {bagCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setDrawerOpen(true);
                setToastMessage(null);
              }}
              className="ml-1 text-xs font-semibold text-[#1C3B2B] underline underline-offset-4 cursor-pointer whitespace-nowrap"
            >
              View Bag
            </button>
          )}
        </div>
      )}
    </div>
  );
}
