import React from 'react';
import SearchBarYouTube from '../components/SearcBarYoutube.jsx';
import youtube from '../api/youtube.js' 
import VideoList from '../components/VideoList.jsx';

class AppYouTube extends React.Component {
    state = { videos: [], selectedVideo: null};
    
    onTermSubmit = async (term) => {
        console.log(term);
        const response = await youtube.get('/search', {
            params: {
                q: term
            }
        });

        //only Interest me response.data.items
        this.setState({videos: response.data.items});

        console.log(response.data.items);
       
    };

    //  "selectedVideo" since this is going to be a callback
    //I'm going to define it as an arrow funtion as we have many other times
    onVideoSelect = (video) => {
        console.log('From the App!', video);
        this.setState({selectedVideo: video });
    }

    render () {
        return (
            <div className="ui container">
                <SearchBarYouTube onFormSubmit={this.onTermSubmit}/>
                {/* onVideoSelect={this.onVideoSelect} Can Have Differents Names */}
                <VideoList onVideoSelect={this.onVideoSelect} videos={this.state.videos} selectedVideo/>
                I have {this.state.videos.length} videos.
            </div>
        )
    }
}

export default AppYouTube;

