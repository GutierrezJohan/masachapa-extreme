import { isAuthenticated } from './CartApiService';

export type OrderItem = {
  id: number;
  productoId: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  imagen?: string;
};

export type Order = {
  id: number;
  fecha: string | null;
  estado: string;
  total: number;
  direccion_envio: string;
  metodo_pago: string;
  items: OrderItem[];
};

function getApiUrl() {
  return (import.meta as any).env.VITE_API_URL as string | undefined;
}

function getToken() {
  try { return localStorage.getItem('token') || undefined; } catch { return undefined; }
}

function authHeaders(): Record<string,string> {
  const token = getToken();
  const h: Record<string,string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export async function apiCheckout(direccion_envio: string, metodo_pago: string): Promise<Order> {
  if (!isAuthenticated()) throw new Error('Debe iniciar sesión para completar la compra');
  const API = getApiUrl();
  if (!API) throw new Error('Falta VITE_API_URL');
  const res = await fetch(`${API}/api/orders/checkout`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ direccion_envio, metodo_pago })
  });
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(text.startsWith('<') ? 'Respuesta no JSON (revisa VITE_API_URL y servidor)' : text);
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Error al procesar el checkout');
  if (!data?.order) throw new Error('Formato de respuesta inválido');
  return data.order as Order;
}
