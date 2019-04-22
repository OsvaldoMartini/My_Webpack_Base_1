import React, { Component } from 'react';

//Making Use of Book-List
import BookList from '../containers/book-list';

//Making Use of Book-Detail
import BookDetail from '../containers/book-detail';


export default class App extends Component {
  render() {
    return (
      <div>
        <BookList/>
        <BookDetail/>
      </div>
    );
  }
}
