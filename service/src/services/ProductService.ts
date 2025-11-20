export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  imagen: string; // URL
  creadoEn?: string;
}

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
const STORAGE_KEY = 'admin_products';

function getToken(): string | null {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

function headers(json = true): HeadersInit {
  const h: Record<string, string> = {};
  const token = getToken();
  if (json) h['Content-Type'] = 'application/json';
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

function loadLocal(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

function saveLocal(list: Product[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/api/products`, { headers: headers(false) });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return (data?.products || data) as Product[];
  } catch (e) {
    // Propagate error so UI can show proper message instead of local fallback
    throw e;
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  if (!category) return getAllProducts();
  try {
    const res = await fetch(`${API_URL}/api/products?category=${encodeURIComponent(category)}`, { headers: headers(false) });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return (data?.products || data) as Product[];
  } catch (e) {
    // Propagate error to caller
    throw e;
  }
}

export async function createProduct(input: Omit<Product, 'id' | 'creadoEn'>): Promise<Product> {
  try {
    const res = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: headers(true),
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return (data?.product || data) as Product;
  } catch {
    const list = loadLocal();
    const id = Date.now();
    const product: Product = { id, creadoEn: new Date().toISOString(), ...input };
    list.unshift(product);
    saveLocal(list);
    return product;
  }
}

export async function deleteProduct(id: number): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: headers(false),
    });
    if (!res.ok) throw new Error('API error');
    return;
  } catch {
    const list = loadLocal().filter(p => p.id !== id);
    saveLocal(list);
  }
}

export async function getProductById(id: number | string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/api/products/${id}`, { headers: headers(false) });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.product || data) as Product;
  } catch {
    // Fallback: try local cache
    const list = loadLocal();
    const numId = Number(id);
    return list.find(p => p.id === numId) || null;
  }
}

export async function getRelatedProducts(categoria: string, excludeId: number | string, limit = 4): Promise<Product[]> {
  if (!categoria) return [];
  try {
    const res = await fetch(`${API_URL}/api/products?category=${encodeURIComponent(categoria)}`, { headers: headers(false) });
    if (!res.ok) throw new Error('API error');
    const data = (await res.json())?.products || [];
    return (data as Product[])
      .filter(p => String(p.id) !== String(excludeId))
      .slice(0, limit);
  } catch {
    return loadLocal()
      .filter(p => p.categoria.toLowerCase() === categoria.toLowerCase() && String(p.id) !== String(excludeId))
      .slice(0, limit);
  }
}

export async function updateProduct(id: number, input: Partial<Omit<Product, 'id' | 'creadoEn'>>): Promise<Product> {
  try {
    const res = await fetch(`${API_URL}/api/products/${id} `, {
      method: 'PUT',
      headers: headers(true),
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return (data?.product || data) as Product;
  } catch {
    // Local optimistic update fallback
    const list = loadLocal();
    const idx = list.findIndex(p => p.id === id);
    if (idx >= 0) {
      const updated: Product = { ...list[idx], ...input } as Product;
      list[idx] = updated;
      saveLocal(list);
      return updated;
    }
    throw new Error('No se pudo actualizar');
  }
}
