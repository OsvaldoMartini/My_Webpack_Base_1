import React from "react";
//1) Tag: Binding_Context : BIDING the context, for solving "CONTEXT" problem when whe get "this === undefined"
//2) Tag: Arrowfunction_OnFormSubmit : ARROW FUNCTION the context, for solving "CONTEXT" problem when whe get "this === undefined"
//3) Tag: Arrowfunction_Render_1 : ARROW FUNCTION the context, for solving "CONTEXT" problem when whe get "this === undefined"
//4) Tag: Arrowfunction_Render_1 : ARROW FUNCTION the context, for solving "CONTEXT" problem when whe get "this === undefined"

class SearchBar extends React.Component {
  constructor(props) {
      super(props);
      this.onFormSubmit = this.onFormSubmit.bind(this);
  }

  state = { term: "" };

  onInputChange(event) {
    //console.log(event.target.value);
  }

  onInputClick() {
    //console.log("Input was Clicked");
  }

  //Here Have a Coxtext Problem (this === UNDEFINED)
  onFormSubmit(event) {
    event.preventDefault();

    //From Child to Parent  ->  Using the CallBack
    this.props.onSubmit(this.state.term);
   
    //console.log(this.state.term);
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
              value={this.state.term}
              onChange={e => this.setState({ term: e.target.value })}
            />
          </div>
        </form>
      </div>
    );
  }
}

export default SearchBar;
