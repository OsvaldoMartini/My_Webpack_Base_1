import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchWeather } from '../actions/index';

//controlled component
//State at the Component Level
//Third Step: Remove the "export defaul" at the class SearcBar definition
class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = { term: '' };
    //Context Binding
    this.onInputChange = this.onInputChange.bind(this);
  }

  //Just Vanilla javascript
  onInputChange(event) {
    console.log(event.target.value);
    this.setState({ term: event.target.value });
  }

  onFormSubmit(event) {
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.onFormSubmit} className="input-group">
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

// First Step:
//The MapDispatchToPros Fetch FetchWeather Inside Our SearchBar Component
function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchWeather }, dispatch);
}
// Second Step:
// ###  ==> The Reason of the 'Null' its We are passing the "mapDispatchToProps" as Second Argument STATE ==== null
// ###  ==> I know that Redux is maintaining some STATE but this container jus DOESN'T CARE about it all
// ###  ==> THANKS BUT WE DON'T NEED ANY STATE HERE
export default connect(null, mapDispatchToProps)(SearchBar);
