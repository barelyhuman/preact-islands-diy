import { useState } from 'preact/hooks'
import { styled } from 'goober'

const Button = styled('button')`
  background: #efefef;
  color: #181819;
  padding: 6px 12px;
  font-size: 16px;
  min-width: 100px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: black;
  border: 0;
`

export default function Counter({ initValue = 0 }) {
  const [x, setX] = useState(initValue)
  return (
    <>
      <Button onClick={_ => setX(x + 1)}>{x}</Button>
    </>
  )
}
