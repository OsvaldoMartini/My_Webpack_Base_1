import { useState } from 'react'

export default Counter = ({ parentCallback }) => {
  const [count, setCount] = useState(0)

  return (
    <button
      onClick={() => {
        setCount((count) => count + 1)
        parentCallback(count + 1)
      }}
    >
      increment
    </button>
  )
}
