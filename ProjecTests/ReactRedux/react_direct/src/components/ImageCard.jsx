import React from 'react';

class ImageCard extends React.Component{
    render() {
    
        // Creatting clean code
        // destructure out (outing)  the propd.image
        const {description, urls} = this.props.image;


        return (
        <div>
            <img 
            alt={description}
            src={urls.regular}/>
        </div>
        );
    }
}

export default ImageCard;