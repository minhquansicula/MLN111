export const CASES = [
  {
    id: "case-1",
    post: {
      author: "Daily Student News",
      avatar: "DS",
      time: "2 giờ trước",
      content: "🚨 BREAKING\n\nNghiên cứu mới chứng minh rằng sinh viên sử dụng AI bị giảm 40% khả năng ghi nhớ.",
      likes: "28.3K",
      comments: "4.8K",
      shares: "14.2K",
    },
    investigationPoints: 3,
    checks: [
      { id: "source", label: "Kiểm tra Nguồn", cost: 1, result: "Trang web 'Daily Student News' mới lập 2 tháng trước. Không có tác giả rõ ràng. Không dẫn link bài nghiên cứu gốc." },
      { id: "comments", label: "Đọc Bình luận", cost: 1, result: "Minh: 'Mình dùng AI mỗi ngày, thấy trí nhớ kém đi thật.'\nLan: 'Đây là nghiên cứu khoa học rồi cãi gì nữa?'" },
      { id: "search", label: "Tìm tin tức khác", cost: 1, result: "Không có tờ báo lớn hay tạp chí khoa học nào đưa tin về nghiên cứu này." },
      { id: "original", label: "Đọc bài gốc", cost: 2, result: "Không tìm thấy bài nghiên cứu gốc nào khớp với thông tin trên." },
    ],
    correctVerdict: "FALSE",
    recommendedAction: "REPORT",
    explanation: "Thông tin này đến từ một nguồn không uy tín, không có bằng chứng khoa học thực tế, và lợi dụng sự tranh cãi về AI để câu view.",
    missedEvidence: "Việc không có bài nghiên cứu gốc và tờ báo lớn nào đưa tin là dấu hiệu rõ nhất của tin giả."
  }
];

export const VERDICTS = {
  TRUE: "ĐÚNG",
  FALSE: "SAI",
  MISLEADING: "GÂY HIỂU LẦM",
  NOT_ENOUGH_EVIDENCE: "CHƯA ĐỦ BẰNG CHỨNG"
};

export const ACTIONS = {
  SHARE: "CHIA SẺ",
  REPORT: "BÁO CÁO",
  ADD_CONTEXT: "THÊM BỐI CẢNH",
  WAIT_FOR_MORE_EVIDENCE: "CHỜ THÊM BẰNG CHỨNG"
};
