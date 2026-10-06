# Nội dung và kiểm tra Truth Rush

## Rà soát logic ngày 06/10/2026

- Hồ sơ 2: bản tin khoa chỉ đối chiếu số ca của một lớp, không khẳng định tỷ lệ toàn khoa khi chưa có báo cáo tổng hợp. Hai bài dẫn cùng bảng không được coi là hai nguồn dữ liệu độc lập.
- Hồ sơ 3: giữ phán quyết Đúng cho khẳng định được dùng AI trong bài tập số 2; ưu tiên Bổ sung bối cảnh để nêu yêu cầu ghi công cụ, kiểm tra đầu ra và tự giải thích. Hành động này được 20 điểm, chia sẻ nguyên bài được 10 điểm.
- Hồ sơ 3: ngày hiển thị và metadata mỗi kiểm tra được 5 điểm; cùng bình luận chỉ đạt 12 điểm. Muốn đạt tối đa 25 điểm điều tra phải có xác nhận trực tiếp từ ảnh đầy đủ hoặc LMS, vẫn trong ngân sách 3 điểm.
- Hồ sơ 4: thông báo đang điều tra không xác nhận vụ rò rỉ. Chờ xác minh trước khi lan truyền vẫn đi cùng phòng ngừa qua trang chính thức, gồm bật xác thực hai bước và đổi mật khẩu nếu đã nhập vào biểu mẫu lạ.
- Màn chọn độ tự tin nói rõ người chơi đánh giá phán quyết của mình. Với Chưa đủ bằng chứng, đó là mức chắc chắn về việc chứng cứ hiện tại chưa đủ, không phải xác suất sự việc xảy ra.
- Rubric frontend và backend được cập nhật cùng nhau; regression kiểm tra điểm hành động, giới hạn bằng chứng phụ và kết quả chấm lại qua API.

## Bộ Nâng cao

Mỗi lượt mới gồm đủ 8 hồ sơ trong một bộ, tối đa 800 điểm: 4 hồ sơ gốc tiếp nối 4 hồ sơ nâng cao. Ba hồ sơ đầu mỗi chặng xáo thứ tự; hồ sơ khủng hoảng ở vị trí 4 và 8. Toàn bộ nhân vật, văn bản, nghiên cứu, số liệu và hình ảnh là dữ liệu hư cấu phục vụ học tập.

| Hồ sơ | Kỹ năng cần dùng | Ngân sách | Phán quyết |
|---|---|---:|---|
| AI và phép tính 40% | Phân biệt tỷ lệ tương đối/điểm phần trăm; đọc thiết kế, mẫu và phép đo trước khi suy ra nhân quả | 4 | Gây hiểu lầm |
| Bức ảnh đúng, chú thích sai | Kiểm tra lần xuất bản sớm, kiến trúc, địa điểm và thời gian; không chỉ tìm dấu chỉnh sửa | 3 | Sai |
| Miễn phí có đúng là miễn phí? | Đọc phạm vi áp dụng và hiệu lực chính sách; đối chiếu hóa đơn cùng tuyến/ngày/đối tượng | 3 | Đúng |
| Giọng nói giống chưa đủ | Truy nguồn bản ghi, phân biệt độ giống giọng với xác suất thật và nhận ra giới hạn công cụ | 4 | Chưa đủ bằng chứng |

Mỗi hồ sơ có 6 kiểm tra, gồm nguồn trực tiếp, bằng chứng yếu, thông tin trái chiều và giới hạn phương pháp. Người chơi không đủ ngân sách để mở tất cả. Có ít nhất một đường điều tra đạt 25 điểm trong ngân sách của từng hồ sơ. Trả lời đúng không tự mang lại điểm điều tra.

Hồ sơ ghi âm dùng đồ họa và bản chép lời mô phỏng, không có tệp âm thanh thật. Hình sân trường do công cụ imagegen tích hợp tạo. Bảy hình khác là đồ họa SVG trong `PostMedia.jsx`, có văn bản thay thế và chú thích. Ảnh không chứa lời giải; bằng chứng chỉ mở khi người chơi chọn kiểm tra.

## Các lỗi đã xử lý

- Tra cứu hồ sơ bằng ID thay vì vị trí mảng, tránh nhầm bài/đáp án/điểm khi xáo thứ tự.
- Mua bằng chứng kiểm tra ngân sách, bước chơi, trùng lượt và hạn điều tra trong một thao tác; chặn cập nhật từ màn hình cũ khi bấm nhanh.
- Có sổ đọc lại bằng chứng miễn phí trước phán quyết và trong các bước chọn tự tin/hành động.
- Hết giờ chuyển sang phán quyết nhưng không đóng bằng chứng đang đọc; đồng hồ không trở lại 120 giây sau khi kết thúc.
- Kiểm tra dữ liệu lưu trước khi khôi phục, tính lại điểm và chuyển lượt schema cũ sang bộ Luyện tập.
- Tạo run ID được cả trên HTTP LAN khi `crypto.randomUUID` không khả dụng.
- Hộp bằng chứng dùng dialog, hỗ trợ Escape, focus và cuộn nội dung; sửa tràn ngang tại viewport 320px.
- Giữ phiên giáo viên khi tải lại cùng tab; ngăn yêu cầu polling chồng nhau.
- Thêm thời hạn yêu cầu API, thông báo lỗi kết nối, thử lại khi tải thống kê hoặc nộp kết quả và cảnh báo khi trình duyệt không lưu được tiến độ.
- Backend kiểm tra bộ của lớp, từ chối payload null/không hợp lệ với 400 và tính lại điểm theo rubric tương ứng.
- Thống kê bằng chứng dùng khóa `caseId:checkId` để không gộp các kiểm tra trùng tên giữa hồ sơ.

## Kiểm chứng ngày 04/10/2026

- `npm test` sau khi gộp: 28 kiểm tra .NET, 12 kiểm tra frontend, 1 integration HTTP gồm nhiều bước cho bộ đầy đủ và bộ cũ. Kiểm tra lượt không kết thúc ở câu 4, khôi phục câu 8, tổng 800 điểm và từ chối kết quả thiếu/trùng hồ sơ.
- `npm run build`: frontend và backend production build thành công, bundle tại `.artifacts/publish`; ảnh được đóng gói cùng ứng dụng.
- Đã chơi hết bộ Nâng cao trên trình duyệt: 388/400, đọc đủ bằng chứng trong ngân sách, thử hết giờ khi dialog còn mở, khôi phục lượt và xem lại đúng thứ tự.
- Đã tạo lớp Nâng cao qua UI, tải lại phiên giáo viên, tham gia và nộp lượt 213/400; bảng xếp hạng và thống kê khớp server. Một phán quyết sai với tự tin 100% được trừ 20 điểm tự tin, tổng hồ sơ chặn ở 0.
- Kiểm tra giao diện desktop và mobile 320px; ảnh tải được, bảng bằng chứng cuộn đúng, không tràn ngang ở màn đã kiểm tra.
- Không ghi nhận lỗi console trong tab chơi trong lượt kiểm tra.

Dữ liệu lớp vẫn lưu trong RAM, hết hạn sau 8 giờ và mất khi khởi động lại backend. Đây là giới hạn MVP hiện tại.

## Gộp thành một bộ

Màn đầu và tạo lớp đã bỏ lựa chọn hai bộ. Lượt mới dùng `complete` với đủ 8 ID, thang điểm 800; các chỉ số thành phần và danh hiệu tăng theo số hồ sơ. Dashboard lớp hiển thị phân bố cả 8 câu. Lượt và lớp cũ 4 câu vẫn có thể tiếp tục với thang 400 để không mất tiến độ; giao diện giáo viên thông báo tạo lớp mới để dùng đủ 8 câu.

Đã kiểm tra bộ gộp trên UI: tạo lớp, chơi đủ 8 câu, câu 4 chuyển sang câu 5, tải lại và tiếp tục đúng câu 5, nộp kết quả 128/800 cho lượt cố ý chọn cùng một phán quyết, dashboard có đủ 8 hồ sơ và khớp 128/800. Không ghi nhận lỗi console. Build frontend/backend production và 41 kiểm tra tự động đạt.
