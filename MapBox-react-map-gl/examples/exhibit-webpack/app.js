/* global document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';

const MAPBOX_TOKEN =
  'pk.eyJ1Ijoib21hcnRpbmkiLCJhIjoiY2p2dTdtZmdxM2RnNzN6bWdwNGlmcW90aiJ9.VExEJ3JXpjCLDUvsmovEkQ'; // Set your mapbox token here

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: 37.785164,
        longitude: -122.41669,
        zoom: 14,
        bearing: 0,
        pitch: 0
      }
    };
  }

  render() {
    const {viewport} = this.state;

    return (
      <MapGL
        {...viewport}
        width="100vw"
        height="100vh"
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={v => this.setState({viewport: v})}
        preventStyleDiffing={false}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      />
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
