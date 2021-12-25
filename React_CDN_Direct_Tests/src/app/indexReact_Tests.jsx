import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.jsx'
import FirstButton from '../components/FirstButton.jsx'
import SecondButton from '../components/SecondButton.jsx'
import Avatar from '../components/AvatarTest.jsx'
import CalendarDate from '../components/CalendarDate.jsx'
import Product from '../components/ProductList.jsx'
import DynamicItems from '../components/DynamicItems.jsx'
import ParentPlanet from '../components/ParentPlanet.jsx'
import ScrollBarDin from '../components/sub-components/ScrollBarDin.jsx'
//import ParentCounter from '../components/ParentCounter.jsx'
// import OnMouseMove from '../components/on_mouse-move.tsx'

ReactDOM.render(<App />, document.getElementById('root'))

ReactDOM.render(<Product />, document.getElementById('product'))

ReactDOM.render(<FirstButton />, document.getElementById('firstButton'))
ReactDOM.render(<SecondButton />, document.getElementById('secondButton'))
ReactDOM.render(<Avatar />, document.getElementById('avatar'))
ReactDOM.render(<CalendarDate />, document.getElementById('calendarDate'))
ReactDOM.render(<DynamicItems />, document.getElementById('dynamicItems'))
ReactDOM.render(<ParentPlanet />, document.getElementById('planet'))
ReactDOM.render(<ScrollBarDin />, document.getElementById('scroolDin'))
// ReactDOM.render(<ParentCounter />, document.getElementById('parentCounter'))

//ReactDOM.render(<OnMouseMove />, document.getElementById('mouseMoveTS'))
