import React from 'react';
import CustomMap from './components/CustomMap';

function App() {
  const actualPosition = { x: 300, y: 200 }; // Exemple de position

  return (
    <div>
      <h1>PUBG GeoGuessr</h1>
      <CustomMap actualPosition={actualPosition} />
    </div>
  );
}

export default App;