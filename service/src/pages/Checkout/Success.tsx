import React from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';

const SuccessPage: React.FC = () => {
  const location = useLocation<{ order?: any }>();
  const history = useHistory();
  const order = location.state?.order;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/" /></IonButtons>
          <IonTitle>Compra Exitosa</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="success-content" fullscreen>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px' }}>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>¡Gracias por tu compra!</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {!order && <div>No hay datos de la orden.</div>}
              {order && (
                <>
                  <p><strong>Orden #{order.id}</strong></p>
                  <p>Fecha: {order.fecha || '—'}</p>
                  <p>Estado: {order.estado}</p>
                  <p>Total: ${order.total?.toFixed?.(2) || order.total}</p>
                  <hr />
                  <h3 style={{ marginTop: 16 }}>Items</h3>
                  {order.items.map((it: any) => (
                    <div key={it.id} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.9rem', padding:'4px 0' }}>
                      <span>{it.nombre} × {it.cantidad}</span>
                      <span>${(it.precio_unitario * it.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                </>
              )}
              <div style={{ marginTop: 24, display:'flex', gap:12, flexWrap:'wrap' }}>
                <IonButton onClick={() => history.push('/home')}>Seguir comprando</IonButton>
                <IonButton fill="outline" onClick={() => history.push('/profile')}>Ver perfil</IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SuccessPage;
