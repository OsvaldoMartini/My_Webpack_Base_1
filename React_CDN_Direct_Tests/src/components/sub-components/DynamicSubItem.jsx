import React from 'react'

export default class DynamicSubItem extends React.PureComponent {
  state = {
    text: this.props.text,
  }

  onChange = (event) => {
    if (event.key === 'Enter') {
      this.setState({
        text: event.target.value,
      })
    }
  }

  componentDidMount() {
    console.log('Mounted ', this.props.text)
  }

  componentWillUnmount() {
    console.log('Unmounting ', this.props.text)
  }

  handleRemove = () => {
    //var lang = this.dropdown.value;
    this.props.triggerSelectedItem(this.props.id)
  }

  ShowProductDetails = () => {
    //this.props.triggerChildShow(name);
    this.props.triggerChildShow(this.props.text)
  }

  render() {
    console.log('rerendering ', this.props.text)
    //Two correct wasy to get the property
    const { text } = this.props
    //const text = this.props.text;
    return (
      <li>
        <input
          value={text}
          onChange={this.onChange}
          style={{ background: this.props.background }}
        />
        <span
          id={this.props.id}
          onClick={this.handleRemove}
          text="x"
          original-title="Remove item"
          data-uniqueid={this.props.id}
          style={{ background: this.props.background }}
        >
          X
        </span>
      </li>
    )
  }
}
