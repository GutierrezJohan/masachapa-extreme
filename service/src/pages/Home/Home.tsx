import React, { useMemo, useState, useEffect } from 'react';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
  IonModal,
  IonFooter,
  IonText,
} from '@ionic/react';
import { 
  cartOutline, 
  close, 
  snowOutline, 
  carOutline, 
  flashOutline, 
  waterOutline, 
  constructOutline, 
  cogOutline, 
  batteryChargingOutline, 
  funnelOutline, 
  leafOutline, 
  hardwareChipOutline, 
  helpCircleOutline, 
  handLeftOutline,
  gridOutline,
  listOutline
} from 'ionicons/icons';
import './Home.css';
import NavBar from '../../components/NavBar/NavBar';
import { useHistory } from 'react-router-dom';

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  badge?: string;
};

const SAMPLE_PRODUCTS: Product[] = [
  { id: '1', name: 'Filtro de aceite', price: 8.99, category: 'Motor', badge: 'OEM' },
  { id: '2', name: 'Pastillas de freno', price: 29.9, category: 'Frenos', badge: 'Top' },
  { id: '3', name: 'Batería 12V 65Ah', price: 119.0, category: 'Eléctrico' },
  { id: '4', name: 'Bujías Iridium (x4)', price: 39.5, category: 'Motor', badge: 'Nuevo' },
  { id: '5', name: 'Amortiguador delantero', price: 85.0, category: 'Suspensión' },
  { id: '6', name: 'Alternador 120A', price: 249.0, category: 'Eléctrico', badge: 'Garantía' },
  { id: '7', name: 'Filtro de aire', price: 14.9, category: 'Motor' },
  { id: '8', name: 'Limpiaparabrisas 22"', price: 9.5, category: 'Accesorios' },
];

const PRODUCT_CATEGORIES = [
  { name: 'Air Condition / Heating', icon: snowOutline },
  { name: 'Sistema de frenos', icon: handLeftOutline },
  { name: 'Piezas de carrocería', icon: carOutline },
  { name: 'Consumables', icon: flashOutline },
  { name: 'Cooling system', icon: waterOutline },
  { name: 'Motor', icon: cogOutline },
  { name: 'Componente electrónico', icon: batteryChargingOutline },
  { name: 'Partes de combustible', icon: funnelOutline },
  { name: 'Eléctrico', icon: leafOutline },
];

const POPULAR_PRODUCTS: Product[] = [
  {
    id: '2',
    name: 'Pastillas de freno',
    price: 29.9,
    category: 'Frenos',
    badge: 'Top',
    image: 'https://images.unsplash.com/photo-1598301252104-3eaaa5ae88f0?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '4',
    name: 'Bujías Iridium (x4)',
    price: 39.5,
    category: 'Motor',
    badge: 'Nuevo',
    image: 'https://images.unsplash.com/photo-1605733513597-a8f8341084e9?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '6',
    name: 'Alternador 120A',
    price: 249.0,
    category: 'Eléctrico',
    badge: 'Garantía',
    image: 'https://images.unsplash.com/photo-1600004003352-5f024f5652b8?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '1',
    name: 'Filtro de aceite',
    price: 8.99,
    category: 'Motor',
    badge: 'OEM',
    image: 'https://images.unsplash.com/photo-1598302202730-20c9c4a0f0c7?auto=format&fit=crop&w=400&q=80',
  },
];

const Home: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const history = useHistory();

  const addToCart = (p: Product) => {
    setCart(prev => [...prev, p]);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const categories = useMemo(() => {
    return Array.from(new Set(SAMPLE_PRODUCTS.map(p => p.category).filter(Boolean))) as string[];
  }, []);

  const filtered = useMemo(() => {
    return SAMPLE_PRODUCTS.filter(p => {
      const matchesQuery = query.trim() === '' || p.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = !category || p.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  const getCategoryDescription = (categoryName: string): string => {
    const descriptions: Record<string, string> = {
      'Motor': 'Filtros, bujías, correas y componentes esenciales para el corazón de tu vehículo',
      'Sistema de frenos': 'Pastillas, discos, tambores y sistemas de frenado para máxima seguridad',
      'Air Condition / Heating': 'Componentes de climatización para mantener el confort en cualquier clima',
      'Piezas de carrocería': 'Parachoques, panelas, espejos y elementos estructurales de carrocería',
      'Consumables': 'Aceites, líquidos de frenos, refrigerantes y otros insumos para mantenimiento',
      'Cooling system': 'Radiadores, termostatos, bombas de agua y componentes del sistema de enfriamiento',
      'Componente electrónico': 'Sensores, alternadores, baterías y sistemas eléctricos y electrónicos',
      'Partes de combustible': 'Bombas, inyectores, tanques y componentes del sistema de combustible',
      'Eléctrico': 'Baterías, alternadores, cables y componentes del sistema eléctrico',
      'Suspensión': 'Amortiguadores, resortes, brazos y componentes de suspensión',
      'Accesorios': 'Accesorios y complementos para personalizar tu vehículo',
      'Otros': 'Otros accesorios y complementos para personalizar tu vehículo'
    };
    
    return descriptions[categoryName] || 'Encuentra los mejores repuestos y accesorios para tu vehículo';
  };

  // Efecto para mostrar las tarjetas con animación staggered
  useEffect(() => {
    const cards = document.querySelectorAll('.category-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('visible');
      }, 100 + (index * 50));
    });
  }, []);

  return (
    <IonPage>
      <NavBar
        title="Machapa Extreme"
        query={query}
        onQueryChange={(v) => setQuery(v)}
        cartCount={cart.length}
        onCartClick={() => {}}
      />

      <IonContent fullscreen className="home-content">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Machapa Extreme</IonTitle>
          </IonToolbar>
        </IonHeader>

        <section className="hero">
          {/* Elementos decorativos flotantes */}
          <div className="decoration decoration-1"></div>
          <div className="decoration decoration-2"></div>
          <div className="decoration decoration-3"></div>
          
          <div className="hero-inner">
            <h1>Encuentra repuestos <span className="highlight">confiables</span> para tu vehículo</h1>
            <p>Piezas OEM y alternativas de alta calidad a los mejores precios del mercado. Envíos rápidos y garantía en todos nuestros productos.</p>
            <div className="hero-actions">
              <IonButton 
                onClick={() => setCategory(null)} 
                className="primary"
                aria-label="Explorar todos los productos"
              >
                <IonIcon icon={carOutline} slot="start" />
                Explorar productos
              </IonButton>
              <IonButton 
                fill="clear" 
                onClick={() => setCategory('Motor')} 
                className="secondary"
                aria-label="Ver repuestos de motor"
              >
                <IonIcon icon={cogOutline} slot="start" />
                Repuestos de motor
              </IonButton>
            </div>
          </div>
          
          <div className="hero-image-container">
            <div className="hero-image" aria-hidden="true">
              <img 
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80" 
                alt="Repuestos automotrices de alta calidad" 
                loading="lazy"
              />
            </div>
          </div>
        </section>

        <div className="container">
          {/* Sección visual de categorías MEJORADA */}
          <section className="product-categories">
            <h2>Explora nuestras <span>categorías</span></h2>
            <p className="categories-subtitle">
              Encuentra repuestos y accesorios para cada parte de tu vehículo. 
              Selecciona una categoría para ver productos especializados.
            </p>
            
            <div className="categories-controls">
              <div className="categories-view-toggle">
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} 
                  aria-label="Vista de cuadrícula"
                  onClick={() => setViewMode('grid')}
                >
                  <IonIcon icon={gridOutline} />
                </button>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} 
                  aria-label="Vista de lista"
                  onClick={() => setViewMode('list')}
                >
                  <IonIcon icon={listOutline} />
                </button>
              </div>
            </div>
            
            {/* Contenedor con transición entre vistas */}
            <div className="categories-view-container">
              {/* Vista de cuadrícula */}
              <div className={`category-cards-grid ${viewMode !== 'grid' ? 'inactive' : ''}`}>
                {PRODUCT_CATEGORIES.map((cat, index) => {
                  const isFeatured = cat.name === 'Motor';
                  const itemCount = SAMPLE_PRODUCTS.filter(p => p.category === cat.name).length;
                  
                  return (
                    <div 
                        className={`category-card ${category === cat.name ? 'active' : ''} ${isFeatured ? 'featured-category' : ''}`} 
                        key={cat.name} 
                        onClick={() => { setCategory(cat.name); history.push(`/category/${encodeURIComponent(cat.name)}`); }}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => e.key === 'Enter' && (setCategory(cat.name), history.push(`/category/${encodeURIComponent(cat.name)}`))}
                        aria-label={`Ver productos de ${cat.name}`}
                      >
                      {itemCount > 0 && (
                        <div className="category-badge">
                          {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                        </div>
                      )}
                      
                      <div className="category-content">
                        <div className="category-icon-container">
                          <IonIcon icon={cat.icon} />
                        </div>
                        <h3 className="category-title">{cat.name}</h3>
                        <p className="category-description">
                          {getCategoryDescription(cat.name)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Vista de lista */}
              <div className={`category-list ${viewMode === 'list' ? 'active' : ''}`}>
                {PRODUCT_CATEGORIES.map((cat, index) => {
                  const itemCount = SAMPLE_PRODUCTS.filter(p => p.category === cat.name).length;
                  
                  return (
                    <div 
                        className={`list-category-item ${category === cat.name ? 'active' : ''}`} 
                        key={cat.name} 
                        onClick={() => { setCategory(cat.name); history.push(`/category/${encodeURIComponent(cat.name)}`); }}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => e.key === 'Enter' && (setCategory(cat.name), history.push(`/category/${encodeURIComponent(cat.name)}`))}
                        aria-label={`Ver productos de ${cat.name}`}
                      >
                      <div className="list-category-icon">
                        <IonIcon icon={cat.icon} />
                      </div>
                      <div className="list-category-content">
                        <h3 className="list-category-title">{cat.name}</h3>
                        <p className="list-category-description">
                          {getCategoryDescription(cat.name)}
                        </p>
                      </div>
                      {itemCount > 0 && (
                        <div className="list-category-badge">
                          {itemCount}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Sección de artículos populares MEJORADA CON IMÁGENES */}
          <section className="popular-items">
            <h3>Artículos Populares</h3>
            <IonGrid>
              <IonRow>
                {POPULAR_PRODUCTS.map(p => (
                  <IonCol size="12" sizeSm="6" sizeMd="3" key={p.id}>
                    <IonCard 
                      className="product-card" 
                      onClick={() => setSelected(p)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => e.key === 'Enter' && setSelected(p)}
                      aria-label={`Ver detalles de ${p.name}`}
                    >
                      <div className="product-image-container">
                        {p.badge && <span className="product-badge">{p.badge}</span>}
                        <img
                          src={p.image || 'https://via.placeholder.com/400x300/f1f5f9/94a3b8?text=Imagen+no+disponible'}
                          alt={p.name}
                          className="product-image"
                          loading="lazy"
                        />
                      </div>
                      <div className="product-card-content">
                        <IonText className="product-card-title">{p.name}</IonText>
                        {p.category && (
                          <IonText className="product-card-category">{p.category}</IonText>
                        )}
                        <div className="product-card-meta">
                          <IonText className="product-card-price">${p.price.toFixed(2)}</IonText>
                          <IonButton
                            className="product-card-action"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(p);
                            }}
                            aria-label={`Añadir ${p.name} al carrito`}
                          >
                            Añadir
                          </IonButton>
                        </div>
                      </div>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </section>
        </div>

        <IonModal isOpen={!!selected} onDidDismiss={() => setSelected(null)} className="product-modal">
          <IonHeader>
            <IonToolbar>
              <IonTitle>{selected?.name}</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setSelected(null)}>
                <IonIcon icon={close} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <div className="modal-body">
            {selected && (
              <>
                <div className="modal-info">
                  <h2>{selected.name}</h2>
                  <p className="modal-price">${selected.price.toFixed(2)}</p>
                  <p className="modal-desc">Verifica compatibilidad por marca, modelo y año antes de comprar.</p>
                  <div className="modal-actions">
                    <IonButton onClick={() => { addToCart(selected); setSelected(null); }}>Añadir al carrito</IonButton>
                  </div>
                </div>
              </>
            )}
          </div>
          <IonFooter />
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Home;