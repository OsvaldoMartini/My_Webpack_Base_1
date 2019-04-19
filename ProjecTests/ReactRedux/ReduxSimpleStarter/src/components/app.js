import React, { Component } from 'react';

//Making Use of Book-List
import BookList from '../containers/book-list';


export default class App extends Component {
  render() {
    return (
      <div>
        <BookList/>
      </div>
    );
  }
}
