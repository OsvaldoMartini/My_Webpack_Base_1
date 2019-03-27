import React from 'react';

export default class PlanetProperties extends React.PureComponent {
    constructor(props){
        super(props);
    }

    render() {
        return (
        <button onClick={this.props.triggerChildUpdate}>Update From Child</button>
        );
    }
    
}