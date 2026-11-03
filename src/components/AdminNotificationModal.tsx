import React, { useState } from "react";
import { AdminNotification } from "../types";
import { 
  X, 
  Bell, 
  MessageSquare, 
  AlertTriangle, 
  CheckCheck, 
  Trash2, 
  ExternalLink,
  Sparkles,
  Inbox
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AdminNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onSelectPromptForFeedback?: (promptId: number | string) => void;
}

export function AdminNotificationModal({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onSelectPromptForFeedback
}: AdminNotificationModalProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const formatTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} • ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    } catch {
      return isoStr;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-[#FFFDFC] dark:bg-[#1A1215] rounded-3xl border-2 border-pink-200 dark:border-pink-900/60 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#D38C9D]/20 via-pink-100/40 to-transparent dark:from-[#A55166]/30 dark:via-transparent dark:to-transparent border-b border-pink-100 dark:border-pink-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#D38C9D]/20 dark:bg-[#A55166]/40 flex items-center justify-center text-[#A55166] dark:text-[#F2AFBC]">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-rose-950 dark:text-rose-100 flex items-center gap-2">
                  <span>Thông Báo Quản Trị</span>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                      {unreadCount} mới
                    </span>
                  )}
                </h3>
                <p className="text-xs text-rose-700/70 dark:text-rose-300/70">
                  Cập nhật phản hồi bệnh nhân & báo cáo kiểm duyệt
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-700 dark:text-rose-300 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Subheader Controls */}
          <div className="px-4 py-2.5 bg-rose-50/50 dark:bg-rose-950/20 border-b border-pink-100 dark:border-pink-900/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  filter === "all"
                    ? "bg-[#A55166] text-white shadow-sm"
                    : "text-rose-800 dark:text-rose-300 hover:bg-rose-100/70 dark:hover:bg-rose-900/30"
                }`}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  filter === "unread"
                    ? "bg-[#A55166] text-white shadow-sm"
                    : "text-rose-800 dark:text-rose-300 hover:bg-rose-100/70 dark:hover:bg-rose-900/30"
                }`}
              >
                Chưa đọc ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 text-[11px] font-bold text-[#A55166] dark:text-[#F2AFBC] hover:underline cursor-pointer"
              >
                <CheckCheck size={14} /> Đã đọc tất cả
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-pink-100 dark:divide-pink-950/40">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500 gap-3">
                <div className="w-14 h-14 rounded-full bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center text-pink-300 dark:text-pink-700">
                  <Inbox size={28} />
                </div>
                <p className="text-sm font-semibold text-rose-900/60 dark:text-rose-200/60">
                  {filter === "unread" ? "Không có thông báo mới chưa đọc!" : "Chưa có thông báo nào gửi đến bạn."}
                </p>
                <span className="text-xs text-rose-400">
                  Khi bệnh nhân gửi nhận xét cho điều dưỡng, hệ thống sẽ báo ngay tại đây 🌸
                </span>
              </div>
            ) : (
              filteredNotifications.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!item.read) onMarkAsRead(item.id);
                  }}
                  className={`p-3 rounded-2xl transition-all flex flex-col gap-2 my-1 ${
                    !item.read 
                      ? "bg-rose-50/80 dark:bg-rose-950/40 border border-pink-200 dark:border-pink-900/50" 
                      : "hover:bg-pink-50/40 dark:hover:bg-rose-950/20 border border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                        item.type === "report" 
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400" 
                          : "bg-pink-100 dark:bg-pink-950/60 text-[#A55166] dark:text-[#F2AFBC]"
                      }`}>
                        {item.type === "report" ? <AlertTriangle size={14} /> : <MessageSquare size={14} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-rose-950 dark:text-rose-100 leading-tight">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          {formatTime(item.timestamp)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Chưa đọc" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotification(item.id);
                        }}
                        className="p-1 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                        title="Xóa thông báo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Message body */}
                  <p className="text-xs text-rose-900 dark:text-rose-200 font-medium pl-9 leading-relaxed">
                    {item.message}
                  </p>

                  {/* Actions bar */}
                  {item.promptId && onSelectPromptForFeedback && (
                    <div className="pl-9 pt-1 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!item.read) onMarkAsRead(item.id);
                          onClose();
                          onSelectPromptForFeedback(item.promptId!);
                        }}
                        className="px-3 py-1 rounded-xl bg-[#A55166] hover:bg-[#8C3E52] text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all"
                      >
                        <ExternalLink size={12} /> Xem & Trả lời nhận xét
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 bg-pink-50/50 dark:bg-rose-950/30 border-t border-pink-100 dark:border-pink-900/30 text-center text-[11px] text-rose-700/70 dark:text-rose-300/70">
            💡 Admin có thể phản hồi trực tiếp các ý kiến của bệnh nhân ngay trong bảng nhận xét!
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
