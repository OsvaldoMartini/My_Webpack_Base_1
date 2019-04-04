import React, { Component }  from 'react';
import {Scrollbar} from '../../plugins/react_components/react-custom-scrollbars.js';

// export default class ScrollBarDin extends React.Component
// {
//     render() {
//         return (
//                 <Scrollbar style={ {width: '100%', minHeight: 300} } >
//                     <p>Hello world!</p>
//                 </Scrollbar>
//         );
//     }
// }


// import $ from '../../plugins/jquery-v3-2-1/jquery.min.js';

// export default class MyHomeComponent extends React.Component {
//   componentDidMount() {
//     const MCSB = require('malihu-custom-scrollbar-plugin');;
//     let mcsb = new MCSB.default();

//     $("#mypage").mCustomScrollbar({theme:'dark'});

//   }
//   render() {
//     return (<div id="mypage">Enter a lot of content here..</div>);
//   }

// }

export default class ScrollBarDin extends React.PureComponent {
  constructor(props) {
    super(props);
  
    const array = [...Array(10000)].map((val, i) => `Item ${i}`);
    console.log(array); // 1443535752

    this.state = {
      items: [
        {
          text: "id1",
          id: 1
        },
        {
          text: "id2",
          id: 2
        }
      ]
    };

  }
  
  render() {
    return (
      <div className="container">
        <div className="left-col">Left col</div>

        <div className="center-col">
          <span>List</span>
          <ul>
          {/* {this.state.items.map((item, index) => (
            <li
              {...item}
              key={index}
            />
          )
          )} */}

            {this.state.items.map((item, index) => (
              <li key={`item_${index}`}>{item.text}</li>
            ))}
          </ul>
        </div>

        <div className="right-col">Right col</div>
      </div>
    );
  }
}
