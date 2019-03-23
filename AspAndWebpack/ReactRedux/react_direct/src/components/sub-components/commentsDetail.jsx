export default class CommentsDetails extends React.Component {
    constructor(props) {
      super(props);
    }
    
    render() {
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
      )
    }
  }
  