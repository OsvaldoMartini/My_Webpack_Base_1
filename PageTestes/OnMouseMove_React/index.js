import ReactDOM from 'react-dom'

import OnMouseMove from './on_mouse-move'

ReactDOM.render(<OnMouseMove />, document.getElementById('root'))

// document.querySelectorAll('.on_mouse_move').forEach((domContainer) => {
//   // Read the comment ID from a data-* attribute.
//   const commentID = parseInt(domContainer.dataset.commentid, 10)
//   ReactDOM.render(e(OnMouseMove, { commentID: commentID }), domContainer)
// })
