import { io } from 'socket.io-client'

let socket: any = null

export function connectSocket(token?: string) {
  if (socket) return socket
  const configuredApiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL
  const base = import.meta.env.VITE_SOCKET_URL || (configuredApiUrl ? configuredApiUrl.replace(/\/$/, '').replace(/\/api$/, '') : 'https://wagpaty-backend.vercel.app')
  try {
    socket = io(base, { auth: { token } })
    socket.on && socket.on('connect_error', (err: any) => {
      console.warn('Socket connect_error:', err)
    })
  } catch (err) {
    console.warn('Failed to connect socket:', err)
    socket = null
  }
  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (!socket) return
  socket.disconnect()
  socket = null
}
