import React from 'react';

class ImageCard extends React.Component{
    constructor(props){
        super(props);
        //Creating image Ref
        this.imageRef = React.createRef();
    }
    
    //to Early to get the height because we do not yet have the image loaded up
    componentDidMount() {
        //So once it emits this load even that means that we now have successfully downloaded the image it's
        //being display on the screen
        //with the callback "setSpans" for control set of span for the grid-row-end
        this.imageRef.current.addEventListener('load', this.setSpans);
    }

    setSpans = () => {
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