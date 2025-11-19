import React from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonImg } from '@ionic/react';
import './ProductCard.css';

export type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  badge?: string;
};

type Props = {
  product: Product;
  onClick?: (p: Product) => void;
  onAdd?: (p: Product) => void;
};

import { useHistory } from 'react-router-dom';

const ProductCard: React.FC<Props> = ({ product, onClick, onAdd }) => {
  const history = useHistory();
  const goDetail = () => {
    if (onClick) return onClick(product);
    history.push({ pathname: `/product/${product.id}`, state: { product } });
  };
  return (
    <IonCard className="product-card" onClick={goDetail}>
      <div className="card-media">
        <IonImg src={product.image || '/images/product-default.png'} alt={product.name} className="product-image" />
        {product.badge && <span className="pill">{product.badge}</span>}
      </div>
      <IonCardHeader>
        <IonCardTitle>{product.name}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div className="card-meta">
          <span className="price">${product.price.toFixed(2)}</span>
          <IonButton size="small" onClick={(e) => { e.stopPropagation(); onAdd && onAdd(product); }}>Añadir</IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default ProductCard;
