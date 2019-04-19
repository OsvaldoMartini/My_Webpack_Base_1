import React, { Component } from 'react';

//TO FORGE the coneection between the React and Reducers
// TEH GLUE BETWEEN REACT AND REDUX
import { connect } from 'react-redux';

import {selectBook} from '../actions/index';

//So this is the part right here where we take that return value from select book and make sure that it
//Actually flows through all different reducers in our application
import { bindActionCreators} from 'redux'; 

//Not Export "export default" We just need the Classe Base Component
 class BookList extends Component {
    //We are going to Pretend
    //We're going to plan that we're going to wire up the list of books to be
    //on this dot props for the booklist and we'll map over that array
    //and for each element int the array will return an ("ally"/"l ie") "<li>"
    //Don't forget the "key" because is a list use any unique value
    renderList() {
        return this.props.books.map((book) => {
            return (<li 
                key={book.title}
                onClick={() => this.props.selectBook(book)}
                //Don't Boder now about the ERROR: bundle.js:21252 Uncaught Error: Actions must be plain objects. Use custom middleware for async actions. 
                className="list-group-item">
                {book.title}
            </li>
            );
        });
    }
    
    render () {
        console.log(this.props.asdf);
        return (
            <ul className="list-group col-sm-4">
            {this.renderList()}
            </ul>
        )
    }
}

//the Purpose of this is to take our application state as an argument
//The first Argument is the State and it Returns an object 
// whatever object is returned will be available to our component as this props.

// ##=> If Our state ever changes this container will instantly render with new list of books.
function mapStateToProps(state) {
    //Whatever is returned will show up as props 
    //insideof BookList
    return {
        asdf: '123',
        // ###=> Whenever the application state changes the object in the state funcion will be assigned as props to the component
        books: state.books
    }
}

// #####=>  Anything returned from this function end up as PROPS on the BookList container
function mapDispatchToProps(dispatch) {
    // Whenever selectBook is called, the result should be passed
    // to all of our reducers 
    // // #####=>  THE FIRST PARAMETER DOES THE MAGIC "...tors({selectBook: ..." CALL OUR ACTION CREATOR
    return bindActionCreators({selectBook: selectBook}, dispatch);
    // Is what takes these actions and it basically you know receives them kind of like a funnel
    // When it spits them back out to all different reducers in our application
    // #####=>  So again bind action creators with dispatch says:
    // #####=>   I am going to take this stuff and I'm going to take all these actions and make sure
    // #####=>   That they get passed on to all the different reducers inside the application
    // Flow in all differents Reducers
}




//React-Redux is the Glue between both

//At The Very bottom We need to actually make use of that connect function
// that we imported up to the connect and Return a Container
// We don't want to export the BookList plane component that nobody cares about

// Connect: Takes a function and component and produces a container (Smart component)
// ####  WE WANT TO EXPORT THE CONTAINER  ### //
//This Promote BookList from a component to a Container - it needs to know
// about this new dispatch method, selectBook. Make it available as a prop.
export default connect(mapStateToProps, mapDispatchToProps)(BookList);


