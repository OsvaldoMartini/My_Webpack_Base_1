import React, { Component } from 'react';

class GoogleMap extends Component {

    componentDidMount() {
        //Work Around to show the Google Map
        const google = window.google;

        // this Came from index.html => "...<script src="https://maps.googleapis.com/maps/api/....."
        new google.maps.Map(this.refs.map, {
            zoom: 12,
            center: {
                lat: this.props.lat,
                lng: this.props.lon
            }
        });
    }


    render() {
        //  this.refs.map It Gives Directy reference in Html content o the page
        return <div style={{ height: '200px', width: '250px' }} ref="map" />;
    }
}


export default GoogleMap;