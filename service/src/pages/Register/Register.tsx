import React, { useState } from 'react';
import { IonPage, IonContent, IonInput, IonButton, IonItem, IonIcon, IonTextarea, IonToast } from '@ionic/react';
import { personAddOutline, mailOutline, lockClosedOutline, callOutline, homeOutline } from 'ionicons/icons';
import './Register.css';
import { useHistory } from 'react-router-dom';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning' | 'primary'>('primary');
  const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
  const history = useHistory();

  const isValidEmail = (val: string) => /.+@.+\..+/.test(val);
  const isFormValid = (
    nombre.trim().length > 0 &&
    isValidEmail(email) &&
    password.length >= 8 &&
    password === confirmPassword &&
    direccion.trim().length > 0
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowToast(false);
    try {
      if (!email || !password || !nombre) {
        setLoading(false);
        setToastMessage('Completa los campos obligatorios (nombre, email, contraseña)');
        setToastColor('danger');
        setShowToast(true);
        return;
      }

      if (!isValidEmail(email)) {
        setLoading(false);
        setToastMessage('Correo electrónico inválido');
        setToastColor('danger');
        setShowToast(true);
        return;
      }

      if (password.length < 8) {
        setLoading(false);
        setToastMessage('La contraseña debe tener al menos 8 caracteres');
        setToastColor('danger');
        setShowToast(true);
        return;
      }

      if (password !== confirmPassword) {
        setLoading(false);
        setToastMessage('Las contraseñas no coinciden');
        setToastColor('danger');
        setShowToast(true);
        return;
      }

      // Dirección requerida (registro por defecto como cliente)
      if (!direccion) {
        setLoading(false);
        setToastMessage('La dirección es obligatoria');
        setToastColor('danger');
        setShowToast(true);
        return;
      }

      const payload: any = {
        nombre,
        email,
        password,
        // tipo se omite; backend usa 'cliente' por defecto
      };
      if (telefono) payload.telefono = telefono;
      payload.direccion = direccion;

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setToastMessage(data?.error || 'No se pudo registrar');
        setToastColor('danger');
        setShowToast(true);
        return;
      }

      setToastMessage('¡Registro exitoso!');
      setToastColor('success');
      setShowToast(true);

      // Auto login después del registro
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const loginData = await loginRes.json();

      if (loginRes.ok && loginData?.token) {
        try {
          localStorage.setItem('token', loginData.token);
          if (loginData.user) localStorage.setItem('user', JSON.stringify(loginData.user));
        } catch {}
        history.push('/profile');
      } else {
        // Si el login automático falla, al menos mostrar éxito del registro
        setToastMessage('¡Registro exitoso! Ahora inicia sesión.');
        setToastColor('success');
        setShowToast(true);
      }
    } catch (err: any) {
      setLoading(false);
      setToastMessage('Error de conexión con el servidor');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      {/* IonContent solo maneja el fondo */}
      <IonContent className="register-content" fullscreen>
        {/* Nuevo wrapper para centrado */}
        <div className="register-wrapper">
          <div className="register-container">
            <h1 className="register-title">Machapa Extreme</h1>
            <h2 className="register-subtitle">Crear Cuenta</h2>
            <form className="register-form" onSubmit={handleRegister}>
              <IonItem className="register-item">
                <IonIcon icon={personAddOutline} slot="start" />
                <IonInput
                  type="text"
                  placeholder="Nombre completo"
                  value={nombre}
                  onIonChange={e => setNombre(e.detail.value || '')}
                  required
                  className="register-input"
                />
              </IonItem>
              <IonItem className="register-item">
                <IonIcon icon={mailOutline} slot="start" />
                <IonInput
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onIonChange={e => setEmail(e.detail.value || '')}
                  required
                  className="register-input"
                />
              </IonItem>
              <IonItem className="register-item">
                <IonIcon icon={callOutline} slot="start" />
                <IonInput
                  type="tel"
                  placeholder="Teléfono (opcional)"
                  value={telefono}
                  onIonChange={e => setTelefono(e.detail.value || '')}
                  className="register-input"
                />
              </IonItem>
              <IonItem className="register-item">
                <IonIcon icon={lockClosedOutline} slot="start" />
                <IonInput
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onIonChange={e => setPassword(e.detail.value || '')}
                  required
                  className="register-input"
                />
              </IonItem>
              <IonItem className="register-item">
                <IonIcon icon={lockClosedOutline} slot="start" />
                <IonInput
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onIonChange={e => setConfirmPassword(e.detail.value || '')}
                  required
                  className="register-input"
                />
              </IonItem>
              <IonItem className="register-item">
                <IonIcon icon={homeOutline} slot="start" />
                <IonTextarea
                  placeholder="Dirección de envío"
                  value={direccion}
                  onIonChange={e => setDireccion(e.detail.value || '')}
                  autoGrow
                  className="register-input"
                />
              </IonItem>
              <IonButton type="submit" expand="block" className="register-btn" disabled={loading || !isFormValid}>
                {loading ? 'Registrando...' : 'Registrarse'}
              </IonButton>
            </form>
          </div>
        </div>
        <IonToast
          isOpen={showToast}
          message={toastMessage}
          color={toastColor}
          duration={2500}
          position="top"
          onDidDismiss={() => setShowToast(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Register;