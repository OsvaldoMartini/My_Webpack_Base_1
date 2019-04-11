import React from 'react';

const VideoItem = ({video}) => {
    //props.video  => destructure  => ({video})
    return <div>{video.snippet.title}</div>;
};

export default VideoItem;