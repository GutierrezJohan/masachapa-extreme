export type ApiCartItem = {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
  subtotal?: number;
};

function getApiUrl() {
  return (import.meta as any).env.VITE_API_URL as string | undefined;
}

function getToken() {
  try { return localStorage.getItem('token') || undefined; } catch { return undefined; }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const base: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) base['Authorization'] = `Bearer ${token}`;
  return base;
}

export async function apiGetCart(): Promise<{ items: ApiCartItem[]; count: number; subtotal: number; }> {
  const API = getApiUrl();
  if (!API) throw new Error('VITE_API_URL no configurado');
  const res = await fetch(`${API}/api/cart`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Error al obtener carrito');
  return data;
}

export async function apiAddItem(productId: number, cantidad: number) {
  const API = getApiUrl();
  if (!API) throw new Error('VITE_API_URL no configurado');
  const res = await fetch(`${API}/api/cart/items`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ productId, cantidad })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Error al agregar al carrito');
  return data as { items: ApiCartItem[]; count: number; subtotal: number; };
}

export async function apiUpdateItem(productId: number, delta: number) {
  const API = getApiUrl();
  if (!API) throw new Error('VITE_API_URL no configurado');
  const res = await fetch(`${API}/api/cart/items/${productId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ delta })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Error al actualizar carrito');
  return data as { items: ApiCartItem[]; count: number; subtotal: number; };
}

export async function apiRemoveItem(productId: number) {
  const API = getApiUrl();
  if (!API) throw new Error('VITE_API_URL no configurado');
  const res = await fetch(`${API}/api/cart/items/${productId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Error al eliminar del carrito');
  return data as { items: ApiCartItem[]; count: number; subtotal: number; };
}

export async function apiClearCart() {
  const API = getApiUrl();
  if (!API) throw new Error('VITE_API_URL no configurado');
  const res = await fetch(`${API}/api/cart`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Error al limpiar carrito');
  return data as { items: ApiCartItem[]; count: number; subtotal: number; };
}

export function isAuthenticated() {
  return !!getToken();
}
