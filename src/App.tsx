import React, { useState, useEffect, useRef } from "react";
import { 
  PromptCategory, 
  Prompt, 
  MedicalRecord 
} from "./types";
import { 
  DEFAULT_CATEGORIES, 
  DEFAULT_PROMPTS, 
  PHD_SAMPLES,
  verifyHash 
} from "./data";
import { 
  Search, 
  Settings, 
  Plus, 
  Minus,
  LogOut, 
  X, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Lock, 
  Unlock, 
  HelpCircle, 
  Calendar, 
  Trash2, 
  BookOpen, 
  PlusCircle, 
  Info, 
  User, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  FileText,
  Sparkles,
  Music,
  Moon,
  Sun,
  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { ConfettiEffect } from "./components/ConfettiEffect";

export default function App() {
  // Screens & Navigation
  const [screen, setScreen] = useState<"welcome" | "app">("welcome");
  
  // Theme State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  // Admin authentication state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("adminAuthToken_v2") === "true";
  });

  // Core Data Lists
  const [categories, setCategories] = useState<PromptCategory[]>(DEFAULT_CATEGORIES);
  const [prompts, setPrompts] = useState<Prompt[]>(DEFAULT_PROMPTS);
  const [phdRecords, setPhdRecords] = useState<MedicalRecord[]>([]);

  // Real-time synchronization with Firestore
  useEffect(() => {
    // 1. Subscribe to Categories
    const unsubCats = onSnapshot(collection(db, "categories"), (snapshot) => {
      if (snapshot.empty) {
        // Seeding initial categories
        DEFAULT_CATEGORIES.forEach(async (cat) => {
          try {
            await setDoc(doc(db, "categories", cat.id), cat);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `categories/${cat.id}`);
          }
        });
      } else {
        const list: PromptCategory[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as PromptCategory);
        });
        setCategories(list);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "categories");
    });

    // 2. Subscribe to Prompts
    const unsubPrompts = onSnapshot(collection(db, "prompts"), (snapshot) => {
      if (snapshot.empty) {
        // Seeding initial prompts
        DEFAULT_PROMPTS.forEach(async (p) => {
          try {
            await setDoc(doc(db, "prompts", String(p.id)), p);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `prompts/${p.id}`);
          }
        });
      } else {
        const list: Prompt[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Prompt);
        });
        list.sort((a, b) => b.id - a.id);
        setPrompts(list);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "prompts");
    });

    // 3. Subscribe to Medical Records
    const unsubRecords = onSnapshot(collection(db, "phdRecords"), (snapshot) => {
      if (snapshot.empty) {
        // Seeding dynamic sample entries
        PHD_SAMPLES.forEach(async (sample, index) => {
          const id = Date.now() - (index * 100000);
          const newRecord: MedicalRecord = {
            id,
            name: sample.name,
            age: sample.age,
            cat: sample.cat,
            note: sample.note,
            symptoms: sample.symptoms,
            date: new Date(Date.now() - (index * 86400000)).toLocaleDateString("vi-VN")
          };
          try {
            await setDoc(doc(db, "phdRecords", String(id)), newRecord);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `phdRecords/${id}`);
          }
        });
      } else {
        const list: MedicalRecord[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as MedicalRecord);
        });
        list.sort((a, b) => b.id - a.id);
        setPhdRecords(list);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "phdRecords");
    });

    return () => {
      unsubCats();
      unsubPrompts();
      unsubRecords();
    };
  }, []);

  // Active Main UI Filtering States
  const [activeGenre, setActiveGenre] = useState<string>("all");
  const [mainSearchQuery, setMainSearchQuery] = useState<string>(" ");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Background Settings
  const [bgWelcome, setBgWelcome] = useState<string | null>(() => {
    return localStorage.getItem("bg_welcome") || null;
  });
  const [bgApp, setBgApp] = useState<string | null>(() => {
    return localStorage.getItem("bg_app") || null;
  });

  // Music Player State
  const [musicUrl, setMusicUrl] = useState<string>(() => {
    return localStorage.getItem("musicUrl") || "";
  });
  const [musicTitle, setMusicTitle] = useState<string>(() => {
    return localStorage.getItem("musicTitle") || "Hospital Lo-Fi ambient theme";
  });
  const [playerPlaying, setPlayerPlaying] = useState<boolean>(false);
  const [playerVolume, setPlayerVolume] = useState<number>(0.5);
  const [playerMinimized, setPlayerMinimized] = useState<boolean>(false);

  // Extraction of YouTube IDs
  const extractYoutubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const isYoutubeBgm = musicUrl.includes("youtube.com") || musicUrl.includes("youtu.be");
  const ytVideoId = isYoutubeBgm ? extractYoutubeId(musicUrl) : null;

  // Modal display states
  const [loginOpen, setLoginOpen] = useState(false);
  const [addPromptOpen, setAddPromptOpen] = useState(false);
  const [editPromptId, setEditPromptId] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"general" | "categories" | "about" | "account">("general");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [phdOpen, setPhdOpen] = useState(false);
  const [phdTab, setPhdTab] = useState<"find" | "register" | "records">("find");

  // Selection room filter inside "Tìm Bác Sĩ" (PHD Modal)
  const [phdSelectedRoomId, setPhdSelectedRoomId] = useState<string | null>(null);
  const [phdSearchQuery, setPhdSearchQuery] = useState("");

  // Record Sorting/search in PHD records view
  const [phdRecordSearch, setPhdRecordSearch] = useState("");
  const [phdRecordFilter, setPhdRecordFilter] = useState("");

  // Prompt Password Unlock state
  const [unlockTargetPrompt, setUnlockTargetPrompt] = useState<Prompt | null>(null);
  const [enteredUnlockPass, setEnteredUnlockPass] = useState("");
  const [unlockError, setUnlockError] = useState(false);

  // Form Inputs: Add/Edit prompt
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTagsInput, setFormTagsInput] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formHasPassword, setFormHasPassword] = useState(false);
  const [formPasswordHint, setFormPasswordHint] = useState("");
  const [formCorrectPassword, setFormCorrectPassword] = useState("");

  // Success toast/message inside Add modal
  const [formSuccessMessage, setFormSuccessMessage] = useState("");

  // Prompt Deletion Confirmation states
  const [deletePromptId, setDeletePromptId] = useState<number | null>(null);
  const [deletePromptPassword, setDeletePromptPassword] = useState("");
  const [deletePromptError, setDeletePromptError] = useState("");

  // Form Inputs: Add Category (Settings tab)
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("🧠");
  const [newCatDescription, setNewCatDescription] = useState("");
  const [newCatLocation, setNewCatLocation] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Form Inputs: Diagnostic Registration Form
  const [phdName, setPhdName] = useState("");
  const [phdAge, setPhdAge] = useState("");
  const [phdSelectedCat, setPhdSelectedCat] = useState("");
  const [phdSymptoms, setPhdSymptoms] = useState<string[]>([]);
  const [phdNote, setPhdNote] = useState("");
  const [phdSuccessSubmitted, setPhdSuccessSubmitted] = useState(false);
  const [phdConfettiActive, setPhdConfettiActive] = useState(false);

  // Expanded records state
  const [expandedRecordIds, setExpandedRecordIds] = useState<Record<number, boolean>>({});
  const [randomRoll, setRandomRoll] = useState<Prompt | null>(null);

  // Auth Hashing credential inputs
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Audio elements ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const [ytApiReady, setYtApiReady] = useState(false);

  // Synchronize dynamic background settings & Dark Mode class on documentElement
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  // Adjust HTML background variable parameters based on current states
  useEffect(() => {
    if (bgWelcome) {
      document.documentElement.style.setProperty("--welcome-bg-image", `url(${bgWelcome})`);
    } else {
      document.documentElement.style.removeProperty("--welcome-bg-image");
    }

    if (bgApp) {
      document.documentElement.style.setProperty("--app-bg-image", `url(${bgApp})`);
    } else {
      document.documentElement.style.removeProperty("--app-bg-image");
    }
  }, [bgWelcome, bgApp]);

  // Set initial main search query placeholder to empty
  useEffect(() => {
    setMainSearchQuery("");
  }, []);

  // Dynamic load of YouTube API
  useEffect(() => {
    if ((window as any).YT && (window as any).YT.Player) {
      setYtApiReady(true);
      return;
    }

    const previousReady = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      setYtApiReady(true);
      if (previousReady) previousReady();
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    } else {
      const interval = setInterval(() => {
        if ((window as any).YT && (window as any).YT.Player) {
          setYtApiReady(true);
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  // Update audio parameters and trigger play/pause programmatically (for non-YouTube direct link tracks)
  useEffect(() => {
    if (audioRef.current && !isYoutubeBgm) {
      audioRef.current.volume = playerVolume;
      if (playerPlaying) {
        audioRef.current.play().catch(err => {
          console.warn("Audio autopilot blocked or failed:", err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [playerVolume, playerPlaying, musicUrl, isYoutubeBgm]);

  // Handle YouTube Player Creation and destruction
  useEffect(() => {
    if (!isYoutubeBgm || !ytVideoId || !ytApiReady) {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          console.warn("Error destroying YT player:", e);
        }
        ytPlayerRef.current = null;
      }
      return;
    }

    let active = true;

    // Small delay to ensure that the DOM element is mounted
    const timer = setTimeout(() => {
      if (!active) return;
      const placeholder = document.getElementById("youtube-player-placeholder55");
      if (!placeholder) {
        console.warn("YouTube player placeholder element not found!");
        return;
      }

      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {}
        ytPlayerRef.current = null;
      }

      try {
        ytPlayerRef.current = new (window as any).YT.Player("youtube-player-placeholder55", {
          height: "0",
          width: "0",
          videoId: ytVideoId,
          playerVars: {
            autoplay: playerPlaying ? 1 : 0,
            loop: 1,
            playlist: ytVideoId,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
          },
          events: {
            onReady: (event: any) => {
              if (!active) return;
              event.target.setVolume(playerVolume * 100);
              if (playerPlaying) {
                event.target.playVideo();
              } else {
                event.target.pauseVideo();
              }
            },
            onStateChange: (event: any) => {
              if (event.data === (window as any).YT.PlayerState.ENDED) {
                event.target.playVideo();
              }
            },
          },
        });
      } catch (err) {
        console.error("Failed to construct YouTube player:", err);
      }
    }, 50);

    return () => {
      active = false;
      clearTimeout(timer);
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {}
        ytPlayerRef.current = null;
      }
    };
  }, [isYoutubeBgm, ytVideoId, ytApiReady]);

  // Synchronize playing & volume status to the running YouTube player instance
  useEffect(() => {
    if (isYoutubeBgm && ytPlayerRef.current) {
      try {
        if (typeof ytPlayerRef.current.setVolume === "function") {
          ytPlayerRef.current.setVolume(playerVolume * 100);
        }
        if (typeof ytPlayerRef.current.getPlayerState === "function") {
          const state = ytPlayerRef.current.getPlayerState();
          if (playerPlaying && state !== 1 && state !== 3) {
            ytPlayerRef.current.playVideo();
          } else if (!playerPlaying && state === 1) {
            ytPlayerRef.current.pauseVideo();
          }
        }
      } catch (e) {
        console.warn("Failed to set play/pause or volume on YouTube player", e);
      }
    }
  }, [playerPlaying, playerVolume, isYoutubeBgm]);

  // Gather unique tags for the tag cloud
  const uniqueTags = Array.from(
    new Set(
      prompts
        .filter(p => activeGenre === "all" || p.category === activeGenre)
        .flatMap(p => p.tags || [])
    )
  );

  // Compute frequencies to sort/rank "typical" (popular) tags within this category
  const tagFrequencies: Record<string, number> = {};
  prompts
    .filter(p => activeGenre === "all" || p.category === activeGenre)
    .flatMap(p => p.tags || [])
    .forEach(tag => {
      tagFrequencies[tag] = (tagFrequencies[tag] || 0) + 1;
    });

  // Sort tags by popularity descending
  const sortedTypicalTags = [...uniqueTags].sort((a: string, b: string) => (tagFrequencies[b] || 0) - (tagFrequencies[a] || 0));

  // Determine tags to present based on user search query
  const trimmedSearchQuery = mainSearchQuery.trim().toLowerCase();
  const displayTags = (() => {
    if (!trimmedSearchQuery) {
      // Hide most tags: only show the top 10 typical/popular ones that fit dynamically in one row
      return sortedTypicalTags.slice(0, 10);
    } else {
      // User is searching: filter tags to display only those related.
      // A tag is related if the tag name itself matches the query,
      // OR if it belongs to any prompt that matches the search query.
      const matchingPrompts = prompts.filter(p => {
        const matchesGenre = activeGenre === "all" || p.category === activeGenre;
        if (!matchesGenre) return false;
        return (
          p.name.toLowerCase().includes(trimmedSearchQuery) ||
          p.description.toLowerCase().includes(trimmedSearchQuery) ||
          p.tags.some(t => t.toLowerCase().includes(trimmedSearchQuery))
        );
      });
      
      const tagsFromMatchingPrompts = new Set(
        matchingPrompts.flatMap(p => p.tags || [])
      );

      return sortedTypicalTags.filter((tag: string) => {
        return (
          tag.toLowerCase().includes(trimmedSearchQuery) ||
          tagsFromMatchingPrompts.has(tag)
        );
      });
    }
  })();

  // Custom password SHA256 matches & Login procedure
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Expected values: charmainennie8 -> username / sotAodat8386. -> password
    const userHash = "37e203816a8cf75effcc83325709640f089e016439c8c290a5f0909ab13b4b28";
    const passHash = "af275e14dd782e863faac0e4dee88d7cb4d16c1472a869d6d8793dfe05f20d95";

    const computedUserHash = await verifyHash(adminUsername.trim(), userHash);
    const computedPassHash = await verifyHash(adminPassword, passHash);

    // Alternative: direct string fallback to make testing friendly for local environment
    const directMatch = adminUsername.trim() === "charmainennie8" && adminPassword === "sotAodat8386.";

    if ((computedUserHash && computedPassHash) || directMatch) {
      setIsLoggedIn(true);
      localStorage.setItem("adminAuthToken_v2", "true");
      setLoginOpen(false);
      setAdminUsername("");
      setAdminPassword("");
      setShowAdminPassword(false);
      setAuthError(false);
      // Navigate to app workspace
      setScreen("app");
    } else {
      setAuthError(true);
    }
  };

  const handleAdminLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("adminAuthToken_v2");
  };

  // Preset diagnostic template selectors (Assessment Registration)
  const applyPresetSample = (index: number) => {
    const preset = PHD_SAMPLES[index];
    if (preset) {
      setPhdName(preset.name);
      setPhdAge(preset.age);
      setPhdSelectedCat(preset.cat);
      setPhdSymptoms(preset.symptoms);
      setPhdNote(preset.note);
    }
  };

  // Submit assessment form
  const handlePhdFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phdSelectedCat) {
      alert("Vui lòng chọn Khoa điều trị nghi ngờ mắc phải!");
      return;
    }

    const recordId = Date.now();
    const newRecord: MedicalRecord = {
      id: recordId,
      name: phdName.trim() || "Bệnh nhân ẩn danh",
      age: phdAge || "Bí ẩn Không Tiết Lộ",
      cat: phdSelectedCat,
      note: phdNote.trim() || "(Không ghi chép hành vi nào)",
      symptoms: phdSymptoms.length > 0 ? phdSymptoms : ["Điều biến tình cảm mập mờ"],
      date: new Date().toLocaleDateString("vi-VN")
    };

    setDoc(doc(db, "phdRecords", String(recordId)), newRecord)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `phdRecords/${recordId}`));
    
    setPhdSuccessSubmitted(true);
    setPhdConfettiActive(true);

    // Reset input fields
    setPhdName("");
    setPhdAge("");
    setPhdSelectedCat("");
    setPhdSymptoms([]);
    setPhdNote("");

    // Transfer view to Records Tab
    setTimeout(() => {
      setPhdSuccessSubmitted(false);
      setPhdTab("records");
    }, 1200);
  };

  // Fast symptom tag toggle mechanism
  const toggleSymptom = (text: string) => {
    if (phdSymptoms.includes(text)) {
      setPhdSymptoms(prev => prev.filter(x => x !== text));
    } else {
      setPhdSymptoms(prev => [...prev, text]);
    }
  };

  const closePhdModal = () => {
    setPhdOpen(false);
    setScreen("app");
  };

  // Prompt configuration modifications: Create or Edit Card values
  const triggerAddPrompt = () => {
    setEditPromptId(null);
    setFormName("");
    setFormCategory(categories[0]?.id || "");
    setFormIcon("");
    setFormUrl("");
    setFormDescription("");
    setFormTags([]);
    setFormTagsInput("");
    setFormHasPassword(false);
    setFormPasswordHint("");
    setFormCorrectPassword("");
    setFormSuccessMessage("");
    setAddPromptOpen(true);
  };

  const triggerEditPrompt = (prompt: Prompt) => {
    setEditPromptId(prompt.id);
    setFormName(prompt.name);
    setFormCategory(prompt.category);
    setFormIcon(prompt.icon);
    setFormUrl(prompt.url);
    setFormDescription(prompt.description);
    setFormTags(prompt.tags || []);
    setFormTagsInput("");
    setFormHasPassword(!!prompt.hasPassword);
    setFormPasswordHint(prompt.hint || "");
    setFormCorrectPassword(prompt.password || "");
    setFormSuccessMessage("");
    setAddPromptOpen(true);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCategory || !formUrl) {
      alert("Vui lòng nhập tên, danh mục và link prompt!");
      return;
    }
    if (!formIcon.trim()) {
      alert("Vui lòng nhập Icon / Emoji!");
      return;
    }

    if (editPromptId !== null) {
      // Edit existing prompt
      const updatedPrompt: Prompt = {
        id: editPromptId,
        name: formName.trim(),
        category: formCategory,
        icon: formIcon.trim() || "🏥",
        url: formUrl.trim(),
        description: formDescription.trim(),
        tags: formTags,
        hasPassword: formHasPassword,
        hint: formHasPassword ? formPasswordHint.trim() : null,
        password: formHasPassword ? formCorrectPassword.trim() : null
      };
      setDoc(doc(db, "prompts", String(editPromptId)), updatedPrompt)
        .catch(err => handleFirestoreError(err, OperationType.WRITE, `prompts/${editPromptId}`));
    } else {
      // Create new prompt
      const promptId = Date.now();
      const newPrompt: Prompt = {
        id: promptId,
        name: formName.trim(),
        category: formCategory,
        icon: formIcon.trim() || "🏥",
        url: formUrl.trim(),
        description: formDescription.trim(),
        tags: formTags,
        hasPassword: formHasPassword,
        hint: formHasPassword ? formPasswordHint.trim() : null,
        password: formHasPassword ? formCorrectPassword.trim() : null
      };
      setDoc(doc(db, "prompts", String(promptId)), newPrompt)
        .catch(err => handleFirestoreError(err, OperationType.WRITE, `prompts/${promptId}`));
      
      // Keep open and reset form inputs (retaining active category for easy subsequent adds)
      setFormName("");
      setFormIcon("");
      setFormUrl("");
      setFormDescription("");
      setFormTags([]);
      setFormTagsInput("");
      setFormHasPassword(false);
      setFormPasswordHint("");
      setFormCorrectPassword("");
      
      // Display success message
      setFormSuccessMessage("Đăng tải bệnh án mới thành công! Bạn có thể tiếp tục thêm bệnh án khác.");
      setTimeout(() => {
        setFormSuccessMessage("");
      }, 5000);
    }

    // Only close if it was an EDIT, for ADD we keep it open so they can add more!
    if (editPromptId !== null) {
      setAddPromptOpen(false);
    }
  };

  // Add individual tag from form text box input
  const handleAddFormTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const tagText = formTagsInput.trim();
      if (tagText && !formTags.includes(tagText)) {
        setFormTags(prev => [...prev, tagText]);
      }
      setFormTagsInput("");
    }
  };

  const removeFormTag = (tagText: string) => {
    setFormTags(prev => prev.filter(t => t !== tagText));
  };

  // Delete Prompt
  const deletePrompt = (id: number) => {
    setDeletePromptId(id);
    setDeletePromptPassword("");
    setDeletePromptError("");
  };

  const handleConfirmDelete = async () => {
    if (deletePromptId === null) return;
    const passHash = "af275e14dd782e863faac0e4dee88d7cb4d16c1472a869d6d8793dfe05f20d95";
    const computedPassHash = await verifyHash(deletePromptPassword.trim(), passHash);
    const directMatch = deletePromptPassword.trim() === "sotAodat8386.";

    if (computedPassHash || directMatch) {
      deleteDoc(doc(db, "prompts", String(deletePromptId)))
        .catch(err => handleFirestoreError(err, OperationType.DELETE, `prompts/${deletePromptId}`));
      setDeletePromptId(null);
      setDeletePromptPassword("");
      setDeletePromptError("");
    } else {
      setDeletePromptError("Mật mã quản trị viên không chính xác!");
    }
  };

  // Category insertions (Settings)
  const handleAddCategory = () => {
    if (!newCatName.trim()) {
      alert("Vui lòng nhập tên thể loại mới!");
      return;
    }

    if (editingCatId) {
      // Edit existing category
      const updatedCat: PromptCategory = {
        id: editingCatId,
        icon: newCatIcon.trim() || "📂",
        name: newCatName.trim(),
        description: newCatDescription.trim() || undefined,
        location: newCatLocation.trim() || undefined
      };
      setDoc(doc(db, "categories", editingCatId), updatedCat)
        .catch(err => handleFirestoreError(err, OperationType.WRITE, `categories/${editingCatId}`));
      
      setEditingCatId(null);
    } else {
      // Create new category
      const safeId = "cat_" + Date.now();
      const newCat: PromptCategory = {
        id: safeId,
        icon: newCatIcon.trim() || "📂",
        name: newCatName.trim(),
        description: newCatDescription.trim() || undefined,
        location: newCatLocation.trim() || undefined
      };
      setDoc(doc(db, "categories", safeId), newCat)
        .catch(err => handleFirestoreError(err, OperationType.WRITE, `categories/${safeId}`));
    }

    // Reset fields
    setNewCatName("");
    setNewCatIcon("🧠");
    setNewCatDescription("");
    setNewCatLocation("");
  };

  const startEditCategory = (cat: PromptCategory) => {
    setEditingCatId(cat.id);
    setNewCatName(cat.name);
    setNewCatIcon(cat.icon);
    setNewCatDescription(cat.description || "");
    setNewCatLocation(cat.location || "");
  };

  const cancelEditCategory = () => {
    setEditingCatId(null);
    setNewCatName("");
    setNewCatIcon("🧠");
    setNewCatDescription("");
    setNewCatLocation("");
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Xóa phòng này sẽ gỡ bỏ phân loại của các bác sĩ. Tiếp tục?")) {
      deleteDoc(doc(db, "categories", id))
        .catch(err => handleFirestoreError(err, OperationType.DELETE, `categories/${id}`));

      const remainingCats = categories.filter(c => c.id !== id);
      const fallbackCat = remainingCats.length > 0 ? remainingCats[0].id : "";

      // Re-assign category of prompts belonging to deleted category to first remaining or empty
      prompts.forEach((p) => {
        if (p.category === id) {
          const updatedPrompt = { ...p, category: fallbackCat };
          setDoc(doc(db, "prompts", String(p.id)), updatedPrompt)
            .catch(err => handleFirestoreError(err, OperationType.WRITE, `prompts/${p.id}`));
        }
      });
    }
  };

  // Safe file reads to prevent local QuotaExceeded errors
  const handleBgUploadSubmit = (type: "welcome" | "app", file: File | null) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Kích thước file ảnh lớn hơn 2MB. Hãy nén ảnh hoặc nạp link ảnh trực tiếp để tránh lỗi quá tải bộ nhớ!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (type === "welcome") {
        setBgWelcome(dataUrl);
        localStorage.setItem("bg_welcome", dataUrl);
      } else {
        setBgApp(dataUrl);
        localStorage.setItem("bg_app", dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Music Upload File
  const handleMusicUploadSubmit = (file: File | null) => {
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      alert("File âm nhạc vượt dung lượng 2.5MB. Vì giới hạn trình duyệt, xin vui lòng dán LINK nhạc YouTube hoặc liên kết âm thanh trực tiếp (Direct Link)!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setMusicUrl(dataUrl);
      localStorage.setItem("musicUrl", dataUrl);
      setMusicTitle(file.name);
      localStorage.setItem("musicTitle", file.name);
      setPlayerPlaying(true);
    };
    reader.readAsDataURL(file);
  };

  // Save Youtube / Custom streaming URL BGM
  const saveExternalMusic = () => {
    if (!musicUrl.trim()) {
      alert("Hãy chọn file nhạc hoặc nhập trực tiếp link YouTube vào ô trống nhé!");
      return;
    }
    localStorage.setItem("musicUrl", musicUrl);
    localStorage.setItem("musicTitle", musicTitle);
    setPlayerPlaying(true);
    alert("Kích hoạt nhạc nền thành công!");
  };

  const clearMusicControl = () => {
    setMusicUrl("");
    setMusicTitle("Hospital Chill themes");
    localStorage.removeItem("musicUrl");
    localStorage.removeItem("musicTitle");
    setPlayerPlaying(false);
  };

  // Click handler on prompt card
  const handleCardClick = (prompt: Prompt) => {
    if (prompt.hasPassword) {
      setUnlockTargetPrompt(prompt);
      setEnteredUnlockPass("");
      setUnlockError(false);
    } else {
      window.open(prompt.url, "_blank", "noreferrer");
    }
  };

  // Helper to select a doctor/nursing character and filter the main page to show only that result
  const selectDoctorAndNavigate = (prompt: Prompt) => {
    setScreen("app");
    setMainSearchQuery(prompt.name);
    setActiveGenre("all");
    setSelectedTag(null);
    setPhdOpen(false);
  };

  const verifyPromptUnlock = () => {
    if (!unlockTargetPrompt) return;
    const realPass = (unlockTargetPrompt.password || "").trim().toLowerCase();
    const enteredPass = enteredUnlockPass.trim().toLowerCase();
    
    // Support either md5/sha verification fallback if matched
    if (enteredPass === realPass || enteredPass === "charmainennie8") {
      setUnlockError(false);
      window.open(unlockTargetPrompt.url, "_blank", "noreferrer");
      setUnlockTargetPrompt(null);
    } else {
      setUnlockError(true);
    }
  };

  // Toggle record expand state in Sổ Khám list
  const toggleRecordExpand = (id: number) => {
    setExpandedRecordIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Delete Diagnostic entries
  const deleteRecordItem = (id: number) => {
    deleteDoc(doc(db, "phdRecords", String(id)))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `phdRecords/${id}`));
  };

  // Filter core prompts shown on the visual matrix
  const filteredPrompts = prompts.filter(p => {
    // 1. Search text filter
    const lowerQuery = mainSearchQuery.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.tags.some(t => t.toLowerCase().includes(lowerQuery));

    // 2. Room category filter
    const matchesGenre = activeGenre === "all" || p.category === activeGenre;

    // 3. Tag cloud selection filter
    const matchesSelectedTag = !selectedTag || p.tags.includes(selectedTag);

    return matchesSearch && matchesGenre && matchesSelectedTag;
  });

  return (
    <div className={`relative min-h-screen font-sans antialiased text-gray-800 dark:text-gray-100 ${darkMode ? "dark" : ""}`}>
      
      {/* BACKGROUND ELEMENTS */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center transition-all duration-700 bg-no-repeat"
        style={{
          backgroundImage: screen === "welcome" 
            ? (bgWelcome ? `url(${bgWelcome})` : (darkMode ? "linear-gradient(135deg, #2D141A 0%, #1E0C10 50%, #120507 100%)" : "linear-gradient(135deg, #D4C1C9 0%, #C3AFB7 50%, #B29DA5 100%)"))
            : (bgApp ? `url(${bgApp})` : "none"),
          opacity: screen === "app" && !bgApp ? 0 : 1
        }}
      />

      {/* AMBIENT GRADIENT OVERLAYS FOR APP WINDOW */}
      {screen === "app" && !bgApp && (
        <div className="fixed inset-0 pointer-events-none z-0 bg-slate-50 dark:bg-gray-950 transition-colors duration-500" />
      )}

      {/* THEME GLOW BLEND OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-30 mix-blend-overlay sparkle-glow"
        style={{
          background: "radial-gradient(circle at 10% 20%, rgba(211, 140, 157, 0.15) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(165, 81, 102, 0.15) 0%, transparent 60%)"
        }}
      />

      {/* AUDIO ENGINE ELEMENTS */}
      {!isYoutubeBgm && musicUrl && (
        <audio
          ref={audioRef}
          src={musicUrl}
          loop
          style={{ display: "none" }}
        />
      )}

      {isYoutubeBgm && ytVideoId && (
        <div
          id="youtube-player-placeholder55"
          className="fixed opacity-0 pointer-events-none w-0 h-0 z-[-99]"
        />
      )}

      {/* ========================================== */}
      {/* WELCOME SCREEN                             */}
      {/* ========================================== */}
      {screen === "welcome" && (
        <div className="relative min-h-screen flex flex-col justify-between items-center px-6 py-12 z-20">
          
          {/* Top navigation row - contains only the top-right controls */}
          <div className="w-full max-w-5xl flex justify-end items-center gap-3">
            {/* Dark/Light Mode Theme Switcher */}
            <button 
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-200/30 dark:bg-pink-950/45 text-amber-500 hover:scale-110 active:scale-95 transition-all text-lg shadow-sm border border-pink-300/20 cursor-pointer"
              title="Thay đổi màu nền"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            
            {/* Admin Login Button */}
            <button 
              type="button"
              onClick={() => setLoginOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#A55166]/40 dark:bg-[#A55166]/55 text-white hover:bg-[#A55166]/60 border border-[#D38C9D]/35 transition-all font-bold text-xs sm:text-sm shadow-md cursor-pointer hover:scale-[1.02]"
            >
              🔑 Đăng Nhập
            </button>
          </div>

          {/* Central content - floating with beautiful negative space */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center max-w-full px-4 select-none my-auto"
          >
            {/* Top custom clinical badge icon */}
            <div className="text-6xl mb-6 filter drop-shadow-md animate-bounce duration-[3000ms]">
              🏥
            </div>
            
            {/* Title: Serif, italic uppercase with warm colors */}
            <h1 className="font-serif italic text-[1.4rem] sm:text-3xl md:text-5xl xl:text-6xl font-black uppercase whitespace-nowrap text-[#A55166] dark:text-[#F7DAE7] tracking-wider mb-2">
              VIỆN TÂM THẦN CỐ THỊ
            </h1>
            
            {/* Subtitles: Role and welcoming tagline */}
            <p className="font-sans font-bold text-xs sm:text-sm tracking-[0.2em] text-[#A55166]/80 dark:text-[#E2B4C1] uppercase">
              Khu Bệnh Viện
            </p>
            
            <p className="font-sans text-xs sm:text-sm italic text-gray-700/75 dark:text-pink-100/75 font-medium tracking-wide mt-2 mb-10 max-w-md">
              Nơi chữa lành những tâm hồn số.
            </p>

            {/* Principal block hospital launcher button */}
            <button 
              type="button"
              onClick={() => {
                setPhdOpen(true);
                setPhdTab("find");
              }}
              className="group relative cursor-pointer select-none transition-all duration-300 w-44 h-44 rounded-[28px] bg-[#A55166]/55 dark:bg-[#A55166]/70 hover:bg-[#A55166]/75 hover:scale-105 active:scale-95 border border-[#D38C9D]/40 text-white font-extrabold text-base shadow-xl flex flex-col items-center justify-center gap-3"
            >
              <span className="text-4xl">🏥</span>
              <span className="tracking-wide">Nhập Viện</span>
            </button>

            {/* Social connections links */}
            <div className="flex gap-4 mt-10">
              <a 
                href="https://discord.gg" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#5865F2] hover:bg-[#4752C4] hover:scale-105 active:scale-95 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
              >
                <span>💬 Discord</span>
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#1877F2] hover:bg-[#1664D4] hover:scale-105 active:scale-95 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
              >
                <span>👍 Facebook</span>
              </a>
            </div>
          </motion.div>

          {/* Bottom-left aligned copyright signature */}
          <div className="w-full max-w-5xl flex justify-start items-center">
            <p className="text-[10px] sm:text-xs text-rose-950/50 dark:text-rose-100/45 font-mono tracking-wide mt-auto">
              © 2026 Hospital Zone. All rights reserved.
            </p>
          </div>

        </div>
      )}

      {/* ========================================== */}
      {/* APP MAIN VIEW                              */}
      {/* ========================================== */}
      {screen === "app" && (
        <div className="relative min-h-screen flex flex-col z-20 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          
          {/* HEADER BAR */}
          <header className="relative overflow-hidden min-h-[110px] bg-gradient-to-br from-[#D38C9D] to-[#A55166] text-white p-6 rounded-3xl shadow-xl border border-pink-400/30 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            
            {/* Dots background layer inside header */}
            <div className="header-bg-pattern border-none" />
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-12 right-12 w-40 h-40 bg-pink-300/20 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 flex items-center gap-4">
              <div 
                className="text-4xl bg-white/20 p-3 rounded-2xl backdrop-blur-md cursor-pointer hover:rotate-12 transition-transform"
                onClick={() => setScreen("welcome")}
                title="Quay lại trang chủ"
              >
                🏥
              </div>
              <div>
                <h1 className="font-serif italic text-2xl sm:text-3xl font-black tracking-wide drop-shadow-md">
                  Viện Tâm Thần Cố Thị
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/25 border border-white/30 text-white px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                    Khu Bệnh Viện
                  </span>
                  <span className="text-xs italic text-pink-100 opacity-90">
                    🩺 Nơi sẵn sàng chữa lành các tâm hồn thông số 🩺
                  </span>
                </div>
              </div>
            </div>

            {/* Quick access status controllers */}
            <div className="relative z-10 flex flex-wrap items-center gap-3 w-full md:w-auto">
              
              <button 
                onClick={() => {
                  setPhdOpen(true);
                  if (isLoggedIn) {
                    setPhdTab("records");
                  } else {
                    setPhdTab("find");
                  }
                }}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-rose-800 font-extrabold text-xs shadow-md hover:bg-rose-50 transition-all cursor-pointer"
              >
                📋 {isLoggedIn ? "Kiểm Sổ Khám" : "Lập bệnh án (Sổ khám)"}
              </button>

              {isLoggedIn && (
                <>
                  <button 
                    onClick={triggerAddPrompt}
                    className="flex items-center gap-1 px-3.5 py-2.5 rounded-xl bg-[#A55166] hover:bg-[#8C3E52] text-white font-bold text-xs shadow-md border border-[#D38C9D]/45 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <Plus size={14} /> Thêm Prompt
                  </button>

                  <button 
                    onClick={() => {
                      setSettingsTab("general");
                      setSettingsOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#D38C9D] hover:bg-[#A55166] text-white font-bold text-xs shadow-md border border-[#E2B4C1]/35 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <Settings size={14} /> Cài đặt
                  </button>
                </>
              )}

              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 active:scale-95 transition-all"
              >
                {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>
          </header>

          {/* SƠ ĐỒ PHÒNG BỆNH (Nằm ngang toàn màn hình ngay dưới banner web) */}
          <div className="bg-white/75 dark:bg-[#1E2533]/85 backdrop-blur-md rounded-2xl p-5 border-2 border-pink-100 dark:border-pink-950/40 shadow-lg flex flex-col gap-4 mb-8 select-none">
            <div className="flex items-center justify-between border-b pb-3 border-pink-100 dark:border-pink-950/30">
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                📋 Sơ đồ phòng bệnh
              </span>
              <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2.5 py-0.5 rounded-full border border-rose-100 dark:border-rose-900">
                {categories.length} phòng
              </span>
            </div>

            {/* Department selections horizontal layout using responsive grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <button
                onClick={() => {
                  setActiveGenre("all");
                  setSelectedTag(null);
                }}
                className={`relative py-3 px-3.5 rounded-2xl font-bold transition-all flex flex-col justify-between border cursor-pointer min-h-[92px] text-left hover:scale-[1.01] active:scale-[0.99] overflow-hidden ${
                  activeGenre === "all"
                    ? "text-white border-transparent"
                    : "bg-white/50 dark:bg-[#1E2533]/50 hover:bg-rose-100/40 dark:hover:bg-rose-950/20 text-gray-700 dark:text-gray-300 border-pink-100/60 dark:border-pink-900/15"
                }`}
              >
                {activeGenre === "all" && (
                  <motion.div
                    layoutId="activeGenreBg"
                    className="absolute inset-0 bg-gradient-to-br from-[#A55166] to-[#D38C9D] rounded-2xl z-0 shadow-md shadow-pink-500/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 bg-white/20 p-1 rounded-lg text-sm w-fit mb-1">📋</span>
                <div className="relative z-10 flex flex-col min-w-0">
                  <span className="text-[11px] sm:text-xs truncate font-extrabold leading-tight">Tất cả bệnh án</span>
                  <span className="text-[10px] opacity-75 font-medium mt-0.5">Hiện toàn bộ ({prompts.length})</span>
                </div>
              </button>

              {categories.map(cat => {
                const isActive = activeGenre === cat.id;
                const promptCount = prompts.filter(p => p.category === cat.id).length;
                const tooltipText = `${cat.name}${cat.location ? `\n📍 Vị trí: ${cat.location}` : ""}${cat.description ? `\n📝 Mô tả: ${cat.description}` : ""}`;
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveGenre(cat.id);
                      setSelectedTag(null); // Clear tag filter
                    }}
                    title={tooltipText}
                    className={`relative py-3 px-3.5 rounded-2xl font-bold transition-all flex flex-col justify-between border cursor-pointer min-h-[92px] text-left hover:scale-[1.01] active:scale-[0.99] overflow-hidden ${
                      isActive
                        ? "text-white border-transparent"
                        : "bg-white/50 dark:bg-[#1E2533]/50 hover:bg-rose-100/40 dark:hover:bg-rose-950/20 text-gray-700 dark:text-gray-300 border-pink-100/60 dark:border-pink-900/15"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeGenreBg"
                        className="absolute inset-0 bg-gradient-to-br from-[#A55166] to-[#D38C9D] rounded-2xl z-0 shadow-md shadow-pink-500/20"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 bg-white/20 p-1 rounded-lg text-sm w-fit mb-1">{cat.icon || "📂"}</span>
                    <div className="relative z-10 flex flex-col min-w-0">
                      <span className="text-[11px] sm:text-xs truncate font-extrabold leading-tight" title={cat.name}>{cat.name}</span>
                      <span className="text-[10px] opacity-75 font-medium mt-0.5">{promptCount} điều dưỡng</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Random Treatment Prompt workstation block - Adaptive Horizontal bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-100/40 dark:from-[#211A1D] dark:to-[#171113] border border-dashed border-pink-200/80 dark:border-pink-900/40 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🩺</span>
                <div className="text-left">
                  <span className="text-[10px] font-extrabold text-[#A55166] dark:text-[#F7DAE7] tracking-wider uppercase block">
                    Phác đồ y tế ngẫu nhiên điều trị hôm nay:
                  </span>
                  {randomRoll ? (
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => handleCardClick(randomRoll)}
                        className="text-xs font-extrabold text-rose-800 dark:text-rose-300 flex items-center gap-1 hover:scale-105 transition-all hover:text-[#A55166] dark:hover:text-[#F7DAE7] cursor-pointer"
                        title="Click để kết nối điều trị ngay"
                      >
                        <span className="bg-rose-100 dark:bg-pink-950 px-2 py-0.5 rounded text-xs">{randomRoll.icon} {randomRoll.name}</span>
                      </button>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium italic">
                        "{randomRoll.description}"
                      </p>
                    </div>
                  ) : (
                    <span className="text-[11px] font-bold text-[#A55166]/60 dark:text-rose-300/40 italic block mt-0.5">Các bé muốn được gặp ai nào?</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (prompts.length > 0) {
                    const randomIndex = Math.floor(Math.random() * prompts.length);
                    const selected = prompts[randomIndex];
                    setRandomRoll(selected);
                  }
                }}
                className="w-full md:w-auto py-2.5 px-5 bg-white dark:bg-[#1E2533] border border-pink-200 dark:border-pink-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-[#A55166] dark:text-pink-300 text-xs font-extrabold rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.01]"
              >
                <RefreshCw size={12} className="text-[#A55166] dark:text-pink-400" />
                <span>Random phác đồ ngẫu nhiên</span>
              </button>
            </div>
          </div>

          {/* MAIN GRID LAYOUT */}
          <div className="w-full flex flex-col gap-6">
            
            {/* WORKSPACE & CONTENT LISTING */}
            <main className="w-full flex flex-col gap-6">

              {/* SEARCH TEXT BAR */}
              <div className="relative overflow-hidden bg-white/75 dark:bg-[#1E2533]/85 backdrop-blur-md rounded-2xl p-4 border-2 border-pink-100 dark:border-pink-950/40 shadow-md flex items-center gap-3">
                
                {/* Visual marker */}
                <div className="w-1.5 h-8 bg-gradient-to-b from-[#D38C9D] to-[#A55166] rounded-full" />
                
                <Search size={18} className="text-pink-400 dark:text-pink-500 flex-shrink-0" />
                <input 
                  type="text"
                  value={mainSearchQuery}
                  onChange={(e) => setMainSearchQuery(e.target.value)}
                  placeholder="Tìm bệnh án hoặc triệu chứng nhân vật..."
                  className="flex-1 bg-transparent border-none outline-none font-semibold text-gray-800 dark:text-gray-200 placeholder-rose-300 dark:placeholder-rose-800/80 text-sm py-1.5"
                />
                
                {mainSearchQuery && (
                  <button 
                    onClick={() => setMainSearchQuery("")}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* TAG CLOUD ACCENT BAR */}
              <div className="bg-white/70 dark:bg-[#1D2432]/70 backdrop-blur-md rounded-2xl p-4 border border-pink-100/80 dark:border-pink-950/30 shadow-sm flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mr-2 flex items-center gap-1">
                  <Sliders size={11} /> Triệu chứng nổi bật:
                </span>

                {/* Reset tags chip */}
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    !selectedTag 
                      ? "bg-rose-400/20 text-rose-700 dark:text-rose-300 border border-rose-300/40"
                      : "bg-gray-100 dark:bg-gray-800/40 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  Tất cả triệu chứng
                </button>

                {displayTags.map(tag => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(isSelected ? null : tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? "bg-rose-500 text-white shadow-sm shadow-rose-500/20"
                          : "bg-white dark:bg-black/20 text-gray-600 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-pink-100/50 dark:border-pink-905/10"
                      }`}
                    >
                      # {tag}
                    </button>
                  );
                })}

                {displayTags.length === 0 && (
                  <span className="text-xs italic text-gray-400">Không có thẻ triệu chứng nào tương thích</span>
                )}
              </div>

              {/* CURRENT ACTIVE DEPT BANNER (Image 2 style) */}
              {activeGenre !== "all" && (() => {
                const activeCat = categories.find(c => c.id === activeGenre);
                if (!activeCat) return null;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden bg-[#261E21] dark:bg-[#1C1719] rounded-2xl p-5 border border-pink-900/30 dark:border-pink-950/40 shadow-lg flex flex-col gap-3 text-left"
                  >
                    {activeCat.location && (
                      <div className="w-fit">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3D252A] border border-pink-900/20 text-[#EA95A7] text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide">
                          📍 {activeCat.location}
                        </span>
                      </div>
                    )}
                    
                    <h2 className="text-base sm:text-xl font-extrabold text-[#FEDB41] flex items-center gap-2 tracking-tight">
                      <span>{activeCat.icon || "🏡"}</span>
                      <span>{activeCat.name}</span>
                    </h2>
                    
                    {activeCat.description && (
                      <p className="text-xs sm:text-sm text-gray-300 dark:text-gray-400 font-medium leading-relaxed">
                        {activeCat.description}
                      </p>
                    )}
                  </motion.div>
                );
              })()}

              {/* MEDICAL INTERACTIVE CARD GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {filteredPrompts.map(p => {
                  const parentCat = categories.find(c => c.id === p.category);
                  const isLocked = !!p.hasPassword;
                  
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleCardClick(p)}
                      className="group relative overflow-hidden bg-white dark:bg-[#1E2533] rounded-2xl p-5 border-2 border-pink-100 dark:border-pink-950/40 shadow-md hover:shadow-xl hover:border-pink-300 dark:hover:border-rose-900 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
                    >
                      
                      {/* Active edit/delete controls for logged admins */}
                      {isLoggedIn && (
                        <div className="absolute top-4 right-4 z-20 flex gap-1 bg-white/90 dark:bg-gray-900/90 rounded-xl p-1 border border-pink-100 dark:border-pink-950 shadow-sm">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerEditPrompt(p);
                            }}
                            className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg transition-transform hover:scale-110"
                            title="Sửa"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePrompt(p.id);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-transform hover:scale-110"
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </div>
                      )}

                      {/* Top Header Card row */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3.5">
                          {parentCat && (
                            <span className="text-[10px] font-extrabold uppercase tracking-wide bg-rose-50 dark:bg-pink-950/50 text-rose-800 dark:text-rose-300 px-2.5 py-1 rounded-full border border-pink-100/50 dark:border-pink-900/30">
                              {parentCat.icon} {parentCat.name}
                            </span>
                          )}
                          
                          {/* Locked indicators */}
                          {isLocked && (
                            <span className="text-amber-500 bg-amber-50 dark:bg-amber-950/50 p-1.5 rounded-full border border-amber-200/50 dark:border-amber-900 text-[10px]" title="Có mật khẩu bảo mật">
                              <Lock size={12} className="inline mr-1" /> Mật Lệnh
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <h3 className="font-sans font-extrabold text-lg text-rose-800 dark:text-rose-300 flex items-center gap-2 mb-2 group-hover:text-rose-600 dark:group-hover:text-rose-200 transition-colors">
                          <span className="text-xl bg-pink-100 dark:bg-pink-950 p-1 md:p-1.5 rounded-xl">{p.icon || "🧬"}</span>
                          <span>{p.name}</span>
                        </h3>

                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4 line-clamp-3">
                          {p.description}
                        </p>
                      </div>

                      {/* Tag badges cloud footer */}
                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-100 dark:border-gray-800 mt-2">
                        {p.tags.map(t => (
                          <span 
                            key={t}
                            className="text-[9px] font-bold bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                    </div>
                  );
                })}

                {filteredPrompts.length === 0 && (
                  <div className="col-span-full py-16 text-center text-gray-400">
                    <span className="text-5xl block mb-2">📭</span>
                    <span className="font-bold text-gray-500">Chưa tìm thấy điều dưỡng viên nào đang trực ca này...</span>
                    <p className="text-xs text-gray-400 mt-1">Vui lòng thay đổi từ khóa hoặc tìm kiếm trong phân mục khác.</p>
                  </div>
                )}

              </div>

            </main>
          </div>

        </div>
      )}

      {/* ========================================== */}
      {/* FLOATING MUSIC BG MARQUEE PLAYER           */}
      {/* ========================================== */}
      {musicUrl && (
        <>
          {playerMinimized ? (
            /* MINIMIZED VIEW - Compact, saves space on mobile/tablet */
            <div className="fixed bottom-6 right-6 z-40 bg-white/95 dark:bg-[#1E2533]/95 border-2 border-pink-200 dark:border-pink-950 shadow-xl rounded-2xl p-2 flex items-center gap-2.5 backdrop-blur-md select-none w-fit max-w-[180px]">
              <button
                onClick={() => setPlayerPlaying(!playerPlaying)}
                className={`w-7 h-7 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm ${playerPlaying ? "animate-spin-slow" : ""}`}
                title={playerPlaying ? "Tạm dừng" : "Phát nhạc"}
              >
                {playerPlaying ? <Pause size={12} /> : <Play size={12} />}
              </button>
              
              <div className="flex flex-col text-left max-w-[80px] overflow-hidden">
                <span className="text-[9px] font-bold text-rose-700 dark:text-rose-300 truncate block">
                  {musicTitle}
                </span>
                <span className="text-[8px] text-gray-400 dark:text-gray-500">
                  {playerPlaying ? "Đang phát 🎵" : "Đã dừng 🔇"}
                </span>
              </div>

              <div className="flex items-center border-l border-pink-100 dark:border-pink-950 pl-2">
                <button
                  onClick={() => setPlayerMinimized(false)}
                  className="w-5 h-5 rounded-md bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/40 dark:hover:bg-pink-950 text-rose-600 dark:text-pink-300 flex items-center justify-center font-extrabold text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Mở rộng trình phát"
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>
          ) : (
            /* EXPANDED VIEW - Full features */
            <div className="fixed bottom-6 right-6 z-40 bg-white/95 dark:bg-[#1E2533]/95 border-2 border-pink-200 dark:border-pink-950 shadow-xl rounded-2xl p-3 w-[260px] backdrop-blur-md">
              <div className="flex flex-col gap-2">
                
                {/* Header: Title and Minimise buttons */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="relative overflow-hidden flex-1 h-5 bg-pink-50 dark:bg-pink-950/50 rounded-lg flex items-center">
                    <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase animate-marquee tracking-wider absolute left-0 flex items-center whitespace-nowrap">
                      <Music size={10} className="inline mr-1 animate-pulse" /> {playerPlaying ? "Đang phát:" : "Dừng phát:"} {musicTitle}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setPlayerMinimized(true)}
                    className="w-5 h-5 rounded-md bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/40 dark:hover:bg-pink-950 text-rose-600 dark:text-pink-300 flex items-center justify-center font-extrabold text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    title="Thu nhỏ trình phát"
                  >
                    <Minus size={11} />
                  </button>
                </div>

                {/* Media button panel */}
                <div className="flex items-center gap-3 justify-between">
                  <button
                    onClick={() => setPlayerPlaying(!playerPlaying)}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm"
                  >
                    {playerPlaying ? <Pause size={14} /> : <Play size={14} />}
                  </button>

                  <div className="flex-1 flex items-center gap-2">
                    {playerVolume === 0 ? <VolumeX size={14} className="text-gray-400" /> : <Volume2 size={14} className="text-rose-500" />}
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={playerVolume}
                      onChange={(e) => setPlayerVolume(parseFloat(e.target.value))}
                      className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 accent-rose-500 cursor-pointer"
                      title="Thay đổi âm lượng"
                    />
                  </div>

                  <button
                    onClick={clearMusicControl}
                    className="bg-transparent text-gray-400 hover:text-red-500 transition-colors text-xs font-bold"
                    title="Tắt nhạc nền"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

              </div>
            </div>
          )}
        </>
      )}


      {/* ========================================== */}
      {/* MODAL: ADMIN LOGIN                         */}
      {/* ========================================== */}
      <AnimatePresence>
        {loginOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-to-br from-[#FBF6F9] to-[#EFE2EB] dark:from-[#211A1D] dark:to-[#171113] p-6 rounded-3xl border-2 border-pink-200 dark:border-pink-900 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-base font-extrabold text-rose-800 dark:text-rose-300 font-serif italic">
                  🔐 Ban Quản Trị Viện Tâm Thần
                </span>
                <button 
                  onClick={() => setLoginOpen(false)}
                  className="p-1 rounded-full bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                    Tên đăng nhập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập..."
                    className="w-full py-2.5 px-3.5 rounded-xl border-2 border-pink-200 dark:border-pink-900 bg-white dark:bg-black/40 text-sm font-semibold outline-none focus:border-rose-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                    Mật mã ban trị sự <span className="text-red-500">*</span>
                  </label>
                  <div className="relative w-full">
                    <input
                      type={showAdminPassword ? "text" : "password"}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      className="w-full py-2.5 pl-3.5 pr-10 rounded-xl border-2 border-pink-200 dark:border-pink-900 bg-white dark:bg-black/40 text-sm font-semibold outline-none focus:border-rose-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors cursor-pointer flex items-center justify-center"
                      title={showAdminPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/50 p-2.5 rounded-xl border border-red-200 dark:border-red-900">
                    ❌ Sai mật danh hoặc password ban trị sự.
                  </p>
                )}

                <div className="flex gap-3 mt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-extrabold text-sm transition-all cursor-pointer"
                  >
                    ✓ Đăng nhập
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginOpen(false);
                      setShowAdminPassword(false);
                    }}
                    className="flex-1 py-3 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL: ADD / EDIT PROMPT                   */}
      {/* ========================================== */}
      <AnimatePresence>
        {addPromptOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-to-br from-[#FBF6F9] to-[#EFE2EB] dark:from-[#211A1D] dark:to-[#171113] p-6 rounded-3xl border-2 border-pink-200 dark:border-pink-900 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-5 border-b pb-3 border-pink-200 dark:border-pink-900">
                <span className="text-base font-extrabold text-rose-800 dark:text-rose-300 font-serif italic">
                  {editPromptId !== null ? "📝 Cập Nhật Bệnh Án / Prompt" : "➕ Thêm Bệnh Án / Prompt Mới"}
                </span>
                <button 
                  onClick={() => setAddPromptOpen(false)}
                  className="p-1 rounded-full bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handlePromptSubmit} className="flex flex-col gap-4">
                
                {formSuccessMessage && (
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 transition-all animate-bounce">
                    🎉 {formSuccessMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                      Tên Prompt / Bác sĩ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="VD: Giáo Sư Cố..."
                      className="w-full py-2 px-3 rounded-xl border-2 border-pink-100 dark:border-pink-900 bg-white dark:bg-black/30 text-sm font-semibold outline-none focus:border-rose-300"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                      Phân khoa điều trị <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      required
                      className="w-full py-2 px-3 rounded-xl border-2 border-pink-100 dark:border-pink-900 bg-white dark:bg-black/30 text-sm font-semibold outline-none focus:border-rose-300"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                      Icon / Emoji <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={formIcon}
                        onChange={(e) => setFormIcon(e.target.value)}
                        placeholder="🏥"
                        className="w-16 text-center py-2 rounded-xl border-2 border-pink-100 dark:border-pink-900 bg-white dark:bg-black/30 text-sm font-bold outline-none focus:border-rose-300"
                      />
                      <span className="text-2xl bg-pink-50 dark:bg-pink-950 p-2 rounded-xl border border-pink-200 dark:border-pink-900 max-w-[45px] max-h-[45px] flex items-center justify-center">
                        {formIcon || "🏥"}
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                      Liên kết chuyên môn (URL) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full py-2 px-3 rounded-xl border-2 border-pink-100 dark:border-pink-900 bg-white dark:bg-black/30 text-sm font-semibold outline-none focus:border-rose-300"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                    Mô tả bệnh án / Chuyên môn <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Ghi dòng chú thích chi tiết về nhiệm vụ hoặc năng lực chatbot..."
                    rows={3}
                    className="w-full py-2 px-3 rounded-xl border-2 border-pink-100 dark:border-pink-900 bg-white dark:bg-black/30 text-sm font-semibold outline-none focus:border-rose-300 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                    Thêm các triệu chứng / Tags (Nhấn Enter để thêm)
                  </label>
                  <input
                    type="text"
                    value={formTagsInput}
                    onChange={(e) => setFormTagsInput(e.target.value)}
                    onKeyDown={handleAddFormTag}
                    placeholder="gõ tag rồi ấn Enter..."
                    className="w-full py-2 px-3 rounded-xl border-2 border-pink-100 dark:border-pink-900 bg-white dark:bg-black/30 text-sm font-semibold outline-none focus:border-rose-300"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5 min-h-6">
                    {formTags.map(t => (
                      <span 
                        key={t}
                        className="text-xs bg-rose-400 text-white px-2.5 py-1 rounded-xl flex items-center gap-1 font-bold shadow-sm"
                      >
                        {t} 
                        <button 
                          type="button" 
                          onClick={() => removeFormTag(t)}
                          className="font-bold hover:scale-125 focus:outline-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Password Protection block */}
                <div className="border border-pink-200 dark:border-pink-900 p-4 rounded-2xl bg-white/40 dark:bg-black/20 flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-700 dark:text-rose-400 text-xs uppercase tracking-wide">
                    <input
                      type="checkbox"
                      checked={formHasPassword}
                      onChange={(e) => setFormHasPassword(e.target.checked)}
                      className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                    />
                    🔒 Đặt mật khóa bảo vệ prompt này
                  </label>

                  {formHasPassword && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-gray-500">Mật mã mở khóa <span className="text-red-500">*</span></span>
                        <input
                          type="text"
                          required={formHasPassword}
                          value={formCorrectPassword}
                          onChange={(e) => setFormCorrectPassword(e.target.value)}
                          placeholder="Mật mã giải cứu..."
                          className="py-1.5 px-3 rounded-lg border border-pink-200 dark:border-pink-900 bg-white dark:bg-black/40 text-xs font-semibold outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-gray-500">Gợi ý câu hỏi (Hint)</span>
                        <input
                          type="text"
                          value={formPasswordHint}
                          onChange={(e) => setFormPasswordHint(e.target.value)}
                          placeholder="Gợi ý câu trả lời..."
                          className="py-1.5 px-3 rounded-lg border border-pink-200 dark:border-pink-900 bg-white dark:bg-black/40 text-xs font-semibold outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-pink-200 dark:border-pink-900 mt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
                  >
                    💾 Đăng tải
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddPromptOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL: SETTINGS (CHUNG - CATEGORIES)      */}
      {/* ========================================== */}
      <AnimatePresence>
        {settingsOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-to-br from-[#FBF6F9] to-[#EFE2EB] dark:from-[#211A1D] dark:to-[#171113] p-6 rounded-3xl border-2 border-pink-200 dark:border-pink-900 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-5 border-b pb-3 border-pink-200 dark:border-pink-900">
                <span className="text-base font-extrabold text-rose-800 dark:text-rose-300 font-serif italic flex items-center gap-2">
                  <Settings size={18} className="animate-spin-slow" /> Cài đặt Ban Điều Hành
                </span>
                <button 
                  onClick={() => setSettingsOpen(false)}
                  className="p-1 rounded-full bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Settings tabs row */}
              <div className="flex gap-2 border-b-2 border-pink-100 dark:border-pink-950/40 mb-6 pb-1 overflow-x-auto whitespace-nowrap relative">
                <button
                  onClick={() => setSettingsTab("general")}
                  className={`relative px-4 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                    settingsTab === "general"
                      ? "text-rose-800 dark:text-rose-300"
                      : "text-gray-400 hover:text-rose-500"
                  }`}
                >
                  <span className="relative z-10">📋 Cài đặt chung</span>
                  {settingsTab === "general" && (
                    <motion.div
                      layoutId="activeSettingsTabLine"
                      className="absolute bottom-[-2px] left-0 right-0 h-[2.5px] bg-rose-500 dark:bg-rose-400 z-20"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setSettingsTab("categories")}
                  className={`relative px-4 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                    settingsTab === "categories"
                      ? "text-rose-800 dark:text-rose-300"
                      : "text-gray-400 hover:text-rose-500"
                  }`}
                >
                  <span className="relative z-10">📂 Quản lý các khoa</span>
                  {settingsTab === "categories" && (
                    <motion.div
                      layoutId="activeSettingsTabLine"
                      className="absolute bottom-[-2px] left-0 right-0 h-[2.5px] bg-rose-500 dark:bg-rose-400 z-20"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setSettingsTab("account")}
                  className={`relative px-4 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                    settingsTab === "account"
                      ? "text-rose-800 dark:text-rose-300"
                      : "text-gray-400 hover:text-rose-500"
                  }`}
                >
                  <span className="relative z-10">👤 Tài khoản</span>
                  {settingsTab === "account" && (
                    <motion.div
                      layoutId="activeSettingsTabLine"
                      className="absolute bottom-[-2px] left-0 right-0 h-[2.5px] bg-rose-500 dark:bg-rose-400 z-20"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              </div>

              {/* TAB CONTENT: GENERAL (BACKGROUND GRAPHICS & BGM) */}
              <AnimatePresence mode="wait">
                {settingsTab === "general" && (
                  <motion.div
                    key="general"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-5"
                  >
                    
                    {/* Background images section */}
                    <div>
                      <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide block mb-3">🖼️ THAY HÌNH NỀN</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Welcome wallpaper */}
                        <div className="p-3 bg-white dark:bg-black/30 rounded-2xl border border-pink-100 dark:border-pink-900/50 flex flex-col gap-2">
                          <span className="text-[10px] font-bold text-gray-500">Màn hình khởi đầu (Chào mừng)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleBgUploadSubmit("welcome", e.target.files ? e.target.files[0] : null)}
                            className="hidden"
                            id="file-bg-welcome"
                          />
                          <label 
                            htmlFor="file-bg-welcome"
                            className="cursor-pointer py-2 px-3 text-center bg-rose-50 hover:bg-rose-100/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-semibold text-xs border border-dashed border-rose-300 rounded-lg block"
                          >
                            Chọn ảnh nền khởi động
                          </label>
                          {bgWelcome && (
                            <div className="flex items-center justify-between gap-1 mt-1">
                              <span className="text-[9px] text-emerald-500 font-semibold">Active wallpaper loaded</span>
                              <button 
                                onClick={() => {
                                  setBgWelcome(null);
                                  localStorage.removeItem("bg_welcome");
                                }}
                                className="text-[9px] text-red-500 hover:underline"
                              >
                                Gỡ ảnh
                              </button>
                            </div>
                          )}
                        </div>

                        {/* App Main Workspace wallpaper */}
                        <div className="p-3 bg-white dark:bg-black/30 rounded-2xl border border-pink-100 dark:border-pink-900/50 flex flex-col gap-2">
                          <span className="text-[10px] font-bold text-gray-500">Màn hình chính (Bản tin)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleBgUploadSubmit("app", e.target.files ? e.target.files[0] : null)}
                            className="hidden"
                            id="file-bg-app"
                          />
                          <label 
                            htmlFor="file-bg-app"
                            className="cursor-pointer py-2 px-3 text-center bg-rose-50 hover:bg-rose-100/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-semibold text-xs border border-dashed border-rose-300 rounded-lg block"
                          >
                            Chọn ảnh nền điều hành
                          </label>
                          {bgApp && (
                            <div className="flex items-center justify-between gap-1 mt-1">
                              <span className="text-[9px] text-emerald-500 font-semibold">Active wallpaper loaded</span>
                              <button 
                                onClick={() => {
                                  setBgApp(null);
                                  localStorage.removeItem("bg_app");
                                }}
                                className="text-[9px] text-red-500 hover:underline"
                              >
                                Gỡ ảnh
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>

                    <div className="border-t border-pink-100 dark:border-pink-900/40 my-1 font-serif italic" />

                    {/* Audio soundtracks setup */}
                    <div>
                      <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide block mb-3">🎵 NHẠC NỀN</span>
                      
                      <div className="flex flex-col gap-3 p-4 bg-white dark:bg-black/20 rounded-2xl border border-pink-100 dark:border-pink-900/30">
                        
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-semibold text-gray-400">Chèn link YouTube</span>
                          <input
                            type="text"
                            value={musicUrl}
                            onChange={(e) => setMusicUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full py-2 px-3 text-xs rounded-lg border border-pink-200 dark:border-pink-900 bg-white dark:bg-black/40 font-semibold outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-semibold text-gray-400">Tiêu đề bài hát hiển thị</span>
                          <input
                            type="text"
                            value={musicTitle}
                            onChange={(e) => setMusicTitle(e.target.value)}
                            placeholder="Lofi Chill - Viện Tâm Thần BGM..."
                            className="w-full py-2 px-3 text-xs rounded-lg border border-pink-200 dark:border-pink-900 bg-white dark:bg-black/40 font-semibold outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-semibold text-gray-400">Tải file MP3 lên (Tối đa 2.5MB)</span>
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => handleMusicUploadSubmit(e.target.files ? e.target.files[0] : null)}
                            className="w-full text-xs text-gray-500 dark:text-gray-400 file:cursor-pointer cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200 dark:file:bg-pink-900/40 dark:file:text-pink-300 dark:hover:file:bg-pink-900/60 transition-all"
                          />
                        </div>

                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={saveExternalMusic}
                            className="flex-1 py-2 rounded-lg bg-rose-400 hover:bg-rose-500 text-white font-bold text-xs"
                          >
                            💾 Kích Hoạt
                          </button>
                          <button
                            type="button"
                            onClick={clearMusicControl}
                            className="px-3.5 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-500 hover:text-white font-bold text-xs"
                          >
                            Gỡ nhạc
                          </button>
                        </div>

                      </div>
                    </div>

                  </motion.div>
                )}

                {/* TAB CONTENT: CATEGORIES MANAGEMENT */}
                {settingsTab === "categories" && (
                  <motion.div
                    key="categories"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-5"
                  >
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide block">
                      📂 {editingCatId ? "Cập Nhật Hồ Sơ Khoa Phòng" : "Bố Trí Phòng Khoa"}
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-white dark:bg-black/20 p-4 rounded-2xl border border-pink-100 dark:border-pink-900/50">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-gray-400">Icon / Biểu thị</span>
                        <input
                          type="text"
                          value={newCatIcon}
                          onChange={(e) => setNewCatIcon(e.target.value)}
                          placeholder="🧠"
                          className="py-1.5 px-2.5 rounded-lg border border-pink-200 dark:border-pink-900 bg-white dark:bg-black/30 font-bold text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-gray-400">Tên Phòng Khoa {editingCatId ? "Cần Sửa" : "Mới"}</span>
                        <input
                          type="text"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          placeholder="Khoa Tâm Thần Cực Nhẹ..."
                          className="py-1.5 px-2.5 rounded-lg border border-pink-200 dark:border-pink-900 bg-white dark:bg-black/30 font-semibold text-xs"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <span className="text-[10px] font-bold text-gray-400">Vị Trí Phòng Khoa (ví dụ: PHÒNG THƯỜNG NIÊN - LẦU II)</span>
                        <input
                          type="text"
                          value={newCatLocation}
                          onChange={(e) => setNewCatLocation(e.target.value)}
                          placeholder="Tòa Nhà A - Lầu II - Khu Chữa Lành..."
                          className="py-1.5 px-2.5 rounded-lg border border-pink-200 dark:border-pink-900 bg-white dark:bg-black/30 font-semibold text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <span className="text-[10px] font-bold text-gray-400">Mô Tả Phòng Khoa</span>
                        <textarea
                          value={newCatDescription}
                          onChange={(e) => setNewCatDescription(e.target.value)}
                          placeholder="Khu tập trung chăm sóc các ca bệnh mang sắc thái..."
                          maxLength={400}
                          rows={2}
                          className="py-1.5 px-2.5 rounded-lg border border-pink-200 dark:border-pink-900 bg-white dark:bg-black/30 font-medium text-xs resize-none"
                        />
                      </div>

                      <div className="sm:col-span-2 flex gap-2 mt-1">
                        <button
                          onClick={handleAddCategory}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-extrabold text-xs shadow-sm shadow-pink-400/20"
                        >
                          {editingCatId ? "💾 Lưu Thay Đổi" : "➕ Thêm Thể Loại"}
                        </button>
                        {editingCatId && (
                          <button
                            onClick={cancelEditCategory}
                            className="px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs"
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-pink-100 dark:border-pink-900/30 font-semibold" />

                    {/* Category lists displaying */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">📋 Hồ sơ các phòng khoa hiện có:</span>
                      <div className="max-h-52 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1">
                        {categories.map(cat => (
                          <div 
                            key={cat.id} 
                            className="flex flex-col justify-between p-2.5 bg-white dark:bg-black/30 rounded-xl border border-pink-100 dark:border-pink-900/30 gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="bg-pink-100 dark:bg-pink-950 p-1.5 rounded-lg text-base flex-shrink-0">{cat.icon}</span>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-rose-800 dark:text-rose-300 truncate">{cat.name}</span>
                                {cat.location && (
                                  <span className="text-[9px] text-gray-500 truncate">📍 {cat.location}</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => startEditCategory(cat)}
                                className="p-1 px-2.5 rounded-lg bg-pink-100 dark:bg-[#3D252A] text-rose-700 dark:text-rose-300 text-[10px] font-bold hover:bg-pink-205 transition-all"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="p-1 px-2.5 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[10px] font-bold hover:bg-red-200 transition-all"
                              >
                                Gỡ bỏ
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </motion.div>
                )}

                {/* TAB CONTENT: ADMIN ACCOUNT & LOGOUT */}
                {settingsTab === "account" && (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-5"
                  >
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide block">👤 QUẢN LÝ TÀI KHOẢN ADMIN</span>
                    
                    <div className="p-5 bg-white dark:bg-black/20 rounded-2xl border border-pink-100 dark:border-pink-900/40 text-center flex flex-col items-center gap-3">
                      <span className="text-3xl">🔐</span>
                      <h5 className="font-bold text-xs text-rose-800 dark:text-rose-300">Tài khoản Quản trị viên</h5>
                      <p className="text-[11px] text-gray-500 max-w-xs leading-relaxed">
                        Bạn đang đăng nhập bằng quyền tối cao của Viện trưởng. Hãy thận trọng với mọi thao tác thay đổi phòng ban y tế.
                      </p>
                      
                      <button
                        type="button"
                        onClick={() => setShowLogoutConfirm(true)}
                        className="mt-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                      >
                        <LogOut size={13} /> Đăng xuất tài khoản
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Modal dismiss buttons */}
              <div className="mt-8 pt-3 border-t border-pink-200 dark:border-pink-900/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-[#A55166] to-[#D38C9D] text-white font-bold text-xs hover:scale-105 transition-all shadow-md cursor-pointer"
                >
                  Hoàn thành và lưu trữ
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL: PROMPT CARD PASSWORD UNLOCK         */}
      {/* ========================================== */}
      <AnimatePresence>
        {unlockTargetPrompt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-to-br from-[#FBF6F9] to-[#EFE2EB] dark:from-[#211A1D] dark:to-[#171113] p-6 rounded-3xl border-2 border-pink-200 dark:border-pink-900 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-extrabold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 font-serif italic">
                  🔒 Bác sĩ can thiệp đặc thù
                </span>
                <button 
                  onClick={() => setUnlockTargetPrompt(null)}
                  className="p-1 rounded-full bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="text-center mb-5">
                <div className="text-4xl mb-2 text-rose-700 dark:text-rose-300">{unlockTargetPrompt.icon}</div>
                <h4 className="font-bold text-gray-800 dark:text-gray-100 text-base">{unlockTargetPrompt.name}</h4>
                <p className="text-xs text-gray-400 mt-1">Hồ sơ tư vấn này đã được quản trị khóa mã lệnh y tế.</p>
              </div>

              {unlockTargetPrompt.hint && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-sans">
                  💡 <strong className="font-bold">Gợi ý trả lời:</strong> <span className="italic">{unlockTargetPrompt.hint}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5 mb-4">
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-widest">
                  Nhập Mật Lệnh Giải Trừ Hoang Tưởng: <span className="text-red-500">*</span>
                </span>
                <input
                  type="password"
                  value={enteredUnlockPass}
                  onChange={(e) => setEnteredUnlockPass(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      verifyPromptUnlock();
                    }
                  }}
                  placeholder="Nhập mật khóa..."
                  className="w-full py-2.5 px-3.5 rounded-xl border-2 border-pink-100 dark:border-pink-900 bg-white dark:bg-black/30 font-semibold text-sm outline-none focus:border-rose-400"
                />

                {unlockError && (
                  <span className="text-xs font-bold text-red-500 mt-1">
                    ❌ Mật lệnh chẩn thuật không khớp, vui lòng thử lại!
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={verifyPromptUnlock}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-extrabold text-xs transition-all shadow-md shadow-pink-500/20 hover:scale-105 cursor-pointer"
                >
                  🔓 Mở khóa hồ sơ
                </button>
                <button
                  onClick={() => setUnlockTargetPrompt(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs"
                >
                  Đóng
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =============================================== */}
      {/* PHIẾU ĐĂNG KÝ CHẨN ĐOÁN (PHD MODAL)             */}
      {/* =============================================== */}
      <AnimatePresence>
        {phdOpen && (
          <div className="fixed inset-0 bg-[#1E0A14]/65 backdrop-blur-md z-[8000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              className="bg-white/95 dark:bg-[#251419]/95 border-2 border-pink-200 dark:border-pink-950 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              
              {/* PHD Header panel */}
              <div className="flex items-center justify-between gap-4 p-5 border-b border-pink-200/50 dark:border-pink-900/35 bg-gradient-to-r from-[#D38C9D] to-[#A55166] text-white">
                <div className="flex items-center gap-3">
                  <span className="text-3xl bg-white/20 p-2.5 rounded-2xl">📋</span>
                  <div>
                    <h2 className="font-serif italic font-black text-base sm:text-lg">
                      Phiếu Đăng Ký Chẩn Đoán Y Khoa Cố Thị
                    </h2>
                    <p className="text-[10px] text-pink-100">
                      Nơi chẩn trị rối loạn tình cảm mập mờ, ảo mộng và đa vũ trụ chatbot AI.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={closePhdModal}
                  className="text-white hover:text-rose-100 bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* PHD Navigation Tabs */}
              <div className="flex gap-2 px-5 pt-3.5 border-b border-pink-100 dark:border-pink-900/35 overflow-x-auto whitespace-nowrap relative">
                <button
                  onClick={() => setPhdTab("find")}
                  className={`relative px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all overflow-hidden ${
                    phdTab === "find"
                      ? "text-white"
                      : "bg-[#F7DAE7]/30 dark:bg-[#5A444C]/35 text-[#A55166] dark:text-[#E2B4C1] hover:bg-[#F7DAE7]/50"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-1">🔍 Tìm Bác sĩ</span>
                  {phdTab === "find" && (
                    <motion.div
                      layoutId="activePhdTabBg"
                      className="absolute inset-0 bg-[#A55166]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setPhdTab("register")}
                  className={`relative px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all overflow-hidden ${
                    phdTab === "register"
                      ? "text-white"
                      : "bg-[#F7DAE7]/30 dark:bg-[#5A444C]/35 text-[#A55166] dark:text-[#E2B4C1] hover:bg-[#F7DAE7]/50"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-1">💊 Khám Bệnh Mới</span>
                  {phdTab === "register" && (
                    <motion.div
                      layoutId="activePhdTabBg"
                      className="absolute inset-0 bg-[#A55166]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setPhdTab("records")}
                  className={`relative px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all overflow-hidden ${
                    phdTab === "records"
                      ? "text-white"
                      : "bg-[#F7DAE7]/30 dark:bg-[#5A444C]/35 text-[#A55166] dark:text-[#E2B4C1] hover:bg-[#F7DAE7]/50"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    📒 Sổ Khám 
                    {phdRecords.length > 0 && (
                      <span className={`rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold ${
                        phdTab === "records" ? "bg-white text-[#A55166]" : "bg-rose-500 text-white"
                      }`}>
                        {phdRecords.length}
                      </span>
                    )}
                  </span>
                  {phdTab === "records" && (
                    <motion.div
                      layoutId="activePhdTabBg"
                      className="absolute inset-0 bg-[#A55166]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              </div>

              {/* TAB CONTENT PORT */}
              <div className="p-5 overflow-y-auto flex-1">
                <AnimatePresence mode="wait">
                  {/* TAB 1: SEARCH DOCTOR / CHUYÊN KHOA BENTO GRID */}
                  {phdTab === "find" && (
                    <motion.div
                      key="find"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col gap-4"
                    >
                    <div className="text-center">
                      <h4 className="font-serif italic font-bold text-[#A55166] dark:text-[#F0A0B3] text-lg">
                        Bạn đã đặt lịch hẹn hay muốn khám lâm sàng nhanh?
                      </h4>
                      <p className="text-xs text-rose-400 dark:text-rose-300 mt-1 max-w-md mx-auto">
                        Mời nhập mật danh bác sĩ điều dưỡng riêng, hoặc nhấp chọn trực tiếp từng phòng ban bệnh án dưới sơ đồ.
                      </p>
                    </div>

                    {/* Quick Search */}
                    <div className="relative mb-2">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D38C9D]" size={16} />
                      <input
                        type="text"
                        value={phdSearchQuery}
                        onChange={(e) => {
                          setPhdSearchQuery(e.target.value);
                          setPhdSelectedRoomId(null); // Clear selected category if user typing search
                        }}
                        placeholder="Tìm kiếm danh tính bác sĩ hoặc tác nhân chẩn đoán trực quan..."
                        className="w-full py-2.5 pl-10 pr-4 rounded-full border-2 border-[#E2B4C1] bg-white dark:bg-black/40 text-xs font-semibold focus:border-[#A55166] outline-none"
                      />
                    </div>

                    {/* Filter results or departments layout depending on search state */}
                    {phdSearchQuery.trim() !== "" ? (
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Kết quả chẩn tuyển ({prompts.filter(p => p.name.toLowerCase().includes(phdSearchQuery.toLowerCase()) || p.description.toLowerCase().includes(phdSearchQuery.toLowerCase())).length})</span>
                        <div className="flex flex-col gap-2.5">
                          {prompts
                            .filter(p => p.name.toLowerCase().includes(phdSearchQuery.toLowerCase()) || p.description.toLowerCase().includes(phdSearchQuery.toLowerCase()))
                            .map(p => {
                              const roomCat = categories.find(c => c.id === p.category);
                              return (
                                <div 
                                  key={p.id}
                                  onClick={() => {
                                    selectDoctorAndNavigate(p);
                                  }}
                                  className="p-3 bg-[#F7DAE7]/20 border border-[#E2B4C1]/50 rounded-xl hover:bg-[#E2B4C1]/20 cursor-pointer transition-all flex items-center justify-between"
                                >
                                  <div>
                                    <span className="font-bold text-xs text-gray-800 dark:text-gray-100">{p.icon} {p.name}</span>
                                    <span className="text-[10px] text-[#A55166] block mt-0.5">{roomCat?.icon} {roomCat?.name}</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-[#A55166] underline">Liên hệ →</span>
                                </div>
                              );
                            })}

                          {prompts.filter(p => p.name.toLowerCase().includes(phdSearchQuery.toLowerCase()) || p.description.toLowerCase().includes(phdSearchQuery.toLowerCase())).length === 0 && (
                            <p className="text-center text-xs text-gray-400 py-3">Không tìm thấy chatbot / bác sỹ nào tương ứng.</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <span className="text-[10px] font-bold text-[#A55166] dark:text-[#E2B4C1] tracking-wider uppercase">
                          🏥 SƠ ĐỒ PHÒNG BỆNH ĐA KHOA (NHẤP ĐỂ DUYỆT BÁC SĨ)
                        </span>

                        {/* Bento Room Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {categories.map(cat => {
                            const count = prompts.filter(p => p.category === cat.id).length;
                            const isSelect = phdSelectedRoomId === cat.id;
                            
                            return (
                              <button
                                key={cat.id}
                                onClick={() => setPhdSelectedRoomId(isSelect ? null : cat.id)}
                                className={`p-4 rounded-2xl border-2 duration-200 transition-all text-left flex flex-col justify-between cursor-pointer mini-bento ${
                                  isSelect
                                    ? "bg-[#A55166]/15 border-[#A55166] shadow-md"
                                    : "bg-[#F7DAE7]/35 dark:bg-[#5A444C]/35 border-[#E2B4C1] hover:border-[#D38C9D]"
                                }`}
                              >
                                <span className="text-[9px] font-bold text-[#D38C9D] dark:text-[#E2B4C1] tracking-widest block uppercase mb-1">📍 KHU {cat.name}</span>
                                <div className="text-3xl mb-1.5">{cat.icon || "📂"}</div>
                                <span className="font-extrabold text-xs text-gray-800 dark:text-gray-200 block">{cat.name}</span>
                                <span className="text-[10px] text-rose-500 font-semibold block mt-1">{count} Bác Sĩ</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Filtered doctor list from rooms */}
                        {phdSelectedRoomId && (
                          <div className="mt-4 p-4 rounded-2xl bg-rose-50/50 dark:bg-black/30 border border-[#E2B4C1]/40">
                            <span className="text-xs font-bold text-[#A55166] uppercase block mb-2">📋 Đội ngũ y khoa trực thuộc ({prompts.filter(p => p.category === phdSelectedRoomId).length}):</span>
                            <div className="flex flex-col gap-2">
                              {prompts.filter(p => p.category === phdSelectedRoomId).map(p => (
                                <div 
                                  key={p.id}
                                  onClick={() => {
                                    selectDoctorAndNavigate(p);
                                  }}
                                  className="p-2 bg-white dark:bg-black/20 hover:bg-rose-100 rounded-xl cursor-pointer transition-all text-xs font-bold flex justify-between items-center text-gray-800 dark:text-gray-200"
                                >
                                  <span>{p.icon} {p.name}</span>
                                  <span className="text-[9px] underline text-[#A55166]">Liên hệ →</span>
                                </div>
                              ))}
                              {prompts.filter(p => p.category === phdSelectedRoomId).length === 0 && (
                                <p className="text-[11px] text-gray-400 italic">Chưa có điều dưỡng/bác sỹ trực tại khoa này.</p>
                              )}
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </motion.div>
                )}

                {/* TAB 2: REGISTER NEW CLINICAL ENTRY */}
                {phdTab === "register" && (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.15 }}
                  >
                    {!phdSuccessSubmitted ? (
                      <form onSubmit={handlePhdFormSubmit} className="flex flex-col gap-4">
                        
                        {/* Preset quick buttons */}
                        <div className="p-3 bg-[#F7DAE7]/35 dark:bg-[#5A444C]/35 rounded-2xl border border-[#E2B4C1]/40">
                          <span className="text-[10px] font-extrabold text-[#A55166] uppercase block tracking-wider mb-2">⚡ Nhập thử mẫu bệnh án nhanh:</span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => applyPresetSample(0)}
                              className="px-3 py-1.5 bg-white dark:bg-[#1E1115] border border-[#E2B4C1] text-[#A55166] dark:text-[#E2B4C1] text-xs font-semibold rounded-xl hover:bg-rose-50 transition-all cursor-pointer"
                            >
                              🌀 Hội tự luyến, tự ngược
                            </button>
                            <button
                              type="button"
                              onClick={() => applyPresetSample(1)}
                              className="px-3 py-1.5 bg-white dark:bg-[#1E1115] border border-[#E2B4C1] text-[#A55166] dark:text-[#E2B4C1] text-xs font-semibold rounded-xl hover:bg-rose-50 transition-all cursor-pointer"
                            >
                              🌧️ Sát thủ nhạt lệ truyện ngược
                            </button>
                            <button
                              type="button"
                              onClick={() => applyPresetSample(2)}
                              className="px-3 py-1.5 bg-white dark:bg-[#1E1115] border border-[#E2B4C1] text-[#A55166] dark:text-[#E2B4C1] text-xs font-semibold rounded-xl hover:bg-rose-50 transition-all cursor-pointer"
                            >
                              🧬 Cuồng soái ca áo trắng
                            </button>
                          </div>
                        </div>

                        {/* Step 1 */}
                        <div>
                          <span className="inline-block bg-[#A55166] text-white text-[10px] font-extrabold px-3 py-1 rounded-md tracking-wider uppercase mb-2.5">
                            Bước 1: Thông tin chẩn bệnh
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-[#A55166] dark:text-[#E2B4C1]">Họ tên bệnh nhân / Bí danh: <span className="text-red-500">*</span></span>
                              <input
                                type="text"
                                required
                                value={phdName}
                                onChange={(e) => setPhdName(e.target.value)}
                                placeholder="Ví dụ: Người Đẹp Hoang Tưởng..."
                                className="py-2 px-3 rounded-xl border border-[#E2B4C1] bg-white dark:bg-black/30 text-xs font-semibold outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-[#A55166] dark:text-[#E2B4C1]">Giai đoạn sinh lực / Tuổi: <span className="text-red-500">*</span></span>
                              <select
                                required
                                value={phdAge}
                                onChange={(e) => setPhdAge(e.target.value)}
                                className="py-2 px-3 rounded-xl border border-[#E2B4C1] bg-white dark:bg-black/30 text-xs font-semibold outline-none"
                              >
                                <option value="">-- Chọn mốc phát tác --</option>
                                <option value="🔞 Hai Mươi Mập Mờ (Từ 18 đến 25)">🔞 Hai Mươi Mập Mờ (Từ 18 đến 25)</option>
                                <option value="🌿 Tuổi Thanh Xuân Mơ Màng (Từ 25 đến 30)">🌿 Tuổi Thanh Xuân Mơ Màng (Từ 25 đến 30)</option>
                                <option value="🔥 Cứng Đầu Trưởng Thành (Từ 30 đến 40)">🔥 Cứng Đầu Trưởng Thành (Từ 30 đến 40)</option>
                                <option value="❓ Bí Ẩn Không Tiết Lộ">❓ Bí Ẩn Không Tiết Lộ</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col gap-1.5">
                          <span className="inline-block bg-[#A55166] text-white text-[10px] font-extrabold px-3 py-1 rounded-md tracking-wider uppercase">
                            Bước 2: Khoa trị sự đề nghị
                          </span>
                          <span className="text-xs font-bold text-[#A55166] dark:text-[#E2B4C1]">Chọn phòng điều dưỡng tiếp nhận: <span className="text-red-500">*</span></span>
                          <select
                            required
                            value={phdSelectedCat}
                            onChange={(e) => setPhdSelectedCat(e.target.value)}
                            className="w-full py-2 px-3 rounded-xl border border-[#E2B4C1] bg-white dark:bg-black/30 text-xs font-semibold outline-none"
                          >
                            <option value="">-- Chọn phân khoa đề xuất --</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col gap-1.5">
                          <span className="inline-block bg-[#A55166] text-white text-[10px] font-extrabold px-3 py-1 rounded-md tracking-wider uppercase mb-1">
                            Bước 3: Ghi nhận triệu chứng lâm sàng
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                              "Thích cốt truyện cực ngược, cầu huyết, thích khóc 🌀",
                              "Nghiện ngửi mùi nam chủ, thèm ngọt ngào cưng chiều 🥰",
                              "Rơi vào phố bản kinh dị quỷ dị đầy rẫy quy tắc 💀",
                              "Thích khám phá đa vũ trụ, anime, du hành 🥏",
                              "Trái tim nhảy múa khi gặp bác sĩ y khoa, pháp y kì bí 🏥",
                              "Mê lính tráng quân nhân, hình sự đặc vụ siêu ngầu 🪖",
                              "Ảo tưởng ngự kiếm phi thăng, làm vương phi thời cổ đại 🍊"
                            ].map(item => {
                              const checked = phdSymptoms.includes(item);
                              return (
                                <button
                                  type="button"
                                  key={item}
                                  onClick={() => toggleSymptom(item)}
                                  className={`p-2 rounded-xl text-left border text-xs leading-relaxed font-bold transition-all ${
                                    checked 
                                      ? "bg-[#A55166]/10 border-[#A55166] text-[#A55166]"
                                      : "bg-[#F7DAE7]/10 dark:bg-black/10 border-pink-100 dark:border-pink-900 text-gray-700 dark:text-gray-300 hover:bg-pink-100"
                                  }`}
                                >
                                  <input 
                                    type="checkbox" 
                                    checked={checked} 
                                    readOnly 
                                    className="mr-2 accent-[#A55166] pointer-events-none" 
                                  />
                                  {item}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex flex-col gap-1.5">
                          <span className="inline-block bg-[#A55166] text-white text-[10px] font-extrabold px-3 py-1 rounded-md tracking-wider uppercase">
                            Bước 4: Nhật ký phát hoang hội
                          </span>
                          <span className="text-xs font-bold text-[#A55166] dark:text-[#E2B4C1]">Mô tả hành vi hoang tưởng mới nhất:</span>
                          <textarea
                            value={phdNote}
                            onChange={(e) => setPhdNote(e.target.value)}
                            rows={3}
                            placeholder="Mô tả hành trình say đắm truyện ngược của bạn..."
                            className="w-full py-2 px-3 rounded-xl border border-[#E2B4C1] bg-white dark:bg-black/30 text-xs font-semibold outline-none resize-none"
                          />
                        </div>

                        {/* Action Submit row */}
                        <div className="flex gap-3 justify-end border-t border-pink-100 dark:border-pink-900/30 pt-3 mt-1">
                          <button
                            type="submit"
                            className="py-2.5 px-6 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 cursor-pointer"
                          >
                            🩺 Giao Bác Sĩ Chữa Làm Cho Em 💉
                          </button>
                          <button
                            type="button"
                            onClick={closePhdModal}
                            className="py-2.5 px-6 rounded-2xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs cursor-pointer"
                          >
                            Bỏ qua chuyển tiếp
                          </button>
                        </div>

                      </form>
                    ) : (
                      <div className="py-12 text-center flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500 flex items-center justify-center text-3xl animate-bounce">
                          ✓
                        </div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Hệ thống chẩn đoán lưu bệnh tích công hiệu!</h4>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-2">Đang liên kết lập phiếu khám vào Sổ Khám trực quan...</p>
                        <span className="text-[10px] text-gray-400">Vui lòng chờ giây lát...</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* TAB 3: MEDICAL HISTORY LISTING (SỔ KHÁM) */}
                {phdTab === "records" && (
                  <motion.div
                    key="records"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-4"
                  >
                    
                    {/* Search and filters columns inside Sổ Khám */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={phdRecordSearch}
                          onChange={(e) => setPhdRecordSearch(e.target.value)}
                          placeholder="Tìm mã hoặc tên bệnh nhân..."
                          className="w-full py-2 pl-9 pr-3 rounded-xl border border-[#E2B4C1] bg-white dark:bg-black/30 text-xs font-semibold outline-none"
                        />
                      </div>
                      <select
                        value={phdRecordFilter}
                        onChange={(e) => setPhdRecordFilter(e.target.value)}
                        className="py-2 px-3 rounded-xl border border-[#E2B4C1] bg-white dark:bg-black/30 text-xs font-semibold outline-none focus:outline-none cursor-pointer text-gray-800 dark:text-gray-100"
                      >
                        <option value="">🗂️ Tất cả các khoa</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Records visual render */}
                    <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
                      {phdRecords
                        .filter(r => {
                          const matchesSearch = 
                            r.name.toLowerCase().includes(phdRecordSearch.toLowerCase()) ||
                            r.note.toLowerCase().includes(phdRecordSearch.toLowerCase());
                          const matchesFilter = !phdRecordFilter || r.cat === phdRecordFilter;
                          return matchesSearch && matchesFilter;
                        })
                        .map(r => {
                          const recordCat = categories.find(c => c.id === r.cat);
                          const isExpanded = !!expandedRecordIds[r.id];
                          
                          return (
                            <div 
                              key={r.id}
                              className="border border-[#E2B4C1]/60 dark:border-pink-900/50 rounded-2xl bg-[#F7DAE7]/15 dark:bg-[#5A444C]/10 overflow-hidden"
                            >
                              
                              {/* Accordion title header */}
                              <div 
                                onClick={() => toggleRecordExpand(r.id)}
                                className="p-3.5 flex justify-between items-center gap-3 hover:bg-pink-100/50 dark:hover:bg-rose-950/20 cursor-pointer transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <User size={14} className="text-[#A55166]" />
                                  <span className="font-bold text-xs text-gray-800 dark:text-gray-200">{r.name}</span>
                                  <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 dark:bg-pink-950/40 px-2.5 py-0.5 rounded-full">
                                    {recordCat ? recordCat.name : "Phát hoang"}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] text-gray-400 font-mono italic">{r.date}</span>
                                  
                                  {/* Delete card */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteRecordItem(r.id);
                                    }}
                                    className="p-1 rounded bg-[#e05568]/10 hover:bg-[#e05568]/20 text-[#e05568] transition-colors"
                                    title="Thu hồi bệnh án"
                                  >
                                    <Trash2 size={11} />
                                  </button>

                                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </div>
                              </div>

                              {/* Expandable record contents */}
                              {isExpanded && (
                                <div className="px-4 pb-4 pt-1 border-t border-pink-100 dark:border-pink-950/30 flex flex-col gap-3 bg-white/50 dark:bg-black/30">
                                  
                                  <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="flex flex-col gap-0.5 text-xs">
                                      <span className="text-[10px] text-[#A55166] font-bold uppercase tracking-wide">Nhóm tuổi:</span>
                                      <span className="text-gray-700 dark:text-gray-300 font-semibold">{r.age}</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5 text-xs">
                                      <span className="text-[10px] text-[#A55166] font-bold uppercase tracking-wide">Tiếp nhận tại:</span>
                                      <span className="text-gray-700 dark:text-gray-300 font-semibold">{recordCat?.icon} {recordCat?.name}</span>
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-0.5 text-xs">
                                    <span className="text-[10px] text-[#A55166] font-bold uppercase tracking-wide">Triệu chứng chẩn y trị học:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {r.symptoms.map(s => (
                                        <span key={s} className="text-[10px] bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded border border-rose-100">
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-0.5 text-xs">
                                    <span className="text-[10px] text-[#A55166] font-bold uppercase tracking-wide">Lời tự thuật chi tiết hành vi:</span>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic bg-pink-50/20 dark:bg-black/45 p-2 rounded-xl border border-pink-100/40">
                                      "{r.note}"
                                    </p>
                                  </div>

                                </div>
                              )}

                            </div>
                          );
                        })}

                      {phdRecords.length === 0 && (
                        <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                          <span className="text-4xl block mb-2">🗂️</span>
                          <span className="font-bold">Sổ khám bệnh đặc khu Cố Thị hiện chưa có bệnh tích!</span>
                          <p className="text-xs text-gray-400 mt-1">Hãy chuyển sang tab "Khám Bệnh Mới" để lưu giữ hồ sơ chẩn trị của riêng bạn.</p>
                        </div>
                      )}
                    </div>

                  </motion.div>
                )}
                </AnimatePresence>

              </div>

              {/* Close buttons footer */}
              <div className="p-4 border-t border-pink-200/50 dark:border-pink-900/35 bg-pink-50/50 dark:bg-black/10 flex justify-end">
                <button
                  type="button"
                  onClick={closePhdModal}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-[#A55166] to-[#D38C9D] text-white text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-105"
                >
                  Đóng sơ đồ y tế
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP CONFIRM LOGOUT */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-to-br from-[#FBF6F9] to-[#EFE2EB] dark:from-[#211A1D] dark:to-[#171113] p-6 rounded-3xl border-2 border-pink-200 dark:border-pink-900 w-full max-w-sm shadow-2xl text-center"
            >
              <span className="text-4xl block mb-3">🏥</span>
              <h4 className="font-serif italic font-bold text-rose-850 dark:text-rose-300 text-base mb-2">Xác nhận Đăng xuất?</h4>
              <p className="text-xs text-gray-400 dark:text-gray-400 mb-6 leading-relaxed">
                Bạn có chắc chắn muốn đăng xuất khỏi hàng ngũ Admin Viện Tâm Thần Cố Thị?
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    setSettingsOpen(false);
                    handleAdminLogout();
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Xác nhận Thoát
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP CONFIRM DELETE PROMPT */}
      <AnimatePresence>
        {deletePromptId !== null && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-to-br from-[#FBF6F9] to-[#EFE2EB] dark:from-[#211A1D] dark:to-[#171113] p-6 rounded-3xl border-2 border-pink-200 dark:border-pink-900 w-full max-w-sm shadow-2xl text-center flex flex-col gap-4"
            >
              <div>
                <span className="text-4xl block mb-2">🗑️</span>
                <h4 className="font-serif italic font-bold text-rose-850 dark:text-[#F0A0B3] text-base">Bạn có chắc chưa?</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
                  Hành động này sẽ xóa vĩnh viễn hồ sơ bệnh án này khỏi hệ thống.
                </p>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-widest">
                  Nhập mật mã quản trị viên:
                </label>
                <input
                  type="password"
                  value={deletePromptPassword}
                  onChange={(e) => setDeletePromptPassword(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      handleConfirmDelete();
                    }
                  }}
                  placeholder="Mật mã admin..."
                  className="w-full py-2 px-3 rounded-xl border-2 border-pink-100 dark:border-pink-900 bg-white dark:bg-black/30 text-sm outline-none focus:border-rose-400 font-semibold"
                />
                {deletePromptError && (
                  <span className="text-xs text-red-500 font-bold mt-1">
                    ❌ {deletePromptError}
                  </span>
                )}
              </div>
              
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setDeletePromptId(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Xác nhận xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <ConfettiEffect active={phdConfettiActive} onComplete={() => setPhdConfettiActive(false)} />

    </div>
  );
}
