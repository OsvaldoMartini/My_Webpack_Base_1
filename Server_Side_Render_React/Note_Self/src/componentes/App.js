import React, { Component } from 'react';
import { Form, FormControl, Button } from 'react-bootstrap';
console.log('React version', React.version);
//console.log('Form version', Form.version);
//console.log('FormControl version', FormControl.version);
//console.log('Button version', Button.version);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };
  }
  render() {
    return (
      <div>
        <h2>Note to Self</h2>
        <Form inline>
          <FormControl
            onChange={event => this.setState({ text: event.target.value })}
          />{' '}
          <Button onClick={() => console.log(this.state)}>Submit</Button>
        </Form>
      </div>
    );
  }
}

export const color = 'Red';
export const country = 'Italy';

export default App;
