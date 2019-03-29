import React from "react";
import axios from "../plugins/axios.js";
import SearchBar from "../components/SearchBar.jsx";

class AppSearch extends React.Component {
  async onSearchSubmit(term) {

    //console.log(term);

    const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: { query: term },
        headers: {
            Authorization: 'Client-ID 43d68399a648aab9b8b72502c3feddddabbc9399d2d5f0cdd2df7a284d27c64f'
        }
    });

    console.log(response.data.results);
    
  }

  render() {
    return (
      <div className="AppSearch" style={{ marginTop: "10px" }}>
        <SearchBar onSubmit={this.onSearchSubmit} />
      </div>
    );
  }
}

export default AppSearch;
