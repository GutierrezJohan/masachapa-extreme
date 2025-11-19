export interface Category {
  id: number;
  nombre: string;
  descripcion?: string | null;
}

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/api/categories`);
  if (!res.ok) {
    throw new Error(`Error categorías (HTTP ${res.status})`);
  }
  const data = await res.json();
  if (!data.categories || !Array.isArray(data.categories)) {
    throw new Error('Respuesta inválida de categorías');
  }
  return data.categories as Category[];
}
