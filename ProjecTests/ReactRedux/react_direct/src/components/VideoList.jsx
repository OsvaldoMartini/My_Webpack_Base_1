import React from 'react';
import VideoItem from '../components/sub-components/VideoItem.jsx';

const VideoList = ({videos, onVideoSelect}) => {
    //props.videos

    const renderedList = videos.map(video => {
        return <VideoItem onVideoSelect={onVideoSelect} video={video}/>
    });

    return <div className="ui relaxed divided list">{renderedList}</div>;
}

export default VideoList;