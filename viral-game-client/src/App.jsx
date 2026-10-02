import { useEffect, useRef, useState, useId } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Radio,
  ShieldCheck,
  Search,
  Users,
  Clock3,
  Copy,
  Check,
  LockKeyhole,
  MessageCircle,
  Send,
  Flame,
  Eye,
  ChevronRight,
  X,
  Wifi,
  WifiOff,
  BookOpen,
  Zap,
  Monitor,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Fingerprint,
  Heart,
  Repeat2,
  CircleHelp,
  Play,
  ExternalLink,
  Target,
  ArrowDown,
  Layers,
  RotateCcw,
} from "lucide-react";
import { useGame } from "./game-context";
import {
  VERDICTS,
  PHASES,
  PHASE_LABELS,
  ROLES,
  verdictLabel,
  phaseAllowsEvidence,
  secondsRemaining,
  formatTime,
} from "./game";

function Brand({ compact = false }) {
  return (
    <div className="brand">
      <span className="brand-icon">
        <Radio size={21} />
      </span>
      <strong>
        VIRAL<span className="brand-dot">.</span>
      </strong>
      {!compact && <span className="brand-tag">TRUTH UNDER PRESSURE</span>}
    </div>
  );
}
function Tag({ children, tone = "" }) {
  return <span className={"tag " + tone}>{children}</span>;
}
function Empty({ icon: Icon = Search, title, children }) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon size={25} />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
function CopyButton({ value, label = "Sao chép" }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Sao chép nội dung này:", value);
    }
  };
  return (
    <button className="button ghost small" onClick={copy}>
      {copied ? <Check size={15} /> : <Copy size={15} />}{" "}
      {copied ? "Đã chép" : label}
    </button>
  );
}
function ConnectionStatus() {
  const { status } = useGame();
  return (
    <span className={"connection " + (status === "connected" ? "online" : "")}>
      <span className="status-dot" />
      {status === "connected"
        ? "Đã kết nối"
        : status === "replaced"
          ? "Phiên đã chuyển tab"
          : status === "offline"
            ? "Chờ máy chủ"
            : "Đang kết nối…"}
    </span>
  );
}
function Timer({ room }) {
  const { offset } = useGame();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);
  const remaining = secondsRemaining(room.phaseEndsAt, now + offset);
  return (
    <div
      className={"timer " + (remaining <= 10 ? "urgent" : "")}
      aria-label={"Còn " + remaining + " giây"}
    >
      <Clock3 size={18} />
      <span>{formatTime(remaining)}</span>
    </div>
  );
}
function TopBar({ room, isHost }) {
  const { status } = useGame();
  return (
    <>
      <header className="topbar">
        <Brand />
        {room ? (
          <div className="topbar-right">
            <span className="room-mini">
              PHÒNG <b>{room.code}</b>
            </span>
            {isHost && (
              <Tag>
                <Monitor size={12} /> HOST
              </Tag>
            )}
            <ConnectionStatus />
          </div>
        ) : (
          <div className="topbar-right">
            <span className="header-note">Một tin đồn. Nhiều góc nhìn.</span>
            <ConnectionStatus />
          </div>
        )}
      </header>
      {room && status !== "connected" && (
        <div className="connection-banner" role="status">
          <WifiOff size={17} /> Đang khôi phục kết nối. Trận vẫn tiếp tục; dữ
          liệu sẽ tự đồng bộ.
        </div>
      )}
    </>
  );
}
function HomePage() {
  const { enter, busy, status, replaced } = useGame();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [code, setCode] = useState(
    new URLSearchParams(location.search).get("room") || "",
  );
  const ready = status === "connected" && !busy;
  const join = async (event) => {
    event.preventDefault();
    const response = await enter(
      "JoinRoom",
      code.trim().toUpperCase(),
      name.trim(),
    );
    if (response) navigate("/lobby/" + response.roomCode);
  };
  const create = async () => {
    const response = await enter("CreateRoom");
    if (response) navigate("/host/" + response.roomCode);
  };
  return (
    <>
      <TopBar />
      <main className="home">
        <section className="hero">
          <div className="eyebrow">
            <span className="live-dot" /> SOCIAL DEDUCTION × CRITICAL THINKING
          </div>
          <h1>
            Sự thật không
            <br />
            phải lúc nào cũng
            <br />
            <span>được số đông tin.</span>
          </h1>
          <p className="hero-description">
            Một thông tin đang lan truyền. Một lớp học, những mảnh bằng chứng khác
            nhau. Bạn sẽ tin điều gì khi áp lực bắt đầu?
          </p>
          <div className="hero-facts">
            <span>
              <Users size={17} /> 3 - 35 người chơi
            </span>
            <span>
              <Clock3 size={17} /> 15 phút
            </span>
            <span>
              <Monitor size={17} /> Mọi thiết bị
            </span>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="visual-grid" />
            <div className="orbit-label">
              <Radio size={14} /> ĐANG LAN TRUYỀN
            </div>
            <div className="fake-post">
              <div className="fake-author">
                <span className="avatar dark">DS</span>
                <div>
                  <b>Daily Student News</b>
                  <small>Vừa xong · Tin được đề xuất</small>
                </div>
                <span>•••</span>
              </div>
              <h3>“AI khiến trí nhớ sinh viên giảm 40%.”</h3>
              <div className="fake-metrics">
                <span>
                  <Heart size={14} />
                  16,4K
                </span>
                <span>
                  <MessageCircle size={14} />
                  4,2K
                </span>
                <span>
                  <Repeat2 size={14} />
                  8,3K
                </span>
              </div>
            </div>
            <div className="floating-proof">
              <ShieldCheck size={24} />
              <div>
                <b>Đừng dừng ở tiêu đề.</b>
                <span>Bằng chứng nói điều gì?</span>
              </div>
            </div>
            <span className="visual-caption">
              TÌNH HUỐNG MÔ PHỎNG · KHÔNG PHẢI TIN THẬT
            </span>
          </div>
        </section>
        <aside className="entry-column">
          <div className="entry-card">
            <div className="entry-icon">
              <ArrowUpRight size={24} />
            </div>
            <p className="eyebrow muted">BẮT ĐẦU TỪ MỘT CÂU HỎI</p>
            <h2>Bạn có mặt trong phòng?</h2>
            <p>Nhập mã từ host để tham gia cuộc điều tra.</p>
            {replaced && (
              <div className="notice">
                Phiên trước đã được mở ở tab khác. Bạn có thể tham gia bằng tên
                mới.
              </div>
            )}
            <form onSubmit={join}>
              <label htmlFor="name">Tên hiển thị</label>
              <input
                id="name"
                autoComplete="nickname"
                placeholder="Mọi người gọi bạn là gì?"
                maxLength={24}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <label htmlFor="room">
                Mã phòng <span>4 ký tự</span>
              </label>
              <input
                id="room"
                className="code-input"
                autoComplete="off"
                placeholder="A7X9"
                maxLength={4}
                minLength={4}
                pattern="[A-Za-z2-9]{4}"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
              />
              <button
                className="button primary full"
                type="submit"
                disabled={!ready || !name.trim() || code.length !== 4}
              >
                {busy === "JoinRoom" ? "Đang tham gia…" : "Vào phòng"}
                <ArrowRight size={19} />
              </button>
            </form>
            <div className="entry-foot">
              <LockKeyhole size={13} /> Không tài khoản. Không cài đặt.
            </div>
          </div>
          <button className="host-entry" onClick={create} disabled={!ready}>
            <span className="host-entry-icon">
              <Monitor size={22} />
            </span>
            <span>
              <b>Bạn là người dẫn trò?</b>
              <small>
                {busy === "CreateRoom"
                  ? "Đang tạo phòng…"
                  : "Tạo phòng và mời cả lớp tham gia"}
              </small>
            </span>
            <ArrowUpRight size={21} />
          </button>
          <div className="principle">
            <span>01 / NGUYÊN TẮC CỐT LÕI</span>
            <p>
              Bằng chứng <b>hơn</b> số đông.
              <br />
              Kiểm chứng <b>hơn</b> tự tin.
            </p>
          </div>
        </aside>
        <section className="how-it-works">
          <div className="section-kicker">CÁCH CUỘC CHƠI DIỄN RA</div>
          {[
            {
              icon: Eye,
              title: "Đọc giữa những dòng tin",
              text: "Nhận vai trò bí mật và mảnh bằng chứng của riêng bạn.",
            },
            {
              icon: MessageCircle,
              title: "Đặt niềm tin dưới thử thách",
              text: "Kiểm chứng, chia sẻ và đối chiếu các góc nhìn trong lớp.",
            },
            {
              icon: Target,
              title: "Chọn điều đáng để tin",
              text: "Đưa ra kết luận. Khám phá điều đã thay đổi suy nghĩ của bạn.",
            },
          ].map((item, i) => (
            <div className="how-step" key={item.title}>
              <span className="step-no">0{i + 1}</span>
              <item.icon size={22} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </section>
      </main>
      <footer>
        <Brand compact />
        <span>Đánh giá thông tin. Hiểu bối cảnh. Tự đưa ra kết luận.</span>
        <span>CLASSROOM EDITION / 01</span>
      </footer>
    </>
  );
}
function Roster({ room }) {
  return (
    <div className="roster">
      {room.players.map((p, i) => (
        <div
          className={"roster-person " + (!p.isConnected ? "disconnected" : "")}
          key={p.id}
        >
          <span className={"avatar tone-" + (i % 5)}>
            {p.name.slice(0, 2).toUpperCase()}
          </span>
          <span>{p.name}</span>
          <span className={"tiny-dot " + (p.isConnected ? "on" : "")} />
        </div>
      ))}
    </div>
  );
}
function LobbyPage({ snapshot }) {
  const { room, isHost, player } = snapshot;
  const { act, leave, busy, status } = useGame();
  const navigate = useNavigate();
  const connected = room.players.filter((p) => p.isConnected).length;
  const canStart =
    room.players.length >= room.minimumPlayers &&
    connected === room.players.length;
  return (
    <>
      <TopBar room={room} isHost={isHost} />
      <main className="lobby page-width">
        <div className="page-heading">
          <div>
            <div className="eyebrow muted">TRƯỚC KHI TIN TỨC LAN TRUYỀN</div>
            <h1>Chờ đủ những góc nhìn.</h1>
            <p>
              {isHost
                ? "Chia sẻ mã phòng với cả lớp. Bạn chỉ cần bấm bắt đầu một lần."
                : "Chào " +
                  player.name +
                  ". Vai trò của bạn sẽ được tiết lộ khi trận bắt đầu."}
            </p>
          </div>
          <Tag tone="green">
            <span className="status-dot" /> PHÒNG ĐANG MỞ
          </Tag>
        </div>
        <div className="lobby-grid">
          <section className="panel roster-panel">
            <div className="panel-heading">
              <h2>
                <Users size={20} /> Những người tham gia
              </h2>
              <span className="count">
                {room.players.length}
                <span> / {room.maximumPlayers}</span>
              </span>
            </div>
            {room.players.length ? (
              <Roster room={room} />
            ) : (
              <Empty
                icon={Users}
                title="Căn phòng đang chờ những người đầu tiên"
              >
                Mời người chơi mở đường dẫn và nhập mã phòng.
              </Empty>
            )}
            <div className="panel-bottom">
              <span>
                <span className="tiny-dot on" /> {connected} đang kết nối
              </span>
              <span>Host không chiếm vị trí người chơi</span>
            </div>
          </section>
          <aside>
            <div className="room-ticket">
              <span className="eyebrow">MÃ PHÒNG CỦA BẠN</span>
              <div className="big-code">{room.code}</div>
              <CopyButton value={room.code} label="Sao chép mã" />
              <div className="ticket-divider" />
              <p>
                Mở cùng địa chỉ này trên thiết bị của bạn, rồi nhập mã phòng.
              </p>
              <CopyButton
                value={location.origin + "/?room=" + room.code}
                label="Sao chép liên kết mời"
              />
            </div>
            {isHost ? (
              <>
                <button
                  className="button primary full start-button"
                  disabled={!canStart || !!busy || status !== "connected"}
                  onClick={() => act("StartGame")}
                >
                  <Play size={18} />
                  {busy === "StartGame" ? "Đang bắt đầu…" : "Bắt đầu cuộc chơi"}
                </button>
                <p className="helper centered">
                  {canStart
                    ? "Mọi thứ đã sẵn sàng. Trận sẽ tự động chạy."
                    : "Cần tối thiểu " +
                      room.minimumPlayers +
                      " người chơi và tất cả đang kết nối."}
                </p>
              </>
            ) : (
              <div className="waiting">
                <span className="pulse-dot" />
                {room.hostConnected
                  ? "Đang chờ host bắt đầu…"
                  : "Host đang kết nối lại…"}
              </div>
            )}
            <div className="info-note">
              <ShieldCheck size={19} />
              <p>
                Giữ kín vai trò. Lắng nghe bằng chứng. Bạn có thể thay đổi nhận
                định ở lần bỏ phiếu cuối.
              </p>
            </div>
          </aside>
        </div>
        <button
          className="button ghost"
          onClick={async () => {
            if (await leave()) navigate("/");
          }}
          disabled={!!busy}
        >
          <LogOut size={16} />
          {isHost ? "Đóng phòng và quay lại" : "Rời phòng"}
        </button>
      </main>
    </>
  );
}
function PhaseHeader({ room }) {
  const current = PHASES.indexOf(room.phase);
  return (
    <div className="phase-header">
      <div className="phase-line">
        {PHASES.map((p, i) => (
          <div
            key={p}
            title={PHASE_LABELS[p]}
            className={
              i < current || room.phase === "Finished"
                ? "complete"
                : i === current
                  ? "current"
                  : ""
            }
          />
        ))}
      </div>
      <div className="phase-title">
        <div>
          <div className="eyebrow muted">
            {current >= 0
              ? "GIAI ĐOẠN " + String(current + 1).padStart(2, "0") + " / 08"
              : "CUỘC ĐIỀU TRA ĐÃ KHÉP LẠI"}
          </div>
          <h1>{PHASE_LABELS[room.phase]}</h1>
        </div>
        {room.phaseEndsAt && <Timer room={room} />}
      </div>
    </div>
  );
}
function RoleCard({ player, large = false }) {
  const role = ROLES[player.role];
  const Icon =
    player.role === "FactChecker"
      ? ShieldCheck
      : player.role === "Manipulator"
        ? Fingerprint
        : Search;
  return (
    <div className={"role-card " + role.color + (large ? " large" : "")}>
      <div className="role-card-top">
        <Tag>
          <LockKeyhole size={12} /> CHỈ BẠN THẤY
        </Tag>
        <Icon size={large ? 44 : 25} />
      </div>
      <div className="eyebrow">{role.english}</div>
      <h2>{role.name}</h2>
      <p>{role.description}</p>
      {player.role === "Manipulator" && (
        <div className="role-target">
          <Target size={17} /> Mục tiêu: hướng lớp chọn{" "}
          <b>{verdictLabel(player.manipulatorTarget)}</b>
        </div>
      )}
      {player.role !== "User" && (
        <div className="token-row">
          {[0, 1].map((i) => (
            <span
              key={i}
              className={
                i <
                (player.role === "FactChecker"
                  ? player.verifyTokens
                  : player.boostTokens)
                  ? "token active"
                  : "token"
              }
            >
              <Zap size={13} />
            </span>
          ))}
          <span>
            {player.role === "FactChecker"
              ? player.verifyTokens + " lượt kiểm chứng"
              : player.boostTokens + " lượt đẩy xu hướng"}
          </span>
        </div>
      )}
    </div>
  );
}
function NewsCard({ scenario, compact = false }) {
  return (
    <article className={"news-card " + (compact ? "compact" : "")}>
      <div className="news-kicker">
        <Radio size={15} /> BREAKING / THÔNG TIN ĐANG LAN TRUYỀN
      </div>
      <div className="news-body">
        <div className="fake-author">
          <span className="avatar dark">DS</span>
          <div>
            <b>{scenario.author}</b>
            <small>Bài đăng công khai · Được đề xuất cho bạn</small>
          </div>
          <Tag>TIN NỔI BẬT</Tag>
        </div>
        <h2>{scenario.title}</h2>
        <p>{scenario.postContent}</p>
        <div className="fake-metrics">
          <span>
            <Heart size={16} />
            {scenario.likeCount.toLocaleString("vi-VN")}
          </span>
          <span>
            <MessageCircle size={16} />
            {scenario.commentCount.toLocaleString("vi-VN")}
          </span>
          <span>
            <Repeat2 size={16} />
            {scenario.shareCount.toLocaleString("vi-VN")}
          </span>
        </div>
      </div>
      <div className="fiction-note">
        <CircleHelp size={14} /> Tình huống mô phỏng để học tập. Các số liệu
        không phải nghiên cứu thực tế.
      </div>
    </article>
  );
}
function VoteStats({ summary, title, correct }) {
  return (
    <section className="vote-stats">
      <div className="panel-heading">
        <h3>{title}</h3>
        <Tag>
          {summary.cast}/{summary.total} phiếu
        </Tag>
      </div>
      {VERDICTS.map((v) => (
        <div className={"stat-line " + v.color} key={v.key}>
          <div>
            <span>
              {v.label}
              {correct === v.key && <Check size={14} />}
            </span>
            <b>
              {summary.percentages[v.key]}
              <small>%</small>
            </b>
          </div>
          <div className="bar-track">
            <div style={{ width: summary.percentages[v.key] + "%" }} />
          </div>
        </div>
      ))}
      <p className="helper">
        {summary.noVote} không bỏ phiếu · Tỷ lệ trên tổng {summary.total} người
        chơi.
      </p>
    </section>
  );
}
function VotePanel({ room, player }) {
  const { act, busy, status } = useGame();
  const [selection, setSelection] = useState(null);
  const final = room.phase === "FinalVote";
  const locked = final ? player.finalVote : player.initialVote;
  useEffect(() => setSelection(null), [room.phase]);
  return (
    <section className="panel vote-panel">
      <div className="eyebrow muted">
        {final ? "SAU KHI ĐỐI CHIẾU BẰNG CHỨNG" : "TRƯỚC KHI XEM BẰNG CHỨNG"}
      </div>
      <h2>
        {final ? "Kết luận của bạn là gì?" : "Bạn nghĩ thông tin này thế nào?"}
      </h2>
      <p className="subtext">
        {final
          ? "Cân nhắc nguồn tin và bối cảnh. Đây là lựa chọn cuối cùng của bạn."
          : "Chọn nhận định ban đầu. Bạn sẽ có một lần bỏ phiếu mới sau khi điều tra."}
      </p>
      <div className="vote-options">
        {VERDICTS.map((v, i) => (
          <button
            key={v.key}
            className={
              "vote-option " +
              ((locked || selection) === v.key ? "selected " : "") +
              (locked ? "locked" : "")
            }
            disabled={!!locked || !!busy || status !== "connected"}
            onClick={() => setSelection(v.key)}
          >
            <span className="option-letter">{String.fromCharCode(65 + i)}</span>
            <span>
              <b>{v.label}</b>
              <small>{v.description}</small>
            </span>
            {(locked || selection) === v.key && <CheckCircle2 size={19} />}
          </button>
        ))}
      </div>
      {locked ? (
        <div className="vote-locked">
          <LockKeyhole size={17} /> Phiếu đã khóa: <b>{verdictLabel(locked)}</b>
        </div>
      ) : (
        <button
          className="button primary full"
          disabled={!selection || !!busy || status !== "connected"}
          onClick={() =>
            act(final ? "SubmitFinalVote" : "SubmitInitialVote", selection)
          }
        >
          <LockKeyhole size={17} />
          {busy ? "Đang gửi…" : "Xác nhận và khóa phiếu"}
        </button>
      )}
      <p className="helper centered">
        {room.voteProgress}/{room.players.length} đã gửi · Hết giờ, trận tự
        chuyển tiếp.
      </p>
    </section>
  );
}
function EvidenceCard({ evidence, player, phase, own = false }) {
  const { act, busy, status } = useGame();
  const active = phaseAllowsEvidence(phase) && status === "connected" && !busy;
  const sharedByMe = evidence.sharedBy.includes(player?.name);
  return (
    <article
      className={"evidence-card " + (evidence.isBoosted ? "boosted" : "")}
    >
      <div className="evidence-top">
        <span className="evidence-id">
          {evidence.id} <span>/ {evidence.type.toUpperCase()}</span>
        </span>
        <div className="evidence-badges">
          {evidence.isBoosted && (
            <Tag tone="amber">
              <Flame size={12} /> XU HƯỚNG
            </Tag>
          )}
          {evidence.isVerified && (
            <Tag tone="blue">
              <ShieldCheck size={12} /> ĐÃ KIỂM CHỨNG
            </Tag>
          )}
        </div>
      </div>
      <h3>{evidence.title}</h3>
      <p>{evidence.content}</p>
      <div className="evidence-source">
        <BookOpen size={15} />
        <span>
          Nguồn: <b>{evidence.source}</b>
        </span>
      </div>
      {evidence.isVerified && (
        <div className="verification">
          <ShieldCheck size={17} />
          <div>
            <b>Kết quả kiểm chứng</b>
            <p>{evidence.verificationResult}</p>
          </div>
        </div>
      )}
      {!!evidence.sharedBy.length && (
        <div className="shared-by">
          Chia sẻ bởi {evidence.sharedBy.join(", ")}
        </div>
      )}
      {player && (
        <div className="evidence-actions">
          {own && (
            <button
              className="button small"
              disabled={!active || sharedByMe}
              onClick={() => act("ShareEvidence", evidence.id)}
            >
              {sharedByMe ? <Check size={14} /> : <ArrowUpRight size={14} />}{" "}
              {sharedByMe ? "Đã chia sẻ" : "Chia sẻ công khai"}
            </button>
          )}
          {player.role === "FactChecker" && (
            <button
              className="button small blue-button"
              disabled={
                !active ||
                evidence.isVerified ||
                !evidence.canVerify ||
                player.verifyTokens <= 0
              }
              onClick={() => act("VerifyEvidence", evidence.id)}
            >
              <ShieldCheck size={14} /> Kiểm chứng
            </button>
          )}
          {player.role === "Manipulator" && evidence.isShared && (
            <button
              className="button small boost-button"
              disabled={
                !active ||
                phase !== "Discussion" ||
                evidence.isBoosted ||
                player.boostTokens <= 0
              }
              onClick={() => act("BoostEvidence", evidence.id)}
            >
              <Flame size={14} /> Đẩy xu hướng
            </button>
          )}
        </div>
      )}
    </article>
  );
}
function EvidenceBoard({ room, player }) {
  return (
    <section className="evidence-board">
      <div className="section-heading">
        <div>
          <h2>Bằng chứng công khai</h2>
          <p>Đọc nội dung, xem nguồn và đặt trong bối cảnh.</p>
        </div>
        <span className="round-count">{room.publicEvidence.length}</span>
      </div>
      {room.publicEvidence.length ? (
        <div className="evidence-list">
          {room.publicEvidence.map((e) => (
            <EvidenceCard
              key={e.id}
              evidence={e}
              player={player}
              phase={room.phase}
            />
          ))}
        </div>
      ) : (
        <div className="panel">
          <Empty icon={Layers} title="Chưa có bằng chứng được chia sẻ">
            Mỗi người đang giữ một mảnh thông tin. Cuộc điều tra bắt đầu khi
            chúng được kết nối.
          </Empty>
        </div>
      )}
    </section>
  );
}
function ChatBox({ room, player }) {
  const { act, busy, status } = useGame();
  const [text, setText] = useState("");
  const [cooldown, setCooldown] = useState(false);
  const bottom = useRef(null);
  const chatId = useId();
  const timer = useRef(null);
  useEffect(() => {
    if (bottom.current) bottom.current.scrollTop = bottom.current.scrollHeight;
  }, [room.messages.length]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const canChat = room.phase === "Discussion" && !!player;
  const submit = async (e) => {
    e.preventDefault();
    if (await act("SendMessage", text)) {
      setText("");
      setCooldown(true);
      timer.current = setTimeout(() => setCooldown(false), 3000);
    }
  };
  return (
    <section className="panel chat-panel">
      <div className="panel-heading">
        <h2>
          <MessageCircle size={19} /> Thảo luận chung
        </h2>
        <Tag>{room.messages.length}</Tag>
      </div>
      <div className="chat-messages" aria-live="polite" ref={bottom}>
        {room.messages.length ? (
          room.messages.map((m) => (
            <div
              className={
                "chat-message " + (m.playerId === player?.id ? "mine" : "")
              }
              key={m.id}
            >
              <div>
                <b>{m.playerName}</b>
                <time>
                  {new Date(m.sentAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <p>{m.content}</p>
            </div>
          ))
        ) : (
          <Empty
            icon={MessageCircle}
            title={
              room.phase === "Investigation"
                ? "Dành một chút thời gian để đọc"
                : "Bắt đầu bằng một câu hỏi"
            }
          >
            {room.phase === "Investigation"
              ? "Chat sẽ mở ở giai đoạn Thảo luận."
              : "Bằng chứng nào khiến bạn suy nghĩ lại?"}
          </Empty>
        )}
      </div>
      {player ? (
        <form className="chat-form" onSubmit={submit}>
          <label className="sr-only" htmlFor={chatId}>
            Tin nhắn thảo luận
          </label>
          <div>
            <input
              id={chatId}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                canChat
                  ? "Bạn tìm thấy điều gì?"
                  : "Chat chưa mở hoặc đã kết thúc"
              }
              maxLength={200}
              disabled={!canChat || status !== "connected"}
            />
            <button
              className="icon-button"
              aria-label="Gửi tin nhắn"
              disabled={
                !canChat ||
                !text.trim() ||
                cooldown ||
                !!busy ||
                status !== "connected"
              }
            >
              <Send size={18} />
            </button>
          </div>
          <span>
            {cooldown
              ? "Chờ 3 giây trước tin nhắn tiếp theo"
              : "Tôn trọng nhau. Đối chiếu bằng chứng."}
          </span>
          <span>{text.length}/200</span>
        </form>
      ) : (
        <div className="panel-bottom">
          Host quan sát cuộc thảo luận của cả lớp.
        </div>
      )}
    </section>
  );
}
function Results({ room }) {
  const result = room.result;
  const { leave, busy } = useGame();
  const navigate = useNavigate();
  if (!result)
    return (
      <section className="panel">
        <Empty icon={AlertTriangle} title="Trận đã được dừng">
          Host đã kết thúc sớm cuộc chơi. Kết quả của trận này không được tính.
        </Empty>
        <button
          className="button primary"
          onClick={async () => {
            if (await leave()) navigate("/");
          }}
        >
          Quay về trang chủ <ArrowRight size={17} />
        </button>
      </section>
    );
  const winner =
    result.winner === "Truth"
      ? "Sự thật đã thuyết phục được lớp."
      : result.winner === "Manipulator"
        ? "Áp lực đã dẫn dắt lựa chọn."
        : "Chưa bên nào giành chiến thắng.";
  return (
    <div className="results">
      <div className="results-intro">
        <Tag tone="green">
          <CheckCircle2 size={13} /> CUỘC ĐIỀU TRA HOÀN TẤT
        </Tag>
        <h2>
          Điều gì đã thay đổi
          <br />
          cách chúng ta nghĩ?
        </h2>
        <p>
          Nhìn lại hành trình từ ấn tượng đầu tiên đến kết luận có bằng chứng.
        </p>
      </div>
      <div className="results-comparison">
        <div className="panel">
          <VoteStats summary={result.initial} title="01 / Nhận định ban đầu" />
        </div>
        <div className="panel">
          <VoteStats summary={result.final} title="02 / Kết luận cuối cùng" />
        </div>
      </div>
      <section className="truth-panel">
        <div>
          <span className="eyebrow">03 / KẾT LUẬN ĐÚNG</span>
          <h2>{verdictLabel(result.correctVerdict)}</h2>
          <Tag>{result.correctVerdict.toUpperCase()}</Tag>
        </div>
        <div>
          <h3>Vì sao?</h3>
          <p>{result.explanation}</p>
          <small>
            Đây là tình huống giả định dùng để thực hành tư duy phản biện.
          </small>
        </div>
      </section>
      <section className="winner-panel">
        <Target size={30} />
        <div>
          <span className="eyebrow">
            04 /{" "}
            {result.winner === "Draw"
              ? "HÒA"
              : result.winner === "Truth"
                ? "PHE SỰ THẬT THẮNG"
                : "PHE THAO TÚNG THẮNG"}
          </span>
          <h3>{winner}</h3>
          <p>
            {result.classVerdict
              ? "Lựa chọn có nhiều phiếu nhất: " +
                verdictLabel(result.classVerdict)
              : "Không có lựa chọn dẫn đầu duy nhất."}
          </p>
        </div>
      </section>
      <section className="role-reveals">
        {["Manipulator", "FactChecker"].map((role) => (
          <div className="panel" key={role}>
            <div className="panel-heading">
              <h3>
                {role === "Manipulator" ? (
                  <Fingerprint size={19} />
                ) : (
                  <ShieldCheck size={19} />
                )}{" "}
                {ROLES[role].name}
              </h3>
              <Tag>
                {result.roles.filter((p) => p.role === role).length} người
              </Tag>
            </div>
            <div className="name-chips">
              {result.roles
                .filter((p) => p.role === role)
                .map((p) => (
                  <span key={p.playerId}>{p.name}</span>
                ))}
            </div>
          </div>
        ))}
      </section>
      <div className="manipulation-note">
        <Flame size={22} />
        <div>
          <b>Những bằng chứng đã được đẩy xu hướng</b>
          <p>
            {result.boostedEvidenceIds.length
              ? result.boostedEvidenceIds.join(", ") +
                " đã được làm nổi bật một cách có chủ ý. Vị trí hiển thị không chứng minh độ chính xác."
              : "Không có bằng chứng nào được đẩy xu hướng trong trận này."}
          </p>
        </div>
      </div>
      <div className="metrics-grid">
        {[
          ["Đúng lúc đầu", result.initialCorrectPercent + "%"],
          ["Đúng lúc cuối", result.finalCorrectPercent + "%"],
          ["Đổi nhận định", result.changedOpinion],
          ["Thẻ được chia sẻ", result.totalEvidenceShared],
          ["Thẻ đã kiểm chứng", result.verifiedEvidenceShared],
          ["Thẻ lên xu hướng", result.boostedEvidence],
          [
            "Bỏ phiếu đầu / cuối",
            result.initial.noVote + " / " + result.final.noVote,
          ],
        ].map(([label, value], i) => (
          <div className="metric" key={label}>
            <span>{i === 6 ? "Không " + label.toLowerCase() : label}</span>
            <b>{value}</b>
          </div>
        ))}
      </div>
      <div className="debrief">
        <BookOpen size={25} />
        <h3>Mang câu hỏi này ra khỏi cuộc chơi.</h3>
        <p>
          Nguồn gốc ở đâu? Con số đo điều gì? Bối cảnh nào đang bị bỏ qua?
          <br />
          Bạn thay đổi nhận định vì bằng chứng, hay vì nhiều người cùng tin?
        </p>
      </div>
      {room.phase === "Finished" ? (
        <button
          className="button primary"
          disabled={!!busy}
          onClick={async () => {
            if (await leave()) navigate("/");
          }}
        >
          <RotateCcw size={17} /> Trở về và bắt đầu cuộc chơi mới
        </button>
      ) : (
        <p className="helper centered">
          Màn hình kết quả sẽ tự chuyển sang kết thúc khi hết giờ.
        </p>
      )}
    </div>
  );
}
function HostControls({ room }) {
  const { act, busy, status } = useGame();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="host-controls">
      <span>
        <Monitor size={17} /> MÀN HÌNH HOST{" "}
        <span className="host-auto">· Trận đang tự động chạy</span>
      </span>
      {room.phase !== "Finished" && (
        <button
          className="button ghost small danger"
          onClick={() => setConfirm(true)}
        >
          Dừng khẩn cấp
        </button>
      )}
      {confirm && (
        <div className="modal-backdrop">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="end-title"
          >
            <AlertTriangle size={30} />
            <h2 id="end-title">Dừng trận ngay bây giờ?</h2>
            <p>
              Trận sẽ kết thúc với tất cả người chơi. Kết quả chưa hoàn tất sẽ
              không được tính.
            </p>
            <div>
              <button className="button" onClick={() => setConfirm(false)}>
                Tiếp tục chơi
              </button>
              <button
                className="button danger-fill"
                disabled={!!busy || status !== "connected"}
                onClick={async () => {
                  if (await act("EndGame")) setConfirm(false);
                }}
              >
                Dừng trận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function GamePage({ snapshot }) {
  const { room, player, isHost } = snapshot;
  const [tab, setTab] = useState("evidence");
  const investigating = ["Investigation", "Discussion", "FinalVote"].includes(
    room.phase,
  );
  const voting = ["InitialVote", "FinalVote"].includes(room.phase);
  const results = ["Reveal", "Result", "Finished"].includes(room.phase);
  return (
    <>
      <TopBar room={room} isHost={isHost} />
      <main className={"page-width game-page " + (isHost ? "host-view" : "")}>
        {isHost && <HostControls room={room} />}
        <PhaseHeader room={room} />
        {results ? (
          <Results room={room} />
        ) : room.phase === "RoleReveal" ? (
          <div className="role-reveal-stage">
            {player ? (
              <>
                <RoleCard player={player} large />
                <div className="role-reminder">
                  <LockKeyhole size={18} />
                  <p>
                    Vai trò này chỉ dành cho bạn.
                    <br />
                    Đừng để người ngồi cạnh nhìn thấy màn hình.
                  </p>
                </div>
              </>
            ) : (
              <div className="panel host-stage">
                <Fingerprint size={52} />
                <h2>
                  Mỗi người một vai trò.
                  <br />
                  Cả lớp một cuộc điều tra.
                </h2>
                <p>
                  Người chơi đang nhận vai trò bí mật. Bản tin sẽ tự xuất hiện
                  khi hết giờ.
                </p>
                <div className="host-player-count">
                  {room.players.filter((p) => p.isConnected).length}
                  <span> / {room.players.length} đang kết nối</span>
                </div>
              </div>
            )}
          </div>
        ) : room.phase === "BreakingNews" ? (
          <div className="breaking-stage">
            <NewsCard scenario={room.scenario} />
            <div className="reading-note">
              <Eye size={21} />
              <p>
                Đọc kỹ bài đăng. Bạn sẽ đưa ra nhận định ban đầu ngay sau đây.
                <br />
                <b>Đừng để lượng tương tác thay bạn suy nghĩ.</b>
              </p>
            </div>
          </div>
        ) : (
          <div className="game-columns">
            <div className="game-main">
              {voting &&
                (player ? (
                  <VotePanel room={room} player={player} />
                ) : (
                  <div className="panel host-vote">
                    <div className="eyebrow muted">ĐANG NHẬN PHIẾU</div>
                    <h2>Mỗi người tự đưa ra lựa chọn.</h2>
                    <div className="host-player-count">
                      {room.voteProgress}
                      <span> / {room.players.length} đã bỏ phiếu</span>
                    </div>
                    <div className="bar-track">
                      <div
                        style={{
                          width:
                            (room.voteProgress / room.players.length) * 100 +
                            "%",
                        }}
                      />
                    </div>
                    <p>Kết quả sẽ hiện sau khi đóng lượt bỏ phiếu.</p>
                  </div>
                ))}
              {room.phase === "InitialVote" && (
                <NewsCard scenario={room.scenario} compact />
              )}
              {investigating && (
                <>
                  <div className="mobile-tabs">
                    <button
                      className={tab === "evidence" ? "active" : ""}
                      onClick={() => setTab("evidence")}
                    >
                      <Layers size={16} /> Bằng chứng
                    </button>
                    <button
                      className={tab === "chat" ? "active" : ""}
                      onClick={() => setTab("chat")}
                    >
                      <MessageCircle size={16} /> Thảo luận{" "}
                      <span>{room.messages.length}</span>
                    </button>
                  </div>
                  <div className={tab !== "evidence" ? "mobile-hidden" : ""}>
                    {player?.privateEvidence && (
                      <section className="private-section">
                        <div className="section-heading">
                          <h2>
                            <LockKeyhole size={17} /> Mảnh ghép của bạn
                          </h2>
                          <Tag>RIÊNG TƯ</Tag>
                        </div>
                        <EvidenceCard
                          evidence={player.privateEvidence}
                          player={player}
                          phase={room.phase}
                          own
                        />
                      </section>
                    )}
                    <EvidenceBoard room={room} player={player} />
                  </div>
                  <div
                    className={
                      "mobile-chat " + (tab !== "chat" ? "mobile-hidden" : "")
                    }
                  >
                    <ChatBox room={room} player={player} />
                  </div>
                </>
              )}
            </div>
            <aside className="game-sidebar">
              {player && <RoleCard player={player} />}
              <div className="sidebar-connected">
                <Users size={16} />
                <b>
                  {room.players.filter((p) => p.isConnected).length}/
                  {room.players.length}
                </b>{" "}
                đang kết nối
              </div>
              {room.initialVoteResult && (
                <div className="panel">
                  <VoteStats
                    summary={room.initialVoteResult}
                    title="Ấn tượng đầu tiên"
                  />
                  <div className="stats-footnote">
                    Đây là ý kiến của lớp, chưa phải đáp án.
                  </div>
                </div>
              )}
              {investigating && (
                <div className="desktop-chat">
                  <ChatBox room={room} player={player} />
                </div>
              )}
              {investigating && (
                <details className="scenario-details">
                  <summary>
                    <BookOpen size={15} /> Đọc lại bản tin{" "}
                    <ChevronRight size={16} />
                  </summary>
                  <NewsCard scenario={room.scenario} compact />
                </details>
              )}
            </aside>
          </div>
        )}
      </main>
      <div className="game-footer">
        <ShieldCheck size={14} /> Bằng chứng hơn số đông. Bối cảnh hơn tiêu đề.
      </div>
    </>
  );
}
export default function App() {
  const { snapshot, error, setError, status } = useGame();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (snapshot) {
      const path = snapshot.isHost
        ? "/host/" + snapshot.room.code
        : "/" +
          (snapshot.room.phase === "Lobby" ? "lobby" : "game") +
          "/" +
          snapshot.room.code;
      if (location.pathname !== path) navigate(path, { replace: true });
    } else if (status === "connected" && location.pathname !== "/")
      navigate("/", { replace: true });
  }, [
    snapshot?.room.code,
    snapshot?.room.phase,
    snapshot?.isHost,
    status,
    location.pathname,
  ]);
  return (
    <>
      {snapshot ? (
        snapshot.room.phase === "Lobby" ? (
          <LobbyPage snapshot={snapshot} />
        ) : (
          <GamePage snapshot={snapshot} />
        )
      ) : (
        <HomePage />
      )}
      {error && (
        <div className="toast" role="alert">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button
            className="icon-button"
            aria-label="Đóng thông báo"
            onClick={() => setError("")}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </>
  );
}
