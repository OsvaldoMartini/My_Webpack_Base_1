import React from 'react';
import SearchBarYouTube from '../components/SearcBarYoutube.jsx';

class AppYouTube extends React.Component {
    render () {
        return (
            <div className="ui container">
            <SearchBarYouTube message="Ola YouTube"/>
            </div>
        )
    }
}

export default AppYouTube;

