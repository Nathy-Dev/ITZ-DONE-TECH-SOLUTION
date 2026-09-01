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
  userId: Id<"users"> | null;
}

export default function LessonDiscussion({ lessonId, userId }: LessonDiscussionProps) {
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
        userId: userId!,
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-bold text-slate-900">Lesson Discussions</h3>
      </div>

      {/* Post Form */}
      <form onSubmit={handleSubmit} className="relative group">
        {replyTo && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 border border-blue-200 border-b-0 rounded-t-lg">
            <span className="text-xs font-semibold text-blue-600 flex items-center gap-1.5">
              <Reply className="w-3 h-3" /> Replying to message
            </span>
            <button 
              type="button" 
              onClick={() => setReplyTo(null)}
              className="text-xs font-medium text-slate-500 hover:text-red-500"
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
            "w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 resize-none text-xs min-h-[90px] transition-all",
            replyTo ? "rounded-b-lg" : "rounded-lg"
          )}
        />
        <div className="flex justify-end mt-1.5">
          <button
            disabled={isSubmitting || !content.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xs"
          >
            {isSubmitting ? "Sending..." : <><Send className="w-3 h-3" /> {replyTo ? "Reply" : "Post Question"}</>}
          </button>
        </div>
      </form>

      {/* Messages List */}
      <div className="space-y-3 pt-2">
        {mainMessages.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <p className="text-slate-400 text-xs">No discussions yet. Be the first to ask a question!</p>
          </div>
        ) : (
          mainMessages.map((msg) => (
            <MessageItem 
              key={msg._id} 
              message={msg} 
              replies={getReplies(msg._id)}
              onReply={() => setReplyTo(msg._id)}
              onDelete={(id: Id<"discussions">) => deleteMessage({ id, userId: userId! })}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface DiscussionUser {
  name?: string;
  profileImage?: string;
}

interface DiscussionMessage {
  _id: Id<"discussions">;
  content: string;
  createdAt: number;
  parentMessageId?: Id<"discussions">;
  user?: DiscussionUser;
}

interface MessageItemProps {
  message: DiscussionMessage;
  replies: DiscussionMessage[];
  onReply: () => void;
  onDelete: (id: Id<"discussions">) => void;
}

function MessageItem({ message, replies, onReply, onDelete }: MessageItemProps) {
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2.5">
      <div className="flex gap-2.5 group">
        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
          {message.user?.profileImage ? (
            <img src={message.user.profileImage} alt={message.user.name || "User"} className="w-full h-full object-cover" />
          ) : (
            <User className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-slate-900">{message.user?.name || "Student"}</span>
              <span className="text-[10px] text-slate-400">
                {formatDistanceToNow(message.createdAt, { addSuffix: true })}
              </span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button 
                onClick={onReply}
                className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors"
                title="Reply"
              >
                <Reply className="w-3 h-3" />
              </button>
              <button 
                onClick={() => onDelete(message._id)}
                className="p-1 hover:bg-red-50 rounded text-red-500 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="pl-6 space-y-2 border-l border-slate-100 ml-3">
          <button 
            onClick={() => setShowReplies(!showReplies)}
            className="text-[10px] font-semibold text-blue-600 flex items-center gap-1 hover:underline"
          >
            {showReplies ? <><ChevronUp className="w-2.5 h-2.5" /> Hide Replies ({replies.length})</> : <><ChevronDown className="w-2.5 h-2.5" /> Show Replies ({replies.length})</>}
          </button>
          
          {showReplies && replies.map((reply) => (
            <div key={reply._id} className="flex gap-2 group pt-1">
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                {reply.user?.profileImage ? (
                  <img src={reply.user.profileImage} alt={reply.user.name || "User"} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-2.5 h-2.5 text-slate-400" />
                )}
              </div>
              <div className="flex-1 space-y-0.5 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">{reply.user?.name || "Student"}</span>
                    <span className="text-[9px] text-slate-400">
                      {formatDistanceToNow(reply.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  <button 
                    onClick={() => onDelete(reply._id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-50 rounded text-red-500 transition-colors"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
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
