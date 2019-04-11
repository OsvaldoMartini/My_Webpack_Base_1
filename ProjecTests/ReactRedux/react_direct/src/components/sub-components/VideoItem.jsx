//import '../../css/VideoItem.css';
import React from 'react';

const VideoItem = ({video, onVideoSelect}) => {
    //props.video  => destructure  => ({video})
    return (
        // "onClick={onVideoSelect}"" will be call without the apropriate video item
        // it needs o be arrow function to call the "onVideoSelect" function passing the apropriate video item as parameter
    <div onClick={() => onVideoSelect(video)} className="video-item item">
        <img className="ui image" src={video.snippet.thumbnails.medium.url}/>
        <div className="content"> 
           <div className="header">
                {video.snippet.title}
           </div>
        </div>
    </div>
    );
};

export default VideoItem;