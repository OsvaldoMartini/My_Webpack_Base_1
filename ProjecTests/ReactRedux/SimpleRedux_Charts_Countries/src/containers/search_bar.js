import React, { Component } from 'react';

//controlled component
//State at the Component Level
export default class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = { term: '' };
  }

  //Just Vanilla javascript
  onInputChange(event) {
    console.log(event.target.value);
    this.setState({ term: event.target.value });
  }

  render() {
    return (
      <form className="input-group">
        <input
          placeholder="Get a five-day forecast in your favorite cities"
          className="form-control"
          value={this.state.term}
          onChange={this.onInputChange}
        />
        <span className="input-grupo-btn">
          <button type="submit" className="btn btn-secondary">
            Submit
          </button>
        </span>
      </form>
    );
  }
}
