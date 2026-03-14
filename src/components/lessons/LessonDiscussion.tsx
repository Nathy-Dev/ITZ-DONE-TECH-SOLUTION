"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { MessageSquare, Send, Reply, Trash2, User, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface LessonDiscussionProps {
  lessonId: Id<"lessons">;
}

export default function LessonDiscussion({ lessonId }: LessonDiscussionProps) {
  const messages = useQuery(api.discussions.getMessagesByLesson, { lessonId });
  const postMessage = useMutation(api.discussions.postMessage);
  const deleteMessage = useMutation(api.discussions.deleteMessage);

  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<Id<"discussions"> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await postMessage({
        lessonId,
        content,
        parentMessageId: replyTo || undefined,
      });
      setContent("");
      setReplyTo(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (messages === undefined) return null;

  // Group messages into threads
  const mainMessages = messages.filter(m => !m.parentMessageId);
  const getReplies = (parentId: Id<"discussions">) => messages.filter(m => m.parentMessageId === parentId);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-blue-800 dark:text-cyan-400" />
        <h3 className="text-xl font-bold">Lesson Discussions</h3>
      </div>

      {/* Post Form */}
      <form onSubmit={handleSubmit} className="relative group">
        {replyTo && (
          <div className="absolute -top-10 left-0 right-0 flex items-center justify-between px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-t-xl animate-in slide-in-from-bottom-2">
            <span className="text-xs font-bold text-blue-800 dark:text-cyan-400 flex items-center gap-2">
              <Reply className="w-3 h-3" /> Replying to message
            </span>
            <button 
              type="button" 
              onClick={() => setReplyTo(null)}
              className="text-xs font-bold text-slate-500 hover:text-red-500"
            >
              Cancel
            </button>
          </div>
        )}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={replyTo ? "Write your reply..." : "Have a question? Ask it here..."}
          className={cn(
            "w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20 resize-none font-medium min-h-[120px] transition-all",
            replyTo ? "rounded-b-2xl" : "rounded-3xl"
          )}
        />
        <div className="absolute bottom-4 right-4">
          <button
            disabled={isSubmitting || !content.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-800 text-white rounded-xl font-bold hover:bg-blue-900 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-blue-800/20"
          >
            {isSubmitting ? "Sending..." : <><Send className="w-4 h-4" /> {replyTo ? "Reply" : "Post Question"}</>}
          </button>
        </div>
      </form>

      {/* Messages List */}
      <div className="space-y-6">
        {mainMessages.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-muted-foreground font-medium">No discussions yet. Be the first to ask a question!</p>
          </div>
        ) : (
          mainMessages.map((msg) => (
            <MessageItem 
              key={msg._id} 
              message={msg} 
              replies={getReplies(msg._id)}
              onReply={() => setReplyTo(msg._id)}
              onDelete={() => deleteMessage({ id: msg._id })}
            />
          ))
        )}
      </div>
    </div>
  );
}

function MessageItem({ message, replies, onReply, onDelete }: any) {
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 group">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
          {message.user.profileImage ? (
            <img src={message.user.profileImage} alt={message.user.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-slate-400" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{message.user.name}</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                {formatDistanceToNow(message.createdAt, { addSuffix: true })}
              </span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button 
                onClick={onReply}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                title="Reply"
              >
                <Reply className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={onDelete}
                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            {message.content}
          </p>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="pl-14 space-y-4 border-l-2 border-slate-100 dark:border-slate-800/50 ml-5">
          <button 
            onClick={() => setShowReplies(!showReplies)}
            className="text-[10px] font-black uppercase tracking-widest text-blue-800 dark:text-cyan-400 flex items-center gap-2 hover:underline mb-2"
          >
            {showReplies ? <><ChevronUp className="w-3 h-3" /> Hide Replies ({replies.length})</> : <><ChevronDown className="w-3 h-3" /> Show Replies ({replies.length})</>}
          </button>
          
          {showReplies && replies.map((reply: any) => (
            <div key={reply._id} className="flex gap-4 group">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                {reply.user.profileImage ? (
                  <img src={reply.user.profileImage} alt={reply.user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[13px]">{reply.user.name}</span>
                    <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                      {formatDistanceToNow(reply.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  <button 
                    onClick={() => onDelete(reply._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {reply.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
