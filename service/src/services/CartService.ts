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

function saveCart(items: CartItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
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
