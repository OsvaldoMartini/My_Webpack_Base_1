import React, { Component } from 'react';

class GoogleMap extends Component {
    render() {
        //  this.refs.map It Gives Directy reference in Html content o the page
        return <div ref="map" />;
    }
}


export default GoogleMap;