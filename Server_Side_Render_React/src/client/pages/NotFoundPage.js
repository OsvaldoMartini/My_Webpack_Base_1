import React from 'react';

const NotFoundPage = ({ staticContext = {} }) => {
  staticContext.notFound = true;
  return <h2 className="center-align">Route/Page not found</h2>;
};

export default {
  component: NotFoundPage
};
