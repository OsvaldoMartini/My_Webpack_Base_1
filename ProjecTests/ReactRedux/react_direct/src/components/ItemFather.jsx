import React from 'react';
import SubItem from './sub-components/SubItem.jsx';

export default class ItemFather extends React.Component {
  constructor(props) {
    super(props);
    this.state = {items: []};
  }

  componentDidMount() {
    console.log("Mounted ", this.state.items);

    let p = this.state.items.slice();
    p.push({
      text: "First",
      id: 1
    });
    p.push({
      text: "Second",
      id: 2
    });
    this.setState({ items: p });
  }

  addItem = () => {
    const items = [{ text: "Front", id: Date.now() }, ...state.items];
    this.setState({ items });
  };

  removeChildItemAt(index) {
    console.log('to Remove: ' + index);

    let array = this.state.items.slice();
    var index = array.indexOf(e.target.value)
     if (index !== -1) {
       array.splice(index, 1);
       this.setState({items: array});
     }
  


    //  var array = [...this.state.items]; // make a separate copy of the array
    //  var index = array.indexOf(e.target.value)
    //  if (index !== -1) {
    //    array.splice(index, 1);
    //    this.setState({items: array});
    //  }

    //  var array = this.state.items;
    //  var index = array.indexOf(e.target.value); // Let's say it's Bob.
    //  delete array[index];

    //let items = this.state.items.splice(index,1);
    // this.setState({items})

    // delete this.state.items[index];
    // // set the state
    // this.setState({ items : this.state.items });

    // var tmpArray = this.state.items.slice();
    // tmpArray.splice(index, 1);
    // this.setState({ items: tmpArray })
  }

  handleLanguage = (langValue) => {
    alert('ready to remove');
    this.setState({ language: langValue });
  }

  render() {
    return (
      <div>
        <ul>
          {this.state.items.map((item, index) => (
            <SubItem {...item} key={index} onSelectedItem={this.removeChildItemAt}/>
          ))}
        </ul>
        <button onClick={this.addItem}>Add Item</button>
      </div>
    );
  }
}