// const AvatarTest = () => {
//     return (
//       <div classname="ui conatiner comments">
//   <div classname="comment">
//               <a href="" classname="avatar">
//                   <img alt="avatar" src={faker.image.avatar()}/>
//               </a>
//               <div classname="content">
//                   <a href="/" classname="author">
//                             Sam
//             </a>
//                   <div classname="metadata">
//                       <span classname="date">Today at 06:00PM</span>
//                   </div>
//                   <div classname="text">Nice blog post!</div>
//               </div>
//           </div>
//       </div>
//     );
// };

// export default AvatarTest


'use strict';

const e = React.createElement;

export default class AvatarTest extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    if (this.state.liked) {
      return (
        <div classname="comment">
        <a href="" classname="avatar">
          <img alt="avatar" src={faker.image.avatar()}/>
        </a>
        <div classname="content">
          <a href="/" classname="author">
                          Sam
          </a>
          <div classname="metadata">
            <span classname="date">Today at 06:00PM</span>
          </div>
          <div classname="text">Nice blog post!</div>
        </div>
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
