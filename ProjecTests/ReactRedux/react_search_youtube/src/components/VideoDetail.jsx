import React from  'react';

const VideoDetail = ({ video }) => {
    if (!video){
        return <div>Loading...</div>
    }

    const videoSrc = `https://www.youtube.com/embed/${video.id.videoId}`;

    return (
    <div>
        {/* I-Frame Tag is going to attempt to make a request to some outside Web site besides the one that the user is currently visiting on the screen.
        This I-Frame element it will make a request on its own without any Ajax stuff or anything like that. */}
        <div className="ui embed">
        <iframe title="video player" src={videoSrc} />
        </div>
        <div className="ui segment">
            <h4 className="ui header">{video.snippet.title}</h4>
            <p>{video.snippet.description}</p>
        </div>
    </div>
    );

};

export default VideoDetail;
