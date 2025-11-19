export type CartItem = {
  id: number | string;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
};

const KEY = 'cart';

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function notify(items: CartItem[]) {
  try {
    const detail = { count: items.reduce((a, i) => a + (i.cantidad || 0), 0), items };
    window.dispatchEvent(new CustomEvent('cart:updated', { detail }));
  } catch {}
}

function saveCart(items: CartItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  notify(items);
}

export function addToCart(item: CartItem) {
  const list = getCart();
  const idx = list.findIndex(i => String(i.id) === String(item.id));
  if (idx >= 0) {
    list[idx].cantidad += item.cantidad;
  } else {
    list.push(item);
  }
  saveCart(list);
  return list;
}

export function removeFromCart(id: number | string) {
  const list = getCart().filter(i => String(i.id) !== String(id));
  saveCart(list);
  return list;
}

export function updateQuantity(id: number | string, delta: number) {
  const list = getCart().map(i => {
    if (String(i.id) === String(id)) {
      const qty = Math.max(0, (i.cantidad || 0) + delta);
      return { ...i, cantidad: qty };
    }
    return i;
  }).filter(i => i.cantidad > 0);
  saveCart(list);
  return list;
}

export function countItems(): number {
  return getCart().reduce((acc, i) => acc + (i.cantidad || 0), 0);
}

export function onCartUpdated(handler: (e: CustomEvent<{count: number; items: CartItem[]}>) => void) {
  const listener = (e: Event) => handler(e as CustomEvent<{count:number; items: CartItem[]}>);
  window.addEventListener('cart:updated', listener as EventListener);
  return () => window.removeEventListener('cart:updated', listener as EventListener);
}
