import React from 'react'
//import ReactDOM from 'react-dom';
import Draggable from 'react-draggable'

class DraggableComp extends React.Component {
  state = {
    activeDrags: 0,
    deltaPosition: {
      x: 0,
      y: 0,
    },
    controlledPosition: {
      x: -400,
      y: 200,
    },
  }

  handleDrag = (e, ui) => {
    const { x, y } = this.state.deltaPosition
    this.setState({
      deltaPosition: {
        x: x + ui.deltaX,
        y: y + ui.deltaY,
      },
    })
  }

  onStart = () => {
    this.setState({ activeDrags: ++this.state.activeDrags })
  }

  onStop = () => {
    this.setState({ activeDrags: --this.state.activeDrags })
  }

  // For controlled component
  adjustXPos = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const { x, y } = this.state.controlledPosition
    this.setState({ controlledPosition: { x: x - 10, y } })
  }

  adjustYPos = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const { controlledPosition } = this.state
    const { x, y } = controlledPosition
    this.setState({ controlledPosition: { x, y: y - 10 } })
  }

  onControlledDrag = (e, position) => {
    const { x, y } = position
    this.setState({ controlledPosition: { x, y } })
  }

  onControlledDragStop = (e, position) => {
    this.onControlledDrag(e, position)
    this.onStop()
  }

  render() {
    const dragHandlers = { onStart: this.onStart, onStop: this.onStop }
    const { deltaPosition, controlledPosition } = this.state
    return (
      <Draggable
        position={controlledPosition}
        {...dragHandlers}
        onStop={this.onControlledDragStop}
      >
        <div className="box">
          My position can be changed programmatically. <br />I have a dragStop
          handler to sync state.
          <p>
            <a href="#" onClick={this.adjustXPos}>
              Adjust x ({controlledPosition.x})
            </a>
          </p>
          <p>
            <a href="#" onClick={this.adjustYPos}>
              Adjust y ({controlledPosition.y})
            </a>
          </p>
        </div>
      </Draggable>
    )
  }
}

export default DraggableComp

document.getElementById('draggable_container').forEach((domContainer) => {
  // Read the comment ID from a data-* attribute.
  const commentID = parseInt(domContainer.dataset.commentid, 10)
  ReactDOM.render(e(LikeButton, { commentID: commentID }), domContainer)
})

// Find all DOM containers, and render Like buttons into them.
// document.querySelectorAll('.like_button_container')
//   .forEach(domContainer => {
//     // Read the comment ID from a data-* attribute.
//     const commentID = parseInt(domContainer.dataset.commentid, 10);
//     ReactDOM.render(
//       e(LikeButton, { commentID: commentID }),
//       domContainer
//     );
//   });
