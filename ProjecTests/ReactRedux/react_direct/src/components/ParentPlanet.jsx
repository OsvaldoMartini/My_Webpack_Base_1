import React from 'react';
import PlanetProperties from './sub-components/PlanetProperties.jsx';


export default class ParentPlanet extends React.Component {
    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            counter: 0
        };
        this.updateThisCounter = this.updateThisCounter.bind(this);
    }

    updateThisCounter(){
        this.setState({ counter: this.state.counter + 1 });
    }

    render() {
        return (
            <div>
                <span>{this.state.counter}</span>
                <PlanetProperties triggerChildUpdate={this.updateThisCounter}/>
                <button onClick={this.updateThisCounter}>Update From Parent</button>
            </div>
        )
    }

}