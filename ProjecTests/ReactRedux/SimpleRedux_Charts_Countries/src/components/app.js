import React from 'react';
import { Component } from 'react';

import SeachBar from '../containers/search_bar';
import WeatherList from '../containers/weather_list';

export default class App extends Component {
  render() {
    return (
      <div>
        <SeachBar />
        <WeatherList />
      </div>
    );
  }
}
