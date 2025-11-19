import React, { useMemo } from 'react';
import { IonContent, IonHeader, IonPage, IonToolbar, IonTitle, IonButtons, IonBackButton, IonGrid, IonRow, IonCol } from '@ionic/react';
import { useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import ProductCard, { Product } from '../../components/ProductCard/ProductCard';
import './Category.css';

// Temporary sample products - will use same SAMPLE_PRODUCTS shape as Home
const SAMPLE_PRODUCTS: Product[] = [
  { id: '1', name: 'Filtro de aceite', price: 8.99, image: '/images/product-default.png', },
  { id: '2', name: 'Pastillas de freno', price: 29.9, image: '/images/product-default.png', },
  { id: '3', name: 'Batería 12V 65Ah', price: 119.0, image: '/images/product-default.png', },
  { id: '4', name: 'Bujías Iridium (x4)', price: 39.5, image: '/images/product-default.png', },
];

const Category: React.FC = () => {
  const { name } = useParams<{ name: string }>();

  const products = useMemo(() => {
    // In a real app we'd fetch products for the category. For now filter by simple heuristics.
    if (!name) return SAMPLE_PRODUCTS;
    return SAMPLE_PRODUCTS.filter(p => p.name.toLowerCase().includes(name.toLowerCase()) || true);
  }, [name]);

  return (
    <IonPage>
      <NavBar title={`Categoria: ${name || 'Todos'}`} query={''} onQueryChange={() => {}} cartCount={0} onCartClick={() => {}} />
      <IonContent className="home-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/" />
            </IonButtons>
            <IonTitle>Categoria: {name}</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="container">
          <h2 className="category-heading">{name}</h2>

          <IonGrid>
            <IonRow>
              {products.map(p => (
                <IonCol size="12" sizeSm="6" sizeMd="4" key={p.id}>
                  <ProductCard product={p} onAdd={() => {}} onClick={() => {}} />
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Category;
