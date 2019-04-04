import React from "react";
import unsplash from '../api/unsplash.jsx';
import SearchBar from "../components/SearchBar.jsx";

class AppSearch extends React.Component {
  state = {images: []}; // {images: []} Its is better because, If a have state.images.map this will work fine instead of {images: null} (that's cause error)
  
  onSearchSubmit = async term => { /* this was converted to  arrow function to solve context problem */
    const response = await unsplash.get('/search/photos', {
        params: { query: term }
    });

    console.log(this);  {/* this bring us the actual this Object that is "onSubmit" */}
    this.setState({images: response.data.results}); //Pull out actual results or list of images
    console.log(response.data.results);
    
  }

  render() {
    return (
      <div className="AppSearch" style={{ marginTop: "10px" }}>
        <SearchBar onSubmit={this.onSearchSubmit} guessWhoIam={this}/>
        Found: {this.state.images.length}  images   {/* Uncaught (in promise) TypeError: this.setState is not a function */}
      </div>
    );
  }
}

export default AppSearch;
