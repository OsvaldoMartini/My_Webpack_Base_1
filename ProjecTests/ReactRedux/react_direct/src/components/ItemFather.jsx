import React from 'react';
import SubItem from './sub-components/SubItem.jsx';

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
  
     removeChildItemAt(index) {
       console.log('to Remove: '+ index);
      
       let items = this.state.items.splice(index,1);
        this.setState({items})

       // delete this.state.items[index];
      // // set the state
      // this.setState({ items : this.state.items });

      // var tmpArray = this.state.items.slice();
      // tmpArray.splice(index, 1);
      // this.setState({ items: tmpArray })
    }

    handleLanguage = (langValue) => {
      alert('ready to remove');
      this.setState({language: langValue});
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