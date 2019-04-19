import React, { Component } from 'react';

export default class BookList extends Component {
    //We are going to Pretend
    //We're going to plan that we're going to wire up the list of books to be
    //on this dot props for the booklist and we'll map over that array
    //and for each element int the array will return an ("ally"/"l ie") "<li>"
    //Don't forget the "key" because is a list use any unique value
    renderList() {
        return this.props.book.map((book) => {
            return <li key={book.title} className="list-group-item">{book.title}</li>
        });
    }
    
    render () {
        return (
            <ul className="list-group col-sm-4">
            {this.renderList()}
            </ul>
        )
    }
}