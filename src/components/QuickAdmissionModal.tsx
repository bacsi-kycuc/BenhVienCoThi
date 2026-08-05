import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, RefreshCw } from "lucide-react";
import { Prompt, PromptCategory } from "../types";

interface QuickAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMaintenance: boolean;
  quickSearchQuery: string;
  setQuickSearchQuery: (query: string) => void;
  prompts: Prompt[];
  categories: PromptCategory[];
  rolledDoctor: Prompt | null;
  isRollingDice: boolean;
  handleRollDice: () => void;
  selectDoctorAndNavigate: (prompt: Prompt) => void;
  getPromptAvgRating: (promptId: number | string) => number;
}

export const QuickAdmissionModal: React.FC<QuickAdmissionModalProps> = ({
  isOpen,
  onClose,
  isMaintenance,
  quickSearchQuery,
  setQuickSearchQuery,
  prompts,
  categories,
  rolledDoctor,
  isRollingDice,
  handleRollDice,
  selectDoctorAndNavigate,
  getPromptAvgRating,
}) => {
  return (
    <AnimatePresence>
      {!isMaintenance && isOpen && (
        <div className="fixed inset-0 bg-[#1E0A14]/70 backdrop-blur-md z-[8000] flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="bg-gradient-to-br from-[#FFFDFE] to-[#F7EBF2] dark:from-[#21171A] dark:to-[#171013] border-2 border-pink-300/80 dark:border-pink-900/60 w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-4 p-5 border-b border-pink-200/60 dark:border-pink-900/40 bg-gradient-to-r from-[#D38C9D] via-[#B86278] to-[#A55166] text-white">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden bg-[#7A2B3E] p-1 shadow-md border-2 border-white/70 flex items-center justify-center flex-shrink-0">
                  <img 
                    src="https://i.postimg.cc/D0Z0ck2p/lotus.jpg" 
                    alt="Lotus" 
                    className="w-full h-full object-cover rounded-xl mix-blend-screen filter brightness-110 contrast-105"
                  />
                </div>
                <div>
                  <h2 className="font-serif italic font-black text-lg sm:text-xl drop-shadow-xs">
                    Đăng ký khám cùng bác sĩ nào?
                  </h2>
                  <p className="text-xs text-pink-100 font-medium opacity-90">
                    Bệnh viện Cố Thị • Tra cứu nhanh
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-white hover:text-rose-100 bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer border-0 flex items-center justify-center w-8 h-8"
                title="Đóng cửa sổ"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-5">
              {/* Search Input Section */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                  <span>Yêu muốn ai chữa cơn thú tính của em?</span>
                </label>
                <div className="relative w-full">
                  <input
                    type="text"
                    value={quickSearchQuery}
                    onChange={(e) => setQuickSearchQuery(e.target.value)}
                    placeholder="Nói ra đi bé ơi..."
                    className="w-full py-3 pl-4 pr-10 rounded-2xl border-2 border-pink-200 dark:border-pink-900/70 bg-white dark:bg-black/40 text-sm font-semibold text-gray-800 dark:text-gray-100 placeholder-rose-300 dark:placeholder-rose-700/80 focus:border-[#A55166] outline-none shadow-xs transition-all"
                  />
                  {quickSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setQuickSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 text-rose-700 dark:text-rose-300 transition-colors cursor-pointer border-0"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Real-time Search Results if search query is provided */}
              {quickSearchQuery.trim() !== "" ? (
                <div className="flex flex-col gap-2.5">
                  <span className="text-[11px] font-extrabold text-[#A55166] dark:text-rose-300 uppercase tracking-wider">
                    🔎 Kết quả tìm kiếm ({prompts.filter(p => p.name.toLowerCase().includes(quickSearchQuery.toLowerCase()) || p.description.toLowerCase().includes(quickSearchQuery.toLowerCase())).length}):
                  </span>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                    {(() => {
                      const results = prompts.filter(p => p.name.toLowerCase().includes(quickSearchQuery.toLowerCase()) || p.description.toLowerCase().includes(quickSearchQuery.toLowerCase()));
                      if (results.length === 0) {
                        return (
                          <div className="p-6 text-center bg-rose-50/50 dark:bg-black/20 rounded-2xl border border-dashed border-pink-200 dark:border-pink-900/30">
                            <span className="text-2xl block mb-1">😿</span>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Hông tìm thấy bác sĩ này rồi bé ơi...</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Thử gõ tên khác hoặc quay xúc xắc ngẫu nhiên bên dưới nhé!</p>
                          </div>
                        );
                      }
                      return results.map(p => {
                        const catObj = categories.find(c => c.id === p.category);
                        const rating = getPromptAvgRating(p.id);
                        return (
                          <div
                            key={p.id}
                            className="p-3 bg-white dark:bg-black/30 border border-pink-200/80 dark:border-pink-900/40 rounded-2xl shadow-xs hover:border-[#A55166] transition-all flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="text-2xl p-2 bg-pink-50 dark:bg-rose-950/40 rounded-xl flex-shrink-0">{p.icon || "🩺"}</span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-extrabold text-xs text-gray-900 dark:text-gray-100 truncate">{p.name}</h4>
                                  {catObj && (
                                    <span className="text-[9px] font-extrabold bg-rose-100 dark:bg-rose-950 text-[#A55166] dark:text-rose-300 px-2 py-0.5 rounded-full">
                                      {catObj.icon} {catObj.name}
                                    </span>
                                  )}
                                  {rating > 0 && (
                                    <span className="text-[10px] text-amber-500 font-extrabold flex items-center gap-0.5">
                                      ⭐ {rating.toFixed(1)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5 italic">
                                  "{p.description}"
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                selectDoctorAndNavigate(p);
                                onClose();
                              }}
                              className="px-3.5 py-2 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex-shrink-0 cursor-pointer border-0 flex items-center gap-1"
                            >
                              <span>Bé khám không? 🩺</span>
                            </button>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              ) : null}

              {/* Random Dice Roller Section */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-pink-50 via-rose-50/40 to-pink-100/50 dark:from-[#291E22] dark:to-[#1C1417] border border-pink-200 dark:border-pink-900/50 shadow-xs flex flex-col gap-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h4 className="font-serif italic font-extrabold text-xs sm:text-sm text-[#A55166] dark:text-[#F0A0B3] flex items-center gap-1.5">
                    <span>Chưa thì cho 50k bệnh án lộn xộn nhé?</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleRollDice}
                    disabled={isRollingDice}
                    className="px-3.5 py-1.5 bg-white dark:bg-black/40 border border-pink-300 dark:border-pink-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-[#A55166] dark:text-pink-300 text-xs font-black rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border-0"
                  >
                    <RefreshCw size={13} className={isRollingDice ? "animate-spin text-rose-500" : "text-rose-500"} />
                    <span>{rolledDoctor ? "Quay lại lần nữa 🎲" : "Đổ xúc xắc 🎲"}</span>
                  </button>
                </div>

                {/* Rolled Doctor Card display or Cute Rolling animation */}
                <AnimatePresence mode="wait">
                  {isRollingDice ? (
                    <motion.div 
                      key="rolling"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-6 bg-gradient-to-r from-rose-100/90 via-pink-100/70 to-rose-100/90 dark:from-rose-950/50 dark:via-pink-950/40 dark:to-rose-950/50 border-2 border-dashed border-pink-300 dark:border-pink-800 rounded-2xl shadow-inner flex items-center justify-center relative overflow-hidden min-h-[120px]"
                    >
                      <div className="flex items-center justify-center gap-4 sm:gap-6 py-2 select-none">
                        {/* ✮⋆˙ Sparkle */}
                        <motion.span 
                          animate={{ 
                            y: [0, -16, 4, -10, 0],
                            x: [-8, 6, -4, 8, -8],
                            rotate: [0, 45, -30, 60, 0],
                            scale: [0.9, 1.3, 1, 1.2, 0.9]
                          }}
                          transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut" }}
                          className="text-2xl sm:text-3xl font-black text-rose-500 tracking-tighter"
                        >
                          ✮⋆˙
                        </motion.span>

                        {/* Main Dice 1 */}
                        <motion.span 
                          animate={{ 
                            y: [0, -22, 6, -14, 0],
                            rotate: [0, 180, 360],
                            scale: [1, 1.35, 0.95, 1.2, 1]
                          }}
                          transition={{ repeat: Infinity, duration: 0.55, ease: "easeInOut" }}
                          className="text-4xl sm:text-5xl filter drop-shadow-md"
                        >
                          🎲
                        </motion.span>

                        {/* ⋆✴︎˚｡⋆ Magic */}
                        <motion.span 
                          animate={{ 
                            y: [-5, 12, -18, 6, -5],
                            x: [6, -8, 8, -4, 6],
                            rotate: [-20, 40, -40, 20, -20],
                            scale: [1.1, 0.95, 1.3, 1, 1.1]
                          }}
                          transition={{ repeat: Infinity, duration: 0.65, ease: "easeInOut", delay: 0.1 }}
                          className="text-xl sm:text-2xl font-black text-pink-600 tracking-tighter"
                        >
                          ⋆✴︎˚｡⋆
                        </motion.span>

                        {/* Main Dice 2 */}
                        <motion.span 
                          animate={{ 
                            y: [0, -18, 5, -12, 0],
                            rotate: [360, 180, 0],
                            scale: [1, 1.25, 0.9, 1.3, 1]
                          }}
                          transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut", delay: 0.15 }}
                          className="text-4xl sm:text-5xl filter drop-shadow-md"
                        >
                          🎲
                        </motion.span>

                        {/* ✮⋆˙ Sparkle 2 */}
                        <motion.span 
                          animate={{ 
                            y: [4, -14, 0, -18, 4],
                            x: [4, -6, 6, -4, 4],
                            rotate: [0, -60, 40, -20, 0],
                            scale: [1, 1.35, 0.9, 1.2, 1]
                          }}
                          transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.2 }}
                          className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tighter"
                        >
                          ✮⋆˙
                        </motion.span>
                      </div>
                    </motion.div>
                  ) : rolledDoctor ? (
                    <motion.div 
                      key={rolledDoctor.id}
                      initial={{ scale: 0.88, opacity: 0, y: 12 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 22 }}
                      className="p-3.5 bg-white dark:bg-black/40 border-2 border-pink-200 dark:border-pink-900/50 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-3xl p-2.5 bg-rose-100/70 dark:bg-rose-950/60 rounded-2xl flex-shrink-0">{rolledDoctor.icon || "🩺"}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-rose-900 dark:text-rose-200">{rolledDoctor.name}</span>
                            {categories.find(c => c.id === rolledDoctor.category) && (
                              <span className="text-[10px] font-extrabold bg-pink-100 dark:bg-pink-950 text-[#A55166] dark:text-pink-300 px-2.5 py-0.5 rounded-full">
                                {categories.find(c => c.id === rolledDoctor.category)?.icon} {categories.find(c => c.id === rolledDoctor.category)?.name}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium italic mt-1 leading-relaxed">
                            "{rolledDoctor.description}"
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          selectDoctorAndNavigate(rolledDoctor);
                          onClose();
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer border-0 flex items-center justify-center gap-1.5 flex-shrink-0"
                      >
                        <span>Bé khám không? 🩺</span>
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-pink-200/60 dark:border-pink-900/40 bg-pink-50/40 dark:bg-black/20 flex justify-end items-center">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-black transition-colors cursor-pointer border-0"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
