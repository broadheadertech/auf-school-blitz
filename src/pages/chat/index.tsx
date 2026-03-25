import { useState, useEffect, useRef, useMemo } from 'react'
import { MessageSquare, Send, ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'

const db = supabase as any

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  read: boolean
  created_at: string
}

interface ConversationPartner {
  id: string
  name: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export default function ChatPage() {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [partnerNames, setPartnerNames] = useState<Record<string, string>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const userId = user?.id ?? ''

  // Fetch all messages for the current user
  useEffect(() => {
    if (!userId) return

    const fetchMessages = async () => {
      setLoading(true)
      const { data } = await db
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: true })

      if (data) setMessages(data)
      setLoading(false)
    }

    fetchMessages()
  }, [userId])

  // Subscribe to realtime messages
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload: any) => {
          const newMsg = payload.new as Message
          if (newMsg.sender_id === userId || newMsg.recipient_id === userId) {
            setMessages((prev) => [...prev, newMsg])
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Build conversation partners from messages
  const conversations = useMemo(() => {
    const partnerMap = new Map<string, { messages: Message[] }>()

    for (const msg of messages) {
      const partnerId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id
      if (!partnerMap.has(partnerId)) {
        partnerMap.set(partnerId, { messages: [] })
      }
      partnerMap.get(partnerId)!.messages.push(msg)
    }

    const result: ConversationPartner[] = []
    for (const [partnerId, data] of partnerMap.entries()) {
      const sorted = data.messages.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
      const last = sorted[sorted.length - 1]!
      const unreadCount = sorted.filter(
        (m) => m.recipient_id === userId && !m.read,
      ).length

      result.push({
        id: partnerId,
        name: partnerNames[partnerId] ?? partnerId.slice(0, 8) + '...',
        lastMessage: last.content,
        lastMessageAt: last.created_at,
        unreadCount,
      })
    }

    return result.sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    )
  }, [messages, userId, partnerNames])

  // Fetch partner display names
  useEffect(() => {
    const partnerIds = [...new Set(
      messages
        .map((m) => (m.sender_id === userId ? m.recipient_id : m.sender_id))
        .filter((id) => id && !partnerNames[id]),
    )]

    if (partnerIds.length === 0) return

    const fetchNames = async () => {
      const names: Record<string, string> = { ...partnerNames }

      // Try students table
      const { data: students } = await db
        .from('students')
        .select('user_id, first_name, last_name')
        .in('user_id', partnerIds)

      for (const s of students ?? []) {
        names[s.user_id] = `${s.first_name} ${s.last_name}`.trim()
      }

      // Try faculty table for remaining
      const remaining = partnerIds.filter((id) => !names[id])
      if (remaining.length > 0) {
        const { data: faculty } = await db
          .from('faculty')
          .select('user_id, first_name, last_name')
          .in('user_id', remaining)

        for (const f of faculty ?? []) {
          names[f.user_id] = `${f.first_name} ${f.last_name}`.trim()
        }
      }

      setPartnerNames(names)
    }

    fetchNames()
  }, [messages, userId])

  // Scroll to bottom when thread changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedPartnerId, messages])

  // Mark messages as read when selecting a conversation
  useEffect(() => {
    if (!selectedPartnerId || !userId) return

    const unreadIds = messages
      .filter(
        (m) =>
          m.sender_id === selectedPartnerId &&
          m.recipient_id === userId &&
          !m.read,
      )
      .map((m) => m.id)

    if (unreadIds.length > 0) {
      db.from('messages').update({ read: true }).in('id', unreadIds).then(() => {
        setMessages((prev) =>
          prev.map((m) =>
            unreadIds.includes(m.id) ? { ...m, read: true } : m,
          ),
        )
      })
    }
  }, [selectedPartnerId, userId, messages])

  // Thread messages for selected partner
  const threadMessages = useMemo(() => {
    if (!selectedPartnerId) return []
    return messages
      .filter(
        (m) =>
          (m.sender_id === userId && m.recipient_id === selectedPartnerId) ||
          (m.sender_id === selectedPartnerId && m.recipient_id === userId),
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }, [selectedPartnerId, messages, userId])

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedPartnerId || !userId) return

    setSending(true)
    await db.from('messages').insert({
      sender_id: userId,
      recipient_id: selectedPartnerId,
      content: newMessage.trim(),
      read: false,
    })
    setNewMessage('')
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (iso: string) => {
    const date = new Date(iso)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
      return date.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })
    }
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1>Messages</h1>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-[var(--radius-lg)] bg-[var(--color-border)]" />
          ))}
        </div>
      </div>
    )
  }

  // Mobile: if a partner is selected, show thread only
  const showThread = selectedPartnerId !== null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1>Messages</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Direct messaging with students and faculty
          </p>
        </div>
      </div>

      <div className="grid h-[calc(100vh-220px)] min-h-[400px] grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
        {/* Conversation list — hidden on mobile when thread is open */}
        <Card
          className={`flex flex-col overflow-hidden p-0 ${showThread ? 'hidden md:flex' : 'flex'}`}
        >
          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              Conversations
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="mb-3 h-10 w-10 text-[var(--color-text-secondary)]" />
                <p className="text-sm text-[var(--color-text-secondary)]">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedPartnerId(conv.id)}
                  className={`flex w-full items-center gap-3 border-b border-[var(--color-border)] px-4 py-3 text-left transition-colors hover:bg-[var(--color-bg)] ${
                    selectedPartnerId === conv.id ? 'bg-[var(--color-primary-lighter)]' : ''
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-lighter)] text-sm font-bold text-[var(--color-primary)]">
                    {conv.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                        {conv.name}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-[var(--color-text-secondary)]">
                      {conv.lastMessage}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">
                      {formatTime(conv.lastMessageAt)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Message thread */}
        <Card
          className={`flex flex-col overflow-hidden p-0 ${!showThread ? 'hidden md:flex' : 'flex'}`}
        >
          {selectedPartnerId ? (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSelectedPartnerId(null)}
                  className="md:hidden text-[var(--color-primary)]"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-lighter)] text-sm font-bold text-[var(--color-primary)]">
                  {(partnerNames[selectedPartnerId] ?? '?').charAt(0).toUpperCase()}
                </div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {partnerNames[selectedPartnerId] ?? selectedPartnerId.slice(0, 8) + '...'}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {threadMessages.map((msg) => {
                  const isMine = msg.sender_id === userId
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-[var(--radius-lg)] px-3 py-2 text-sm ${
                          isMine
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-[var(--color-bg)] text-[var(--color-text-primary)]'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <p
                          className={`mt-1 text-[10px] ${
                            isMine ? 'text-white/70' : 'text-[var(--color-text-secondary)]'
                          }`}
                        >
                          {formatTime(msg.created_at)}
                          {isMine && msg.read && ' \u2022 Read'}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-[var(--color-border)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
                    aria-label="Message input"
                  />
                  <Button
                    variant="primary"
                    onClick={handleSend}
                    loading={sending}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <MessageSquare className="mb-3 h-12 w-12 text-[var(--color-text-secondary)]" />
              <p className="text-sm text-[var(--color-text-secondary)]">
                Select a conversation to start messaging
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
