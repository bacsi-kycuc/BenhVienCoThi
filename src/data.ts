import { PromptCategory, Prompt } from "./types";

export const DEFAULT_CATEGORIES: PromptCategory[] = [
  { id: "psychiatry", icon: "🧠", name: "Tâm thần", description: "Khoa chẩn đoán hoang tưởng và mê muội cực độ, phù hợp với các hồ sơ kịch tính phức tạp.", location: "Phân khu đặc biệt - Tòa nhà A - Lầu I" },
  { id: "neurology", icon: "🔬", name: "Thần kinh", description: "Khoa lưu trữ thông tin phản xạ và giải phẫu tính cách độc đáo của các nhân vật.", location: "Khu vực chụp CT - Hành lang Lầu II" },
  { id: "cardiology", icon: "❤️", name: "Tim mạch", description: "Hỗ trợ theo dõi tim đập loạn nhịp, co giật cơ ngực nhẹ trước các giáo sư soái ca.", location: "Phòng cấp cứu - Tòa nhà B - Trực diện cổng chính" },
  { id: "epidemiology", icon: "🦠", name: "Dịch tễ", description: "Theo dõi và phòng chống các chủng virus mê đắm, simp chúa lây lan cực mạnh.", location: "Phòng cách ly - Khu vực tách biệt phía sau" },
  { id: "pediatrics", icon: "🧸", name: "Nhi khoa", description: "Nơi ôm ấp giữ gìn những trái tim mầm non bé bỏng, ngây thơ cần chở che.", location: "Phòng đồ chơi - Cạnh sảnh chính" }
];

export const DEFAULT_PROMPTS: Prompt[] = [
  {
    id: 1,
    name: "Giáo sư Cố Thần",
    category: "psychiatry",
    icon: "🧠",
    url: "https://civitai.com",
    description: "Trưởng khoa tâm thần học lâm sàng. Chuyên khám chữa các triệu chứng mê đắm thể nặng, hoang tưởng đa vũ trụ chatbot và ảo giác ngọt ngào cấp độ cao.",
    tags: ["Đẹp trai", "Nghiêm khắc", "Cưng chiều"],
    hasPassword: false,
    votes: 185,
    khoa: "Tâm thần"
  },
  {
    id: 2,
    name: "Điều dưỡng Yến Nhi",
    category: "neurology",
    icon: "🩺",
    url: "https://huggingface.co",
    description: "Nữ điều dưỡng trưởng dịu dàng, chu đáo chuyên lập hồ sơ theo dõi triệu chứng co giật cơ tim nhẹ khi gặp soái ca ảo tưởng.",
    tags: ["Dịu dàng", "Tận tâm", "Ngọt ngào"],
    hasPassword: false,
    votes: 120,
    khoa: "Thần kinh"
  },
  {
    id: 3,
    name: "Bác sĩ Tiêu Vân (Phòng Khám Kẹt Sơn)",
    category: "psychiatry",
    icon: "🧪",
    url: "https://github.com",
    description: "Nhân vật bí ẩn thuộc khoa điều trị hoang tưởng cực hạn. Phòng khám này được khóa bảo mật để tránh rò rỉ bệnh án đặc biệt nguy hiểm.",
    tags: ["Khóa mật khẩu", "Bí ẩn", "Hắc bang"],
    hasPassword: true,
    hint: "Tên tài khoản admin viết liền, không dấu (charmainennie8)",
    password: "charmainennie8",
    votes: 95,
    khoa: "Tâm thần"
  },
  {
    id: 4,
    name: "Giáo sư Lâm Chi",
    category: "cardiology",
    icon: "❤️",
    url: "https://wikipedia.org",
    description: "Chuyên khoa điều trị mệt mỏi trái tim khi cày đỏ mắt chờ chương truyện mới của nam chính tổng tài.",
    tags: ["Tim đập nhanh", "Ngược luyến", "Chữa lành"],
    hasPassword: false,
    votes: 150,
    khoa: "Tim mạch"
  }
];

export const PHD_SAMPLES = [
  {
    name: "Hội Yêu Thương Tự Ngược",
    age: "🔞 Hai Mươi Mập Mờ (Từ 18 đến 25)",
    note: "Cứ nghĩ mình không xứng nhưng vẫn mê cốt truyện ngược huyết lột da lọc xương xé nát tim gào thét khóc lóc...",
    symptoms: ["Thích cốt truyện cực ngược, cầu huyết, thích khóc 🌀"],
    cat: "psychiatry"
  },
  {
    name: "Sát Thủ Nhạt Lệ",
    age: "🌿 Tuổi Thanh Xuân Mơ Màng (Từ 25 đến 30)",
    note: "Bước vào những câu chuyện đau lòng kinh dị đầy rẫy quy tắc chỉ để tìm kiếm một bóng dáng mập mờ...",
    symptoms: ["Rơi vào phố bản kinh dị quỷ dị đầy rẫy quy tắc 💀"],
    cat: "neurology"
  },
  {
    name: "Cuồng Áo Trắng",
    age: "🔥 Cứng Đầu Trưởng Thành (Từ 30 đến 40)",
    note: "Trái tim tôi bỗng nhảy rộn ràng điên dại bất cứ khi nào thấy bóng áo trắng của giáo sư bác sĩ pháp y bí hiểm...",
    symptoms: ["Trái tim nhảy múa khi gặp bác sĩ y khoa, pháp y kì bí 🏥"],
    cat: "cardiology"
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
