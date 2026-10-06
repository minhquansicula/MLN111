# Truth Rush — báo cáo kiểm thử ngày 06/10/2026

## Kiểm thử lại sau khi bổ sung xếp hạng trực tiếp

Chạy lại `npm test`: toàn bộ 46 nhóm đạt, gồm kịch bản 35 người gửi 280 lần cập nhật qua 8 câu và các kiểm tra idempotency/đến sai thứ tự/phân quyền/nộp cuối đã mô tả bên dưới. Không thay đổi code sản phẩm trong lượt kiểm thử này.

Đã chơi đủ 8 câu qua giao diện production với tên QA, chọn Đúng, tự tin 70% và Chia sẻ để có cả câu đúng lẫn câu sai. Riêng hồ sơ 4 mở kiểm tra nguồn, reload và đọc lại miễn phí. Điểm ở header và bảng giáo viên khớp sau mỗi câu:

| Thứ tự chơi | Hồ sơ | Điểm câu | Tổng trên máy và bảng giáo viên |
|---|---|---:|---:|
| 1 | Con số 300% | 0 | 0 |
| 2 | Ảnh chụp bị cắt | 54 | 54 |
| 3 | Học bổng lan truyền | 0 | 54 |
| 4 | Cảnh báo rò rỉ dữ liệu | 3 | 57 |
| 5 | Bức ảnh đúng, chú thích sai | 0 | 57 |
| 6 | AI và phép tính 40% | 0 | 57 |
| 7 | Miễn phí có đúng là miễn phí? | 64 | 121 |
| 8 | Giọng nói giống chưa đủ | 0 | 121 |

- Proxy local trả 503 cho lần gửi tiến độ đầu tiên: câu 0 điểm vẫn được tự gửi lại, xuất hiện trên bảng `1/8`, cảnh báo tự biến mất.
- Reload trong điều tra hồ sơ 4 giữ 54 điểm, 3 điểm ĐT, kiểm tra nguồn đã lưu và đồng hồ 81 giây; đọc lại không trừ thêm ngân sách. Chấm xong tăng thành 57 điểm và `4/8` trên bảng.
- Reload giáo viên giữ đúng lớp và tiến độ. Mỗi câu tiếp theo được đối chiếu sau khi bảng tự làm mới, không cần reload thủ công.
- Khi đã chấm đủ 8 nhưng chưa nộp, bảng có một hàng `8/8 · Đang chơi`, 121 điểm; thống kê hoàn thành vẫn `0/1`.
- Proxy trả 503 cho lần nộp cuối: màn tổng kết giữ 121, có nút GỬI LẠI KẾT QUẢ, nút KẾT QUẢ LỚP bị khóa và bảng chưa đánh dấu hoàn thành.
- Gửi lại thành công: bảng chỉ có một hàng, `8/8 · Đã hoàn thành`, 121 điểm; thống kê `1/1`, trung bình 121, chính xác 80, điều tra 10, trách nhiệm 30. Reload người chơi không làm mất kết quả hoặc nộp trùng; xem kết quả lớp khớp và xem lại có đủ 8 hồ sơ, đúng thứ tự đã chơi.
- Không có lỗi JavaScript trong console được kiểm tra. Các lỗi HTTP 503 được chủ động tạo để thử khả năng phục hồi.

Ảnh kiểm chứng: `.artifacts/truth-rush-live-retest.jpg`. Kiểm tra UI lần này dùng viewport desktop thực tế 1272 px; không bổ sung xác nhận mobile hay 35 thiết bị Wi-Fi thật. Vấn đề thời lượng do client cung cấp được ghi nhận bên dưới vẫn chưa thay đổi.

## Cập nhật: bảng xếp hạng sau từng câu

Bản mới gửi các câu đã chấm lên `PUT /api/class-sessions/{code}/progress`. Backend tự chấm lại, giữ câu trả lời đã ghi nhận và chỉ nhận phần mở rộng của cùng lượt chơi. Bảng giáo viên tự làm mới mỗi 2 giây, có số câu đã làm/trạng thái, và danh sách cuộn đủ toàn bộ người chơi. Thống kê trung bình và ý kiến tiếp tục chỉ tính bài nộp đủ bộ.

46 nhóm kiểm tra tự động đạt (31 backend, 14 frontend, 1 integration HTTP). Kịch bản mới mô phỏng 35 người cập nhật đồng thời qua 8 câu (280 lần cập nhật), đối chiếu điểm và thứ hạng sau mỗi vòng. Đã kiểm tra câu 0 điểm, retry 10 lần, snapshot đến sai thứ tự, đảo thứ tự case/bằng chứng, sửa đáp án cũ, đổi run ID, sai quyền/bộ/ngân sách, và progress đến muộn cùng lúc với bài nộp cuối. Không có cộng trùng, lùi tiến độ hay hàng xếp hạng trùng.

Trên giao diện production: người chơi thật chấm câu đầu được 75 điểm và giáo viên hiển thị ngay `1/8 câu · Đang chơi`; reload và tiếp tục giữ điểm; câu thứ hai được 0 điểm vẫn cập nhật thành `2/8`. Proxy local chủ động trả 503 cho hai lần gửi tiến độ đầu: giao diện giữ 75 điểm, hiện thông báo lỗi, tự gửi lại thành công và xóa thông báo. Dashboard gồm 35 người (2 qua UI, 33 giả lập HTTP), với 4 hoàn thành và 31 đang chơi, hiển thị đủ 35 hàng và đúng số đếm `4/35`. Production build đạt.

Giới hạn top 10 bên dưới đã được khắc phục bằng danh sách cuộn. Khi bằng mọi tiêu chí điểm/thời lượng, tên và ID tạo thứ tự ổn định; vẫn là hạng tuần tự. Vấn đề thời lượng từ client bên dưới vẫn còn. Các phần còn lại ghi nhận lần kiểm thử trước khi thêm cập nhật tiến độ.

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
