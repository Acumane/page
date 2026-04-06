import { useRef } from 'react'

export default function Toast({ message }) {
  const lastMessage = useRef('')
  if (message) lastMessage.current = message

  return <div className={`toast${message ? ' visible' : ''}`}>{lastMessage.current}</div>
}
