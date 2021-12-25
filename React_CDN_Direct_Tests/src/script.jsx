// Code goes here

var Product = React.createClass({
  getINitialState: function () {
    return { qty: 0 }
  },
  buy: function () {
    this.setState({ qty: this.state.qty + 1 })
  },
  render: function () {
    return (
      <div>
        <p>Android - $199</p>
        <button onClick={this.buy}>Buy </button>
        <h3>Qty: {this.props.qty} items(s)</h3>
      </div>
    )
  },
})

function getButtonText() {
  return 'Click on Me!'
}

const App = () => {
  const buttonText = 'Click Me!'
  return (
    <div>
      <label className="label" for="name">
        Enter name:
      </label>
      <input id="name" type="text" />
      <button style={{ backgroundColor: 'blue', color: 'white' }}>
        {buttonText}
      </button>
    </div>
  )
}

/*  this is other way to write
const App = React.createClass({
    render: function() {
      return (
        <div>
            <label className="label" for="name">Enter name:</label>
            <input id="name" type="text"/>
            <button style={{backgroundColor: 'blue', color: 'white'}}>
            {getButtonText()}
            </button>
        </div>
      );
    }
});*/

ReactDOM.render(<App />, document.getElementById('app'))

function tick() {
  const element = (
    <div>
      <h2>It is {new Date().toLocaleTimeString()}.</h2>
    </div>
  )
  ReactDOM.render(element, document.getElementById('tick'))
}
setInterval(tick, 1000)

var Total = React.createClass({
  render: function () {
    return (
      <div>
        <h3>Total Cash: </h3>
      </div>
    )
  },
})

ReactDOM.render(<Product />, document.getElementById('product'))

class Dialog extends React.Component {
  render() {
    return <h1>Message {this.props.message}</h1>
  }
}
class Card extends React.Component {
  render() {
    return (
      <h1 onClick={this.props.setDialogMessage.bind(this, this.props.title)}>
        {this.props.title}
      </h1>
    )
  }
}
class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = { message: 'Initial message' }
  }
  setDialogMessage(message) {
    this.setState({ dialogMessage: message })
  }
  render() {
    return (
      <div>
        <Dialog message={this.state.dialogMessage} />
        {this.props.cards.map((card, i) => (
          <Card
            key={i}
            title={card}
            setDialogMessage={(message) => this.setDialogMessage(message)}
          />
        ))}
      </div>
    )
  }
}

ReactDOM.render(
  <Main cards={['mama', 'papa', 'dother']}></Main>,
  document.getElementById('example'),
)

class MyHomeComponent extends React.Component {
  componentDidMount() {
    const MCSB = require('./<path>/MCustomScrollBar')
    let mcsb = new MCSB.default()

    $('#mypage').mCustomScrollbar({ theme: 'dark' })
  }
  render() {
    return (
      <div id="mypage">Enter a lot of content here..{this.props.title}</div>
    )
  }
}

ReactDOM.render(
  <MyHomeComponent></MyHomeComponent>,
  document.getElementById('mypage'),
)
