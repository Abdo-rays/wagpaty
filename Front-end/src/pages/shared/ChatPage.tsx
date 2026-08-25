import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Circle, Check, CheckCheck, Search, Plus, X, ArrowLeft } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import Spinner from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LanguageContext'
import { chatApi } from '../../lib/api/chat.api'
import { connectSocket, getSocket, disconnectSocket } from '../../lib/socket'

interface Msg { _id: string; sender: any; senderModel: string; content: string; createdAt: string; isRead: boolean }
interface Convo { partnerId: string; partnerName: string; partnerLogo?: string; lastMessage?: string; unreadCount?: number; isOnline?: boolean }

export default function ChatPage() {
  const { user } = useAuth()
  const { t } = useLang()
  const [convos, setConvos] = useState<Convo[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [loadingConvos, setLoadingConvos] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)
  const [conversationSearch, setConversationSearch] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [chatContacts, setChatContacts] = useState<Convo[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const convosRef = useRef<Convo[]>([])

  // Load conversations list
  useEffect(() => {
    const load = async () => {
      setLoadingConvos(true)
      try {
        const contactsRes = await chatApi.getContacts()
        const contacts = (contactsRes.data?.data || []).map((contact: any) => ({
          partnerId: contact._id,
          partnerName: contact.restaurantName || contact.name,
          partnerLogo: contact.logo || contact.profileImage,
          isOnline: undefined,
        }))
        setChatContacts(contacts)
        const res = await chatApi.getConversations()
        const loadedConvos = res.data?.data || []
        const withMessages = contacts.map((contact: Convo) => {
          const existing = loadedConvos.find((conversation: Convo) => conversation.partnerId === contact.partnerId)
          return existing ? { ...contact, ...existing } : contact
        })
        const finalConvos = user?.role === 'customer' ? withMessages : loadedConvos
        convosRef.current = finalConvos
        setConvos(finalConvos)
      } catch {
        // fallback: empty
      } finally {
        setLoadingConvos(false)
      }
    }
    load()
  }, [user])

  // Socket connection
  useEffect(() => {
    if (!user) {
      disconnectSocket()
      return
    }
    const token = (() => { try { const s = sessionStorage.getItem('auth'); return s ? JSON.parse(s).token : undefined } catch { return undefined } })()
    const socket = connectSocket(token)

    const onUserStatus = ({ userId, isOnline }: any) => {
      setConvos(prev => prev.map(c => c.partnerId === userId && c.isOnline !== isOnline ? { ...c, isOnline } : c))
    }
    const onNewMessage = (msg: any) => {
      // msg should include conversation partner id and sender info
      const partner = (msg.senderModel === 'Restaurant' || msg.senderModel === 'User') ? (msg.sender?._id || msg.sender) : null
      const senderId = String(msg.sender?._id || msg.sender || '')
      const receiverId = String(msg.receiver?._id || msg.receiver || msg.receiverId || '')
      if (activeId && (senderId === String(activeId) || receiverId === String(activeId))) {
        setMessages(m => m.some(existing => existing._id === msg._id) ? m : [...m, msg])
        if (senderId === String(activeId)) {
          chatApi.getConversation(activeId).catch(() => {})
        }
      } else {
        setConvos(prev => prev.map(c => c.partnerId === partner ? { ...c, unreadCount: (c.unreadCount||0) + 1, lastMessage: msg.content } : c))
      }
    }
    const onMessagesRead = ({ readerId }: any) => {
      if (String(readerId) === String(user?.id)) return
      setMessages(prev => prev.map(message => {
        const senderId = String(message.sender?._id || message.sender || '')
        return senderId === String(user?.id) ? { ...message, isRead: true } : message
      }))
    }
    const onTyping = ({ userId }: any) => { if (activeId === userId) setTyping(true) }
    const onStopTyping = ({ userId }: any) => { if (activeId === userId) setTyping(false) }

    socket.on('userStatusChanged', onUserStatus)
    socket.on('newMessage', onNewMessage)
    socket.on('typing', onTyping)
    socket.on('stopTyping', onStopTyping)
    socket.on('messagesRead', onMessagesRead)

    const syncOnlineStatuses = () => {
      convosRef.current.forEach(convo => {
        socket.emit('checkOnlineStatus', convo.partnerId, ({ isOnline }: { isOnline: boolean }) => {
          setConvos(prev => prev.map(item => item.partnerId === convo.partnerId && item.isOnline !== isOnline ? { ...item, isOnline } : item))
        })
      })
    }
    socket.on('connect', syncOnlineStatuses)
    syncOnlineStatuses()

    return () => {
      socket.off('userStatusChanged', onUserStatus)
      socket.off('newMessage', onNewMessage)
      socket.off('typing', onTyping)
      socket.off('stopTyping', onStopTyping)
      socket.off('messagesRead', onMessagesRead)
      socket.off('connect', syncOnlineStatuses)
      // do not disconnect socket here to preserve across pages
    }
  }, [user, activeId])

  // Load messages for active conversation
  useEffect(() => {
    if (!activeId) return
    const load = async () => {
      setLoadingMsgs(true)
      try {
        const res = await chatApi.getConversation(activeId)
        setMessages(res.data?.data || [])
      } catch {
        setMessages([])
      } finally {
        setLoadingMsgs(false)
      }
    }
    load()
  }, [activeId])

  useEffect(() => {
    const socket = getSocket()
    if (!socket || convos.length === 0) return
    convos.forEach(convo => {
      socket.emit('checkOnlineStatus', convo.partnerId, ({ isOnline }: { isOnline: boolean }) => {
        setConvos(prev => prev.map(item => item.partnerId === convo.partnerId && item.isOnline !== isOnline ? { ...item, isOnline } : item))
      })
    })
  }, [convos.length])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // join/leave conversation when activeId changes
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    if (activeId) {
      socket.emit('joinConversation', activeId)
    }
    return () => { if (activeId) socket.emit('leaveConversation', activeId) }
  }, [activeId])

  const send = async () => {
    if (!input.trim() || !activeId || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    try {
      const res = await chatApi.sendMessage(activeId, { content: text })
      const newMsg = res.data?.data
      if (newMsg) {
        setMessages(m => m.some(existing => existing._id === newMsg._id) ? m : [...m, newMsg])
      }
    } catch {
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  // typing indicator emitter
  useEffect(() => {
    const socket = getSocket()
    if (!socket || !activeId) return
    let timeout: any = null
    if (input.trim()) {
      socket.emit('typing', activeId)
      clearTimeout(timeout)
      timeout = setTimeout(() => socket.emit('stopTyping', activeId), 1200)
    } else {
      socket.emit('stopTyping', activeId)
    }
    return () => clearTimeout(timeout)
  }, [input, activeId])

  const activeConvo = convos.find(c => c.partnerId === activeId)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className={`${activeId ? 'hidden md:flex' : 'flex'} flex-col border-e w-full md:w-72 flex-shrink-0`}
        style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-fg" style={{ fontFamily: 'Outfit' }}>{t('messages')}</h2>
            <button onClick={() => setShowNewChat(true)} title="New chat"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg,#E63946,#C1121F)' }}><Plus size={16} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg3" />
              <input value={conversationSearch} onChange={e => setConversationSearch(e.target.value)} placeholder="Search restaurants..." className="input-base pl-9 py-2 text-sm" />
            </div>
          </div>
          {loadingConvos ? <Spinner /> : convos.filter(c => c.partnerName.toLowerCase().includes(conversationSearch.toLowerCase())).map(c => (
            <button key={c.partnerId} onClick={() => setActiveId(c.partnerId)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
              style={{
                borderBottom: '1px solid var(--card-border)',
                background: activeId === c.partnerId ? 'var(--primary-muted)' : 'transparent',
              }}>
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg,#E63946,#C1121F)' }}>
                  {c.partnerLogo ? <img src={c.partnerLogo} alt="" className="w-full h-full object-cover" /> : c.partnerName?.charAt(0) || '?'}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2`}
                  style={{ borderColor: 'var(--card)', background: c.isOnline ? '#10B981' : 'var(--fg-3)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-fg text-sm truncate">{c.partnerName}</p>
                  {(c.unreadCount || 0) > 0 && (
                    <span className="text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0"
                      style={{ background: '#E63946', fontSize: '10px' }}>{c.unreadCount}</span>
                  )}
                </div>
                {c.lastMessage && <p className="text-xs text-fg3 truncate mt-0.5">{c.lastMessage}</p>}
              </div>
            </button>
          ))}
          {!loadingConvos && convos.length === 0 && (
            <div className="py-12 text-center text-fg3 text-sm">{t('noConversations')}</div>
          )}
        </div>
      </div>

      {/* Chat window */}
      {activeId && activeConvo ? (
        <div className="flex-1 flex flex-col min-w-0 bg-page">
          <div className="px-5 py-3.5 flex items-center gap-3" style={{ background: 'var(--card)', borderBottom: '1px solid var(--card-border)' }}>
            <button onClick={() => setActiveId(null)} title="Back to conversations" aria-label="Back to conversations" className="chat-back-button flex items-center gap-1.5 px-2.5 h-9 rounded-lg text-fg2 hover:text-fg mr-1" style={{ background: 'var(--bg-alt)', border: '1px solid var(--card-border)' }}><ArrowLeft size={17} /><span>Back</span></button>
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: 'linear-gradient(135deg,#E63946,#C1121F)' }}>
                {activeConvo.partnerName?.charAt(0)}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                style={{ borderColor: 'var(--card)', background: activeConvo.isOnline ? '#10B981' : 'var(--fg-3)' }} />
            </div>
            <div>
              <p className="font-bold text-fg text-sm">{activeConvo.partnerName}</p>
              <p className={`text-xs flex items-center gap-1 ${activeConvo.isOnline ? 'text-emerald-500' : 'text-fg3'}`}>
                <Circle size={5} fill="currentColor" />
                {activeConvo.isOnline ? t('online') : t('offline')}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {loadingMsgs ? <Spinner /> : messages.map(msg => {
              const isMe = (msg.senderModel === 'User' && user?.role === 'customer') ||
                           (msg.senderModel === 'Restaurant' && user?.role === 'restaurant')
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} anim-fade`}>
                  <div className={`max-w-xs lg:max-w-sm px-4 py-2.5 ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className={`text-xs mt-1 flex items-center gap-1 ${isMe ? 'text-red-200' : 'text-fg3'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      {isMe && (msg.isRead ? <CheckCheck size={14} className="text-sky-300" /> : <Check size={14} />)}
                    </p>
                  </div>
                </div>
              )
            })}
            {typing && (
              <div className="flex justify-start anim-fade">
                <div className="bubble-them px-4 py-3 flex items-center gap-1.5">
                  {[0, 0.15, 0.3].map((d, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-fg3 animate-bounce" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-4 py-3" style={{ background: 'var(--card)', borderTop: '1px solid var(--card-border)' }}>
            <div className="flex items-center gap-3">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                placeholder={`${t('typeMessage')} ${activeConvo.partnerName}...`}
                className="input-base flex-1" />
              <button onClick={send} disabled={!input.trim() || sending}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all active:scale-95 disabled:opacity-40 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#E63946,#C1121F)' }}>
                {sending ? <span className="spinner" /> : <Send size={15} />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center text-fg3">
            <p className="text-5xl mb-4">💬</p>
            <p className="font-medium text-fg2">{t('selectConversation')}</p>
          </div>
        </div>
      )}

      {showNewChat && user?.role === 'customer' && (
        <div className="modal-overlay anim-fade" onClick={() => setShowNewChat(false)}>
          <div className="card p-5 w-full max-w-sm anim-scale" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-fg" style={{ fontFamily: 'Outfit' }}>Start a new chat</h2>
              <button onClick={() => setShowNewChat(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-fg3" style={{ background: 'var(--bg-alt)' }}><X size={15} /></button>
            </div>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {(chatContacts.length ? chatContacts : convos).map(c => <button key={c.partnerId} onClick={() => { setActiveId(c.partnerId); setShowNewChat(false) }} className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-alt" style={{ background: 'transparent' }}>
                <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white font-bold" style={{ background: 'var(--primary)' }}>
                  {c.partnerLogo ? <img src={c.partnerLogo} alt="" className="w-full h-full object-cover" /> : c.partnerName.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-fg">{c.partnerName}</span>
              </button>)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
