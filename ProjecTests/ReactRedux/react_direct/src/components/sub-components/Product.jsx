import React from 'react';


export default class Product  extends React.Component {
    constructor(props) {
        super(props);
        this.state = { qty: 0 };
    }

    handleBuy(){
         this.setState({qty: this.state.qty + 1});
    }

     //TODO-MARTINI Borer for the Each Product class='w3-container w3-border w3-round-xlarge'
  
    //  ShowProductDetails(){
    //     //alert('Need to be fixed');
    //     this.props.handleShowProductDetails(this.props.name);
    //  }


     ShowProductDetails = (name) => {
        //this.props.triggerChildShow(name);
        this.props.triggerChildShow(this.props.name);
    }
    render(){
        return (
            <div>
            <p>{this.props.name} - ${this.props.price}</p>
            <button onClick={() => this.handleBuy()}>Buy</button>
            <button onClick={() => this.ShowProductDetails()}>Show Me</button>
            {/* onClick={this.ShowProductDetails} */}
            <h3>Qty: {this.state.qty} item(s)</h3>
            </div>
         );
    }
}   