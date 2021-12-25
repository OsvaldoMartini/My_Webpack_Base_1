import { useCallback, useState } from 'react'

export default function ParentCounter() {
  const [count, setCount] = useState(0)

  const callback = useCallback((count) => {
    setCount(count)
  }, [])

  return (
    <div className="App">
      <Counter parentCallback={callback} />
      <h2>count {count}</h2>
    </div>
  )
}
