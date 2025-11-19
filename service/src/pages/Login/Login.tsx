import React, { useState } from 'react';
import { IonPage, IonContent, IonInput, IonButton, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { personOutline, lockClosedOutline, logInOutline } from 'ionicons/icons';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Simulación de login
    setTimeout(() => {
      setLoading(false);
      if (email === 'demo@demo.com' && password === '123456') {
        // Redirigir o mostrar éxito
        alert('¡Bienvenido!');
      } else {
        setError('Credenciales incorrectas');
      }
    }, 1200);
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
              {error && <div className="login-error">{error}</div>}
              <IonButton type="submit" expand="block" className="login-btn" disabled={loading}>
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
      </IonContent>
    </IonPage>
  );
};

export default Login;
