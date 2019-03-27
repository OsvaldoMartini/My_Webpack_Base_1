import React from "react";
import SubItem from "./sub-components/SubItem.jsx";

export default class ItemFather extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [
        {
          text: "First",
          id: 1
        },
        {
          text: "Second",
          id: 2
        }
      ]
    };
  }
  addItem = () => {
    const items = [{ text: "Front", id: Date.now() }, ...this.state.items];
    this.setState({ items });
  };

  removeChildItemAt = id => {
    console.log("to Remove: " + id);
    //const items = [{ text: "Front", id: Date.now() }, ...this.state.items];
    //var array = [...this.state.items];

    var array = this.state.items.filter(function(item) {
      return item.id != id;
    });
    this.setState({ items: array });
    // var itemsUpdate = [];
    // itemsUpdate = { $splice: [[id, 1]] };
    // this.setState({
    //   items: React.addons.update(this.state.items, itemsUpdate)
    // });

    //let array = this.state.items.slice();
    // var index = array.indexOf(id);
    // if (index !== -1) {
    //   array.splice(index, 1);
    //   this.setState({ items: array });
    // }

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

    // delete this.state.items[index];
    // // set the state
    // this.setState({ items : this.state.items });

    // var tmpArray = this.state.items.slice();
    // tmpArray.splice(index, 1);
    // this.setState({ items: tmpArray })
  };

  handleLanguage = langValue => {
    alert("ready to remove");
    this.setState({ language: langValue });
  };

  render() {
    return (
      <div>
        <ul>
          {this.state.items.map((item, index) => (
            <SubItem
              {...item}
              key={index}
              triggerSelectedItem={this.removeChildItemAt}
            />
          ))}
        </ul>
        <button onClick={this.addItem}>Add Item</button>
      </div>
    );
  }
}
