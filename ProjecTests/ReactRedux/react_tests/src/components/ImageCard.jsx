import React from 'react';

class ImageCard extends React.Component{
    constructor(props){
        super(props);

        this.state = {spans: 0};
        
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
        //Making the calculation per each image
        const height = this.imageRef.current.clientHeight;

        // 150 from grid-auto-rows: 150px;
        // + 1  is to make sure that if we have like a portion of a row that this image needs
        //  it's going to be rounded up or essentially a ghost like the next highest row 
        // Mat.ceil -> I'am going to do a math dot ceiling on this thing just to cap its value
        //We can remove the "+ 1" just to see the results 
        const spans = Math.ceil(height / 10) + 1;   //150 from  grid-auto-rows: 150px

        //this.setState({spans: spans});
        this.setState({spans}); //E.S 2015 syntax
        
    }

    render() {
    
        // Creatting clean code
        // destructure out (outing)  the propd.image
        const {description, urls} = this.props.image;


        //It must Use " ` " back tick and not use " ' " single quote
        return (
        <div style={{gridRowEnd: `span ${this.state.spans}`}}>  
            <img 
            ref={this.imageRef} 
            alt={description}
            src={urls.regular}/>
        </div>
        );
    }
}

export default ImageCard;