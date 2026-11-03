import React, { useState, useEffect, useRef } from "react";
import { LoungePost, LoungeComment, Prompt } from "../types";
import { 
  Sparkles, 
  Image as ImageIcon, 
  Send, 
  MessageCircle, 
  Pin, 
  Trash2, 
  X, 
  Search,
  Maximize2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  HeartHandshake,
  Palette
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

const REACTION_EMOJIS = [
  { key: "heart", emoji: "❤️", label: "Yêu thích" },
  { key: "laugh", emoji: "😂", label: "Cười xỉu" },
  { key: "hug", emoji: "🤗", label: "Ôm một cái" },
  { key: "blossom", emoji: "🌸", label: "Dễ thương" },
];

export const FONT_OPTIONS = [
  { key: "nunito", name: "Nunito (Tròn Trịa & Ngọt Ngào)", class: "font-nunito" },
  { key: "comfortaa", name: "Comfortaa (Anime Modern)", class: "font-comfortaa" },
  { key: "quicksand", name: "Quicksand (Nhẹ Nhàng & Thanh Thoát)", class: "font-quicksand" },
  { key: "itim", name: "Itim (Nét Chữ Tay Webtoon)", class: "font-itim" },
  { key: "baloo", name: "Baloo 2 (Bouncy Cute)", class: "font-baloo" },
  { key: "be_vietnam", name: "Be Vietnam Pro (Sắc Nét Chuẩn)", class: "font-be-vietnam" },
];

export const THEME_OPTIONS = [
  {
    key: "pink",
    name: "🌸 Hồng Sakura (Classic Pink)",
    bg: "bg-gradient-to-br from-[#A55166] via-[#D38C9D] to-[#F2AFBC]",
    textGlowClass: "anime-text-glow-pink",
    bannerGlowClass: "anime-banner-glow-pink",
    btnTextColor: "text-[#A55166]",
    activeFilterBg: "bg-[#A55166] text-white border-[#A55166]"
  },
  {
    key: "lavender",
    name: "🔮 Tím Mộng Mơ (Magical Lavender)",
    bg: "bg-gradient-to-br from-[#6B46C1] via-[#8B5CF6] to-[#C084FC]",
    textGlowClass: "anime-text-glow-lavender",
    bannerGlowClass: "anime-banner-glow-lavender",
    btnTextColor: "text-[#6B46C1]",
    activeFilterBg: "bg-[#6B46C1] text-white border-[#6B46C1]"
  },
  {
    key: "gold",
    name: "🌅 Hoàng Kim Sunset (Golden Hour)",
    bg: "bg-gradient-to-br from-[#B45309] via-[#F59E0B] to-[#FDE047]",
    textGlowClass: "anime-text-glow-gold",
    bannerGlowClass: "anime-banner-glow-gold",
    btnTextColor: "text-[#B45309]",
    activeFilterBg: "bg-[#B45309] text-white border-[#B45309]"
  },
  {
    key: "cyan",
    name: "🌊 Xanh Biển Crystal (Anime Ocean)",
    bg: "bg-gradient-to-br from-[#0369A1] via-[#38BDF8] to-[#BAE6FD]",
    textGlowClass: "anime-text-glow-cyan",
    bannerGlowClass: "anime-banner-glow-cyan",
    btnTextColor: "text-[#0369A1]",
    activeFilterBg: "bg-[#0369A1] text-white border-[#0369A1]"
  },
  {
    key: "mint",
    name: "🍃 Bạc Hà Tươi Mát (Fresh Mint)",
    bg: "bg-gradient-to-br from-[#047857] via-[#34D399] to-[#A7F3D0]",
    textGlowClass: "anime-text-glow-mint",
    bannerGlowClass: "anime-banner-glow-mint",
    btnTextColor: "text-[#047857]",
    activeFilterBg: "bg-[#047857] text-white border-[#047857]"
  }
];

// Helper to count words (Vietnamese + English whitespace separated)
function countWords(str: string): number {
  const trimmed = str.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

// Compress image to Base64 using HTML Canvas
function compressImage(file: File, maxDim = 1080, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context failed"));
        
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = ev.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface HospitalLoungeProps {
  isLoggedIn: boolean;
  addToast: (msg: string, type?: "success" | "warning") => void;
  prompts?: Prompt[];
}

export function HospitalLounge({ isLoggedIn, addToast, prompts = [] }: HospitalLoungeProps) {
  const [posts, setPosts] = useState<LoungePost[]>([]);
  const [comments, setComments] = useState<Record<string, LoungeComment[]>>({});
  const [selectedNurseFilter, setSelectedNurseFilter] = useState("all");
  
  // Modal Post Form state
  const [showPostModal, setShowPostModal] = useState(false);
  const [authorName, setAuthorName] = useState(() => localStorage.getItem("lounge_nickname") || "");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nurse Search Autocomplete state
  const [nurseSearchQuery, setNurseSearchQuery] = useState("");
  const [selectedNurseName, setSelectedNurseName] = useState<string | null>(null);
  const [isNurseDropdownOpen, setIsNurseDropdownOpen] = useState(false);
  const nurseInputRef = useRef<HTMLInputElement>(null);
  const nurseDropdownRef = useRef<HTMLDivElement>(null);

  // Active expanded comments per post
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [newCommentAuthor, setNewCommentAuthor] = useState(() => localStorage.getItem("lounge_nickname") || "");
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  // Lightbox
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // Font & Theme Customizer State
  const [selectedFont, setSelectedFont] = useState(() => localStorage.getItem("lounge_banner_font") || "nunito");
  const [selectedTheme, setSelectedTheme] = useState(() => localStorage.getItem("lounge_banner_theme") || "pink");
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);

  // User reactions tracked in localStorage
  const [userReactions, setUserReactions] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem("lounge_user_reactions") || "{}");
    } catch {
      return {};
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync Banner Theme & Font from Firestore across devices
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "lounge_theme"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.fontKey) {
          setSelectedFont(data.fontKey);
          localStorage.setItem("lounge_banner_font", data.fontKey);
        }
        if (data.themeKey) {
          setSelectedTheme(data.themeKey);
          localStorage.setItem("lounge_banner_theme", data.themeKey);
        }
      }
    }, (err) => {
      console.warn("Firestore settings load error:", err);
    });
    return () => unsub();
  }, []);

  // Close nurse search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        nurseDropdownRef.current &&
        !nurseDropdownRef.current.contains(event.target as Node) &&
        nurseInputRef.current &&
        !nurseInputRef.current.contains(event.target as Node)
      ) {
        setIsNurseDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Subscribe to Lounge Posts
  useEffect(() => {
    const q = query(collection(db, "lounge_posts"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: LoungePost[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as LoungePost;
        loaded.push({ ...data, id: docSnap.id });
      });
      loaded.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setPosts(loaded);
    }, (err) => {
      console.error("Firestore lounge_posts load error:", err);
      handleFirestoreError(err, OperationType.GET, "lounge_posts");
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to Lounge Comments
  useEffect(() => {
    const q = query(collection(db, "lounge_comments"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const grouped: Record<string, LoungeComment[]> = {};
      snapshot.forEach((docSnap) => {
        const c = { ...docSnap.data(), id: docSnap.id } as LoungeComment;
        if (!grouped[c.postId]) grouped[c.postId] = [];
        grouped[c.postId].push(c);
      });
      Object.keys(grouped).forEach(postId => {
        grouped[postId].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });
      setComments(grouped);
    }, (err) => {
      console.error("Firestore lounge_comments load error:", err);
    });

    return () => unsubscribe();
  }, []);

  // Handle Image Selection with max 4 images
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 4) {
      addToast("Mỗi bài viết chỉ được đính kèm tối đa 4 bức ảnh!", "warning");
      return;
    }

    setIsCompressing(true);
    try {
      const compressedList: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        const compressed = await compressImage(file, 1080, 0.72);
        compressedList.push(compressed);
      }
      setImages(prev => [...prev, ...compressedList].slice(0, 4));
      addToast(`Đã tối ưu ${compressedList.length} ảnh siêu nhẹ sẵn sàng đăng! 📸`, "success");
    } catch (err) {
      console.error("Error compressing lounge images:", err);
      addToast("Không thể tải ảnh, vui lòng thử lại file khác!", "warning");
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Post
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAuthor = authorName.trim() || "Bệnh nhân ẩn danh";
    const words = countWords(content);

    if (words === 0) {
      addToast("Vui lòng nhập nội dung bài viết!", "warning");
      return;
    }

    if (words > 1000) {
      addToast(`Bài viết hiện có ${words} từ, vượt quá giới hạn tối đa 1000 từ!`, "warning");
      return;
    }

    const matchedNurse = prompts.find(
      (p) => p.name.toLowerCase() === nurseSearchQuery.trim().toLowerCase()
    );
    const finalNurseName = selectedNurseName || matchedNurse?.name || (nurseSearchQuery.trim() ? nurseSearchQuery.trim() : undefined);

    setIsSubmitting(true);
    const postId = "post_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);
    const newPost: LoungePost = {
      id: postId,
      author: finalAuthor,
      content: content.trim(),
      nurseName: finalNurseName,
      images: images,
      reactions: { heart: 0, laugh: 0, hug: 0, blossom: 0 },
      commentsCount: 0,
      isPinned: false,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem("lounge_nickname", finalAuthor);

    try {
      await setDoc(doc(db, "lounge_posts", postId), newPost);
      
      // Notify Admin in real-time notification center
      const notifId = "notif_post_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      const adminAlert = {
        id: notifId,
        type: "feedback",
        title: `Bài viết mới trong Sảnh Khoe${finalNurseName ? ` (về ${finalNurseName})` : ""}`,
        message: `${finalAuthor}: "${content.trim().slice(0, 90)}${content.trim().length > 90 ? "..." : ""}"`,
        promptId: postId,
        promptName: finalNurseName ? `Về ${finalNurseName}` : "Bài viết Sảnh Khoe",
        author: finalAuthor,
        timestamp: new Date().toISOString(),
        read: false
      };
      setDoc(doc(db, "admin_notifications", notifId), adminAlert).catch(e => console.warn("Admin post notification error:", e));

      addToast("Đã đăng bài lên Sảnh Khoe thành công! 🌸✨", "success");
      window.dispatchEvent(new CustomEvent("celebrate-confetti"));
      
      setContent("");
      setImages([]);
      setNurseSearchQuery("");
      setSelectedNurseName(null);
      setShowPostModal(false);
    } catch (err) {
      console.error("Error saving lounge post:", err);
      handleFirestoreError(err, OperationType.WRITE, `lounge_posts/${postId}`);
      addToast("Lỗi khi đăng bài, vui lòng thử lại!", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reactions Handler
  const handleToggleReaction = async (postId: string, reactionKey: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const currentReactionKey = userReactions[postId];
    const updatedReactions = { ...(post.reactions || {}) };

    if (currentReactionKey === reactionKey) {
      updatedReactions[reactionKey] = Math.max(0, (updatedReactions[reactionKey] || 1) - 1);
      const newUserReactions = { ...userReactions };
      delete newUserReactions[postId];
      setUserReactions(newUserReactions);
      localStorage.setItem("lounge_user_reactions", JSON.stringify(newUserReactions));
    } else {
      if (currentReactionKey && updatedReactions[currentReactionKey]) {
        updatedReactions[currentReactionKey] = Math.max(0, updatedReactions[currentReactionKey] - 1);
      }
      updatedReactions[reactionKey] = (updatedReactions[reactionKey] || 0) + 1;
      const newUserReactions = { ...userReactions, [postId]: reactionKey };
      setUserReactions(newUserReactions);
      localStorage.setItem("lounge_user_reactions", JSON.stringify(newUserReactions));
    }

    try {
      await setDoc(doc(db, "lounge_posts", postId), { ...post, reactions: updatedReactions });
    } catch (err) {
      console.error("Error updating reactions:", err);
      handleFirestoreError(err, OperationType.WRITE, `lounge_posts/${postId}`);
    }
  };

  // Submit Comment
  const handleSubmitComment = async (postId: string) => {
    const text = (newCommentText[postId] || "").trim();
    if (!text) {
      addToast("Vui lòng nhập nội dung bình luận!", "warning");
      return;
    }

    const finalAuthor = (newCommentAuthor || authorName).trim() || (isLoggedIn ? "Ban Giám Đốc" : "Bệnh nhân thân thiện");
    setSubmittingComment(prev => ({ ...prev, [postId]: true }));

    const commentId = "cmt_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const newComment: LoungeComment = {
      id: commentId,
      postId,
      author: finalAuthor,
      content: text,
      isAdmin: isLoggedIn,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem("lounge_nickname", finalAuthor);

    try {
      await setDoc(doc(db, "lounge_comments", commentId), newComment);
      
      const targetPost = posts.find(p => p.id === postId);
      if (targetPost) {
        await setDoc(doc(db, "lounge_posts", postId), {
          ...targetPost,
          commentsCount: (targetPost.commentsCount || 0) + 1
        });
      }

      // Notify Admin in real-time notification center
      const notifId = "notif_cmt_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      const adminAlert = {
        id: notifId,
        type: "feedback",
        title: `Bình luận mới trong Sảnh Khoe`,
        message: `${finalAuthor}: "${text.slice(0, 90)}${text.length > 90 ? "..." : ""}"`,
        promptId: postId,
        promptName: targetPost?.nurseName ? `Về ${targetPost.nurseName}` : "Bài viết Sảnh Khoe",
        author: finalAuthor,
        timestamp: new Date().toISOString(),
        read: false
      };
      setDoc(doc(db, "admin_notifications", notifId), adminAlert).catch(e => console.warn("Admin comment notification error:", e));

      setNewCommentText(prev => ({ ...prev, [postId]: "" }));
      addToast("Đã gửi bình luận! 💬", "success");
    } catch (err) {
      console.error("Error adding lounge comment:", err);
      handleFirestoreError(err, OperationType.WRITE, `lounge_comments/${commentId}`);
      addToast("Lỗi khi gửi bình luận!", "warning");
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Admin Pin / Unpin
  const handleTogglePin = async (post: LoungePost) => {
    if (!isLoggedIn) return;
    try {
      await setDoc(doc(db, "lounge_posts", post.id), {
        ...post,
        isPinned: !post.isPinned
      });
      addToast(post.isPinned ? "Đã gỡ ghim bài viết!" : "Đã ghim bài viết lên đầu sảnh! 📌", "success");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `lounge_posts/${post.id}`);
    }
  };

  // Admin Delete Post
  const handleDeletePost = async (postId: string) => {
    if (!isLoggedIn) return;
    if (!window.confirm("Admin có chắc chắn muốn xóa bài viết này khỏi Sảnh Khoe?")) return;

    try {
      await deleteDoc(doc(db, "lounge_posts", postId));
      addToast("Đã xóa bài viết thành công!", "success");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `lounge_posts/${postId}`);
    }
  };

  // Admin Delete Comment
  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!isLoggedIn) return;
    try {
      await deleteDoc(doc(db, "lounge_comments", commentId));
      const targetPost = posts.find(p => p.id === postId);
      if (targetPost && targetPost.commentsCount) {
        await setDoc(doc(db, "lounge_posts", postId), {
          ...targetPost,
          commentsCount: Math.max(0, targetPost.commentsCount - 1)
        });
      }
      addToast("Đã xóa bình luận!", "success");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `lounge_comments/${commentId}`);
    }
  };

  // Autocomplete matching nurses
  const matchingNurses = nurseSearchQuery.trim()
    ? prompts.filter((p) => p.name.toLowerCase().includes(nurseSearchQuery.trim().toLowerCase()))
    : prompts;

  // Extract list of unique nurses mentioned across all posts for filtering
  const mentionedNurses = Array.from(
    new Set(posts.map((p) => p.nurseName).filter((name): name is string => Boolean(name && name.trim())))
  );

  const filteredPosts = selectedNurseFilter === "all"
    ? posts
    : posts.filter(p => p.nurseName === selectedNurseFilter);

  const wordCount = countWords(content);

  const formatRelativeTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const diffMs = Date.now() - d.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMin < 1) return "Vừa xong";
      if (diffMin < 60) return `${diffMin} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return iso;
    }
  };

  const activeFontObj = FONT_OPTIONS.find(f => f.key === selectedFont) || FONT_OPTIONS[0];
  const activeThemeObj = THEME_OPTIONS.find(t => t.key === selectedTheme) || THEME_OPTIONS[0];

  const handleUpdateThemeAndFont = async (fontKey: string, themeKey: string) => {
    setSelectedFont(fontKey);
    setSelectedTheme(themeKey);
    localStorage.setItem("lounge_banner_font", fontKey);
    localStorage.setItem("lounge_banner_theme", themeKey);
    if (isLoggedIn) {
      try {
        await setDoc(doc(db, "settings", "lounge_theme"), {
          fontKey,
          themeKey,
          updatedAt: new Date().toISOString()
        });
        addToast("Đã lưu font chữ Việt hóa & theme glow cho Sảnh Khoe! 🎨✨", "success");
      } catch (err) {
        console.error("Error saving theme to firestore:", err);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-16 font-nunito">
      
      {/* SẢNH KHOE BANNER / HERO (BACKGROUND IMAGE & SINGLE POST BUTTON ONLY) */}
      <div className="lounge-banner relative w-full h-48 sm:h-64 md:h-72 rounded-3xl overflow-hidden shadow-xl border-2 border-white/30 dark:border-white/20 flex items-center justify-center p-6 sm:p-8">
        <motion.div 
          layoutId="lounge-banner-bg" 
          className="absolute inset-0 w-full h-full"
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
        >
          <img 
            src="https://i.postimg.cc/7PT65BC8/banner.jpg" 
            alt="Sảnh Khoe Banner" 
            className="banner-bg-img w-full h-full object-cover filter blur-[2px] brightness-[0.8] scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/banner_lounge.jpg";
            }}
          />
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        </motion.div>

        {/* SINGLE BUTTON: GỬI (TÂM SỰ) AT CENTER */}
        <div className="relative z-10 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setShowPostModal(true)}
            className="px-8 py-3.5 sm:px-10 sm:py-4 rounded-2xl bg-white/95 text-[#A55166] hover:bg-white hover:text-rose-600 font-extrabold text-base sm:text-lg shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 cursor-pointer border-2 border-white/80"
          >
            <Sparkles size={20} className="text-amber-500 animate-spin" style={{ animationDuration: "6s" }} />
            <span>Gửi</span>
          </button>
        </div>
      </div>

      {/* MODAL 'TÂM SỰ HÔM NAY' (EXPANDS FROM BANNER BACKGROUND) */}
      <AnimatePresence>
        {showPostModal && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            onClick={() => setShowPostModal(false)}
          >
            <motion.div
              layoutId="lounge-banner-bg"
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              className="relative w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden my-auto border-2 border-pink-300/80 dark:border-pink-800/80 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background image expanded into modal backdrop */}
              <img 
                src="https://i.postimg.cc/7PT65BC8/banner.jpg" 
                alt="Modal Background" 
                className="absolute inset-0 w-full h-full object-cover brightness-[0.40] blur-[2px] scale-105 pointer-events-none" 
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/banner_lounge.jpg";
                }}
              />
              <div className="absolute inset-0 bg-black/45 backdrop-blur-xs pointer-events-none" />

              <div className="relative z-10">
                {/* Modal Top Header */}
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md text-pink-200 flex items-center justify-center text-lg font-bold shadow-xs">
                      💌
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide drop-shadow-md">
                      Tâm sự hôm nay
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmitPost} className="flex flex-col gap-4">
                  
                  {/* Author Nickname & Nurse Search Dropdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-pink-100 mb-1">
                        🏷️ Biệt danh của bạn (Tự đặt tùy ý):
                      </label>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="VD: Bệnh nhân phòng 404, Mèo Mê Thuốc..."
                        maxLength={40}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/30 text-xs sm:text-sm text-white placeholder-pink-200/60 focus:outline-none focus:ring-2 focus:ring-pink-300"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-bold text-pink-100 mb-1">
                        🩺 Nhắc đến Điều dưỡng / Bác sĩ:
                      </label>
                      <div className="relative">
                        <input
                          ref={nurseInputRef}
                          type="text"
                          value={nurseSearchQuery}
                          onChange={(e) => {
                            setNurseSearchQuery(e.target.value);
                            setSelectedNurseName(null);
                            setIsNurseDropdownOpen(true);
                          }}
                          onFocus={() => setIsNurseDropdownOpen(true)}
                          placeholder="Gõ tên để tìm kiếm điều dưỡng..."
                          className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/30 text-xs sm:text-sm text-white placeholder-pink-200/60 focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                        <Search size={15} className="absolute left-3 top-3 text-pink-200/70 pointer-events-none" />
                        {nurseSearchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setNurseSearchQuery("");
                              setSelectedNurseName(null);
                              setIsNurseDropdownOpen(false);
                            }}
                            className="absolute right-2.5 top-2.5 p-1 text-pink-200 hover:text-white cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      {/* Autocomplete Dropdown List */}
                      {isNurseDropdownOpen && (
                        <div
                          ref={nurseDropdownRef}
                          className="absolute z-30 top-full left-0 right-0 mt-1.5 max-h-48 overflow-y-auto bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl py-1.5"
                        >
                          {matchingNurses.length > 0 ? (
                            matchingNurses.map((nurse) => (
                              <button
                                key={nurse.id}
                                type="button"
                                onClick={() => {
                                  setSelectedNurseName(nurse.name);
                                  setNurseSearchQuery(nurse.name);
                                  setIsNurseDropdownOpen(false);
                                }}
                                className="w-full px-3.5 py-2 text-left hover:bg-pink-500/30 flex items-center justify-between text-xs sm:text-sm transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{nurse.icon || "🩺"}</span>
                                  <span className="font-bold text-white">{nurse.name}</span>
                                </div>
                                {nurse.khoa && (
                                  <span className="text-[10px] text-pink-200 bg-pink-500/30 px-2 py-0.5 rounded-full border border-pink-400/30">
                                    {nurse.khoa}
                                  </span>
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="px-3.5 py-3 text-xs text-gray-300 italic text-center">
                              {nurseSearchQuery.trim() ? "Không tìm thấy điều dưỡng trùng khớp" : "Nhập tên để tìm kiếm điều dưỡng..."}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-pink-100">
                        ✍️ Nội dung tâm sự (Tối đa 1000 từ):
                      </label>
                      <span className={`text-xs font-mono font-bold ${
                        wordCount > 1000 ? "text-red-400 font-black animate-pulse" : wordCount > 800 ? "text-amber-300" : "text-pink-200/80"
                      }`}>
                        {wordCount} / 1000 từ {wordCount > 1000 && "⚠️ (Vượt quá số từ!)"}
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Hôm nay bạn thấy thế nào? Muốn gửi lời cảm ơn hay tâm sự gì cùng viện không?..."
                      className="w-full p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-xs sm:text-sm text-white placeholder-pink-200/60 focus:outline-none focus:ring-2 focus:ring-pink-300 leading-relaxed resize-y"
                    />
                  </div>

                  {/* Photos Uploader */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-pink-100 flex items-center gap-1.5">
                        <ImageIcon size={14} className="text-pink-300" /> Ảnh đính kèm ({images.length}/4):
                      </label>
                      <span className="text-[11px] text-pink-200/70">
                        Nén tự động siêu nhẹ (~40KB/ảnh)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative group w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/40 shadow-md">
                          <img src={img} alt="preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors cursor-pointer"
                            title="Xóa ảnh"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}

                      {images.length < 4 && (
                        <button
                          type="button"
                          disabled={isCompressing}
                          onClick={() => fileInputRef.current?.click()}
                          className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/40 hover:border-white flex flex-col items-center justify-center text-pink-200 gap-1 bg-white/10 hover:bg-white/20 transition-all cursor-pointer hover:scale-105"
                        >
                          {isCompressing ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <ImageIcon size={18} />
                              <span className="text-[10px] font-bold">+ Thêm ảnh</span>
                            </>
                          )}
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                    </div>
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/20">
                    <button
                      type="button"
                      onClick={() => setShowPostModal(false)}
                      className="px-4 py-2 rounded-xl text-pink-100 hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || wordCount > 1000 || wordCount === 0}
                      className="px-7 py-2.5 rounded-xl bg-white text-[#A55166] hover:bg-pink-50 font-extrabold text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <Send size={14} />
                      <span>{isSubmitting ? "Đang gửi..." : "Gửi"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FILTER BY MENTIONED NURSES BAR */}
      {mentionedNurses.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
          <button
            type="button"
            onClick={() => setSelectedNurseFilter("all")}
            className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              selectedNurseFilter === "all"
                ? "bg-[#A55166] text-white border-[#A55166] shadow-md scale-105"
                : "bg-white/70 dark:bg-[#1E2533]/70 text-gray-700 dark:text-gray-300 border-pink-100 dark:border-pink-900/30 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            }`}
          >
            <span>✨ Tất cả bài viết ({posts.length})</span>
          </button>

          {mentionedNurses.map((nurseName) => {
            const isActive = selectedNurseFilter === nurseName;
            const count = posts.filter((p) => p.nurseName === nurseName).length;
            return (
              <button
                key={nurseName}
                type="button"
                onClick={() => setSelectedNurseFilter(nurseName)}
                className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  isActive
                    ? "bg-[#A55166] text-white border-[#A55166] shadow-md scale-105"
                    : "bg-white/70 dark:bg-[#1E2533]/70 text-gray-700 dark:text-gray-300 border-pink-100 dark:border-pink-900/30 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                }`}
              >
                <span>🩺 {nurseName} ({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* POSTS FEED */}
      <div className="flex flex-col gap-6">
        {filteredPosts.length === 0 ? (
          <div className="py-16 px-4 bg-white/60 dark:bg-[#1A1215]/60 backdrop-blur-md rounded-3xl border border-dashed border-pink-200 dark:border-pink-900/40 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-950/50 flex items-center justify-center text-3xl">
              ☕
            </div>
            <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">
              {selectedNurseFilter === "all" ? "Chưa có bài viết nào trong Sảnh Khoe!" : `Chưa có bài viết nào nhắc tới ${selectedNurseFilter}`}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
              Hãy là người đầu tiên gửi bài tâm sự hay cảm ơn tại Sảnh Khoe nhé! 🌸
            </p>
            <button
              type="button"
              onClick={() => setShowPostModal(true)}
              className="mt-2 px-5 py-2.5 rounded-xl bg-[#A55166] hover:bg-[#8C3E52] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              ✍️ Đăng tâm sự ngay
            </button>
          </div>
        ) : (
          filteredPosts.map(post => {
            const isCommentsOpen = !!expandedComments[post.id];
            const postComments = comments[post.id] || [];
            const myReaction = userReactions[post.id];

            return (
              <div
                key={post.id}
                className={`lounge-post-card relative bg-white/85 dark:bg-[#1A1215]/85 backdrop-blur-md rounded-3xl p-5 sm:p-6 border transition-all duration-300 shadow-md ${
                  post.isPinned 
                    ? "border-2 border-amber-400/80 dark:border-amber-500/60 bg-gradient-to-br from-amber-50/30 via-white/85 to-pink-50/20 dark:from-amber-950/20 dark:via-[#1A1215]/85 dark:to-rose-950/20" 
                    : "border-pink-100 dark:border-pink-900/40"
                }`}
              >
                {/* Pinned Header indicator */}
                {post.isPinned && (
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-400 mb-3 bg-amber-100/60 dark:bg-amber-950/50 px-3 py-1 rounded-full w-fit border border-amber-300 dark:border-amber-800">
                    <Pin size={12} className="fill-amber-500 text-amber-600" />
                    <span>Bài viết được Ban Quản Trị Ghim Nổi Bật</span>
                  </div>
                )}

                {/* Post Author Bar */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#A55166] to-[#F2AFBC] text-white font-extrabold flex items-center justify-center text-sm shadow-sm select-none">
                      {post.author.slice(0, 1).toUpperCase() || "B"}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                          {post.author}
                        </span>
                        {post.nurseName && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-[#A55166] dark:text-[#F2AFBC] border border-rose-200 dark:border-rose-900/50 flex items-center gap-1">
                            🩺 Gửi đến: {post.nurseName}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Admin Controls */}
                  {isLoggedIn && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleTogglePin(post)}
                        className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                          post.isPinned
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                            : "text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                        }`}
                        title={post.isPinned ? "Gỡ ghim" : "Ghim bài viết"}
                      >
                        <Pin size={14} className={post.isPinned ? "fill-current" : ""} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                        title="Xóa bài viết này"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content Text */}
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line mb-4 font-normal">
                  {post.content}
                </p>

                {/* Images Grid (Up to 4 images) */}
                {post.images && post.images.length > 0 && (
                  <div className={`mb-4 rounded-2xl overflow-hidden border border-pink-100 dark:border-pink-900/40 ${
                    post.images.length === 1 
                      ? "grid grid-cols-1 max-h-[420px]" 
                      : post.images.length === 2 
                      ? "grid grid-cols-2 gap-1.5 max-h-[300px]" 
                      : post.images.length === 3 
                      ? "grid grid-cols-3 gap-1.5 max-h-[260px]" 
                      : "grid grid-cols-2 gap-1.5 max-h-[380px]"
                  }`}>
                    {post.images.map((imgUrl, imgIdx) => (
                      <div
                        key={imgIdx}
                        onClick={() => setActiveLightboxImage(imgUrl)}
                        className="relative group cursor-pointer overflow-hidden bg-black/5 dark:bg-black/30 aspect-square sm:aspect-auto h-full"
                      >
                        <img
                          src={imgUrl}
                          alt={`Post visual ${imgIdx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Maximize2 size={20} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reactions & Comment Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-pink-100 dark:border-pink-900/30">
                  {/* Emoji Reactions buttons */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    {REACTION_EMOJIS.map(r => {
                      const count = (post.reactions?.[r.key] || 0);
                      const isSelected = myReaction === r.key;
                      return (
                        <button
                          key={r.key}
                          type="button"
                          onClick={() => handleToggleReaction(post.id, r.key)}
                          className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                            isSelected
                              ? "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 shadow-sm scale-105"
                              : "bg-pink-50/50 dark:bg-black/20 hover:bg-pink-100/50 dark:hover:bg-rose-950/30 text-gray-700 dark:text-gray-300 border border-transparent"
                          }`}
                          title={r.label}
                        >
                          <span className="text-sm">{r.emoji}</span>
                          {count > 0 && <span className="font-mono text-[11px]">{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Toggle comments button */}
                  <button
                    type="button"
                    onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50/70 dark:bg-black/30 hover:bg-pink-100 dark:hover:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    <MessageCircle size={14} />
                    <span>Bình luận ({postComments.length})</span>
                    {isCommentsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {/* EXPANDABLE COMMENTS SECTION */}
                <AnimatePresence>
                  {isCommentsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pt-4 mt-3 border-t border-pink-100/60 dark:border-pink-900/30 flex flex-col gap-3"
                    >
                      {/* Comments List */}
                      {postComments.length === 0 ? (
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic py-2 text-center">
                          Chưa có bình luận nào. Hãy để lại lời nhắn động viên đầu tiên nhé!
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                          {postComments.map(c => (
                            <div
                              key={c.id}
                              className={`p-3 rounded-2xl flex flex-col gap-1 text-xs ${
                                c.isAdmin 
                                  ? "bg-rose-100/60 dark:bg-rose-950/40 border border-pink-300 dark:border-pink-800/80" 
                                  : "bg-pink-50/40 dark:bg-black/25 border border-pink-100/50 dark:border-pink-900/20"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-gray-900 dark:text-gray-100">
                                    {c.author}
                                  </span>
                                  {c.isAdmin && (
                                    <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-[#A55166] text-white flex items-center gap-0.5">
                                      <ShieldCheck size={11} /> BQT
                                    </span>
                                  )}
                                  <span className="text-[10px] text-gray-400">
                                    • {formatRelativeTime(c.createdAt)}
                                  </span>
                                </div>

                                {isLoggedIn && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(post.id, c.id)}
                                    className="text-gray-400 hover:text-red-500 p-0.5 transition-colors cursor-pointer"
                                    title="Xóa bình luận"
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                                {c.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={newCommentText[post.id] || ""}
                          onChange={(e) => setNewCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmitComment(post.id);
                            }
                          }}
                          placeholder={isLoggedIn ? "Bình luận với tư cách Ban Quản Trị..." : "Viết bình luận, lời an ủi/khen ngợi..."}
                          className="flex-1 px-3.5 py-2 rounded-xl bg-pink-50/50 dark:bg-black/30 border border-pink-200 dark:border-pink-900 text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#A55166]"
                        />
                        <button
                          type="button"
                          disabled={submittingComment[post.id] || !(newCommentText[post.id] || "").trim()}
                          onClick={() => handleSubmitComment(post.id)}
                          className="px-3.5 py-2 rounded-xl bg-[#A55166] hover:bg-[#8C3E52] text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
                        >
                          <Send size={13} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeLightboxImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setActiveLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeLightboxImage}
                alt="Enlarged view"
                className="w-full h-full object-contain max-h-[85vh] select-none rounded-2xl"
              />
              <button
                type="button"
                onClick={() => setActiveLightboxImage(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
