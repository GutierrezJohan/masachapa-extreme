import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonToolbar, IonTitle, IonButtons, IonBackButton, IonGrid, IonRow, IonCol, IonSpinner } from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import ProductCard, { Product } from '../../components/ProductCard/ProductCard';
import { addToCart as cartAdd } from '../../services/CartService';
import './Category.css';
import { getProductsByCategory } from '../../services/ProductService';
import { countItems as cartCountItems } from '../../services/CartService';

// Sin fallback: si la categoría no tiene productos mostraremos mensaje vacío

const Category: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const history = useHistory();
  const decodedName = React.useMemo(() => {
    try {
      // Normalize cases where %2F comes through literally
      return decodeURIComponent(name.replace(/%2F/g, '%2F'))
        .replace(/%2F/g, '/');
    } catch {
      return name.replace(/%2F/g, '/');
    }
  }, [name]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError('');
      try {
        const list = await getProductsByCategory(decodedName);
        if (!mounted) return;
        const mapped: Product[] = list
          .filter((p: any) => {
            // Asegurar coincidencia estricta por nombre de categoría (case-insensitive)
            const cat = (p.categoria || p.Categoria?.nombre || '').toLowerCase();
            return cat === (decodedName || '').toLowerCase();
          })
          .map((p: any) => ({
          id: String(p.id),
          name: p.nombre || p.name,
          price: p.precio ?? p.price ?? 0,
          image: p.imagen || p.imagen_url || p.image || '/images/product-default.png',
        }));
        setProducts(mapped);
      } catch (e: any) {
        if (!mounted) return;
        setError(e.message || 'Error cargando productos de la categoría');
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [name]);

  return (
    <IonPage>
      <NavBar title={`Categoria: ${decodedName || 'Todos'}`} query={''} onQueryChange={() => {}} cartCount={cartCountItems()} onCartClick={() => history.push('/cart')} />
      <IonContent className="home-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/" />
            </IonButtons>
            <IonTitle>Categoria: {decodedName}</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="container">
          <h2 className="category-heading">{decodedName}</h2>

          <IonGrid>
            <IonRow>
              {loading && (
                <IonCol size="12" className="ion-text-center" style={{ padding: '40px' }}>
                  <IonSpinner name="crescent" />
                </IonCol>
              )}
              {!loading && products.map(p => (
                <IonCol size="12" sizeSm="6" sizeMd="4" key={p.id}>
                  <ProductCard product={p} onAdd={(prod) => cartAdd({ id: prod.id, nombre: prod.name, precio: prod.price, cantidad: 1, imagen: prod.image })} />
                </IonCol>
              ))}
              {!loading && products.length === 0 && (
                <IonCol size="12" style={{ textAlign: 'center', opacity: 0.7, padding: '32px' }}>
                  No hay productos para esta categoría.
                </IonCol>
              )}
            </IonRow>
          </IonGrid>
          {error && <div style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '12px', textAlign: 'center' }}>{error}</div>}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Category;
