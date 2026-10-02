# VIRAL: Truth Under Pressure

Trò chơi lớp học bằng tiếng Việt về thông tin sai lệch và tư duy phản biện. 35 người chơi + 1 host; React/Vite + ASP.NET Core/SignalR; dữ liệu nằm trong RAM. Mỗi trận chạy tự động trong 15 phút.

## Chạy nhanh

Môi trường đã kiểm chứng: Node.js 24 và .NET SDK 9. Không cần database.

Tại thư mục gốc:

~~~powershell
npm run setup
npm run dev
~~~

Mở **http://localhost:5173**. Bấm tạo phòng trên tab host, rồi mở 3 tab khác để tham gia bằng 3 tên. Các tab dùng phiên riêng và không ghi đè nhau. Nhấn Start để chạy trận.

- Development: tối thiểu 3 người; tại 3 người có đủ 3 vai trò.
- Chạy thử đủ lớp: **npm run dev -- --classroom** (yêu cầu 35 người).
- Frontend: cổng 5173; backend: cổng 5001. Vite chuyển tiếp SignalR sang backend.
- Ctrl+C trong cửa sổ chạy sẽ dừng cả hai server.

Để mở trên điện thoại cùng Wi-Fi, dùng địa chỉ IPv4 của máy chạy game, ví dụ http://192.168.x.x:5173. Không dùng localhost trên điện thoại. Mạng phải cho phép các thiết bị kết nối tới máy host và cổng tương ứng. Trên mạng nội bộ nên mở trang host bằng cùng địa chỉ LAN trước khi sao chép link mời.

## Bản đóng gói cho lớp học

~~~powershell
npm run build
npm start
~~~

Mở **http://localhost:5001** hoặc địa chỉ LAN của máy. Bản build chứa frontend, font và backend trong **.artifacts/publish**; chỉ cần ASP.NET Core Runtime 9 để chạy bản đã đóng gói. Production luôn yêu cầu đủ 35 người, dùng đúng thời lượng 15 phút. Chỉ chạy **một instance** vì không có database/distributed state.

Có thể chuyển thư mục publish sang máy chủ có runtime phù hợp. Khi triển khai Internet, đặt phía sau HTTPS reverse proxy có hỗ trợ WebSocket và không scale nhiều instance. Repository chưa cấu hình một nhà cung cấp hosting cụ thể.

## Luồng chơi

| Giai đoạn | Thời lượng | Hành động |
|---|---:|---|
| Nhận vai trò | 30 giây | Mỗi người chỉ thấy vai trò riêng |
| Tin đang lan truyền | 45 giây | Đọc cùng một bài đăng |
| Nhận định ban đầu | 30 giây | Mỗi người gửi một phiếu không thể sửa |
| Điều tra | 3 phút | Đọc, chia sẻ, kiểm chứng; chat đóng |
| Thảo luận | 6 phút | Chat, chia sẻ, Verify và Boost |
| Kết luận cuối cùng | 30 giây | Một phiếu cuối; các kỹ năng đóng |
| Hé lộ | 2 phút 30 giây | Đáp án, giải thích, vai trò, thao túng |
| Báo cáo | 1 phút 15 giây | Thống kê rồi tự kết thúc |

Host chỉ tạo phòng, bắt đầu, quan sát và dừng khẩn cấp. Sau Start không cần thao tác chuyển giai đoạn.

## Quy tắc đã chốt

- 35 người: 25 User, 5 Fact Checker, 5 Manipulator. Phân vai ngẫu nhiên trên server.
- Fact Checker có 2 Verify, dùng trên thẻ riêng hoặc thẻ công khai. Kết quả thẻ riêng chỉ công khai khi thẻ được chính người đó chia sẻ.
- Manipulator có 2 Boost, chỉ dùng trong Discussion với thẻ công khai chưa boost. Boost không sửa nội dung, không tiết lộ người thực hiện.
- 7 thẻ tình huống được phân phối đều, mỗi người một thẻ. Các bản sao gộp thành một thẻ công khai với danh sách người chia sẻ.
- Không vote được tính riêng là NO_VOTE, không tự đổi thành một verdict. Phần trăm dùng tổng người chơi trong trận làm mẫu số.
- Lựa chọn có số phiếu cao nhất **duy nhất** quyết định kết luận của lớp. Đây là plurality, không bắt buộc vượt 50%. Hòa hoặc không có phiếu: DRAW. Lựa chọn dẫn đầu không khớp mục tiêu bên nào: DRAW.
- Changed Opinion chỉ đếm người có cả hai phiếu và hai lựa chọn khác nhau.
- Chat tối đa 200 ký tự, 3 giây giữa hai tin nhắn. Giữ 200 tin gần nhất.
- Scenario và các số liệu nghiên cứu là **hư cấu để học tập**, đã gắn nhãn trong giao diện.
- Confidence, âm thanh và các tính năng ngoài MVP chưa đưa vào bản này.

## Kết nối lại và lưu trữ

Token ngẫu nhiên được lưu trong **sessionStorage riêng từng tab** để hỗ trợ reload và nhiều người thử trên một trình duyệt. Đây là lựa chọn thay cho localStorage chung giữa các tab. Giữ tab để kết nối lại; đóng hẳn tab có thể làm mất phiên tùy trình duyệt. Vai trò, token kỹ năng, thẻ và phiếu nằm trên server và được khôi phục đúng phiên.

Kết nối mới của cùng phiên thay kết nối cũ. Host cũng reconnect được. Mất kết nối không dừng trận và không bỏ vị trí của người chơi. Restart backend sẽ mất mọi phòng. Phòng kết thúc được dọn sau 1 giờ; lobby không hoạt động được dọn sau 2 giờ.

## Kiểm thử

~~~powershell
npm test
~~~

Bao gồm kiểm thử C# quy tắc kết quả/riêng tư, kiểm thử frontend và trận tích hợp **35 client SignalR thật**. Integration chạy backend riêng trên cổng 5002 với các phase ngắn để giảm thời gian kiểm thử, rồi tự dừng server đó. Cổng 5002 cần trống.

Bộ test kiểm tra phân vai, khóa phòng, vote trùng/sai phase, quyền host, Verify/Boost đồng thời, giới hạn token, chat/cooldown, snapshot không lộ bí mật, reconnect, reveal, thống kê và tự kết thúc.

Xem TEST_REPORT.md để biết kết quả chạy thực tế và phạm vi đã kiểm chứng.

## Cấu trúc

~~~text
ViralGame.Server/
  Hubs/GameHub.cs                  Giao tiếp SignalR
  Models/GameModels.cs             Mô hình và cấu hình
  Data/ScenarioData.cs              Bộ tình huống mô phỏng
  Services/GameService.cs           Luật và hành động người chơi
  Services/GameStateMachine.cs      Timer, chuyển phase, hủy trận
  Services/SnapshotService.cs       Ranh giới dữ liệu công khai/riêng tư
  Services/VoteService.cs           Kết quả và thống kê
  Services/RoomBroadcaster.cs       Snapshot realtime có revision
  Services/RoomCleanupService.cs    Dọn phòng hết hạn
ViralGame.Tests/                    Kiểm thử quy tắc và riêng tư
viral-game-client/src/              React, giao diện responsive, phiên SignalR
viral-game-client/tests/            Kiểm thử frontend và tích hợp 35 client
scripts/                           Setup, chạy, build, test
~~~

## Giao thức realtime

Client gọi CreateRoom, JoinRoom, Reconnect, GetSnapshot, StartGame, SubmitInitialVote, ShareEvidence, VerifyEvidence, BoostEvidence, SendMessage, SubmitFinalVote, EndGame và LeaveRoom.

Server gửi một sự kiện chuẩn hóa **Snapshot** gồm room công khai + player riêng cho đúng kết nối + isHost. Snapshot có revision và thời gian server. Dùng một sự kiện đầy đủ thay cho chuỗi event nhỏ trong requirement để reconnect khôi phục chính xác, tránh mất cập nhật. SessionReplaced thông báo khi phiên đã chuyển sang kết nối mới.

Mọi thao tác thay đổi được khóa theo phòng. Không serialize trực tiếp domain model. Đáp án, thông tin kiểm chứng chưa mở, phiên và vai trò người khác không xuất hiện trong payload trước thời điểm cho phép.
