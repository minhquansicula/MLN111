# TRUTH RUSH

Game web cá nhân về kiểm chứng thông tin, tư duy phản biện và chia sẻ có trách nhiệm. Người chơi điều tra 8 bài đăng viral trong một lượt, dùng số điểm kiểm tra có hạn, đưa ra phán quyết với độ tự tin và nhận phản hồi theo từng quyết định.

Ứng dụng dùng React/Vite và ASP.NET Core 9. Chế độ solo chạy ngay trong trình duyệt; chế độ lớp học thêm mã lớp, thống kê và bảng xếp hạng. Không cần tài khoản hay database.

## Chạy local

Yêu cầu Node.js 20+ và .NET SDK 9.

```powershell
npm run setup
npm run dev
```

Mở [http://localhost:5173](http://localhost:5173). Frontend chạy ở cổng 5173 và chuyển tiếp `/api` sang backend ở cổng 5001.

## Luồng chơi

1. Nhập tên, chọn solo hoặc nhập mã lớp.
2. Đọc bài đăng và ghi lại nhận định ban đầu.
3. Dùng Investigation Points để mở những bằng chứng quan trọng.
4. Chọn phán quyết cuối, độ tự tin và hành động có trách nhiệm.
5. Xem lời giải, điểm chi tiết và bằng chứng mạnh đã bỏ lỡ.
6. Hoàn thành đủ 8 hồ sơ để nhận kết quả trên thang 800 điểm.

Tiến độ được lưu trong `localStorage`, nên tải lại trang không làm mất lượt chơi.

Ngân hàng có **một bộ đầy đủ gồm 8 hồ sơ**, mỗi lượt chơi xuyên suốt trên thang 800 điểm:

- 4 hồ sơ ban đầu để làm quen với cách kiểm chứng.
- Tiếp nối bằng 4 hồ sơ nâng cao: diễn giải nghiên cứu AI, ảnh đúng nhưng sai bối cảnh, chính sách xe miễn phí có ngoại lệ và đoạn ghi âm thiếu nguồn gốc. Có 24 lựa chọn điều tra mới, bảng dữ liệu, nguồn đối chiếu và bằng chứng mâu thuẫn.

Ba hồ sơ đầu trong mỗi chặng được xáo thứ tự và lưu cùng tiến độ; hồ sơ khủng hoảng ở vị trí 4 và 8 có giới hạn điều tra lần lượt 90 và 120 giây. Lượt chơi tiếp tục sau câu 4 và chỉ tổng kết khi hết câu 8. Thời lượng dự kiến 24–30 phút. Có thể đọc lại bằng chứng đã mở mà không mất thêm điểm, kể cả sau khi hết thời gian. Màn xem lại mở toàn bộ bằng chứng sau khi hoàn thành.

Mỗi hồ sơ có hình minh họa và chú thích. Ảnh sân trường do AI tạo; các đồ họa còn lại được dựng bằng SVG. Mọi nội dung đều được đánh dấu mô phỏng. Xem [ghi chú nội dung](TRUTH_RUSH_CONTENT.md) và [nguồn gốc ảnh](viral-game-client/public/images/truth-rush/README.md).

## Chế độ lớp học

Mở `/teacher` hoặc chọn **Tôi là giáo viên** trên trang đầu, sau đó tạo mã gồm 6 ký tự. Học sinh nhập mã này và chơi theo tốc độ riêng, không có phòng chờ.

Lớp tạo mới tự động dùng bộ đầy đủ 8 hồ sơ. Sau mỗi câu đã chấm, game gửi quyết định lên backend để cập nhật bảng xếp hạng; tải lại và tiếp tục cũng gửi lại tiến độ đã lưu. Nếu mất mạng, game giữ điểm trên máy và tự thử gửi lại mỗi 5 giây hoặc khi mạng trở lại. Bài nộp cuối vẫn phải có đủ 8 hồ sơ khác nhau. Phiên giáo viên được giữ trong `sessionStorage` để tải lại cùng tab vẫn mở được dashboard. Lượt chơi và lớp cũ gồm 4 hồ sơ vẫn được hỗ trợ để tiếp tục; tạo lượt/lớp mới để chơi đủ 8.

Dashboard cập nhật:

- số người tham gia và hoàn thành;
- điểm, độ chính xác, điều tra và trách nhiệm trung bình;
- phân bố ý kiến trước và sau điều tra;
- bảng xếp hạng của toàn bộ người đã hoàn thành ít nhất một câu, kèm tiến độ và trạng thái đang chơi/hoàn thành; tự làm mới mỗi 2 giây. Thứ hạng ưu tiên độ chính xác, chất lượng điều tra, trách nhiệm, độ tự tin rồi mới đến tốc độ. Đây là thứ hạng tạm thời khi lớp còn đang chơi; người đã làm nhiều câu có thể đứng cao hơn. Nếu mọi tiêu chí bằng nhau, tên rồi ID người chơi quyết định thứ tự ổn định.

Các điểm trung bình và phân bố ý kiến chỉ tính bài đã nộp đủ bộ. Tiến độ gửi trùng hoặc đến muộn không cộng thêm điểm, không lùi số câu đã làm và không sửa câu trả lời đã ghi nhận.

Điểm lớp được backend tính lại từ quyết định gốc. Server kiểm tra case, phán quyết, hành động, độ tự tin, danh sách bằng chứng và ngân sách Investigation Points; client không thể tự gửi tổng điểm.

API:

| Method | Endpoint | Công dụng |
|---|---|---|
| POST | `/api/class-sessions` | Tạo phiên đủ 8 hồ sơ và teacher token; không cần body hoặc dùng `{ "packId": "complete" }` |
| GET | `/api/class-sessions/{code}` | Xem trạng thái công khai |
| POST | `/api/class-sessions/{code}/join` | Tham gia lớp |
| POST | `/api/class-sessions/{code}/results` | Nộp quyết định để server chấm |
| PUT | `/api/class-sessions/{code}/progress` | Gửi các câu đã chấm cùng participant token và run ID để cập nhật thứ hạng tạm thời |
| GET | `/api/class-sessions/{code}/stats` | Thống kê lớp |
| GET | `/api/class-sessions/{code}/leaderboard` | Bảng xếp hạng |

`stats` và `leaderboard` yêu cầu header `X-Session-Token`. Giáo viên xem được ngay; học sinh chỉ xem được sau khi hoàn thành.

## Chấm điểm

Mỗi case tối đa 100 điểm:

| Thành phần | Điểm |
|---|---:|
| Phán quyết chính xác | 40 |
| Chất lượng bằng chứng | tối đa 25 |
| Hành động có trách nhiệm | 20 hoặc 10 |
| Độ tự tin đã hiệu chỉnh | -20 đến +10 |
| Đổi từ nhận định sai sang đúng | 5 |

Tổng case được chặn trong khoảng 0–100.

## Build và chạy production

```powershell
npm run build
npm start
```

Bundle được tạo tại `.artifacts/publish`. Mở [http://localhost:5001](http://localhost:5001) hoặc địa chỉ LAN của máy chủ.

Dữ liệu lớp học nằm trong RAM và hết hạn sau 8 giờ. Chạy một backend instance cho bản MVP này.

## Kiểm thử

```powershell
npm test
```

Bộ test gồm:

- quy tắc tính điểm Truth Rush và giới hạn điểm điều tra;
- vòng đời tạo lớp, tham gia, nộp kết quả, phân quyền thống kê và leaderboard;
- các kiểm tra frontend cho điểm, timer và nhãn;
- kiểm tra 8 hồ sơ, ngân sách, lưu tiến độ hỏng và chuyển đổi dữ liệu lưu cũ;
- integration HTTP thật cho bộ đầy đủ và bộ cũ, chấm điểm đồng nhất client/server, từ chối lượt thiếu/trùng hồ sơ và payload không hợp lệ.

Bộ regression SignalR của game cũ vẫn được giữ riêng và có thể chạy bằng:

```powershell
cd viral-game-client
npm run test:legacy
```

## Cấu trúc chính

```text
ViralGame.Server/
  TruthRush/
    TruthRushEndpoints.cs
    TruthRushClassService.cs
    TruthRushScoringService.cs
    TruthRushRubrics.cs
    TruthRushModels.cs
viral-game-client/
  src/truth-rush/
    TruthRushApp.jsx
    cases.js
    advancedCases.js
    PostMedia.jsx
    gameEngine.js
    api.js
    theme.css
  tests/truth-rush.test.mjs
ViralGame.Tests/Program.cs
```

Các tình huống và nguồn trong game là dữ liệu hư cấu phục vụ học tập.
