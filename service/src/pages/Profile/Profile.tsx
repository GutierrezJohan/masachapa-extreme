import React from 'react';
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonButton,
} from '@ionic/react';
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
  direccion?: string; // si es cliente
  nivel_acceso?: string; // si es admin
  departamento?: string | null; // si es admin
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
  const [query, setQuery] = React.useState('');
  const [user, setUser] = React.useState<Usuario | null>(null);
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const history = useHistory();

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (!storedUser || !token) {
        history.push('/login');
        return;
      }
      // Primero intenta cargar desde API para datos frescos
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
            // Fallback a localStorage si el token no funciona
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

  const cartCount = cart.reduce((acc, i) => acc + (i.cantidad || 0), 0);
  const cartTotal = cart.reduce((acc, i) => acc + (i.precio || 0) * (i.cantidad || 0), 0);

  return (
    <IonPage>
      <NavBar
        title="Machapa Extreme"
        query={query}
        onQueryChange={setQuery}
        cartCount={cartCount}
        onCartClick={() => {}}
      />
      <IonContent fullscreen>
        <div className="profile-container">
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="4" sizeLg="4">
                <IonCard className="profile-card">
                  <div className="profile-avatar">
                    <img src={user?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(user?.nombre || 'U')} alt="Avatar" />
                  </div>
                  <IonCardHeader>
                    <IonCardTitle className="profile-name">{user?.nombre || 'Usuario'}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonText className="profile-email">{user?.email}</IonText>
                    <div className="profile-info">
                      <div className="profile-row">
                        <span className="profile-label">Teléfono:</span>
                        <span>{user?.telefono || 'No registrado'}</span>
                      </div>
                      <div className="profile-row">
                        <span className="profile-label">Fecha de registro:</span>
                        <span>{user?.fecha_registro || '-'}</span>
                      </div>
                      <div className="profile-row">
                        <span className="profile-label">Tipo de usuario:</span>
                        <span>{user?.tipo === 'administrador' ? 'Administrador' : 'Cliente'}</span>
                      </div>
                      <div className="profile-row">
                        <span className="profile-label">Estado de cuenta:</span>
                        <span>{user?.activo === false ? 'Inactivo' : 'Activo'}</span>
                      </div>
                      {user?.tipo !== 'administrador' && user?.direccion && (
                        <div className="profile-row">
                          <span className="profile-label">Dirección:</span>
                          <span>{user.direccion}</span>
                        </div>
                      )}
                      {user?.tipo === 'administrador' && (
                        <>
                          <div className="profile-row">
                            <span className="profile-label">Nivel de acceso:</span>
                            <span>{user.nivel_acceso || 'básico'}</span>
                          </div>
                          <div className="profile-row">
                            <span className="profile-label">Departamento:</span>
                            <span>{user.departamento || '-'}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="profile-actions">
                      <IonButton className="edit-btn">Editar Perfil</IonButton>
                      <IonButton className="logout-btn" fill="outline" onClick={handleLogout}>Cerrar Sesión</IonButton>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="8" sizeLg="8">
                <div className="profile-cart">
                  <h3 className="cart-title">Carrito de compras</h3>
                  {cart.length === 0 ? (
                    <p className="cart-empty">Tu carrito está vacío.</p>
                  ) : (
                    <>
                      <IonList className="cart-list">
                        {cart.map((item) => (
                          <IonItem key={item.id} className="cart-item">
                            <img src={item.imagen} alt={item.nombre} className="cart-item-img" />
                            <IonLabel className="cart-item-info">
                              <div className="cart-item-name">{item.nombre}</div>
                              <div className="cart-item-qty">Cantidad: {item.cantidad}</div>
                            </IonLabel>
                            <IonText className="cart-item-price">${(item.precio * item.cantidad).toFixed(2)}</IonText>
                          </IonItem>
                        ))}
                      </IonList>
                      <div className="cart-total-row">
                        <span className="cart-total-label">Total:</span>
                        <span className="cart-total-value">${cartTotal.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
}