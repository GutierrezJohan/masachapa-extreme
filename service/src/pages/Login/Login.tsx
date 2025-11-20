import React, { useMemo, useState } from 'react';
import { IonPage, IonContent, IonInput, IonButton, IonItem, IonLabel, IonIcon, IonToast } from '@ionic/react';
import { personOutline, lockClosedOutline, logInOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './Login.css';
import { syncAfterLogin } from '../../services/CartService';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const history = useHistory();

  const API_URL = (import.meta as any).env.VITE_API_URL as string | undefined;

  const isValidEmail = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const isValidPassword = useMemo(() => password.length >= 6, [password]);
  const canSubmit = isValidEmail && isValidPassword && !loading;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!API_URL) {
      setError('Configuración inválida: falta VITE_API_URL');
      setShowToast(true);
      return;
    }
    if (!canSubmit) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        const message = data?.error || data?.message || 'Credenciales incorrectas';
        throw new Error(message);
      }

      const { token, user } = data || {};
      if (!token || !user) {
        throw new Error('Respuesta inválida del servidor');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Sincronizar carrito invitado -> servidor antes de redirigir
      try { await syncAfterLogin(); } catch {}

      setShowToast(true);
      setTimeout(() => { history.push('/profile'); }, 300);
    } catch (err: any) {
      setError(err?.message || 'No se pudo iniciar sesión');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      {/* IonContent solo maneja el fondo y fullscreen */}
      <IonContent className="login-content" fullscreen>
        {/* Nuevo wrapper para centrado */}
        <div className="login-wrapper">
          <div className="login-container">
            <h1 className="login-title">Machapa Extreme</h1>
            <h2 className="login-subtitle">Iniciar Sesión</h2>
            <form className="login-form" onSubmit={handleLogin}>
              <IonItem className="login-item">
                <IonIcon icon={personOutline} slot="start" />
                <IonInput
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onIonChange={e => setEmail(e.detail.value!)}
                  required
                  className="login-input"
                />
              </IonItem>
              <IonItem className="login-item">
                <IonIcon icon={lockClosedOutline} slot="start" />
                <IonInput
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onIonChange={e => setPassword(e.detail.value!)}
                  required
                  className="login-input"
                />
              </IonItem>
              {(!isValidEmail || !isValidPassword) && (
                <div className="login-error">
                  {!isValidEmail ? 'Correo inválido. ' : ''}
                  {!isValidPassword ? 'La contraseña debe tener al menos 6 caracteres.' : ''}
                </div>
              )}
              {error && <div className="login-error">{error}</div>}
              <IonButton type="submit" expand="block" className="login-btn" disabled={!canSubmit}>
                <IonIcon icon={logInOutline} slot="start" />
                {loading ? 'Ingresando...' : 'Ingresar'}
              </IonButton>
            </form>
            <div className="login-links">
              <span>¿No tienes cuenta?{' '}
                <a href="/register" className="register-link">Regístrate aquí</a>
              </span>
            </div>
          </div>
        </div>
        <IonToast
          isOpen={showToast}
          message={error ? error : 'Inicio de sesión exitoso'}
          duration={1500}
          color={error ? 'danger' : 'success'}
          onDidDismiss={() => setShowToast(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
