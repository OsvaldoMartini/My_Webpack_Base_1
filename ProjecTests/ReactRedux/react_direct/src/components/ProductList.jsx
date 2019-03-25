import React from 'react';

import Product from './sub-components/Product.jsx';
import ApprovalCard from './sub-components/ApprovalCard.jsx';

export default class ProductList extends React.Component{
    constructor(props){
    super(props);
    }
    showProductSelected(name){
        alert('You Selected: ' + name);
    }

    render(){
        return (
         <div>
            <Product name="Android" price="121" handleShowProductDetails={() => this.showProductSelected(this.props.name)}/>
            <Product name="Apple" price="123" handleShowProductDetails={() => this.showProductSelected(this.props.name)}/>
            <Product name="Nokia" price="125" handleShowProductDetails={() => this.showProductSelected(this.props.name)}/>
        </div>
        )
    }
}