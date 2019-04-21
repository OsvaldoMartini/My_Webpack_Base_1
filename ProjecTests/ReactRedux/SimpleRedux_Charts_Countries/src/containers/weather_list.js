import React, { Component } from 'react';

import { connect } from 'react-redux';

class WeatherList extends Component  // => We're exporting the connected version of weather
{
    render() {
        return (
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>City</th>
                        <th>Temperature</th>
                        <th>Pressure</th>
                        <th>Humidity</th>
                    </tr>
                </thead>
            </table>
        );
    }
}

// This it will get the data weather from the "combineReducers" and define insinde our WeatherList Container component
function mapStateToProps({ weather }) {  // => We could use just "weather" Instead state.weather (ES6 Syntax)
    return { weather }; // { weather } === { weather: weather };
}

//Connect our Component with the function Map State Props
//We have access to this props inside our Weather List component
export default connect(mapStateToProps)(WeatherList); // => We're exporting the connected version of weather
