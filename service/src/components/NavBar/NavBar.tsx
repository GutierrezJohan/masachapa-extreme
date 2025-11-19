import React, { useState, useEffect } from 'react';
import {
  IonHeader,
  IonToolbar,
  IonSearchbar,
  IonButton,
  IonIcon,
  IonBadge,
} from '@ionic/react';
import { cartOutline, personOutline, searchOutline } from 'ionicons/icons';
import './NavBar.css';
import { useHistory } from 'react-router-dom';

type NavBarProps = {
  title?: string;
  query: string;
  onQueryChange: (value: string) => void;
  cartCount?: number;
  onCartClick?: () => void;
  searchPlaceholder?: string;
};

const NavBar: React.FC<NavBarProps> = ({
  title = 'Machapa Extreme',
  query,
  onQueryChange,
  cartCount = 0,
  onCartClick,
  searchPlaceholder = 'Buscar por pieza, modelo, año...',
}) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <IonHeader className={`main-header ${scrolled ? 'scrolled' : ''}`}>
        <IonToolbar className="navbar-toolbar">
          <div className="navbar-container">
            <div className="navbar-left">
              <div 
                className="navbar-logo" 
                onClick={() => history.push('/')}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && history.push('/')}
                aria-label="Ir a inicio"
              >
                <div className="logo-icon">
                  <span className="logo-initials">ME</span>
                </div>
                <span className="logo-text">{title}</span>
              </div>
            </div>

            <div className="navbar-center">
              <div className="desktop-search">
                <IonSearchbar
                  value={query}
                  onIonChange={(e) => onQueryChange(e.detail.value || '')}
                  placeholder={searchPlaceholder}
                  animated
                  className="main-search"
                >
                </IonSearchbar>
              </div>
            </div>

            <div className="navbar-right">
              <IonButton 
                fill="clear" 
                className="navbar-action-btn user-btn"
                aria-label="Mi cuenta"
                onClick={() => history.push('/profile')}
              >
                <IonIcon icon={personOutline} />
              </IonButton>
              
              <IonButton 
                fill="clear" 
                className="navbar-action-btn cart-btn"
                onClick={onCartClick}
                aria-label="Carrito de compras"
              >
                <IonIcon icon={cartOutline} />
                {cartCount > 0 && (
                  <IonBadge className="cart-badge">
                    {cartCount}
                  </IonBadge>
                )}
              </IonButton>
              
              <div className="mobile-search-toggle">
                <IonButton 
                  fill="clear" 
                  className="navbar-action-btn"
                  onClick={() => setShowMobileSearch(!showMobileSearch)}
                  aria-label={showMobileSearch ? "Cerrar búsqueda" : "Abrir búsqueda"}
                >
                  <IonIcon icon={searchOutline} />
                </IonButton>
              </div>
            </div>
          </div>
        </IonToolbar>

        {showMobileSearch && (
          <div className="mobile-search-container">
            <IonSearchbar
              value={query}
              onIonChange={(e) => onQueryChange(e.detail.value || '')}
              placeholder="Buscar productos..."
              animated
              className="mobile-search"
            >
              <IonIcon slot="start" icon={searchOutline} />
            </IonSearchbar>
          </div>
        )}
      </IonHeader>
    </>
  );
};

export default NavBar;