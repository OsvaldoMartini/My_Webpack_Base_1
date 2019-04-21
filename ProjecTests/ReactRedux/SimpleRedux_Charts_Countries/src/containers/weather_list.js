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
function mapStateToProps(state) {
    return { weather: state.weather };
}