// App.tsx
// Kindacode.com
import React from 'react'

const e = React.createElement

const OnMouseMove: React.FunctionComponent = () => {
  // This function will be triggered when the mouse pointer is over the box
  const boxMouseOverHandler = (event: React.MouseEvent<HTMLDivElement>) => {
    const box: HTMLDivElement = event.currentTarget
    box.style.backgroundColor = 'lightblue'
  }

  // This function will be triggered when the mouse pointer is moving out the box
  const boxMouseOutHandler = (event: React.MouseEvent<HTMLDivElement>) => {
    const box: HTMLDivElement = event.currentTarget
    box.style.backgroundColor = 'lightgreen'
  }

  // This function will be triggered when the mouse pointer is over the input
  const inputMouseOverHandler = (event: React.MouseEvent<HTMLInputElement>) => {
    const input: HTMLInputElement = event.currentTarget
    input.style.backgroundColor = 'lime'
  }

  // This function will be triggered when the mouse pointer is moving out of the input
  const inputMouseOutHandler = (event: React.MouseEvent<HTMLInputElement>) => {
    const input: HTMLInputElement = event.currentTarget
    input.style.backgroundColor = 'white'
  }

  // This function will be triggered when the mouse pointer is over the button
  const buttonMouseOverHandler = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const btn: HTMLButtonElement = event.currentTarget
    btn.style.border = '3px solid red'
    btn.style.backgroundColor = 'orange'
  }

  // This function will be triggered when the mouse pointer is moving out of the button
  const buttonMouseOutHandler = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const btn: HTMLButtonElement = event.currentTarget
    btn.style.border = 'none'
    btn.style.backgroundColor = 'yellow'
  }

  return (
    <div
      style={styles.box}
      onMouseOver={boxMouseOverHandler}
      onMouseOut={boxMouseOutHandler}
    >
      <input
        onMouseOver={inputMouseOverHandler}
        onMouseOut={inputMouseOutHandler}
        style={styles.input}
        placeholder="Welcome to KindaCode.com"
      />
      <button
        onMouseOver={buttonMouseOverHandler}
        onMouseOut={buttonMouseOutHandler}
        style={styles.button}
      >
        Button
      </button>
    </div>
  )
}

// Styling
const styles: { [key: string]: React.CSSProperties } = {
  box: {
    margin: '50px auto',
    width: 400,
    padding: 50,
    backgroundColor: 'lightgreen',

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  input: {
    width: 300,
    padding: '10px 8px',
    border: '1px solid #666',
    borderRadius: 10,
  },
  button: {
    marginTop: 20,
    padding: '20px 30px',
    border: 'none',
    backgroundColor: 'yellow',
    cursor: 'pointer',
    borderRadius: 10,
  },
}

export default OnMouseMove

// // Find all DOM containers, and render Like buttons into them.
// document.querySelectorAll('.on_mouse_move').forEach((domContainer) => {
//   // Read the comment ID from a data-* attribute.
//   // const commentID = parseInt(domContainer.dataset.commentid, 10)
//   React.ReactDOM.render(e(OnMouseMove), domContainer)
// })
