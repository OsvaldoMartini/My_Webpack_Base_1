import React from "react";
import axios from "../plugins/axios.js";
import SearchBar from "../components/SearchBar.jsx";

class AppSearch extends React.Component {
  state = {images: []}; // {images: []} Its is better because, If a have state.images.map this will work fine instead of {images: null} (that's cause error)
  
  onSearchSubmit = async (term) => {
  //console.log(term);
    const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: { query: term },
        headers: {
            Authorization: 'Client-ID 43d68399a648aab9b8b72502c3feddddabbc9399d2d5f0cdd2df7a284d27c64f'
        }
    });

    console.log(this);  {/* this bring us the actual this Object that is "onSubmit" */}
    this.setState({images: response.data.results}); //Pull out actual results or list of images
    console.log(response.data.results);
    
  }

  render() {
    return (
      <div className="AppSearch" style={{ marginTop: "10px" }}>
        <SearchBar onSubmit={this.onSearchSubmit} guessWhoIam={this}/>
        Found: {this.state.images.length}   {/* Uncaught (in promise) TypeError: this.setState is not a function */}
      </div>
    );
  }
}

export default AppSearch;
