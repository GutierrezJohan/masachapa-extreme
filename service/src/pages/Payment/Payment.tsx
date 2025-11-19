import React, { useMemo, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
  IonList,
  IonButton,
  IonRadioGroup,
  IonRadio,
  IonToast,
  IonSpinner
} from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import './Payment.css';

interface LocationState {
  shipping?: { nombre: string; email: string; telefono?: string; direccion: string; notas?: string };
  subtotal?: number;
}

const Payment: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const [method, setMethod] = useState<'card' | 'cod' | 'paypal'>('card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{open:boolean; msg:string; color:'success'|'danger'}>({open:false,msg:'',color:'success'});

  const subtotal = location.state?.subtotal ?? 0;
  const shipping = location.state?.shipping;

  const cardValid = useMemo(() => {
    if (method !== 'card') return true;
    const num = cardNumber.replace(/\s+/g,'');
    const exp = cardExp.trim();
    const cvv = cardCvv.trim();
    return cardName.trim().length>2 && /^\d{13,19}$/.test(num) && /^\d{2}\/\d{2}$/.test(exp) && /^\d{3,4}$/.test(cvv);
  }, [method, cardName, cardNumber, cardExp, cardCvv]);

  const pay = async () => {
    if (!shipping) {
      setToast({open:true, msg:'Faltan datos de envío', color:'danger'});
      history.replace('/checkout');
      return;
    }
    if (!cardValid) {
      setToast({open:true, msg:'Datos de tarjeta inválidos', color:'danger'});
      return;
    }
    setProcessing(true);
    try {
      // Simulación de procesamiento
      await new Promise(r => setTimeout(r, 1200));
      const orderId = 'ORD-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      // Limpiar carrito
      localStorage.removeItem('cart');
      history.replace('/checkout/success', { orderId, subtotal, shipping });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/checkout" />
          </IonButtons>
          <IonTitle>Pago</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="payment-container">
          <IonRadioGroup value={method} onIonChange={e => setMethod(e.detail.value)}>
            <div className={`method-card ${method==='card'?'active':''}`}>
              <IonItem lines="none">
                <IonLabel>Tarjeta de crédito/débito</IonLabel>
                <IonRadio slot="end" value="card" />
              </IonItem>
              {method==='card' && (
                <div style={{ padding: 12 }}>
                  <IonList>
                    <IonItem>
                      <IonLabel position="stacked">Nombre en la tarjeta</IonLabel>
                      <IonInput value={cardName} onIonChange={e=>setCardName(e.detail.value || '')} />
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Número</IonLabel>
                      <IonInput inputmode="numeric" value={cardNumber} onIonChange={e=>setCardNumber(e.detail.value || '')} />
                    </IonItem>
                    <div className="inline-fields">
                      <IonItem>
                        <IonLabel position="stacked">Expiración (MM/AA)</IonLabel>
                        <IonInput inputmode="numeric" value={cardExp} onIonChange={e=>setCardExp(e.detail.value || '')} />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="stacked">CVV</IonLabel>
                        <IonInput inputmode="numeric" value={cardCvv} onIonChange={e=>setCardCvv(e.detail.value || '')} />
                      </IonItem>
                    </div>
                  </IonList>
                </div>
              )}
            </div>

            <div className={`method-card ${method==='paypal'?'active':''}`}>
              <IonItem lines="none">
                <IonLabel>PayPal (simulado)</IonLabel>
                <IonRadio slot="end" value="paypal" />
              </IonItem>
            </div>

            <div className={`method-card ${method==='cod'?'active':''}`}>
              <IonItem lines="none">
                <IonLabel>Pago contra entrega</IonLabel>
                <IonRadio slot="end" value="cod" />
              </IonItem>
            </div>
          </IonRadioGroup>

          <div style={{ marginTop: 16 }}>
            <IonButton expand="block" onClick={pay} disabled={processing || (method==='card' && !cardValid)}>
              {processing ? <IonSpinner name="crescent" /> : `Pagar ${subtotal ? `$${subtotal.toFixed(2)}` : ''}`}
            </IonButton>
          </div>
        </div>
        <IonToast isOpen={toast.open} message={toast.msg} duration={1200} color={toast.color} onDidDismiss={()=>setToast({...toast, open:false})} />
      </IonContent>
    </IonPage>
  );
};

export default Payment;
