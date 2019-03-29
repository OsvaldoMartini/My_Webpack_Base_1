import React from "react";

class SearchBar extends React.Component {
 // 1) BIDING the Solving CONTEXT PROBLE when "this === undegined"
 constructor(props) {
     super(props);
     this.onFormSubmit = this.onFormSubmit.bind(this);
 }
 
 state = { term: 'Hi there!' };

onInputChange(event){
    console.log(event.target.value);
}

onInputClick(){
    console.log('Input was Clicked');
}

//Here Have a Coxtext Problem (this === UNDEFINED)
onFormSubmit(event){
    event.preventDefault();

    console.log(this.state.term);
}

  render() {
    return (
      <div className="ui segment">
        <form onSubmit={this.onFormSubmit} className="ui form">
          <div className="field">
            <label>ImageSearch</label>
            <input
              type="text"
              
              //Uncontrolled Element
              onClick={this.onInputClick}
              
              //onChange={this.onInputChange}     //When we whant to send the evet foward some function
              //onChange={(event) => console.log(event.target.value)}   //When we Have only one line of Logic

              
              //Controlled Element
               value={this.state.term.toUpperCase()}
               onChange={e => this.setState({ term: e.target.value })}
            />
          </div>
        </form>
      </div>
    );
  }
}

export default SearchBar;
