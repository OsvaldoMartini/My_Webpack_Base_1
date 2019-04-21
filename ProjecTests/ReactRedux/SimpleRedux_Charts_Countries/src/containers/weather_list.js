import React, { Component } from 'react';

import { connect } from 'react-redux';

export default class WeatherList extends Component {
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
    //Same thing to do: 
    //const weather = state.weather;"
    //And We Could condense more like:
    //return { weather: weather }; //We could shrink it to just curly braces weather (because the both are identical) 
    return { weather }; // { weather } === { weather: weather };
}
