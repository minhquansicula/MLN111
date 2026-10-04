import { ADVANCED_CASES } from "./advancedCases.js";

export const VERDICTS = [
  { id: "TRUE", label: "Đúng", description: "Thông tin được bằng chứng đáng tin cậy hỗ trợ." },
  { id: "FALSE", label: "Sai", description: "Thông tin mâu thuẫn với bằng chứng đã xác minh." },
  { id: "MISLEADING", label: "Gây hiểu lầm", description: "Có phần đúng nhưng thiếu bối cảnh quan trọng." },
  { id: "NOT_ENOUGH_EVIDENCE", label: "Chưa đủ bằng chứng", description: "Chưa thể kết luận với mức độ chắc chắn hợp lý." },
];

export const ACTIONS = [
  { id: "SHARE", label: "Chia sẻ", icon: "send", description: "Chuyển tiếp thông tin này." },
  { id: "REPORT", label: "Báo cáo", icon: "flag", description: "Gắn cờ nội dung có hại hoặc sai." },
  { id: "ADD_CONTEXT", label: "Bổ sung bối cảnh", icon: "message", description: "Chia sẻ kèm phần còn thiếu." },
  { id: "WAIT_FOR_MORE_EVIDENCE", label: "Chờ thêm bằng chứng", icon: "clock", description: "Chưa lan truyền khi chưa đủ cơ sở." },
];

const post = (author, handle, time, headline, body, likes, comments, shares, marker) => ({
  author, handle, time, headline, body, likes, comments, shares, marker,
});

export const CASES = [
  {
    id: "case_01", number: 1, difficulty: "Dễ", title: "Học bổng lan truyền",
    lesson: "Độ phổ biến không tạo ra độ tin cậy.", points: 3,
    correctVerdict: "FALSE", bestAction: "REPORT", reasonableActions: ["WAIT_FOR_MORE_EVIDENCE"],
    explanation: "Fanpage này mới được tạo và dùng logo gần giống trường. Trang học bổng chính thức xác nhận không có chương trình nào yêu cầu chia sẻ bài để nhận tiền.",
    post: post("Cơ hội Sinh viên 24h", "@cohoisinhvien24h", "8 phút trước", "Chia sẻ bài viết để nhận học bổng 5.000.000đ", "Nhà trường vừa mở 200 suất hỗ trợ khẩn cấp. Chia sẻ công khai, bình luận mã sinh viên và bấm vào biểu mẫu trước 22:00 hôm nay.", "12,8K", "3,4K", "9,1K", "THÔNG BÁO GẤP"),
    checks: [
      { id: "check_source", label: "Kiểm tra nguồn", cost: 1, score: 10, icon: "globe", title: "Nguồn xuất bản", evidence: "Tên miền của biểu mẫu không thuộc trường. Fanpage được tạo 11 ngày trước và không có dấu xác minh.", note: "Nguồn mới và tên miền lạ là tín hiệu cần kiểm tra thêm." },
      { id: "check_official", label: "Tìm thông báo chính thức", cost: 1, score: 15, strong: true, icon: "landmark", title: "Trang học bổng của trường", evidence: "Trang chính thức ghi rõ: “Hiện không có chương trình học bổng nào yêu cầu sinh viên chia sẻ bài hoặc nhập mã sinh viên trên biểu mẫu bên ngoài.”", note: "Nguồn chính thức trực tiếp bác bỏ nội dung viral." },
      { id: "check_author", label: "Kiểm tra tác giả", cost: 1, score: 5, icon: "user", title: "Người đứng sau bài đăng", evidence: "Không có tên thật, email tổ chức hay thông tin chịu trách nhiệm. Ảnh đại diện sao chép từ website trường.", note: "Thiếu danh tính làm giảm trách nhiệm giải trình." },
      { id: "check_comments", label: "Đọc bình luận", cost: 1, score: 2, icon: "messages", title: "Bình luận nổi bật", evidence: "Nhiều tài khoản nói đã chia sẻ nhưng chưa ai xác nhận nhận tiền. Một bình luận cảnh báo biểu mẫu hỏi quá nhiều thông tin.", note: "Bình luận là dấu hiệu để điều tra, không phải bằng chứng quyết định." },
      { id: "read_original", label: "Mở thể lệ gốc", cost: 2, score: 20, strong: true, icon: "file", title: "Không có thể lệ gốc", evidence: "Nút “Xem thể lệ” dẫn tới trang thu thập số điện thoại, mã sinh viên và mật khẩu email. Không có đơn vị tài trợ hay điều khoản học bổng.", note: "Đây là bằng chứng mạnh về một chiến dịch giả mạo." },
    ],
  },
  {
    id: "case_02", number: 2, difficulty: "Trung bình", title: "Con số 300%",
    lesson: "Tỷ lệ phần trăm cần số gốc và phạm vi.", points: 3,
    correctVerdict: "MISLEADING", bestAction: "ADD_CONTEXT", reasonableActions: ["WAIT_FOR_MORE_EVIDENCE"],
    explanation: "Con số tăng 300% là phép tính đúng từ 1 lên 4 trường hợp, nhưng bài đăng bỏ mẫu số, khoảng thời gian và nguyên nhân. Nó không chứng minh chất lượng đào tạo đang lao dốc.",
    post: post("Campus Watch", "@campuswatch", "24 phút trước", "Số sinh viên trượt môn tăng 300% — chất lượng đào tạo lao dốc", "Báo cáo mới cho thấy số ca trượt môn đã tăng gấp bốn. Sinh viên đang phải trả giá cho chương trình học mới.", "21,4K", "6,8K", "11,2K", "SỐ LIỆU GÂY SỐC"),
    checks: [
      { id: "check_statistics", label: "Kiểm tra phép tính", cost: 1, score: 20, strong: true, icon: "chart", title: "Số tuyệt đối", evidence: "Số trường hợp tăng từ 1 lên 4 trong một lớp 42 người. 300% đúng về phép tính nhưng che giấu quy mô rất nhỏ.", note: "Luôn hỏi tỷ lệ được tính từ bao nhiêu." },
      { id: "check_sample", label: "Kiểm tra phạm vi mẫu", cost: 1, score: 10, icon: "users", title: "Phạm vi dữ liệu", evidence: "Dữ liệu chỉ thuộc một lớp trong một học kỳ. Toàn khoa có hơn 1.200 sinh viên và chưa có báo cáo tổng hợp.", note: "Một lớp không đại diện cho toàn bộ chương trình." },
      { id: "check_source", label: "Kiểm tra nguồn", cost: 1, score: 5, icon: "globe", title: "Campus Watch", evidence: "Trang chuyên tổng hợp tin sinh viên, có tác giả nhưng không dẫn bảng dữ liệu trong bài đăng.", note: "Nguồn thứ cấp cần liên kết tới dữ liệu gốc." },
      { id: "check_comments", label: "Đọc bình luận", cost: 1, score: 2, icon: "messages", title: "Phản ứng của người đọc", evidence: "Các bình luận nổi bật đều suy đoán nguyên nhân. Không ai cung cấp dữ liệu của các lớp khác.", note: "Sự đồng thuận trong bình luận không thay thế dữ liệu." },
      { id: "search_other_news", label: "So sánh nguồn khác", cost: 1, score: 8, icon: "newspaper", title: "Bản tin khoa", evidence: "Bản tin khoa nói tỷ lệ trượt chung gần như không đổi; lớp này có bốn trường hợp vì kỳ trước chỉ có một.", note: "Nguồn độc lập giúp kiểm tra cách bài viral đóng khung con số." },
      { id: "read_original", label: "Đọc bảng dữ liệu gốc", cost: 2, score: 15, strong: true, icon: "file", title: "Bảng thống kê gốc", evidence: "Bảng chỉ ghi số ca theo lớp, không kết luận về nguyên nhân hay chất lượng đào tạo.", note: "Dữ liệu không hỗ trợ kết luận nhân quả của bài đăng." },
    ],
  },
  {
    id: "case_03", number: 3, difficulty: "Khó", title: "Ảnh chụp bị cắt",
    lesson: "Bối cảnh có thể xác nhận một thông tin tưởng như đáng ngờ.", points: 3,
    correctVerdict: "TRUE", bestAction: "SHARE", reasonableActions: ["ADD_CONTEXT"],
    explanation: "Ảnh bị cắt nhưng phần nội dung còn lại không làm thay đổi ý chính: giảng viên thật sự cho phép dùng AI trong bài tập số 2, với yêu cầu ghi nguồn và tự giải thích kết quả.",
    post: post("FPT Study Hub", "@fptstudyhub", "1 giờ trước", "Giảng viên cho phép dùng AI trong bài tập số 2", "Ảnh chụp email đang lan truyền cho thấy lớp MLN111 được phép dùng công cụ AI. Một số người cho rằng ảnh đã bị cắt để xuyên tạc.", "4,9K", "1,1K", "2,3K", "ẢNH CHỤP EMAIL"),
    checks: [
      { id: "check_date", label: "Kiểm tra ngày", cost: 1, score: 15, icon: "calendar", title: "Ngày gửi email", evidence: "Email được gửi hôm qua, trước hạn bài tập 6 ngày. Mã lớp và học kỳ khớp với lịch hiện tại.", note: "Thời điểm phù hợp với thông tin trong bài đăng." },
      { id: "view_full_context", label: "Xem ảnh đầy đủ", cost: 2, score: 20, strong: true, icon: "scan", title: "Phần bị cắt", evidence: "Email đầy đủ: “Có thể dùng AI cho bài số 2, nhưng phải ghi công cụ, kiểm tra đầu ra và tự giải thích.” Phần bị cắt bổ sung điều kiện, không đảo ngược thông báo.", note: "Bối cảnh làm thông tin chính xác hơn, không biến nó thành sai." },
      { id: "check_official", label: "Kiểm tra LMS", cost: 1, score: 15, strong: true, icon: "landmark", title: "Thông báo trên LMS", evidence: "Trang môn học đăng cùng chính sách và cùng thời hạn. Tài khoản đăng là của giảng viên phụ trách.", note: "Nguồn chính thức độc lập xác nhận nội dung." },
      { id: "check_comments", label: "Đọc bình luận", cost: 1, score: 2, icon: "messages", title: "Tranh luận bên dưới", evidence: "Bình luận chia đôi: một bên tin ảnh, một bên nói “email nào cũng làm giả được”. Không bên nào đưa thêm bằng chứng.", note: "Nghi ngờ hợp lý cần được giải quyết bằng kiểm chứng." },
      { id: "check_metadata", label: "Kiểm tra metadata", cost: 1, score: 10, icon: "fingerprint", title: "Dấu vết tệp ảnh", evidence: "Ảnh được chụp cùng ngày email gửi. Không thấy dấu hiệu ghép chữ, nhưng metadata một mình không xác nhận người gửi.", note: "Bằng chứng kỹ thuật hỗ trợ nhưng không mạnh bằng nguồn chính thức." },
    ],
  },
  {
    id: "case_04", number: 4, difficulty: "Khủng hoảng", title: "Cảnh báo rò rỉ dữ liệu",
    lesson: "Bất định là một kết luận hợp lệ khi bằng chứng chưa đủ.", points: 4, timerSeconds: 90,
    correctVerdict: "NOT_ENOUGH_EVIDENCE", bestAction: "WAIT_FOR_MORE_EVIDENCE", reasonableActions: ["ADD_CONTEXT"],
    explanation: "Có tín hiệu đáng kiểm tra nhưng chưa có nguồn độc lập, thông báo chính thức hoặc bằng chứng kỹ thuật đủ mạnh để xác nhận hay bác bỏ vụ rò rỉ. Chờ thêm bằng chứng là lựa chọn phù hợp.",
    post: post("Tech Leak VN", "@techleak_vn", "3 phút trước", "KHẨN: dữ liệu của hàng nghìn sinh viên đã bị rao bán", "Một nguồn tin ẩn danh gửi ảnh chụp danh sách email và nói dữ liệu đến từ nền tảng học tập của trường. Hãy đổi mật khẩu và chia sẻ ngay.", "32,7K", "9,5K", "18,9K", "CẢNH BÁO BẢO MẬT"),
    checks: [
      { id: "check_source", label: "Kiểm tra nguồn", cost: 1, score: 10, icon: "globe", title: "Tech Leak VN", evidence: "Tài khoản từng đăng hai cảnh báo đúng và một cảnh báo sai. Bài hiện tại chỉ dẫn “nguồn ẩn danh”.", note: "Lịch sử hỗn hợp không đủ để xác nhận vụ việc mới." },
      { id: "check_image", label: "Kiểm tra ảnh", cost: 1, score: 15, strong: true, icon: "image", title: "Ảnh danh sách email", evidence: "Một phần email là địa chỉ công khai trên website câu lạc bộ. Ảnh không cho thấy cơ sở dữ liệu, thời gian trích xuất hay hệ thống nguồn.", note: "Ảnh có thể thật nhưng chưa chứng minh dữ liệu bị rò rỉ." },
      { id: "check_date", label: "Kiểm tra thời điểm", cost: 1, score: 15, icon: "calendar", title: "Dấu thời gian", evidence: "Ảnh bị cắt mất ngày. Tìm kiếm ngược cho thấy một phần ảnh đã xuất hiện 8 tháng trước trong bài hướng dẫn an toàn mạng.", note: "Nội dung cũ có thể bị tái sử dụng cho sự kiện mới." },
      { id: "search_other_news", label: "Tìm nguồn độc lập", cost: 1, score: 20, strong: true, icon: "newspaper", title: "Chưa có xác nhận độc lập", evidence: "Chưa có cơ quan báo chí hoặc chuyên gia an ninh nào công bố mẫu dữ liệu để kiểm tra. Một nhóm đang đề nghị nguồn tin cung cấp bằng chứng.", note: "Không tìm thấy xác nhận không đồng nghĩa sự việc chắc chắn không xảy ra." },
      { id: "check_official", label: "Kiểm tra thông báo chính thức", cost: 1, score: 10, icon: "landmark", title: "Thông báo của nền tảng", evidence: "Nền tảng nói đang điều tra và chưa thể xác nhận phạm vi. Họ khuyến nghị bật xác thực hai bước như biện pháp phòng ngừa.", note: "Thông báo này chưa xác nhận cũng chưa bác bỏ sự cố." },
      { id: "check_comments", label: "Đọc bình luận", cost: 1, score: 2, icon: "messages", title: "Phản ứng khẩn cấp", evidence: "Nhiều người kể từng nhận spam; người khác nói vẫn đăng nhập bình thường. Cả hai đều không chứng minh nguồn của danh sách.", note: "Trải nghiệm cá nhân không xác định nguyên nhân của sự cố." },
    ],
  },
];

export const verdictLabel = (id) => VERDICTS.find((item) => item.id === id)?.label ?? id;
export const actionLabel = (id) => ACTIONS.find((item) => item.id === id)?.label ?? id;

const originalMedia = ["scholarship", "statistics", "email", "security"];
const originalAlt = [
  "Áp phích mô phỏng học bổng 5 triệu đồng, yêu cầu chia sẻ bài viết và đăng ký trước 22 giờ.",
  "Biểu đồ bài đăng dùng chỉ số tăng 300%, không hiển thị cỡ mẫu hoặc số tuyệt đối.",
  "Ảnh chụp email mô phỏng về việc được dùng AI cho bài tập số 2, phần điều kiện bị cắt.",
  "Ảnh danh sách email đã ẩn danh được bài đăng dùng để minh họa cáo buộc rò rỉ dữ liệu.",
];
CASES.forEach((item, index) => {
  item.post.media = originalMedia[index];
  item.post.mediaAlt = originalAlt[index];
  item.post.caption = "Tài liệu trong bài đăng · tình huống mô phỏng để học tập.";
});

export const CASE_BANK = [...CASES, ...ADVANCED_CASES];
export const DEFAULT_PACK_ID = "complete";
export const CASE_PACKS = [
  { id: DEFAULT_PACK_ID, label: "Đầy đủ", description: "8 hồ sơ · từ làm quen đến kiểm chứng nâng cao", caseIds: CASE_BANK.map((item) => item.id) },
];
// Only used to resume saved runs and classes created before the eight-case update.
const LEGACY_PACKS = [
  { id: "advanced", label: "Nâng cao", description: "4 hồ sơ mới · bằng chứng trái chiều, nguồn thứ cấp và ngoại lệ", caseIds: ADVANCED_CASES.map((item) => item.id) },
  { id: "foundation", label: "Luyện tập", description: "4 hồ sơ gốc · làm quen với kiểm chứng và ngân sách điều tra", caseIds: CASES.map((item) => item.id) },
];
export const getCase = (id) => CASE_BANK.find((item) => item.id === id);
export const getPack = (id) => [...CASE_PACKS, ...LEGACY_PACKS].find((item) => item.id === id);
