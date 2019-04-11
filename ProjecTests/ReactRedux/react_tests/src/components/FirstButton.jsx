import React from 'react';
import {Button} from 'primereact/components/button/Button';

const e = React.createElement;

export default class FirstButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    let button_label = 'Like';
    if (this.state.liked) {
      button_label = 'FirstButton Component.';
      //return 'FirstButton Component.';
    }

    // return e(
    //   'button',
    //   { onClick: () => this.setState({ liked: true }) },
    //   'Like'
    // );

    return (
        <Button label={button_label} onClick={() => this.handleSwitch()}/>
    );
  }

  handleSwitch() {
    this.setState({liked: this.state.liked === true ? false : true});
 }
}

// const domContainer = document.querySelector('#firstButton');
// ReactDOM.render(e(LikeButton), domContainer);
