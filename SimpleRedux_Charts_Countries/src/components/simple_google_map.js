import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';

const AnyReactComponent = ({ text }) => <div>{text}</div>;


class SimpleMap extends Component {
    static defaultProps = {
        center: {
            lat: 59.95,
            lng: 30.33
        },
        zoom: 12
    };

    renderMarkers(map, maps) {
        let marker = new maps.Marker({
            position: { lat: this.props.lat, lng: this.props.lon },
            map,
            title: 'Hello World!'
        });
    }

    render() {
        return (
            // Important! Always set the container height explicitly
            // <div style={{ height: '100vh', width: '100%' }}>
            <div style={{ height: '200px', width: '250px' }}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: 'AIzaSyAq06l5RUVfib62IYRQacLc-KAy0XIWAVs' }} /* YOUR KEY HERE */
                    // defaultCenter={this.props.center}
                    defaultCenter={{
                        lat: this.props.lat,
                        lng: this.props.lon
                    }}
                    defaultZoom={this.props.zoom}
                    onGoogleApiLoaded={({ map, maps }) => this.renderMarkers(map, maps)}
                    yesIWantToUseGoogleMapApiInternals={true}
                >
                    <AnyReactComponent
                        lat={40.727063} //{59.955413}
                        lng={-74.001693}//{30.337844}
                        text="Lower Manhattan"
                        isMarkerShown={true}

                    />

                </GoogleMapReact>
            </div>
        );
    }
}

export default SimpleMap;