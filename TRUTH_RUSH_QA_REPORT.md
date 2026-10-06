# Truth Rush — báo cáo kiểm thử ngày 06/10/2026

Đã kiểm tra bản nội dung và rubric đang nằm trong workspace, gồm production bundle đã build ngày 06/10/2026. Không phát hành thay đổi trong lần kiểm thử này.

## Kết quả

45 nhóm kiểm tra tự động đạt: 31 backend/rule/privacy, 13 frontend và một luồng integration HTTP gồm nhiều kịch bản. Integration được mở rộng với 96 lượt, mỗi lượt một tổ hợp phán quyết, độ tự tin và hành động; đối chiếu toàn bộ điểm thành phần trên 8 hồ sơ, tổng cộng 768 tổ hợp hồ sơ. Frontend và backend khớp; điểm từng hồ sơ luôn trong 0–100.

Hai lượt chơi qua giao diện production hoàn thành đủ 8 hồ sơ:

- Lớp học: 558/800, giáo viên và thống kê lớp hiển thị đúng 558; chỉ nộp khi hoàn thành.
- Solo: 118/800 khi luôn chọn Đúng, tự tin 70%, chia sẻ và không mở điều tra. Không có nút kết quả lớp hoặc trạng thái nộp bài của lớp.

## Ma trận đã kiểm tra

| Nhóm | Trường hợp | Kết quả |
|---|---|---|
| Form | Tên rỗng, khoảng trắng, quá 24 ký tự, ký tự điều khiển, mã lớp sai | Báo lỗi/từ chối đúng |
| Danh tính | 35 token riêng biệt, tên trùng khác hoa/thường, Unicode NFC/NFD, cắt khoảng trắng | Đúng |
| Chơi | Tutorial, 8 hồ sơ, xáo thứ tự theo chặng, chuyển hồ sơ 4 sang 5, tổng kết | Đúng |
| Điều tra | Trừ ngân sách, chặn kiểm tra quá ngân sách, đọc lại miễn phí, sổ bằng chứng | Đúng |
| Dialog | Escape, đọc bằng chứng trên mobile, bảng dữ liệu, dialog giữ mở khi hết giờ | Đúng |
| Đồng hồ | Hồ sơ 4 chạy 90 giây, reload giữ deadline, hết giờ tự chuyển phán quyết; hồ sơ 8 hiển thị 120 giây và kết thúc thủ công | Đúng |
| Tiến độ | Reload và tiếp tục giữ bước chơi, ngân sách, bằng chứng; lưu hỏng và lượt cũ trong unit tests | Đúng |
| Nội dung mới | Bản tin khoa, điều kiện dùng AI, rubric hồ sơ 3, hướng dẫn bất định và bảo mật | Hiển thị đúng |
| Điểm | Tăng tổng sau từng hồ sơ, giữ tổng khi sang câu mới, câu sai điểm 0, phạt tự tin sai | Đúng |
| Quyền | Giáo viên xem trước khi có bài; thiếu/sai token và học sinh chưa hoàn thành bị chặn | Đúng |
| Nộp | Rỗng, thiếu/trùng/sai hồ sơ, null, sai verdict/action/confidence, bằng chứng lạ/trùng, quá ngân sách, run ID/thời gian ngoài giới hạn | Từ chối đúng |
| Nộp đồng thời | 35 người nộp; retry cùng run 10 lần; hai run khác nhau cho cùng người | Đủ 35 kết quả, retry không nhân đôi, chỉ nhận một run |
| Xếp hạng | Điểm khác nhau, từng tiêu chí phụ, bằng tất cả tiêu chí, lặp đọc bảng | Thứ tự theo rubric; đủ hạng 1–35; không thiếu/trùng người |
| Sức chứa | 100 người vào lớp; người 101 | Nhận đủ 100, từ chối người 101 |
| Thống kê | 35 hoàn thành trong 100 tham gia; lớp UI từ 30/35 đến 35/35 | Chỉ người hoàn thành đóng góp điểm và phân bố; số đếm/điểm đúng |
| Responsive | Viewport 320×740, 768×900, 1280×900 | Không tràn ngang ở các màn đã kiểm tra |
| Ảnh | Email, học bổng, sân trường; đồ họa SVG | Tải/hiển thị được |
| Mạng và vòng đời | Ngắt backend, thử tải lại, restart backend, tạo lớp mới, chơi lại | Có thông báo lỗi, giữ dữ liệu cũ; lớp cũ không còn sau restart; lớp mới hoạt động |
| Console | Lượt chơi bình thường và dashboard tải 35 người | Không có lỗi; HTTP 404/connection refused chỉ xuất hiện khi chủ động kiểm tra lỗi |

## Phát hiện còn lại

### P2 — Có thể giả mạo thời gian dùng để phân hạng

`TruthRushClassService.Leaderboard` dùng `DurationSeconds` trong request làm tiêu chí cuối. `TruthRushScoringService` chỉ kiểm tra phạm vi 1–7200, không đối chiếu đồng hồ server. Đã tạo hai người có cùng 800 điểm và mọi điểm thành phần giống nhau; sau hơn ba giây từ khi tham gia, nộp một lượt khai 1 giây và một lượt khai 600 giây. Backend nhận cả hai và xếp lượt khai 1 giây hạng 1. Thứ tự sắp xếp đúng với dữ liệu đầu vào nhưng tiêu chí tốc độ chưa đảm bảo công bằng.

Đề xuất: ghi thời điểm bắt đầu và hoàn thành trên server để tính thời lượng; xác định rõ thời lượng có tính hướng dẫn và thời gian nghỉ hay không.

### Giới hạn UI — Dashboard chỉ hiển thị top 10

`ClassDashboard` dùng `leaders.slice(0, 10)`. Với lớp 35/35, API có đủ 35 hạng nhưng dashboard chỉ có 10 hàng; không có điều khiển xem hạng 11–35. Đây là giới hạn đã có từ trước, không phải mất dữ liệu backend.

Đề xuất: giữ top 10 làm điểm nổi bật và thêm nút xem toàn bộ bảng xếp hạng, hoặc hiển thị đủ danh sách có cuộn/phân trang.

## Giới hạn của kiểm thử

Tải đồng thời được mô phỏng qua HTTP trên máy local; kiểm tra UI dùng trình duyệt với viewport desktop/tablet/mobile, không phải 35 thiết bị thật trên Wi-Fi. Chưa kiểm tra hạ tầng triển khai Internet, trình duyệt khác, thiết bị thật, mất điện hoặc TTL 8 giờ bằng chờ thực tế. Khi hoàn toàn đồng điểm và đồng thời gian, backend hiện đánh số tuần tự, chưa có quy tắc đồng hạng hoặc tiêu chí cuối được công bố.
