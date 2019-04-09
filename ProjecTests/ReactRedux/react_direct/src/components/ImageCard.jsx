import React from 'react';

class ImageCard extends React.Component{
    constructor(props){
        super(props);
        //Creating image Ref
        this.imageRef = React.createRef();
    }
    
    //to Early to get the height because we do not yet have the image loaded up
    componentDidMount() {
        console.log(this.imageRef);
        console.log(this.imageRef.current.clientHeight);
    }

    render() {
    
        // Creatting clean code
        // destructure out (outing)  the propd.image
        const {description, urls} = this.props.image;


        return (
        <div>
            <img 
            ref={this.imageRef} 
            alt={description}
            src={urls.regular}/>
        </div>
        );
    }
}

export default ImageCard;