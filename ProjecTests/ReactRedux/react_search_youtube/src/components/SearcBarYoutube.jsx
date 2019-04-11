import React from 'react';


class SearchBarYouTube  extends React.Component {
    state = {term: ''};

    onInputChange = event => {
        this.setState({term: event.target.value});
    }

    onFormSubmit = event => {
        event.preventDefault();

        // TODO: Make sure we call
        // callback from parent component
        this.props.onFormSubmit(this.state.term);
    }
    
    render(){
        return (
            <div className="search-bar ui segment">
                <form onSubmit={this.onFormSubmit} className="ui form">
                    <div className="field">
                    <label>Videos</label>
                    <input 
                    type="text"
                    value={this.state.term}
                    onChange={this.onInputChange}>
                    {/* onChange={e => this.setState({ term: e.target.value })} */}
                    </input>
                    </div>
                </form>
            </div>
        )
    }
} 

export default SearchBarYouTube;