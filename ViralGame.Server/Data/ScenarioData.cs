namespace ViralGame.Server;

public static class ScenarioData
{
    public static Scenario Create() => new(
        "ai-memory-fictional", "AI khiến trí nhớ sinh viên giảm 40%?",
        "Một nghiên cứu mới chứng minh sinh viên sử dụng AI để học tập mất 40% khả năng ghi nhớ. Đã đến lúc ngừng dùng AI trong trường học?",
        "Daily Student News", 16400, 4200, 8300, Verdict.Misleading, Verdict.True,
        "Trong tình huống mô phỏng này, nghiên cứu chỉ ghi nhận chênh lệch 40% ở một bài kiểm tra nhớ lại cụ thể, trên 42 sinh viên. Điều đó không chứng minh AI làm mất 40% trí nhớ tổng thể hoặc gây suy giảm lâu dài. Tiêu đề đã lược bỏ bối cảnh và khái quát hóa quá mức. Hãy tìm nguồn gốc, xem cách đo lường và giới hạn của nghiên cứu trước khi chia sẻ.",
        [
            new("E01", "42 người có đại diện cho tất cả?", "Thí nghiệm có 42 sinh viên tại một trường đại học. Nhóm nghiên cứu chưa lặp lại thử nghiệm trên các nhóm lớn hơn.", "Research", "Phần phương pháp · Nghiên cứu gốc", "Nguồn gốc rõ ràng trong tình huống mô phỏng. Mẫu nhỏ và phạm vi hẹp làm hạn chế khả năng khái quát hóa; bản thân cỡ mẫu không đủ để phủ nhận toàn bộ kết quả."),
            new("E02", "Tiêu đề đang được chia sẻ", "“Sinh viên dùng AI mất 40% trí nhớ”, bài báo viết. Không có mô tả cách đo trí nhớ trong phần tiêu đề.", "NewsArticle", "Daily Student News", "Độ tin cậy THẤP. Tiêu đề mở rộng một chỉ số trong thí nghiệm thành kết luận về trí nhớ tổng thể. Bài báo không liên kết nghiên cứu gốc."),
            new("E03", "Con số 40% thực sự đo gì?", "Nhóm sử dụng AI đạt kết quả thấp hơn 40% trong một bài kiểm tra nhớ lại nội dung vừa học, so với nhóm đối chứng.", "Research", "Bảng kết quả · Nghiên cứu gốc", "Nguồn trực tiếp. Con số nói về điểm của một bài kiểm tra cụ thể, không phải 40% tổng khả năng ghi nhớ của con người."),
            new("E04", "Một bình luận rất tự tin", "“Ai cũng biết dùng AI làm não lười đi. Tôi thấy bạn mình dùng AI rồi quên hết bài!”", "SocialPost", "Bình luận của một tài khoản ẩn danh", "Độ tin cậy THẤP. Đây là giai thoại không có dữ liệu đối chứng; không xác minh được tác giả hay quan hệ nhân quả."),
            new("E05", "Lưu ý cuối bài nghiên cứu", "Các tác giả viết: “Không nên khái quát kết quả ra ngoài điều kiện của thí nghiệm này. Chúng tôi chưa đo ảnh hưởng dài hạn.”", "Quote", "Phần giới hạn · Nghiên cứu gốc", "Trích dẫn đúng theo tình huống mô phỏng. Tác giả không kết luận AI gây mất trí nhớ lâu dài. Cần đọc cùng phương pháp và kết quả."),
            new("E06", "8.300 lượt chia sẻ", "Bài đăng đã có 16.400 lượt thích, 4.200 bình luận và 8.300 lượt chia sẻ. Nhiều người nói rằng họ đã tin ngay khi đọc tiêu đề.", "Statistic", "Số liệu hiển thị trên mạng xã hội", "Số tương tác chỉ thể hiện mức độ lan truyền. Không cho biết người chia sẻ đã đọc, kiểm chứng hay hiểu đúng nghiên cứu."),
            new("E07", "Theo dấu nguồn tin", "Bài báo không cung cấp đường dẫn đến bài nghiên cứu. Hồ sơ tác giả chỉ có biệt danh và ảnh đại diện, không có thông tin chuyên môn.", "NewsArticle", "Trang thông tin bài báo", "Không xác minh được tác giả. Thiếu liên kết nguồn gốc làm việc kiểm tra khó hơn; đây là dấu hiệu cần thận trọng, không tự động chứng minh mọi nội dung đều sai.")
        ]);
}
