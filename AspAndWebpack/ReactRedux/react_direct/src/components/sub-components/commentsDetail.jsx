import React from 'react';

export default class CommentsDetails extends React.Component {
    constructor(props) {
      super(props);
    }
    
    render() {
      return (
        <div className="comment">
          <a href="" className="avatar">
            <img alt="avatar" src={faker.image.avatar()}/>
          </a>
          <div className="content">
            <a href="/" className="author">
                            Sam
            </a>
            <div className="metadata">
              <span className="date">Today at 06:00PM</span>
            </div>
            <div className="text">Nice blog post!</div>
          </div>
        </div>
      )
    }
  }
  