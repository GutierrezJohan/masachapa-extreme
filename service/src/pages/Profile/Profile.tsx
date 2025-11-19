import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from '@ionic/react';
import { 
  cameraOutline, 
  callOutline, 
  calendarOutline, 
  personOutline, 
  personAddOutline, 
  trashOutline, 
  cartOutline,
  closeOutline,
  checkmarkCircleOutline,
  logOutOutline,
  pencilOutline,
  locationOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import NavBar from '../../components/NavBar/NavBar';
import { useHistory } from 'react-router-dom';
import './Profile.css';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

type Usuario = {
  id?: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  fecha_registro?: string;
  tipo?: 'cliente' | 'administrador';
  activo?: boolean;
  direccion?: string;
  nivel_acceso?: string;
  departamento?: string | null;
  avatar?: string;
};

type CartItem = {
  id: number | string;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
};

export default function Profile() {
  const [query, setQuery] = useState('');
  const [user, setUser] = useState<Usuario | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const history = useHistory();

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (!storedUser || !token) {
        history.push('/login');
        return;
      }
      (async () => {
        try {
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.user) {
              setUser(data.user);
              try { localStorage.setItem('user', JSON.stringify(data.user)); } catch {}
            }
          } else {
            const parsed: Usuario = JSON.parse(storedUser);
            setUser(parsed);
          }
        } catch {
          const parsed: Usuario = JSON.parse(storedUser);
          setUser(parsed);
        }
      })();
    } catch {
      history.push('/login');
    }

    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        const parsedCart: CartItem[] = JSON.parse(storedCart);
        setCart(parsedCart);
      } else {
        setCart([]);
      }
    } catch {
      setCart([]);
    }
  }, [history]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      history.push('/login');
    }
  };

  const removeFromCart = (itemId: number | string) => {
    const newCart = cart.filter(item => item.id !== itemId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (itemId: number | string, change: number) => {
    const newCart = cart.map(item => {
      if (item.id === itemId) {
        const newQty = item.cantidad + change;
        return newQty > 0 ? { ...item, cantidad: newQty } : item;
      }
      return item;
    }).filter(item => item.cantidad > 0);
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const cartCount = cart.reduce((acc, i) => acc + (i.cantidad || 0), 0);
  const cartTotal = cart.reduce((acc, i) => acc + (i.precio || 0) * (i.cantidad || 0), 0);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <IonPage>
      <NavBar
        title="Mi Perfil"
        query={query}
        onQueryChange={setQuery}
        cartCount={cartCount}
        onCartClick={() => {}}
      />
      <IonContent fullscreen className="profile-content">
        <div className="horizontal-cards-container">
          {/* Tarjeta de perfil de usuario */}
          <div className="horizontal-card">
            <IonCard className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar-container" onClick={() => setShowModal(true)}>
                  <div className="profile-avatar">
                    <img 
                      src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.nombre || 'U')}`} 
                      alt="Avatar de usuario" 
                      loading="lazy"
                    />
                  </div>
                  <div className="avatar-overlay">
                    <IonIcon icon={cameraOutline} className="camera-icon" />
                  </div>
                </div>
                <div className="profile-status">
                  <span className={`status-badge ${user?.activo ? 'active' : 'inactive'}`}>
                    {user?.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              
              <IonCardHeader className="profile-header-content">
                <IonCardTitle className="profile-name">{user?.nombre || 'Usuario'}</IonCardTitle>
                <IonText className="profile-email">{user?.email}</IonText>
              </IonCardHeader>
              
              <IonCardContent className="profile-content-card">
                <div className="profile-stats">
                  <div className="stat-item">
                    <IonIcon icon={cartOutline} />
                    <span className="stat-value">{cartCount}</span>
                    <span className="stat-label">Productos</span>
                  </div>
                  <div className="stat-item">
                    <IonIcon icon={personAddOutline} />
                    <span className="stat-value">{user?.tipo === 'administrador' ? '5' : '0'}</span>
                    <span className="stat-label">Referidos</span>
                  </div>
                  <div className="stat-item">
                    <IonIcon icon={shieldCheckmarkOutline} />
                    <span className="stat-value">{user?.tipo === 'administrador' ? 'Admin' : 'Cliente'}</span>
                    <span className="stat-label">Rol</span>
                  </div>
                </div>

                <div className="profile-details">
                  {user?.telefono && (
                    <div className="detail-row">
                      <IonIcon icon={callOutline} className="detail-icon" />
                      <span className="detail-value">{user.telefono}</span>
                    </div>
                  )}
                  
                  <div className="detail-row">
                    <IonIcon icon={calendarOutline} className="detail-icon" />
                    <span className="detail-value">Registrado: {formatDateTime(user?.fecha_registro || '')}</span>
                  </div>
                  
                  {user?.direccion && (
                    <div className="detail-row">
                      <IonIcon icon={locationOutline} className="detail-icon" />
                      <span className="detail-value">{user.direccion}</span>
                    </div>
                  )}
                  
                  {user?.tipo === 'administrador' && (
                    <>
                      <div className="detail-row">
                        <IonIcon icon={personOutline} className="detail-icon" />
                        <span className="detail-value">Nivel de acceso: {user.nivel_acceso || 'básico'}</span>
                      </div>
                      <div className="detail-row">
                        <IonIcon icon={callOutline} className="detail-icon" />
                        <span className="detail-value">Departamento: {user.departamento || '-'}</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="profile-actions">
                  <IonButton 
                    className="action-btn edit-btn" 
                    onClick={() => history.push('/profile/edit')}
                    aria-label="Editar perfil"
                  >
                    <IonIcon icon={pencilOutline} slot="start" />
                    Editar Perfil
                  </IonButton>
                  <IonButton 
                    className="action-btn logout-btn" 
                    fill="outline" 
                    onClick={handleLogout}
                    aria-label="Cerrar sesión"
                  >
                    <IonIcon icon={logOutOutline} slot="start" />
                    Cerrar Sesión
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          </div>

          {/* Tarjeta de carrito de compras */}
          <div className="horizontal-card">
            <IonCard className="profile-cart">
              <IonCardHeader className="cart-header">
                <IonCardTitle className="cart-title">
                  <IonIcon icon={cartOutline} className="cart-icon" />
                  Carrito de Compras
                </IonCardTitle>
                {cart.length > 0 && (
                  <IonButton 
                    fill="clear" 
                    className="clear-cart-btn"
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de que quieres vaciar tu carrito?')) {
                        setCart([]);
                        localStorage.removeItem('cart');
                      }
                    }}
                    aria-label="Vaciar carrito"
                  >
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                )}
              </IonCardHeader>
              
              <IonCardContent className="cart-content">
                {cart.length === 0 ? (
                  <div className="cart-empty-container">
                    <div className="empty-cart-icon">
                      <IonIcon icon={cartOutline} />
                    </div>
                    <h3 className="cart-empty-title">Tu carrito está vacío</h3>
                    <p className="cart-empty-text">Agrega productos para verlos aquí</p>
                    <IonButton 
                      className="browse-products-btn" 
                      onClick={() => history.push('/')}
                      aria-label="Explorar productos"
                    >
                      Explorar productos
                    </IonButton>
                  </div>
                ) : (
                  <>
                    <IonList className="cart-list">
                      {cart.map((item) => (
                        <IonItem 
                          key={item.id} 
                          className="cart-item"
                          button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowModal(true);
                          }}
                        >
                          <div className="cart-item-image-container">
                            {item.imagen ? (
                              <img src={item.imagen} alt={item.nombre} className="cart-item-img" loading="lazy" />
                            ) : (
                              <div className="cart-item-placeholder">
                                <IonIcon icon={cartOutline} />
                              </div>
                            )}
                          </div>
                          
                          <div className="cart-item-details">
                            <div className="cart-item-name">{item.nombre}</div>
                            <div className="cart-item-price">${(item.precio).toFixed(2)}</div>
                          </div>
                          
                          <div className="cart-item-actions">
                            <div className="quantity-control">
                              <IonButton 
                                fill="clear" 
                                size="small" 
                                className="qty-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(item.id, -1);
                                }}
                                aria-label="Disminuir cantidad"
                              >
                                -
                              </IonButton>
                              <span className="quantity">{item.cantidad}</span>
                              <IonButton 
                                fill="clear" 
                                size="small" 
                                className="qty-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(item.id, 1);
                                }}
                                aria-label="Aumentar cantidad"
                              >
                                +
                              </IonButton>
                            </div>
                            
                            <IonButton 
                              fill="clear" 
                              color="danger" 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromCart(item.id);
                              }}
                              aria-label="Eliminar producto"
                            >
                              <IonIcon icon={trashOutline} />
                            </IonButton>
                          </div>
                        </IonItem>
                      ))}
                    </IonList>
                    
                    <div className="cart-summary">
                      <div className="summary-row">
                        <span className="summary-label">Subtotal:</span>
                        <span className="summary-value">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">Envío:</span>
                        <span className="summary-value">Gratis (envío estándar)</span>
                      </div>
                      <div className="summary-total-row">
                        <span className="total-label">Total:</span>
                        <span className="total-value">${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="cart-footer">
                      <IonButton 
                        className="checkout-btn" 
                        expand="block"
                        onClick={() => history.push('/checkout')}
                        aria-label="Proceder al pago"
                      >
                        Proceder al Pago
                      </IonButton>
                    </div>
                  </>
                )}
              </IonCardContent>
            </IonCard>
          </div>
        </div>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="profile-modal">
          <IonHeader>
            <IonToolbar>
              <IonTitle>Información del Producto</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          {selectedItem && (
            <div className="modal-content">
              <div className="modal-image">
                {selectedItem.imagen ? (
                  <img src={selectedItem.imagen} alt={selectedItem.nombre} />
                ) : (
                  <div className="modal-placeholder">
                    <IonIcon icon={cartOutline} />
                  </div>
                )}
              </div>
              <div className="modal-info">
                <h2 className="modal-product-name">{selectedItem.nombre}</h2>
                <p className="modal-product-price">${(selectedItem.precio * selectedItem.cantidad).toFixed(2)}</p>
                <div className="modal-product-details">
                  <div className="modal-detail">
                    <span className="detail-label">Precio unitario:</span>
                    <span className="detail-value">${selectedItem.precio.toFixed(2)}</span>
                  </div>
                  <div className="modal-detail">
                    <span className="detail-label">Cantidad:</span>
                    <span className="detail-value">{selectedItem.cantidad}</span>
                  </div>
                </div>
                <div className="modal-actions">
                  <IonButton 
                    fill="outline" 
                    color="danger"
                    onClick={() => {
                      removeFromCart(selectedItem.id);
                      setShowModal(false);
                    }}
                    aria-label="Eliminar producto"
                  >
                    <IonIcon icon={trashOutline} slot="start" />
                    Eliminar
                  </IonButton>
                  <IonButton 
                    expand="block"
                    onClick={() => {
                      history.push('/checkout');
                      setShowModal(false);
                    }}
                    aria-label="Comprar ahora"
                  >
                    <IonIcon icon={checkmarkCircleOutline} slot="start" />
                    Comprar Ahora
                  </IonButton>
                </div>
              </div>
            </div>
          )}
        </IonModal>
      </IonContent>
    </IonPage>
  );
}