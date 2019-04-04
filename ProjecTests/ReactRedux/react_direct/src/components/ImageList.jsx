import React from 'react';
//import style from '../css/ImageList.css';

const ImageList = (props) => {
    const images = props.images.map(({description, id, urls}) => {
        return <img key={id} alt={description} src={urls.regular}/>
    });

    return <div className="image-list">{images}</div>;
}

export default ImageList;