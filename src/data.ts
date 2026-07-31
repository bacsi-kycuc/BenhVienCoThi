import { PromptCategory, Prompt } from "./types";

export const DEFAULT_CATEGORIES: PromptCategory[] = [
  { id: "internal_medicine", icon: "🩺", name: "Nội khoa", description: "Khoa khám và điều trị các bệnh lý nội khoa tổng quát định kỳ.", location: "Phân khu A - Tòa nhà 1" },
  { id: "surgery", icon: "🩹", name: "Ngoại khoa", description: "Khoa phẫu thuật, can thiệp ngoại khoa điều trị chấn thương và bệnh lý lý học.", location: "Phòng mổ đặc biệt - Tòa nhà 2" },
  { id: "emergency", icon: "🚨", name: "Cấp cứu & Hồi sức", description: "Khoa hồi sức tích cực và xử lý các ca cấp cứu khẩn cấp 24/7.", location: "Sảnh chính tầng trệt - Tòa nhà cấp cứu" },
  { id: "obstetrics", icon: "🤰", name: "Sản phụ khoa", description: "Khoa chăm sóc sức khỏe sinh sản, theo dõi thai kỳ và sinh nở an toàn.", location: "Khu chăm sóc đặc biệt - Tòa nhà 3" },
  { id: "orthopedics", icon: "🦴", name: "Chấn thương chỉnh hình", description: "Khoa điều trị chấn thương hệ cơ xương khớp và phục hồi chức năng vận động.", location: "Khu vật lý trị liệu - Lầu II Tòa nhà B" }
];

export const DEFAULT_PROMPTS: Prompt[] = [
  {
    id: 101,
    name: "Giáo sư Cố Thần",
    category: "internal_medicine",
    icon: "%F0%9F%AA%BA", // Will map properly
    url: "https://civitai.com",
    description: "Trưởng khoa nội tổng quát lâm sàng. Chuyên khám chữa và theo dõi phác đồ điều trị nội khoa toàn diện với thái độ nghiêm túc và tận tâm.",
    tags: ["Chuyên nghiệp", "Nghiêm khắc", "Tận tụy"],
    hasPassword: false,
    votes: 0,
    khoa: "Nội khoa",
    views: 1240,
    updatedAt: "31/07/2026 12:00",
    isNew: true
  },
  {
    id: 102,
    name: "Điều dưỡng Yến Nhi",
    category: "emergency",
    icon: "🩺",
    url: "https://huggingface.co",
    description: "Nữ điều dưỡng trưởng dịu dàng, phản xạ nhanh nhạy chuyên phụ trách lập hồ sơ theo dõi dấu hiệu sinh tồn khẩn cấp của bệnh nhân ca trực.",
    tags: ["Dịu dàng", "Tận tâm", "Nhạy bén"],
    hasPassword: false,
    votes: 0,
    khoa: "Cấp cứu & Hồi sức",
    views: 852,
    updatedAt: "31/07/2026 11:45"
  },
  {
    id: 103,
    name: "Bác sĩ Tiêu Vân",
    category: "surgery",
    icon: "🩹",
    url: "https://github.com",
    description: "Bác sĩ phẫu thuật chính trực thuộc khu can thiệp đặc biệt ngoại khoa phức tạp. Hồ sơ bệnh án được bảo mật nghiêm ngặt để đảm bảo an toàn y khoa.",
    tags: ["Khóa mật khẩu", "Bí ẩn", "Cẩn trọng"],
    hasPassword: true,
    hint: "Tên tài khoản admin viết liền, không dấu (charmainennie8)",
    password: "charmainennie8",
    votes: 0,
    khoa: "Ngoại khoa",
    views: 2450,
    updatedAt: "31/07/2026 10:30",
    isNew: true
  },
  {
    id: 104,
    name: "Giáo sư Lâm Chi",
    category: "orthopedics",
    icon: "🦴",
    url: "https://wikipedia.org",
    description: "Chuyên gia đầu ngành cơ xương khớp và chấn thương chỉnh hình vận động, hướng dẫn bệnh án phục hồi chức năng hiệu quả.",
    tags: ["Khoa học", "Chu đáo", "Kỹ lưỡng"],
    hasPassword: false,
    votes: 0,
    khoa: "Chấn thương chỉnh hình",
    views: 612,
    updatedAt: "31/07/2026 09:15"
  }
];

export const PHD_SAMPLES = [
  {
    name: "Trần Văn An",
    age: "🔞 Hai Mươi Mập Mờ (Từ 18 đến 25)",
    note: "Theo dõi điều trị triệu chứng đau đầu nhẹ và mỏi cơ kéo dài do sinh hoạt không điều độ...",
    symptoms: ["Đau đầu", "Mệt mỏi kéo dài", "Mất ngủ 🌀"],
    cat: "internal_medicine"
  },
  {
    name: "Nguyễn Thị Bình",
    age: "🌿 Tuổi Thanh Xuân Mơ Màng (Từ 25 đến 30)",
    note: "Sơ cứu vết thương phần mềm ngoài da do va chạm vận động mạnh, cần thay băng rửa vết thương hàng ngày...",
    symptoms: ["Vết thương ngoài da", "Trầy xước nhẹ 💀"],
    cat: "emergency"
  },
  {
    name: "Phạm Minh Đăng",
    age: "🔥 Cứng Đầu Trưởng Thành (Từ 30 đến 40)",
    note: "Can thiệp kiểm tra định kỳ khớp gối trái sau chấn thương thể thao nhẹ...",
    symptoms: ["Đau mỏi khớp gối", "Hạn chế vận động nhẹ 🏥"],
    cat: "orthopedics"
  }
];

/**
 * SHA-256 matching function
 * Note: Since browser JS Crypto is async, we can implement it as a simple utility.
 * In addition to the secure hash verify, we also support plain password checking or fallback matching
 */
export async function verifyHash(inputText: string, targetHash: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(inputText);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex === targetHash;
  } catch (e) {
    // Basic fallback if cryptographic APIs are restricted (e.g. non-HTTPS iframes)
    return false;
  }
}
