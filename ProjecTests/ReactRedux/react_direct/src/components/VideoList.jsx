import React from 'react';
import VideoItem from '../components/sub-components/VideoItem.jsx';

const VideoList = ({videos}) => {
    //props.videos

    const renderedList = videos.map(video => {
        return <VideoItem />
    });

    return <div>{renderedList}</div>;
}

export default VideoList;