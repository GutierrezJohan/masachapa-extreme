import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol,
  IonToast,
  IonToggle,
} from '@ionic/react';
import { arrowBack, saveOutline } from 'ionicons/icons';
import { getProductById, updateProduct, Product } from '../../services/ProductService';
import { getCategories, Category } from '../../services/CategoryService';
import { useHistory, useParams } from 'react-router-dom';
import './AdminProducts.css';

interface RouteParams { id: string; }

const AdminProductEdit: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const productId = Number(id);

  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [categoria, setCategoria] = useState('');
  const [imagen, setImagen] = useState('');
  const [activo, setActivo] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; color?: string }>({ open: false, message: '' });

  const validate = () => {
    const p = Number(precio);
    const s = Number(stock);
    if (!nombre.trim()) return 'El nombre es obligatorio';
    if (isNaN(p) || p < 0) return 'Precio inválido';
    if (isNaN(s) || s < 0) return 'Stock inválido';
    if (!categoria.trim()) return 'Selecciona una categoría';
    if (!imagen.trim()) return 'La URL de imagen es obligatoria';
    try { new URL(imagen); } catch { return 'URL de imagen inválida'; }
    return '';
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const prod = await getProductById(productId);
        if (!prod) {
          setToast({ open: true, message: 'Producto no encontrado', color: 'danger' });
          return;
        }
        if (mounted) {
          setNombre(prod.nombre);
          setDescripcion(prod.descripcion);
          setPrecio(String(prod.precio));
          setStock(String(prod.stock));
          setCategoria(prod.categoria);
          setImagen(prod.imagen);
          setActivo(true); // assuming returned product is active; adjust if backend supplies flag
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [productId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setCatLoading(true);
      setCatError('');
      try {
        const list = await getCategories();
        if (mounted) setCategories(list);
      } catch (e) {
        if (mounted) setCatError('No se pudieron cargar categorías');
      } finally {
        if (mounted) setCatLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onSubmit = async () => {
    const err = validate();
    if (err) {
      setToast({ open: true, message: err, color: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      await updateProduct(productId, {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: Number(precio),
        stock: Number(stock),
        categoria: categoria.trim(),
        imagen: imagen.trim(),
        activo,
      });
      setToast({ open: true, message: 'Producto actualizado', color: 'success' });
      setTimeout(() => history.replace('/admin/products'), 400);
    } catch (e) {
      setToast({ open: true, message: 'No se pudo actualizar', color: 'danger' });
    } finally {
      setSubmitting(false);
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
          <IonTitle>Editar Producto</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onSubmit} disabled={submitting || loading} className="success">
              <IonIcon icon={saveOutline} slot="start" /> Guardar
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="admin-content">
        <div className="admin-container">
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="8">
                <IonItem className="form-item">
                  <IonLabel position="stacked">Nombre</IonLabel>
                  <IonInput value={nombre} onIonInput={e => setNombre(e.detail.value || '')} />
                </IonItem>
                <IonItem className="form-item">
                  <IonLabel position="stacked">Descripción</IonLabel>
                  <IonTextarea value={descripcion} autoGrow onIonInput={e => setDescripcion(e.detail.value || '')} />
                </IonItem>
              </IonCol>
              <IonCol size="12" sizeMd="4">
                <IonItem className="form-item">
                  <IonLabel position="stacked">Precio</IonLabel>
                  <IonInput type="number" value={precio} onIonInput={e => setPrecio(e.detail.value || '')} />
                </IonItem>
                <IonItem className="form-item">
                  <IonLabel position="stacked">Stock</IonLabel>
                  <IonInput type="number" value={stock} onIonInput={e => setStock(e.detail.value || '')} />
                </IonItem>
                <IonItem className="form-item">
                  <IonLabel position="stacked">Categoría</IonLabel>
                  <IonSelect
                    interface="popover"
                    placeholder={catLoading ? 'Cargando...' : (categories.length === 0 ? 'Sin categorías' : 'Selecciona')}
                    value={categoria}
                    onIonChange={e => setCategoria(e.detail.value)}
                    disabled={catLoading || !!catError || categories.length === 0}
                  >
                    {categories.map(c => (
                      <IonSelectOption key={c.id} value={c.nombre}>{c.nombre}</IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                {catError && (
                  <div style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '-8px', marginBottom: '12px' }}>{catError}</div>
                )}
                <IonItem className="form-item">
                  <IonLabel>Activo</IonLabel>
                  <IonToggle checked={activo} onIonChange={e => setActivo(e.detail.checked)} />
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="12">
                <IonItem className="form-item">
                  <IonLabel position="stacked">URL de Imagen</IonLabel>
                  <IonInput placeholder="https://..." value={imagen} onIonInput={e => setImagen(e.detail.value || '')} />
                </IonItem>
              </IonCol>
            </IonRow>
            {imagen && (
              <IonRow>
                <IonCol size="12" className="ion-text-center">
                  <img src={imagen} alt="preview" style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 12, boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }} />
                </IonCol>
              </IonRow>
            )}
            <IonRow>
              <IonCol size="12" className="ion-text-right">
                <IonButton onClick={onSubmit} disabled={submitting || loading} className="success">
                  <IonIcon icon={saveOutline} slot="start" /> Guardar Cambios
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
        <IonToast isOpen={toast.open} onDidDismiss={() => setToast({ open: false, message: '' })} message={toast.message} color={toast.color as any} duration={1600} />
      </IonContent>
    </IonPage>
  );
};

export default AdminProductEdit;