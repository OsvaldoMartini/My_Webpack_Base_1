import React, { Component } from 'react';

import { connect } from 'react-redux';
import Chart from '../components/chart'

class WeatherList extends Component  // => We're exporting the connected version of weather
{
    renderWeather(cityData) {
        // The Rule Behind adding a key in a React list
        // we insert the Key at the top of the element list 
        const name = cityData.city.name;
        //Mapping Temperatures
        const temps = _.map(cityData.list.map(weather => weather.main.temp), (temp) => temp - 273);
        //console.log("temperatures: ", temps);
        const pressures = cityData.list.map(weather => weather.main.pressure);
        const humidities = cityData.list.map(weather => weather.main.humidity);
        return (
            <tr key={name}>
                <td>{name}</td>
                <td><Chart data={temps} color="orange" units="C" /></td>
                <td><Chart data={pressures} color="green" units="hPa" /></td>
                <td><Chart data={humidities} color="black" units="%" /></td>
            </tr>
        );
    }

    render() {
        console.log(this.props.weather);
        return (
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>City</th>
                        <th>Temperature (C)</th>
                        <th>Pressure (hPa)</th>
                        <th>Humidity (%)</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.weather.map(this.renderWeather)}
                </tbody>
            </table>
        );
    }
}

// This it will get the data weather from the "combineReducers" and define insinde our WeatherList Container component
function mapStateToProps({ weather }) {  // => We could use just "weather" Instead state.weather (ES6 Syntax)
    console.log("State Weather: ", weather);
    return { weather }; // { weather } === { weather: weather };
}

//Connect our Component with the function Map State Props
//We have access to this props inside our Weather List component
export default connect(mapStateToProps)(WeatherList); // => We're exporting the connected version of weather
