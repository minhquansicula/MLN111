# TRUTH RUSH — Kế hoạch gameplay và triển khai

Ngày lập: 03/10/2026. Cập nhật triển khai: 04/10/2026.
Nguồn: TRUTH_RUSH_REQUIREMENTS_UI_UX.md, đối chiếu với mã VIRAL hiện tại.
Kế hoạch này đã được triển khai cho MVP: solo 4 case, scoring, save/resume, timer, classroom API, dashboard, leaderboard, test và production build.

## 1. Mục tiêu và phạm vi

Một người nhập tên và bắt đầu ngay, tự hoàn thành 4 case trong khoảng 12–15 phút. Mỗi case yêu cầu chọn bằng chứng dưới ngân sách giới hạn, đưa ra nhận định và quyết định cách ứng xử với thông tin.

MVP bắt buộc: Solo, 4 case, điểm điều tra, sổ bằng chứng, initial/final verdict, confidence, responsible action, reveal, chấm điểm, tổng kết, xem lại case, localStorage và responsive 320px.

Classroom là giai đoạn tiếp theo: mã lớp, gửi bài đã hoàn tất, dashboard, thống kê trước/sau và leaderboard phụ. Không có lobby hoặc số người tối thiểu. Chưa làm combo, editor, database hoặc tài khoản.

## 2. Chuyển đổi từ VIRAL

| Hạng mục | VIRAL hiện tại | TRUTH RUSH |
|---|---|---|
| Trận | Một scenario, cả phòng cùng phase | Bốn case, mỗi người có tiến độ riêng |
| Khởi đầu | Host tạo phòng và Start | Người chơi nhập tên và Start |
| Vai trò | User, Fact Checker, Manipulator | Mọi người có cùng công cụ điều tra |
| Điều tra | Nhận một thẻ rồi chia sẻ | Tự mua các check bằng 3/3/3/4 điểm |
| Trao đổi | Chat và bảng bằng chứng chung | Evidence Notebook riêng |
| Quyết định | Initial/Final Vote | Initial/Final Verdict, Confidence, Responsible Action |
| Kết quả | Kết luận của lớp và bên thắng | Điểm cá nhân, phản hồi từng quyết định |
| Đồng bộ | SignalR và timer server | State frontend + localStorage; API lớp học tùy chọn |

Có thể tái sử dụng React/Vite, router, icon, font tiếng Việt và cách trình bày bài đăng. Cần xây lại game engine, mô hình dữ liệu, scoring và bố cục theo từng bước. Backend ASP.NET hiện tại có thể làm nền cho API classroom sau này; Room/GameHub/state machine tập thể không thuộc engine mới.

## 3. Luồng một case

1. Đọc bài đăng với tác giả, thời gian, nguồn và lượt tương tác.
2. Chọn Initial Opinion một lần; lưu ngay và sang Investigation. Chưa báo đúng/sai.
3. Nhận ngân sách điều tra, chọn Check Source/Author/Comments/Statistics/Date/Image/Other News hoặc Read Original theo case.
4. Mỗi check trừ điểm đúng một lần; không mua khi thiếu điểm. Read Original tốn 2, các check khác mặc định 1.
5. Mở Evidence Sheet 2–5 dòng; sau khi đóng, giữ bằng chứng trong Notebook. Đọc lại check đã mua không mất điểm.
6. Người chơi chủ động Finish Checking, kể cả còn điểm; hết điểm vẫn được xem Notebook trước khi sang bước tiếp.
7. Chọn Final Verdict, thấy lại Initial Opinion; có thể quay lại bước quyết định trước khi khóa nhưng không mua thêm check sau khi đã kết thúc điều tra.
8. Chọn Confidence 50/60/70/80/90/100 bằng nút lớn.
9. Chọn Share/Report/Add Context/Wait For More Evidence. Đây là lựa chọn mô phỏng trong game, không gửi bài ra mạng xã hội.
10. Nút khóa cuối cùng lưu cả ba lựa chọn, tính điểm đúng một lần, tạo suspense 0,5–1 giây, rồi reveal.
11. Hiện đáp án, điểm, lý do ngắn, hành động khuyến nghị, bằng chứng quan trọng bỏ lỡ và bài học.
12. Bấm Next Case; sau case 4 sang Result và có Review Cases/Play Again.

State machine cá nhân: Tutorial → InitialOpinion → Investigation → FinalVerdict → Confidence → ResponsibleAction → Locked → Reveal → NextCase/Result.

## 4. Bộ case đề xuất

Tất cả nội dung dưới đây là tình huống hư cấu; cần hoàn thiện post, bằng chứng, rubric và explanation trước khi đưa vào game.

| Case | Nội dung đề xuất | Điểm | Kết luận và hành động tốt nhất |
|---|---|---:|---|
| 1 — Clickbait/nguồn yếu | Bài giả mạo thông báo “chia sẻ bài là được nhận học bổng”; nguồn chính thức xác nhận không có chương trình đó | 3 | FALSE / REPORT |
| 2 — Thống kê | “Trượt môn tăng 300%: chất lượng đào tạo lao dốc”; số thật là 1 → 4 trong phạm vi nhỏ, không đủ cho kết luận bao quát | 3 | MISLEADING / ADD_CONTEXT |
| 3 — Bối cảnh | Ảnh chụp bị cắt nói môn X cho dùng AI trong bài tập số 2; email đầy đủ, ngày hiện tại và chính sách xác nhận đúng phạm vi ấy | 3 | TRUE / SHARE |
| 4 — Khủng hoảng | Tin nền tảng học tập rò rỉ dữ liệu, ảnh thiếu ngày và trích dẫn ẩn danh; chưa có bằng chứng xác thực hoặc bác bỏ đủ mạnh | 4 | NOT_ENOUGH_EVIDENCE / WAIT_FOR_MORE_EVIDENCE |

Case 3 chủ động cho một thông tin đúng để người chơi không học rằng bài viral hoặc ảnh chụp đều sai. Case 1 cần bằng chứng bác bỏ cụ thể; nguồn yếu tự nó không đủ để kết luận FALSE. Case 4 cần kết thúc với sự bất định có lý do, không mặc định chuyển thành FALSE.

Mỗi case có ít nhất 5 lựa chọn check, tổng chi phí lớn hơn ngân sách; phải có ít nhất một đường điều tra đủ tốt trong ngân sách. Hành động hợp lý khác được định nghĩa riêng theo tình huống, không suy ra máy móc từ verdict.

## 5. Scoring cần chốt

| Thành phần | Quy tắc đề xuất |
|---|---|
| Accuracy | Final đúng +40, sai 0 |
| Investigation | Cộng giá trị các check đã mua, giới hạn 25; giá trị đặt riêng theo mức liên quan của từng case |
| Responsibility | Hành động tốt nhất +20, hợp lý +10, không phù hợp 0; dùng rubric riêng mỗi case |
| Confidence đúng | 50/60/70/80/90/100 → 0/2/4/6/8/10 |
| Confidence sai | 50/60/70/80/90/100 → -3/-5/-7/-10/-15/-20 |
| Adaptability | Initial sai và Final đúng +5; các trường hợp khác 0 |

Điểm case = clamp(tổng 5 thành phần, 0, 100); tổng run = tổng 4 case, tối đa 400. Giữ breakdown thô để giải thích khoản confidence âm ngay cả khi tổng đã được chặn ở 0.

Không thêm bonus cho initial đúng hoặc combo vào MVP, vì sẽ vượt khung 100. Theo công thức requirement, người đúng từ đầu không nhận adaptability nên tối đa 95; người sửa nhận định thành đúng có thể đạt 100. Nếu muốn mọi người đều có thể đạt 100 cần điều chỉnh rubric sau khi thử nghiệm.

Không hiển thị giá trị điểm của check hoặc nhãn “đúng/sai” trong lúc điều tra. Feedback về chất lượng bằng chứng và check đáng giá nhất xuất hiện sau khi khóa.

Skill breakdown phải ghi rõ đơn vị: Accuracy /160, Investigation /100, Responsibility /80, Confidence có thể âm, Adaptability /20. Nếu đổi sang phần trăm, phải định nghĩa cách chuẩn hóa, không dùng các con số không rõ mẫu số.

## 6. Thời gian

12–15 phút là mục tiêu pacing, không phải yêu cầu mọi người cùng kết thúc.

- Tutorial khoảng 20–30 giây.
- Case 1 khoảng 2–2,5 phút; case 2–3 khoảng 2,5–3 phút/case.
- Case 4 khoảng 3,5–4 phút, gồm điều tra, lựa chọn và phản hồi.
- Result khoảng 1–2 phút.

Cases 1–3 dùng soft timer: cảnh báo khi quá thời gian khuyến nghị, vẫn cho hoàn thành. Nếu bật timer 90 giây ở case 4, áp dụng riêng cho Investigation; hết giờ đóng việc mua check và đưa sang Final Verdict, vẫn cho đọc Notebook. Không tự chọn verdict, confidence hoặc action thay người chơi.

Lưu deadline tuyệt đối để reload không cộng lại thời gian. Timer paused hay continued khi tab ẩn cần nhất quán: đề xuất tiếp tục nếu bật chế độ timed, và thông báo rõ trước case 4.

## 7. UI/UX

- Đổi brand sang TRUTH RUSH; dark/neutral news style, một màu accent, font có hỗ trợ tiếng Việt.
- Home: tên, mã lớp nếu classroom đã có, Start; tutorial 3 thẻ ngắn.
- Mỗi màn hình có một quyết định chính; không dồn post, check, vote và score thành dashboard.
- Sticky header cho case x/4, bước hiện tại, thời gian và điểm điều tra ở bước có liên quan.
- Investigation: tóm tắt post, check có giá, Evidence Sheet, Notebook và Finish Checking.
- Final Verdict → Confidence → Responsible Action là các bước riêng, với review trước khóa.
- Reveal ngắn gọn, highlight bằng chứng bỏ lỡ; Result có điểm tổng, breakdown, initial/final đúng và số lần cải thiện.
- Body mobile khoảng 16px, touch target ít nhất 44px, hỗ trợ bàn phím, focus management, reduced motion; không dùng màu đơn độc để truyền đạt.

## 8. Kiến trúc và lưu tiến độ

Frontend độc lập gồm pages, components, data/cases, game reducer, scoring, storageService và apiService tùy chọn. Routes chính: /, /play, /result; dashboard lớp ở /teacher và /teacher/session/:code.

Save gồm schemaVersion, runId, playerName, classCode nếu có, currentCaseIndex, step, initial/final verdict, confidence, action, points, usedChecks, unlockedEvidence, deadline, lockedResult và completedCases. Lưu ngay sau mỗi hành động được chấp nhận; validate khi load, hỗ trợ resume và xử lý phiên bản dữ liệu cũ. Nếu localStorage không khả dụng, game tiếp tục trong RAM và báo rõ không thể lưu.

Không dùng bộ đếm interval làm nguồn thời gian, không tính lại ngẫu nhiên evidence khi reload, không cộng score thêm sau refresh ở Reveal. Kết quả khóa phải giữ nguyên và có runId để tránh gửi trùng.

Đáp án trong static JS có thể xem bằng devtools. MVP đảm bảo không lộ trong UI trước khi khóa; không coi điểm local là dữ liệu chống gian lận.

## 9. Classroom sau khi Solo ổn định

API: Create Session, Join, Submit Results, Stats và Leaderboard; không cần SignalR. Người chơi join là bắt đầu, không đợi host hoặc các bạn.

Gửi đủ lựa chọn và check đã dùng, backend tự tính điểm từ bộ case chuẩn thay vì tin totalScore từ client. Kết quả có runId và submission idempotent. Cách này giảm sửa điểm trực tiếp nhưng không ngăn người xem trước đáp án của bản solo.

Gửi lỗi thì giữ kết quả trong localStorage và có trạng thái chờ gửi/retry. Mã lớp không hợp lệ phải báo rõ để sửa hoặc chọn Solo. Thống kê dùng người đã hoàn tất run, ghi rõ mẫu số, và hiển thị riêng mỗi case. Dashboard có thể polling khoảng 10–15 giây.

Leaderboard ưu tiên accuracy, investigation, responsibility, confidence rồi mới speed; không cộng speed vào khung 400. Số lượng 1, 5, 18, 35 hoặc khác không làm thay đổi luật gameplay.

## 10. Thứ tự triển khai và nghiệm thu

| Mốc | Công việc | Nghiệm thu |
|---|---|---|
| 1 | Chốt 4 case, evidence và scoring rubric | Mỗi case có verdict được bằng chứng hỗ trợ, có đường điều tra phù hợp ngân sách |
| 2 | Game engine + một case hoàn chỉnh | Một người chơi từ Home tới Reveal mà không cần backend |
| 3 | Tích hợp đủ 4 case và scoring | Run hoàn chỉnh, các thành phần điểm và tổng đúng |
| 4 | Save/resume và timer | Reload ở mọi bước giữ đúng điểm, evidence và lựa chọn; không reset timer hoặc cộng điểm lại |
| 5 | UI mobile, Review Cases, Play Again | Chơi tốt từ 320px, keyboard, không lộ đáp án sớm trong UI |
| 6 | Thử nghiệm nội dung và pacing | Người mới hiểu check/cost, hoàn thành khoảng 12–15 phút, biết vì sao quyết định đúng/sai |
| 7 | Classroom API + dashboard nếu triển khai | Người chơi độc lập, gửi kết quả một lần, thống kê theo người hoàn tất |

Kiểm thử trọng tâm: thiếu điểm, check lặp, check trừ điểm đúng một lần, khóa kết quả, confidence âm, clamp điểm, adaptability, đáp án TRUE/FALSE/MISLEADING/NOT_ENOUGH_EVIDENCE, reload mọi bước, hết giờ case 4, save bị lỗi và submission trùng/offline.

Ước lượng cho một người: Solo khoảng 5–8 ngày làm việc; Classroom thêm 2–3 ngày. Đây là ước lượng planning, phụ thuộc độ hoàn thiện nội dung và kết quả thử nghiệm người dùng.

Mốc ưu tiên: hoàn thành một case Solo có chọn check → final verdict → confidence → action → reveal trước, sau đó mở rộng lên bốn case.
