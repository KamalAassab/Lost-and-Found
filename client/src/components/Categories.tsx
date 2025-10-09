import React from 'react';

const Categories: React.FC = () => {
  const categories = [
    {
      name: 'Hoodies',
      description: 'Stay cozy and stylish with our premium hoodies. Perfect for casual outings and chilly days.',
      image: window.location.hostname === 'kamalaassab.github.io' ? '/hoodie.jpg' : '/hoodie.jpg'
    },
    {
      name: 'T-shirts',
      description: 'Our comfortable and trendy t-shirts are a must-have for your everyday wardrobe.',
      image: window.location.hostname === 'kamalaassab.github.io' ? '/tshirt.jpg' : '/tshirt.jpg'
    }
  ];

  return (
    <div className="categories">
      <h2>Categories</h2>
      <div className="category-list">
        {categories.map((category, index) => (
          <div key={index} className="category-item">
            <img src={category.image} alt={category.name} />
            <h3>{category.name}</h3>
            <p>{category.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories; 