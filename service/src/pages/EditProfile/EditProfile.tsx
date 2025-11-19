import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonInput,
  IonLabel,
  IonList,
  IonToast,
  IonSpinner,
  IonText,
  IonFooter,
  IonGrid,
  IonRow,
  IonCol,
  IonModal,
  IonCardContent,
  IonCard
} from '@ionic/react';
import { 
  arrowBackOutline, 
  saveOutline, 
  logOutOutline, 
  cameraOutline,
  closeOutline,
   checkmarkCircleOutline,
  personOutline,
  callOutline,
  homeOutline,
  lockClosedOutline,
  shieldCheckmarkOutline,
  locationOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './EditProfile.css';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

interface UsuarioEdit {
  nombre?: string;
  telefono?: string | null;
  direccion?: string;
  nivel_acceso?: string;
  departamento?: string | null;
  tipo?: 'cliente' | 'administrador';
  avatar?: string | null;
  email?: string;
}

const EditProfile: React.FC = () => {
  const history = useHistory();
  const [original, setOriginal] = useState<UsuarioEdit | null>(null);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [nivelAcceso, setNivelAcceso] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [showToast, setShowToast] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      history.push('/login');
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setOriginal(parsed);
      setNombre(parsed.nombre || '');
      setTelefono(parsed.telefono || '');
      setDireccion(parsed.direccion || '');
      setNivelAcceso(parsed.nivel_acceso || '');
      setDepartamento(parsed.departamento || '');
      setAvatarPreview(parsed.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(parsed.nombre || 'U')}`);
    } catch {
      history.push('/login');
    }
  }, [history]);

  const validNombre = useMemo(() => nombre.trim().length >= 2, [nombre]);
  const validTelefono = useMemo(() => telefono === '' || /^\+?[0-9\s-]{6,}$/.test(telefono), [telefono]);
  const validPassword = useMemo(() => password === '' || password.length >= 8, [password]);
  const passwordsMatch = useMemo(() => password === confirmPassword, [password, confirmPassword]);

  const hasChanges = useMemo(() => {
    if (!original) return false;
    return (
      nombre !== original.nombre ||
      telefono !== (original.telefono || '') ||
      direccion !== (original.direccion || '') ||
      nivelAcceso !== (original.nivel_acceso || '') ||
      departamento !== (original.departamento || '') ||
      password.length > 0
    );
  }, [original, nombre, telefono, direccion, nivelAcceso, departamento, password]);

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!hasChanges) return false;
    if (!validNombre || !validTelefono) return false;
    if (password.length > 0 && (!validPassword || !passwordsMatch)) return false;
    return true;
  }, [loading, hasChanges, validNombre, validTelefono, validPassword, passwordsMatch, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !original) return;
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmation(false);
    const token = localStorage.getItem('token');
    if (!token) {
      setToastMsg('Sesión no válida');
      setToastColor('danger');
      setShowToast(true);
      history.push('/login');
      return;
    }
    setLoading(true);
    try {
      const body: any = {};
      if (nombre !== original?.nombre) body.nombre = nombre.trim();
      if (telefono !== (original?.telefono || '')) body.telefono = telefono.trim();
      if (original?.tipo === 'cliente' && direccion !== (original?.direccion || '')) body.direccion = direccion.trim();
      if (original?.tipo === 'administrador') {
        if (nivelAcceso !== (original?.nivel_acceso || '')) body.nivel_acceso = nivelAcceso.trim();
        if (departamento !== (original?.departamento || '')) body.departamento = departamento.trim();
      }
      if (password.length > 0) body.password = password;

      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Error al actualizar');
      }
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      setToastMsg('Perfil actualizado correctamente');
      setToastColor('success');
      setShowToast(true);
      setTimeout(() => history.push('/profile'), 1200);
    } catch (err: any) {
      setToastMsg(err.message || 'No se pudo actualizar el perfil');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    history.push('/login');
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setToastMsg('Por favor, selecciona un archivo de imagen válido');
      setToastColor('danger');
      setShowToast(true);
      return;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToastMsg('La imagen no puede superar los 5MB');
      setToastColor('danger');
      setShowToast(true);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    const token = localStorage.getItem('token');
    if (!token) {
      setToastMsg('Sesión no válida');
      setToastColor('danger');
      setShowToast(true);
      history.push('/login');
      return;
    }
    
    setUploading(true);
    try {
      const form = new FormData();
      form.append('avatar', file);
      const res = await fetch(`${API_URL}/api/auth/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'No se pudo subir el avatar');
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setOriginal(data.user);
      }
      if (data?.avatar) setAvatarPreview(data.avatar);
      setToastMsg('Avatar actualizado correctamente');
      setToastColor('success');
      setShowToast(true);
    } catch (err: any) {
      setToastMsg(err.message || 'Error al subir avatar');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setUploading(false);
      // Limpiar el input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAvatar = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setToastMsg('Sesión no válida');
      setToastColor('danger');
      setShowToast(true);
      history.push('/login');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/api/auth/avatar`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'No se pudo eliminar el avatar');
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setOriginal(data.user);
      }
      setAvatarPreview(null);
      setToastMsg('Avatar eliminado correctamente');
      setToastColor('success');
      setShowToast(true);
    } catch (err: any) {
      setToastMsg(err.message || 'Error al eliminar avatar');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('¿Estás seguro de que quieres descartar los cambios?')) {
        history.goBack();
      }
    } else {
      history.goBack();
    }
  };

  return (
    <IonPage className="edit-profile-page">
      <IonHeader className="edit-profile-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton 
              onClick={handleCancel} 
              aria-label="Volver"
              className="back-btn"
            >
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Editar Perfil</IonTitle>
          <IonButtons slot="end">
            <IonButton 
              onClick={handleLogout} 
              aria-label="Cerrar sesión"
              className="logout-btn"
            >
              <IonIcon icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen className="edit-profile-content">
        <div className="profile-container">
          <div className="avatar-section">
            <div className="avatar-container" onClick={() => fileInputRef.current?.click()}>
              <div className="avatar-border">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar del usuario" 
                    className="avatar-image"
                    loading="lazy"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    <IonIcon icon={personOutline} className="placeholder-icon" />
                  </div>
                )}
              </div>
              <div className="avatar-overlay">
                <IonIcon icon={cameraOutline} className="camera-icon" />
              </div>
            </div>
            <div className="avatar-actions">
              <IonButton 
                className="action-btn remove-avatar-btn" 
                fill="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  removeAvatar();
                }}
                disabled={!avatarPreview}
              >
                Eliminar avatar
              </IonButton>
              <input 
                ref={fileInputRef}
                id="avatar-input" 
                type="file" 
                accept="image/*" 
                hidden 
                onChange={onAvatarChange} 
              />
            </div>
          </div>

                    <form onSubmit={handleSubmit} className="edit-profile-form" noValidate>
            <IonGrid className="form-grid">
              <IonRow>
                {/* Columna izquierda - Información básica */}
                <IonCol size="12" sizeMd="6">
                  <IonCard className="form-card">
                    <IonCardContent>
                      <div className="form-section">
                        <h3 className="section-title">
                          <IonIcon icon={personOutline} className="section-icon" />
                          Información Personal
                        </h3>
                        <div className="section-content">
                          <IonItem className={`form-item ${!validNombre && nombre.length > 0 ? 'error' : ''}`}>
                            <IonLabel position="stacked">
                              <div className="label-container">
                                <span>Nombre completo</span>
                                <span className="required">*</span>
                              </div>
                            </IonLabel>
                            <IonInput 
                              value={nombre} 
                              onIonChange={e => setNombre(e.detail.value || '')} 
                              placeholder="Ej: Juan Pérez"
                              required 
                              aria-required="true"
                            />
                          </IonItem>
                          {!validNombre && nombre.length > 0 && (
                            <div className="field-error">
                              <IonIcon icon={closeOutline} className="error-icon" />
                              <span>Debe tener al menos 2 caracteres</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="form-section">
                        <h3 className="section-title">
                          <IonIcon icon={callOutline} className="section-icon" />
                          Contacto
                        </h3>
                        <div className="section-content">
                          <IonItem className={`form-item ${!validTelefono && telefono.length > 0 ? 'error' : ''}`}>
                            <IonLabel position="stacked">
                              <div className="label-container">
                                <span>Teléfono</span>
                                <span className="optional">(opcional)</span>
                              </div>
                            </IonLabel>
                            <IonInput 
                              value={telefono} 
                              onIonChange={e => setTelefono(e.detail.value || '')} 
                              placeholder="Ej: +593 99 123 4567"
                            />
                          </IonItem>
                          {!validTelefono && telefono.length > 0 && (
                            <div className="field-error">
                              <IonIcon icon={closeOutline} className="error-icon" />
                              <span>Formato de teléfono inválido</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {original?.tipo === 'cliente' && (
                        <div className="form-section">
                          <h3 className="section-title">
                            <IonIcon icon={homeOutline} className="section-icon" />
                            Dirección
                          </h3>
                          <div className="section-content">
                            <IonItem className="form-item">
                              <IonLabel position="stacked">
                                <div className="label-container">
                                  <span>Dirección completa</span>
                                  <span className="optional">(opcional)</span>
                                </div>
                              </IonLabel>
                              <IonInput 
                                value={direccion} 
                                onIonChange={e => setDireccion(e.detail.value || '')} 
                                placeholder="Ej: Av. Amazonas N34-123, Quito"
                              />
                            </IonItem>
                          </div>
                        </div>
                      )}
                    </IonCardContent>
                  </IonCard>
                </IonCol>

                {/* Columna derecha - Información adicional y seguridad */}
                <IonCol size="12" sizeMd="6">
                  {original?.tipo === 'administrador' && (
                    <IonCard className="form-card">
                      <IonCardContent>
                        <div className="form-section">
                          <h3 className="section-title">
                            <IonIcon icon={shieldCheckmarkOutline} className="section-icon" />
                            Permisos de Administrador
                          </h3>
                          <div className="section-content">
                            <IonItem className="form-item">
                              <IonLabel position="stacked">
                                <div className="label-container">
                                  <span>Nivel de acceso</span>
                                </div>
                              </IonLabel>
                              <IonInput 
                                value={nivelAcceso} 
                                onIonChange={e => setNivelAcceso(e.detail.value || '')} 
                                placeholder="Ej: administrador, supervisor"
                              />
                            </IonItem>
                            <IonItem className="form-item">
                              <IonLabel position="stacked">
                                <div className="label-container">
                                  <span>Departamento</span>
                                </div>
                              </IonLabel>
                              <IonInput 
                                value={departamento} 
                                onIonChange={e => setDepartamento(e.detail.value || '')} 
                                placeholder="Ej: Ventas, Soporte Técnico"
                              />
                            </IonItem>
                          </div>
                        </div>
                      </IonCardContent>
                    </IonCard>
                  )}

                  <IonCard className="form-card">
                    <IonCardContent>
                      <div className="form-section">
                        <h3 className="section-title">
                          <IonIcon icon={lockClosedOutline} className="section-icon" />
                          Seguridad
                        </h3>
                        <div className="section-content">
                          <IonItem className={`form-item password-group-start ${!validPassword && password.length > 0 ? 'error' : ''}`}>
                            <IonLabel position="stacked">
                              <div className="label-container">
                                <span>Nueva contraseña</span>
                                <span className="optional">(opcional)</span>
                              </div>
                            </IonLabel>
                            <IonInput 
                              type="password" 
                              value={password} 
                              onIonChange={e => setPassword(e.detail.value || '')} 
                              placeholder="Mínimo 8 caracteres"
                            />
                          </IonItem>
                          {!validPassword && password.length > 0 && (
                            <div className="field-error">
                              <IonIcon icon={closeOutline} className="error-icon" />
                              <span>La contraseña debe tener al menos 8 caracteres</span>
                            </div>
                          )}

                          {password.length > 0 && (
                            <IonItem className={`form-item ${!passwordsMatch && confirmPassword.length > 0 ? 'error' : ''}`}>
                              <IonLabel position="stacked">
                                <div className="label-container">
                                  <span>Confirmar contraseña</span>
                                </div>
                              </IonLabel>
                              <IonInput 
                                type="password" 
                                value={confirmPassword} 
                                onIonChange={e => setConfirmPassword(e.detail.value || '')} 
                                placeholder="Repite tu contraseña"
                              />
                            </IonItem>
                          )}
                          {password.length > 0 && !passwordsMatch && confirmPassword.length > 0 && (
                            <div className="field-error">
                              <IonIcon icon={closeOutline} className="error-icon" />
                              <span>Las contraseñas no coinciden</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>

            <div className="form-actions">
              <IonButton 
                type="button" 
                expand="block" 
                className="cancel-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </IonButton>
              <IonButton 
                type="submit" 
                expand="block" 
                className="save-btn"
                disabled={!canSubmit}
              >
                {loading ? (
                  <>
                    <IonSpinner name="crescent" className="spinner" />
                    <span>Guardando cambios...</span>
                  </>
                ) : (
                  <>
                    <IonIcon icon={saveOutline} slot="start" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </IonButton>
            </div>
            
            {!hasChanges && (
              <div className="no-changes-message">
                <IonIcon icon={checkmarkCircleOutline} className="check-icon" />
                <p>No hay cambios pendientes para guardar</p>
              </div>
            )}
          </form>
        </div>
      </IonContent>

      <IonModal 
        isOpen={showConfirmation} 
        onDidDismiss={() => setShowConfirmation(false)}
        className="confirmation-modal"
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Confirmar Cambios</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowConfirmation(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="modal-content">
          <div className="modal-body">
            <div className="modal-icon">
              <IonIcon icon={saveOutline} />
            </div>
            <h2>¿Confirmar cambios?</h2>
            <p>Estás a punto de actualizar tu información de perfil. Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <IonButton 
                expand="block" 
                fill="outline" 
                onClick={() => setShowConfirmation(false)}
                className="modal-cancel-btn"
              >
                Cancelar
              </IonButton>
              <IonButton 
                expand="block" 
                onClick={confirmSubmit}
                className="modal-confirm-btn"
              >
                {loading ? 'Guardando...' : 'Confirmar'}
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={showToast}
        message={toastMsg}
        duration={2000}
        color={toastColor}
        position="top"
        onDidDismiss={() => setShowToast(false)}
        cssClass="custom-toast"
      />
    </IonPage>
  );
};

export default EditProfile;