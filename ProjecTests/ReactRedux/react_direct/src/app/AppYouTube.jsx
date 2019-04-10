import React from 'react';
import SearchBarYouTube from '../components/SearcBarYoutube.jsx';
import youtube from '../api/youtube.js' 

class AppYouTube extends React.Component {
    state = { videos: []};
    
    onTermSubmit = async (term) => {
        console.log(term);
        const response = await youtube.get('/search', {
            params: {
                q: term
            }
        });

        //only Interest me response.data.items
        this.setState({videos: response.data.items});

        console.log(response);
       
    };

    render () {
        return (
            <div className="ui container">
                <SearchBarYouTube onFormSubmit={this.onTermSubmit}/>
                I have {this.state.videos.length} videos.
            </div>
        )
    }
}

export default AppYouTube;

