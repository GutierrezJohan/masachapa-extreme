import React from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, homeOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './Success.css';

interface LocationState { orderId?: string; subtotal?: number; shipping?: { nombre: string; email: string; direccion: string } }

const Success: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const orderId = location.state?.orderId || 'ORD-XXXXXX';
  const subtotal = location.state?.subtotal || 0;
  const shipping = location.state?.shipping;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Orden confirmada</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="success-container">
          <div className="success-card">
            <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: 64, color: '#22c55e' }} />
            <h2>¡Gracias por tu compra!</h2>
            <div className="order-id">Número de orden: {orderId}</div>
            <p>Total pagado: ${subtotal.toFixed(2)}</p>
            {shipping && (
              <p>Enviaremos tu pedido a: <strong>{shipping.direccion}</strong></p>
            )}
            <div style={{ marginTop: 16 }}>
              <IonButton onClick={() => history.push('/')}> 
                <IonIcon icon={homeOutline} slot="start" />
                Volver al inicio
              </IonButton>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Success;
