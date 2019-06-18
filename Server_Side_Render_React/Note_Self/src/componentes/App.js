import React, { Component } from 'react';
import { Form, FormControl, Button } from 'react-bootstrap';

class App extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <h2>Note to Self</h2>
        <Form>
          <FormControl />
          <Button>Submit</Button>
        </Form>
      </div>
    );
  }
}

export const color = 'Red';
export const country = 'Italy';

export default App;
