import React, { Component } from 'react';

//TO FORGE the coneection between the React and Reducers
// TEH GLUE BETWEEN REACT AND REDUX
import { connect } from 'react-redux';

//Not Export "export default" We just need the Classe Base Component
 class BookList extends Component {
    //We are going to Pretend
    //We're going to plan that we're going to wire up the list of books to be
    //on this dot props for the booklist and we'll map over that array
    //and for each element int the array will return an ("ally"/"l ie") "<li>"
    //Don't forget the "key" because is a list use any unique value
    renderList() {
        return this.props.books.map((book) => {
            return <li key={book.title} className="list-group-item">{book.title}</li>
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
function mapStateToProps(state) {
    //Whatever is returned will show up as props 
    //insideof BookList
    return {
        asdf: '123',
        books: state.books
    }
}


//React-Redux is the Glue between both

//At The Very bottom We need to actually make use of that connect function
// that we imported up to the connect and Return a Container
// We don't want to export the BookList plane component that nobody cares about

// Connect: Takes a function and component and produces a container (Smart component)
// ####  WE WANT TO EXPORT THE CONTAINER  ### //
export default connect(mapStateToProps)(BookList);


