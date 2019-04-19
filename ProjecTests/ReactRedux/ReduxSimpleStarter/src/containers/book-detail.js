import React, { Component } from 'react';
import { connect } from 'react-redux'

// 3) Step Delete "export default class" ...  => "class ..."" 
class BookDetail extends Component {
    render () {
        if (!this.props.book) {
            return <div>Select a book to get started.</div>
        }

        return (
            <div>
            <h3>Details for:</h3>
            <div>{this.props.book.title}</div> 
            <div>{this.props.book.pages}</div> 
            </div>
        );
    }
}

//mapStateToProp Bring to US the book Details
function mapStateToProp(state) {
    return {
        // ==>  Making Sure we Hook up the Book Detail to the Redux Store
        book: state.activeBook  // ==>> It Cames From:  "...const rootReducer = combineReducers({..."
    }
}

export default connect(mapStateToProp)(BookDetail);




// Steps:
//  1)  Define: "function mapStateToProp(state) {..."
//  2)  Define: "export default connect(mapStateToProp)(Book..."
//  3)  Delete: "export default" from the Top of the "class" ->  it stays: "class BookDetail ext..."

//  With those 3 (Trhee) Steps we've got a connected component in here 