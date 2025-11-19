import React, { useEffect, useMemo, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonNote,
  IonGrid,
  IonRow,
  IonCol,
  IonAlert,
  IonToast,
  IonBadge,
} from '@ionic/react';
import { addCircleOutline, trashOutline, arrowBack } from 'ionicons/icons';
import { deleteProduct, getAllProducts, Product } from '../../services/ProductService';
import { useHistory } from 'react-router-dom';
import './AdminProducts.css';

const AdminProductsList: React.FC = () => {
  const history = useHistory();
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; color?: string }>({ open: false, message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await getAllProducts();
        setProducts(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p =>
      [p.nombre, p.descripcion, p.categoria].some(v => (v || '').toLowerCase().includes(q))
    );
  }, [products, query]);

  const onDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setToast({ open: true, message: 'Producto eliminado', color: 'success' });
    } catch (e) {
      setToast({ open: true, message: 'No se pudo eliminar', color: 'danger' });
    } finally {
      setConfirmId(null);
    }
  };

  return (
    <IonPage>
      <IonHeader className="admin-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Administrar Productos</IonTitle>
          <IonButtons slot="end">
            <IonButton className="success" onClick={() => history.push('/admin/products/new')}>
              <IonIcon icon={addCircleOutline} slot="start" /> Nuevo
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="admin-content">
        <div className="admin-container">
          <div className="actions-row">
            <IonSearchbar placeholder="Buscar por nombre, categoría..." value={query} onIonInput={e => setQuery(e.detail.value || '')} />
          </div>

          {filtered.map(p => (
            <IonCard key={p.id} className="product-card">
              <IonCardHeader>
                <IonCardTitle className="product-title">
                  <span>{p.nombre}</span>
                  <IonBadge className="badge">{p.categoria || 'Sin categoría'}</IonBadge>
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonGrid>
                  <IonRow className="ion-align-items-center">
                    <IonCol size="12" sizeMd="8">
                      <IonItem lines="none">
                        <img src={p.imagen} alt={p.nombre} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, marginRight: 12 }} />
                        <IonLabel>
                          <h2>{p.nombre}</h2>
                          <p className="meta">{p.descripcion || 'Sin descripción'}</p>
                          <IonNote color="medium">#{p.id}</IonNote>
                        </IonLabel>
                      </IonItem>
                    </IonCol>
                    <IonCol size="6" sizeMd="2">
                      <IonLabel>
                        <div className="meta">Precio</div>
                        <div style={{ fontWeight: 700 }}>${'{'}p.precio.toFixed(2){'}'}</div>
                      </IonLabel>
                    </IonCol>
                    <IonCol size="6" sizeMd="2">
                      <IonLabel>
                        <div className="meta">Stock</div>
                        <div style={{ fontWeight: 700 }}>{p.stock}</div>
                      </IonLabel>
                    </IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol size="12" className="ion-text-right">
                      <IonButton color="danger" fill="outline" onClick={() => setConfirmId(p.id)}>
                        <IonIcon icon={trashOutline} slot="start" /> Eliminar
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCardContent>
            </IonCard>
          ))}

          {!loading && filtered.length === 0 && (
            <IonItem lines="none">
              <IonLabel>No hay productos.</IonLabel>
            </IonItem>
          )}
        </div>

        <IonAlert
          isOpen={confirmId !== null}
          header="Confirmar eliminación"
          message="¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer."
          buttons={[
            { text: 'Cancelar', role: 'cancel', handler: () => setConfirmId(null) },
            { text: 'Eliminar', role: 'destructive', handler: () => { if (confirmId !== null) { onDelete(confirmId); } return true; } },
          ]}
          onDidDismiss={() => setConfirmId(null)}
        />

        <IonToast isOpen={toast.open} onDidDismiss={() => setToast({ open: false, message: '' })} message={toast.message} color={toast.color as any} duration={1600} />
      </IonContent>
    </IonPage>
  );
};

export default AdminProductsList;
