import React, { useEffect, useMemo, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonToast
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Checkout.css';
import { getCart as cartGet, refreshCartFromServer } from '../../services/CartService';
import { apiCheckout } from '../../services/OrderApiService';

type CartItem = { id: number | string; nombre: string; precio: number; cantidad: number; imagen?: string };

const Checkout: React.FC = () => {
  const history = useHistory();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [notas, setNotas] = useState('');
  const [toast, setToast] = useState<{open: boolean; msg: string; color: 'success' | 'danger'}>({open:false,msg:'',color:'success'});

  useEffect(() => {
    try {
      const list = cartGet();
      setCart(list);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        setNombre(u?.nombre || '');
        setEmail(u?.email || '');
        setTelefono(u?.telefono || '');
        setDireccion(u?.direccion || '');
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (cart.length === 0) {
      setToast({open:true, msg: 'Tu carrito está vacío', color: 'danger'});
      // Do not redirect immediately; give user a second to react
      const t = setTimeout(() => history.push('/'), 1200);
      return () => clearTimeout(t);
    }
  }, [cart, history, loading]);

  const subtotal = useMemo(() => cart.reduce((s, i) => s + (i.precio || 0) * (i.cantidad || 0), 0), [cart]);

  const validEmail = useMemo(() => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email), [email]);
  const canContinue = useMemo(() => nombre.trim().length>1 && validEmail && direccion.trim().length>3, [nombre, validEmail, direccion]);

  const doCheckout = async () => {
    if (!canContinue) {
      setToast({open:true, msg:'Completa los datos requeridos', color:'danger'});
      return;
    }
    try {
      setLoading(true);
      const order = await apiCheckout(direccion, 'pendiente');
      await refreshCartFromServer();
      setToast({open:true, msg:'Orden creada correctamente', color:'success'});
      // Navegar a página de éxito con resumen
      history.push('/checkout/success', { order });
    } catch (e:any) {
      setToast({open:true, msg: e.message || 'Error en checkout', color:'danger'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" />
          </IonButtons>
          <IonTitle>Checkout</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="checkout-content">
        <div className="checkout-container">
          <div className="checkout-grid">
            <IonCard className="section-card">
              <IonCardHeader className="section-header">
                <IonCardTitle>Datos de envío</IonCardTitle>
              </IonCardHeader>
              <IonCardContent className="section-body">
                <IonList>
                  <IonItem>
                    <IonLabel position="stacked">Nombre completo</IonLabel>
                    <IonInput value={nombre} onIonChange={e=>setNombre(e.detail.value || '')} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Correo electrónico</IonLabel>
                    <IonInput type="email" value={email} onIonChange={e=>setEmail(e.detail.value || '')} />
                  </IonItem>
                  {!validEmail && email.length>0 && (<div className="field-error">Correo inválido</div>)}
                  <IonItem>
                    <IonLabel position="stacked">Teléfono</IonLabel>
                    <IonInput value={telefono} onIonChange={e=>setTelefono(e.detail.value || '')} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Dirección</IonLabel>
                    <IonTextarea value={direccion} onIonChange={e=>setDireccion(e.detail.value || '')} autoGrow />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Notas (opcional)</IonLabel>
                    <IonTextarea value={notas} onIonChange={e=>setNotas(e.detail.value || '')} autoGrow />
                  </IonItem>
                </IonList>
                <IonButton expand="block" onClick={doCheckout} disabled={!canContinue || loading}>{loading ? 'Procesando...' : 'Finalizar compra'}</IonButton>
              </IonCardContent>
            </IonCard>

            <IonCard className="section-card">
              <IonCardHeader className="section-header">
                <IonCardTitle>Resumen</IonCardTitle>
              </IonCardHeader>
              <IonCardContent className="section-body">
                {cart.map(i => (
                  <div className="summary-row" key={i.id}>
                    <span>{i.nombre} × {i.cantidad}</span>
                    <span>${(i.precio * i.cantidad).toFixed(2)}</span>
                  </div>
                ))}
                <hr />
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Envío</span>
                  <span>Gratis</span>
                </div>
                <div className="summary-row summary-total">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </div>
        <IonToast isOpen={toast.open} message={toast.msg} duration={1200} color={toast.color} onDidDismiss={()=>setToast({...toast,open:false})} />
      </IonContent>
    </IonPage>
  );
};

export default Checkout;
