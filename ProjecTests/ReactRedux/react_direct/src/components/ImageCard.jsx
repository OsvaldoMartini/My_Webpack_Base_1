import React from 'react';

class ImageCard extends React.Component{
    constructor(props){
        super(props);
        //Creating image Ref
        this.imageRef = React.createRef();
    }
    
    componentDidMount() {
        console.log(this.imageRef);
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