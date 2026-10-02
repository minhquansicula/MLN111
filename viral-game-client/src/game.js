export const VERDICTS = [
  {
    key: "True",
    label: "Đúng",
    english: "TRUE",
    description: "Thông tin chính xác, có bằng chứng.",
    color: "green",
  },
  {
    key: "False",
    label: "Sai",
    english: "FALSE",
    description: "Thông tin trái với bằng chứng.",
    color: "red",
  },
  {
    key: "Misleading",
    label: "Gây hiểu lầm",
    english: "MISLEADING",
    description: "Có phần đúng nhưng thiếu bối cảnh.",
    color: "amber",
  },
  {
    key: "NotEnoughEvidence",
    label: "Chưa đủ bằng chứng",
    english: "NOT ENOUGH EVIDENCE",
    description: "Chưa thể đưa ra kết luận đáng tin cậy.",
    color: "blue",
  },
];
export const PHASES = [
  "RoleReveal",
  "BreakingNews",
  "InitialVote",
  "Investigation",
  "Discussion",
  "FinalVote",
  "Reveal",
  "Result",
];
export const PHASE_LABELS = {
  Lobby: "Phòng chờ",
  RoleReveal: "Nhận vai trò",
  BreakingNews: "Tin đang lan truyền",
  InitialVote: "Nhận định ban đầu",
  Investigation: "Điều tra",
  Discussion: "Thảo luận",
  FinalVote: "Kết luận cuối cùng",
  Reveal: "Sự thật được hé lộ",
  Result: "Báo cáo lớp học",
  Finished: "Trận đã kết thúc",
};
export const ROLES = {
  User: {
    name: "Người tìm sự thật",
    english: "USER",
    description: "Đọc kỹ. Đặt câu hỏi. Đưa ra kết luận dựa trên bằng chứng.",
    color: "green",
  },
  FactChecker: {
    name: "Người kiểm chứng",
    english: "FACT CHECKER",
    description:
      "Bạn có 2 lượt kiểm chứng nguồn tin. Chọn những bằng chứng cần làm rõ nhất.",
    color: "blue",
  },
  Manipulator: {
    name: "Người thao túng",
    english: "MANIPULATOR",
    description:
      "Bạn có 2 lượt đẩy bằng chứng công khai lên xu hướng. Không thể sửa nội dung thẻ.",
    color: "purple",
  },
};
export const verdictLabel = (value) =>
  VERDICTS.find((v) => v.key === value)?.label ?? "Không bỏ phiếu";
export const phaseAllowsEvidence = (phase) =>
  ["Investigation", "Discussion"].includes(phase);
export function secondsRemaining(deadline, now) {
  return deadline
    ? Math.max(0, Math.ceil((Date.parse(deadline) - now) / 1000))
    : 0;
}
export function formatTime(seconds) {
  return (
    String(Math.floor(seconds / 60)).padStart(2, "0") +
    ":" +
    String(seconds % 60).padStart(2, "0")
  );
}
export function friendlyError(error) {
  return (error?.message || "Không thể kết nối máy chủ. Vui lòng thử lại.")
    .replace(/^.*HubException:\s*/, "")
    .replace(
      /^An unexpected error occurred invoking.*$/,
      "Không thể thực hiện thao tác. Vui lòng thử lại.",
    );
}
