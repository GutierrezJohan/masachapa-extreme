import React from 'react';
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
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonToast,
} from '@ionic/react';
import { trashOutline } from 'ionicons/icons';
import NavBar from '../../components/NavBar/NavBar';
import { getCart, removeFromCart, updateQuantity, countItems, onCartUpdated } from '../../services/CartService';
import { useHistory } from 'react-router-dom';
import './Cart.css';

const CartPage: React.FC = () => {
  const history = useHistory();
  const [items, setItems] = React.useState(getCart());
  const [toast, setToast] = React.useState<{open:boolean; msg:string; color:'success'|'danger'|'warning'}>({open:false,msg:'',color:'success'});

  React.useEffect(() => {
    const off = onCartUpdated((e) => setItems(e.detail.items));
    return off;
  }, []);

  const subtotal = React.useMemo(() => items.reduce((s,i)=> s + (i.precio||0)*(i.cantidad||0), 0), [items]);

  return (
    <IonPage>
      <NavBar title="Carrito" query="" onQueryChange={()=>{}} cartCount={countItems()} onCartClick={() => history.push('/cart')} />
      <IonContent fullscreen className="cart-page-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonBackButton defaultHref="/home" /></IonButtons>
            <IonTitle>Carrito de Compras</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="cart-page-container">
          {items.length === 0 ? (
            <div className="cart-empty">
              <h3>Tu carrito está vacío</h3>
              <p>Explora productos y añádelos al carrito.</p>
              <IonButton onClick={() => history.push('/')}>Explorar productos</IonButton>
            </div>
          ) : (
            <>
              <IonList className="cart-list">
                {items.map(it => (
                  <IonItem key={it.id} className="cart-row" lines="full">
                    <div className="cart-img">
                      {it.imagen ? <img src={it.imagen} alt={it.nombre} /> : <div className="img-placeholder" />}
                    </div>
                    <IonLabel>
                      <h2>{it.nombre}</h2>
                      <IonText color="medium">${it.precio.toFixed(2)}</IonText>
                    </IonLabel>
                    <div className="qty-box">
                      <IonButton fill="clear" size="small" onClick={() => setItems(updateQuantity(it.id, -1))}>-</IonButton>
                      <span className="qty">{it.cantidad}</span>
                      <IonButton fill="clear" size="small" onClick={() => setItems(updateQuantity(it.id, 1))}>+</IonButton>
                    </div>
                    <IonButton fill="clear" color="danger" onClick={() => setItems(removeFromCart(it.id))}>
                      <IonIcon icon={trashOutline} />
                    </IonButton>
                  </IonItem>
                ))}
              </IonList>

              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>${subtotal.toFixed(2)}</strong>
                </div>
                <IonButton expand="block" onClick={() => history.push('/checkout')}>
                  Proceder al pago
                </IonButton>
              </div>
            </>
          )}
        </div>
        <IonToast isOpen={toast.open} onDidDismiss={()=>setToast({...toast,open:false})} message={toast.msg} color={toast.color} duration={1200} />
      </IonContent>
    </IonPage>
  );
};

export default CartPage;
