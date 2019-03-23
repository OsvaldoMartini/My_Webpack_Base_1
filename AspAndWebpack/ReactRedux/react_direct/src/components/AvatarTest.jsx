import React from 'react';
import CommentsDetail from '../components/sub-components/commentsDetail.jsx';

const e = React.createElement;

export default class AvatarTest extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    if (this.state.liked) {
      return (
        <div className="ui conatiner comments">
          <CommentsDetail/>
      </div>
      );
    }

    return e(
      'button',
      { onClick: () => this.setState({ liked: true }) },
      'Like'
    );
  }
}

// const domContainer = document.querySelector('#firstButton');
// ReactDOM.render(e(LikeButton), domContainer);
