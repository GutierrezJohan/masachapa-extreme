// Añadir esta función dentro del componente Home
const getCategoryDescription = (categoryName: string): string => {
  const descriptions: Record<string, string> = {
    'Motor': 'Filtros, bujías, correas y componentes esenciales para el corazón de tu vehículo',
    'Sistema de frenos': 'Pastillas, discos, tambores y sistemas de frenado para máxima seguridad',
    'Air Condition / Heating': 'Componentes de climatización para mantener el confort en cualquier clima',
    'Piezas de carrocería': 'Parachoques, panelas, espejos y elementos estructurales de carrocería',
    'Consumables': 'Aceites, líquidos de frenos, refrigerantes y otros insumos para mantenimiento',
    'Cooling system': 'Radiadores, termostatos, bombas de agua y componentes del sistema de enfriamiento',
    'Componente electrónico': 'Sensores, alternadores, baterías y sistemas eléctricos y electrónicos',
    'Partes de combustible': 'Bombas, inyectores, tanques y componentes del sistema de combustible'
  };
  
  return descriptions[categoryName] || 'Encuentra los mejores repuestos y accesorios para tu vehículo';
};