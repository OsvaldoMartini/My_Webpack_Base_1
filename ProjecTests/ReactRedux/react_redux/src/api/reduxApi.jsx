console.clear();

const createPolicy = (name, amout) => {
  return {
    type: 'CREATE_POLICY',
      payload: {
        name,  // ES 2015 Syntax
        amount // ES 2015 Syntax
      }
  }
}
