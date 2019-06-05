import React from 'react';

const Home = () => {
  return (
    <div className="center-align" style={{ marginTop: '200px' }}>
      <h3>Welcome</h3>
      <p>Check out these awesome features</p>
      <button onClick={() => console.log('Hi There!')}>Press me!</button>
    </div>
  );
};

export default {
  component: Home
};
