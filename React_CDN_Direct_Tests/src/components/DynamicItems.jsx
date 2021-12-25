import React from 'react'
import DynamicSubItem from './sub-components/DynamicSubItem.jsx'

export default class DynamicItems extends React.Component {
  constructor(props) {
    super(props)
    const id1 = Math.floor(new Date().valueOf() / 1)
    const id2 = id1 + 1
    //var secondDate = new Date();
    //secondDate.setSeconds(secondDate.getSeconds() + 1);
    //const id2 = "Input - " + Math.floor(secondDate.valueOf() / 1);
    const array = [...Array(10000)].map((val, i) => `Item ${i}`)

    console.log(array) // 1443535752
    // Current time in seconds
    console.log(Math.floor(new Date().valueOf() / 1)) // 1443535752
    console.log(Math.floor(Date.now() / 1)) // 1443535752
    console.log(Math.floor(new Date().getTime() / 1)) // 1443535752

    this.state = {
      items: [
        {
          text: 'Input - ' + id1,
          background: 'white',
          id: id1,
        },
        {
          text: 'Input - ' + id2,
          background: 'white',
          id: id2,
        },
      ],
    }
  }
  addItem = () => {
    const array = [
      { text: 'Input - ' + Date.now(), id: Date.now() },
      ...this.state.items,
    ]
    this.setState({ items: array })
  }

  removeChildItemAt = (id) => {
    console.log('to Remove: ' + id)
    //const items = [{ text: "Front", id: Date.now() }, ...this.state.items];
    //var array = [...this.state.items];

    var array = this.state.items.filter(function (item) {
      return item.id != id
    })
    this.setState({ items: array })
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
  }

  updateChildItemAt = (id) => {
    console.log('to Update: ' + id)
    //const items = [{ text: "Front", id: Date.now() }, ...this.state.items];
    //var array = [...this.state.items];

    var array = this.state.items.map(function (item) {
      if (item.id === id) {
        item.background = 'green'
      } else {
        item.background = 'white'
      }
      return item
    })
    this.setState({ items: array })
  }

  handleLanguage = (langValue) => {
    alert('ready to remove')
    this.setState({ language: langValue })
  }

  render() {
    return (
      <div>
        <button onClick={this.addItem}>Add Item</button>
        <ul>
          {this.state.items.map((item, index) => (
            <DynamicSubItem
              {...item}
              key={index}
              triggerSelectedItem={this.updateChildItemAt}
            />
          ))}
        </ul>
      </div>
    )
  }
}
