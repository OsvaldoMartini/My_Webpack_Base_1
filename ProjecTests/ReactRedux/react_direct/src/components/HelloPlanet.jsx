import React from 'react';

export default class HelloPlanet extends React.Component {
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
                <button onClick={this.updateThisCounter}>Update Counter</button>
            </div>
        )
    }

}