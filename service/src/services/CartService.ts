import { apiAddItem, apiClearCart, apiGetCart, apiRemoveItem, apiUpdateItem, isAuthenticated } from './CartApiService';

export type CartItem = {
  id: number | string;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
};

const KEY = 'cart';
const KEY_SERVER_CACHE = 'cart:server';
let serverCache: CartItem[] | null = null;

function mapApiToCartItems(items: { productoId: number; nombre: string; precio: number; cantidad: number; imagen?: string }[]): CartItem[] {
  return items.map(i => ({ id: i.productoId, nombre: i.nombre, precio: i.precio, cantidad: i.cantidad, imagen: i.imagen }));
}

async function syncServerCart() {
  try {
    const data = await apiGetCart();
    serverCache = mapApiToCartItems(data.items || []);
    try { sessionStorage.setItem(KEY_SERVER_CACHE, JSON.stringify(serverCache)); } catch {}
    notify(serverCache);
  } catch {}
}

// Merge guest (localStorage) cart into server cart after login
export async function syncAfterLogin() {
  if (!isAuthenticated()) return;
  // Read guest cart from localStorage
  let guest: CartItem[] = [];
  try {
    const raw = localStorage.getItem(KEY);
    guest = raw ? JSON.parse(raw) as CartItem[] : [];
  } catch {}

  if (guest.length) {
    // Sequential to respect stock limits; ignore errors per item
    for (const item of guest) {
      try { await apiAddItem(Number(item.id), item.cantidad); } catch {}
    }
    // Clear guest cart
    try { localStorage.removeItem(KEY); } catch {}
  }
  // Final authoritative server fetch
  await syncServerCart();
}

export function getCart(): CartItem[] {
  if (isAuthenticated()) {
    if (serverCache) return serverCache;
    try {
      const raw = sessionStorage.getItem(KEY_SERVER_CACHE);
      if (raw) {
        serverCache = JSON.parse(raw) as CartItem[];
        return serverCache || [];
      }
    } catch {}
    // Kick off sync in background
    syncServerCart();
    return serverCache || [];
  } else {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }
}

function notify(items: CartItem[]) {
  try {
    const detail = { count: items.reduce((a, i) => a + (i.cantidad || 0), 0), items };
    window.dispatchEvent(new CustomEvent('cart:updated', { detail }));
  } catch {}
}

function saveCart(items: CartItem[]) {
  if (isAuthenticated()) {
    serverCache = items;
    try { sessionStorage.setItem(KEY_SERVER_CACHE, JSON.stringify(items)); } catch {}
  } else {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }
  notify(items);
}

export function addToCart(item: CartItem) {
  if (isAuthenticated()) {
    // Optimistic update
    const current = getCart();
    const idx = current.findIndex(i => String(i.id) === String(item.id));
    if (idx >= 0) {
      current[idx].cantidad += item.cantidad;
    } else {
      current.push({ ...item });
    }
    saveCart(current);
    apiAddItem(Number(item.id), item.cantidad).then(data => {
      const items = mapApiToCartItems(data.items || []);
      saveCart(items);
    }).catch(() => {
      // On failure, revert optimistic change by re-syncing
      syncServerCart();
    });
    return current;
  } else {
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
}

export function removeFromCart(id: number | string) {
  if (isAuthenticated()) {
    const current = getCart().filter(i => String(i.id) !== String(id));
    saveCart(current);
    apiRemoveItem(Number(id)).then(data => {
      const items = mapApiToCartItems(data.items || []);
      saveCart(items);
    }).catch(() => {
      syncServerCart();
    });
    return current;
  } else {
    const list = getCart().filter(i => String(i.id) !== String(id));
    saveCart(list);
    return list;
  }
}

export function updateQuantity(id: number | string, delta: number) {
  if (isAuthenticated()) {
    const updated = getCart().map(i => {
      if (String(i.id) === String(id)) {
        const qty = Math.max(0, (i.cantidad || 0) + delta);
        return { ...i, cantidad: qty };
      }
      return i;
    }).filter(i => i.cantidad > 0);
    saveCart(updated);
    apiUpdateItem(Number(id), delta).then(data => {
      const items = mapApiToCartItems(data.items || []);
      saveCart(items);
    }).catch(() => {
      syncServerCart();
    });
    return updated;
  } else {
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
}

export function countItems(): number {
  if (isAuthenticated()) {
    if (!serverCache) syncServerCart();
    const list = serverCache || [];
    return list.reduce((acc, i) => acc + (i.cantidad || 0), 0);
  }
  return getCart().reduce((acc, i) => acc + (i.cantidad || 0), 0);
}

export function onCartUpdated(handler: (e: CustomEvent<{count: number; items: CartItem[]}>) => void) {
  const listener = (e: Event) => handler(e as CustomEvent<{count:number; items: CartItem[]}>);
  window.addEventListener('cart:updated', listener as EventListener);
  return () => window.removeEventListener('cart:updated', listener as EventListener);
}

export async function refreshCartFromServer() {
  if (isAuthenticated()) {
    await syncServerCart();
  }
}
