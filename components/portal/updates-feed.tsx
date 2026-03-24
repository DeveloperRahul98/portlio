'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow, format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Update, Comment } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Send, Loader2, MessageSquare, Trash2, ChevronDown, ChevronUp, Reply } from 'lucide-react'
import { toast } from 'sonner'

interface UpdatesFeedProps {
  projectId: string
  initialUpdates: Update[]
  accentColor: string
  readonly?: boolean
  clientName?: string
  closed?: boolean
}

export function UpdatesFeed({ projectId, initialUpdates, accentColor, readonly, clientName, closed }: UpdatesFeedProps) {
  const [updates, setUpdates] = useState<Update[]>(initialUpdates)
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>(() =>
    Object.fromEntries(initialUpdates.map(u => [u.id, u.comments ?? []]))
  )
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [replyContent, setReplyContent] = useState<Record<string, string>>({})
  const [replyName, setReplyName] = useState<Record<string, string>>({})
  const [postingReply, setPostingReply] = useState<string | null>(null)

  // Refetch on mount so switching tabs always shows latest replies
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('updates')
      .select('*, comments(*)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setUpdates(data)
          setCommentsMap(Object.fromEntries(data.map((u: Update) => [u.id, u.comments ?? []])))
        }
      })
  }, [projectId])

  const toggleReplies = (updateId: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev)
      if (next.has(updateId)) next.delete(updateId)
      else next.add(updateId)
      return next
    })
  }

  const postUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setPosting(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('updates')
      .insert({ project_id: projectId, content: content.trim() })
      .select()
      .single()

    if (!error && data) {
      const newUpdate = { ...data, comments: [] }
      setUpdates([newUpdate, ...updates])
      setCommentsMap(prev => ({ ...prev, [data.id]: [] }))
      setContent('')
      toast.success('Update posted successfully')
    } else {
      toast.error('Failed to post update')
    }
    setPosting(false)
  }

  const deleteUpdate = async (id: string) => {
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('updates').delete().eq('id', id)
    if (!error) {
      setUpdates(updates.filter((u) => u.id !== id))
      toast.success('Update deleted')
    } else {
      toast.error('Failed to delete update')
    }
    setDeletingId(null)
  }

  const postReply = async (updateId: string) => {
    const text = replyContent[updateId]?.trim()
    if (!text) return

    const authorName = readonly
      ? (replyName[updateId]?.trim() || clientName || 'Client')
      : 'Freelancer'

    setPostingReply(updateId)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('comments')
      .insert({
        update_id: updateId,
        author_name: authorName,
        content: text,
        is_client: !!readonly,
      })
      .select()
      .single()

    if (!error && data) {
      setCommentsMap(prev => ({
        ...prev,
        [updateId]: [...(prev[updateId] ?? []), data],
      }))
      setReplyContent(prev => ({ ...prev, [updateId]: '' }))
      toast.success(readonly ? 'Reply sent' : 'Reply posted')
    } else {
      toast.error('Failed to post reply')
    }
    setPostingReply(null)
  }

  return (
    <div className="space-y-5">
      {!readonly && (
        <form onSubmit={postUpdate} className="glass-card rounded-2xl p-4 space-y-3">
          <Textarea
            placeholder="Post an update for your client..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-background/60 border-border/50 resize-none text-sm min-h-22.5 focus:border-primary/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) postUpdate(e as unknown as React.FormEvent)
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">⌘+Enter to post</span>
            <Button
              type="submit"
              size="sm"
              disabled={!content.trim() || posting}
              className="bg-primary hover:bg-primary/90 shadow-sm shadow-primary/15 transition-all font-medium"
            >
              {posting
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <><Send className="w-3.5 h-3.5 mr-1.5" />Post update</>
              }
            </Button>
          </div>
        </form>
      )}

      {updates.length === 0 ? (
        <div className="text-center py-14 text-muted-foreground">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-5 h-5 opacity-50" />
          </div>
          <p className="text-sm font-medium">No updates yet</p>
          {!readonly && <p className="text-xs mt-1 text-muted-foreground/70">Post your first update above</p>}
          {readonly && <p className="text-xs mt-1 text-muted-foreground/70">Your freelancer hasn&apos;t posted any updates yet</p>}
        </div>
      ) : (
        <div className="max-h-[520px] overflow-y-auto pr-0.5 space-y-0
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-border/60
          hover:[&::-webkit-scrollbar-thumb]:bg-border">
        <div className="relative space-y-0">
          <div
            className="absolute left-3.5 top-3 bottom-3 w-px rounded-full"
            style={{ background: `linear-gradient(to bottom, ${accentColor}50, transparent)` }}
          />
          <AnimatePresence initial={false}>
            {updates.map((update, i) => {
              const comments = commentsMap[update.id] ?? []
              const isExpanded = expandedReplies.has(update.id)
              const clientReplies = comments.filter(c => c.is_client).length

              return (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="relative pl-10 pb-5 group"
                >
                  <div
                    className="absolute left-2.5 top-2.5 w-2 h-2 rounded-full ring-2 ring-background"
                    style={{ background: i === 0 ? accentColor : 'oklch(0.30 0.04 264)' }}
                  />
                  <div className="glass-card rounded-xl overflow-hidden">
                    <div className="p-4">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{update.content}</p>
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/30">
                        <span
                          className="text-xs text-muted-foreground"
                          title={format(new Date(update.created_at), 'PPpp')}
                        >
                          {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                        </span>
                        <div className="flex items-center gap-2">
                          {/* Badge showing new client replies in freelancer view */}
                          {!readonly && clientReplies > 0 && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ background: `${accentColor}18`, color: accentColor }}
                            >
                              {clientReplies} client repl{clientReplies === 1 ? 'y' : 'ies'}
                            </span>
                          )}
                          <button
                            onClick={() => toggleReplies(update.id)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted/40"
                          >
                            <Reply className="w-3 h-3" />
                            {comments.length > 0
                              ? `${comments.length} repl${comments.length === 1 ? 'y' : 'ies'}`
                              : 'Reply'
                            }
                            {isExpanded
                              ? <ChevronUp className="w-3 h-3 ml-0.5" />
                              : <ChevronDown className="w-3 h-3 ml-0.5" />
                            }
                          </button>
                          {!readonly && (
                            <button
                              onClick={() => deleteUpdate(update.id)}
                              disabled={deletingId === update.id}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                              title="Delete update"
                            >
                              {deletingId === update.id
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <Trash2 className="w-3 h-3" />
                              }
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reply thread */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-border/30 bg-muted/15 px-4 py-3 space-y-3">
                            {/* Chat bubbles */}
                            {comments.length > 0 && (
                              <div className="space-y-2.5">
                                {comments.map((comment) => (
                                  <div
                                    key={comment.id}
                                    className={`flex gap-2 ${!comment.is_client ? 'flex-row-reverse' : ''}`}
                                  >
                                    <div
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                                      style={{
                                        background: comment.is_client
                                          ? `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`
                                          : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                      }}
                                    >
                                      {comment.author_name.slice(0, 1).toUpperCase()}
                                    </div>
                                    <div className={`flex flex-col max-w-[80%] ${!comment.is_client ? 'items-end' : 'items-start'}`}>
                                      <div
                                        className={`rounded-2xl px-3 py-2 text-sm ${
                                          comment.is_client
                                            ? 'bg-muted/60 border border-border/40 rounded-tl-none'
                                            : 'rounded-tr-none'
                                        }`}
                                        style={!comment.is_client ? {
                                          background: `${accentColor}18`,
                                          border: `1px solid ${accentColor}28`,
                                        } : {}}
                                      >
                                        <div className="text-xs font-semibold mb-0.5 text-muted-foreground">
                                          {comment.is_client
                                            ? comment.author_name
                                            : (readonly ? 'Freelancer' : 'You')
                                          }
                                        </div>
                                        <div className="leading-relaxed">{comment.content}</div>
                                      </div>
                                      <span className="text-xs text-muted-foreground/60 mt-1 px-1">
                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reply input — hidden when portal is closed */}
                            {!closed && <div className="space-y-2 pt-1">
                              {readonly && (
                                <Input
                                  placeholder="Your name"
                                  value={replyName[update.id] !== undefined ? replyName[update.id] : (clientName ?? '')}
                                  onChange={(e) => setReplyName(prev => ({ ...prev, [update.id]: e.target.value }))}
                                  className="bg-background/60 border-border/50 h-8 text-xs"
                                />
                              )}
                              <div className="flex gap-2 items-end">
                                <Textarea
                                  placeholder={readonly ? 'Write a reply...' : 'Reply to your client...'}
                                  value={replyContent[update.id] ?? ''}
                                  onChange={(e) => setReplyContent(prev => ({ ...prev, [update.id]: e.target.value }))}
                                  className="bg-background/60 border-border/50 resize-none text-xs"
                                  rows={2}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) postReply(update.id)
                                  }}
                                />
                                <Button
                                  size="sm"
                                  disabled={!replyContent[update.id]?.trim() || postingReply === update.id}
                                  onClick={() => postReply(update.id)}
                                  className="shrink-0 h-9 w-9 p-0"
                                  style={{ background: accentColor }}
                                >
                                  {postingReply === update.id
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <Send className="w-3.5 h-3.5" />
                                  }
                                </Button>
                              </div>
                            </div>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
        </div>
      )}
    </div>
  )
}
