import React, { useEffect, useMemo, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import { cartOutline } from 'ionicons/icons';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import ProductCard, { Product as CardProduct } from '../../components/ProductCard/ProductCard';
import './Product.css';
import { getProductById, getRelatedProducts, Product as ApiProduct } from '../../services/ProductService';
import { addToCart as cartAdd } from '../../services/CartService';

interface ProductDetail extends ApiProduct {}

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const location = useLocation<{ product?: any }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState({ open: false, msg: '', color: 'success' as 'success' | 'danger' });
  const [related, setRelated] = useState<CardProduct[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError(''); setProduct(null);
      const prod = await getProductById(id);
      if (!mounted) return;
      if (!prod) {
        // fallback from navigation state
        const s = location.state?.product;
        if (s) {
          setProduct({
            id: Number(s.id) || s.id,
            nombre: s.nombre || s.name,
            descripcion: s.descripcion || '',
            precio: s.precio || s.price || 0,
            stock: s.stock ?? (s.badge === 'Sin stock' ? 0 : 1),
            categoria: s.categoria || s.category || '',
            imagen: s.imagen || s.image || '',
          } as any);
        } else {
          setError('Producto no encontrado');
        }
      } else {
        setProduct(prod);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!product) return;
      const rel = await getRelatedProducts(product.categoria, product.id);
      if (!mounted) return;
      const mapped: CardProduct[] = rel.map(r => ({
        id: String(r.id),
        name: r.nombre,
        price: r.precio,
        image: r.imagen || 'https://via.placeholder.com/400x300/f1f5f9/94a3b8?text=Sin+imagen'
      }));
      setRelated(mapped);
    })();
    return () => { mounted = false; };
  }, [product]);

  const specs = useMemo(() => {
    if (!product) return [] as { label: string; value: string | number | undefined }[];
    return [
      { label: 'Categoría', value: product.categoria },
      { label: 'Stock', value: product.stock },
      { label: 'Estado', value: (product.stock ?? 0) > 0 ? 'Disponible' : 'Sin stock' },
    ];
  }, [product]);

  const addToCart = () => {
    if (!product) return;
    cartAdd({ id: product.id, nombre: product.nombre, precio: Number(product.precio), cantidad: qty, imagen: product.imagen });
    setToast({ open: true, msg: 'Producto añadido al carrito', color: 'success' });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Producto</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="product-content">
        <div className="product-wrapper">
          {loading && (
            <div style={{ display:'flex', justifyContent:'center', padding:'80px 0' }}>
              <IonSpinner name="crescent" />
            </div>
          )}
          {!loading && error && !product && (
            <div style={{ padding:'60px 0', textAlign:'center', opacity:0.7 }}>
              {error}
            </div>
          )}
          {!loading && product && !error && (
            <div className="product-grid">
              <div className="product-gallery">
                <div className="main-image">
                  {product.imagen ? (
                    <img src={product.imagen} alt={product.nombre} />
                  ) : (
                    <div style={{padding:40,textAlign:'center'}}>Sin imagen</div>
                  )}
                </div>
              </div>
              <div className="product-info">
                <h1 className="product-title">{product.nombre}</h1>
                <div className="price-block">
                  <span className="price-current">${Number(product.precio).toFixed(2)}</span>
                  {(product.stock ?? 0) > 0 && <span className="badge">DISPONIBLE</span>}
                </div>
                {product.descripcion && <p className="desc">{product.descripcion}</p>}
                <div className="spec-list">
                  {specs.map(s => (
                    <div className="spec-item" key={s.label}>
                      <span>{s.label}</span>
                      <span>{s.value ?? '-'}</span>
                    </div>
                  ))}
                </div>
                <div className="actions">
                  <div className="qty-row">
                    <div className="qty-box">
                      <IonButton fill="clear" size="small" onClick={()=>setQty(q=> q>1? q-1 : q)}>-</IonButton>
                      <span style={{minWidth:32,textAlign:'center',fontWeight:700}}>{qty}</span>
                      <IonButton fill="clear" size="small" onClick={()=>setQty(q=> q+1)}>+</IonButton>
                    </div>
                    <IonButton onClick={addToCart} disabled={(product.stock ?? 0) <= 0}>
                      <IonIcon icon={cartOutline} slot="start" />Añadir al carrito
                    </IonButton>
                  </div>
                  <IonButton fill="outline" onClick={()=> history.push('/checkout')}>Comprar ahora</IonButton>
                </div>
                <div className="related">
                  <div className="divider" />
                  <h3>Relacionados</h3>
                  <div style={{display:'grid',gap:16,gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))'}}>
                    {related.map(r => (
                      <ProductCard key={r.id} product={r} />
                    ))}
                    {!related.length && <div style={{opacity:0.6}}>No hay relacionados.</div>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <IonToast isOpen={toast.open} message={toast.msg} duration={1400} color={toast.color} onDidDismiss={()=>setToast({...toast,open:false})} />
      </IonContent>
    </IonPage>
  );
};

export default ProductPage;
