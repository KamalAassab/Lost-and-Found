import React from 'react';
import { staticProducts } from '@/data/staticData';

export default function DebugStaticData() {
  const isStaticDeployment = window.location.hostname === 'kamalaassab.github.io';
  
  console.log('=== DEBUG INFO ===');
  console.log('Hostname:', window.location.hostname);
  console.log('Is GitHub Pages:', isStaticDeployment);
  console.log('Static products count:', staticProducts.length);
  console.log('First product:', staticProducts[0]);
  console.log('Featured products:', staticProducts.filter(p => p.featured));
  console.log('========================');
  
  return (
    <div style={{ padding: '20px', background: 'yellow', margin: '20px' }}>
      <h2>DEBUG INFO</h2>
      <p>Hostname: {window.location.hostname}</p>
      <p>Is GitHub Pages: {isStaticDeployment ? 'YES' : 'NO'}</p>
      <p>Static products count: {staticProducts.length}</p>
      <p>Featured products count: {staticProducts.filter(p => p.featured).length}</p>
      <div>
        <h3>All Products:</h3>
        {staticProducts.map(product => (
          <div key={product.id} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc' }}>
            <p><strong>Name:</strong> {product.name}</p>
            <p><strong>Featured:</strong> {product.featured ? 'YES' : 'NO'}</p>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Price:</strong> {product.price}</p>
            <p><strong>Image:</strong> {product.image}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
