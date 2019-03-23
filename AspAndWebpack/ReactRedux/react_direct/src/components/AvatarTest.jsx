import React from 'react';
import CommentsDetail from '../components/sub-components/commentsDetail.jsx';

const e = React.createElement;

export default class AvatarTest extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showAvatar: false };
  }

  render() {
    if (this.state.showAvatar) {
      return (
        <div className="ui conatiner comments">
          <CommentsDetail/>
          <CommentsDetail/>
          <CommentsDetail/>
      </div>
      );
    }

    return e(
      'button',
      { onClick: () => this.setState({ showAvatar: true }) },
      'Show Avatar'
    );
  }
}

// const domContainer = document.querySelector('#firstButton');
// ReactDOM.render(e(LikeButton), domContainer);
