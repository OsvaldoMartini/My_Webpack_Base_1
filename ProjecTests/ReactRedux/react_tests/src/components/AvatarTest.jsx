import React from 'react';
import CommentsDetail from '../components/sub-components/commentsDetail.jsx';
import ApprovalCard from '../components/sub-components/ApprovalCard.jsx';

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
          <ApprovalCard>
            <div>
              <h4>Warning</h4>
              Are you sure you want to do this?00AM
              </div>
          </ApprovalCard>
          <ApprovalCard>
            <CommentsDetail author="Sam" timeAgo="Today at 04:45PM" content="Nice Blog post" avatar={faker.image.avatar()} />
          </ApprovalCard>
          <ApprovalCard>
            <CommentsDetail author="Alex" timeAgo="Today at 02:00AM" content="I Like the subject" avatar={faker.image.avatar()} />
          </ApprovalCard>
          <ApprovalCard>
            <CommentsDetail author="Jane" timeAgo="Yesterday at 05:00PM" content="I like the writing" avatar={faker.image.avatar()} />
          </ApprovalCard>
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
