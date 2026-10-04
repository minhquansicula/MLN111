import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  CalendarDays,
  Check,
  ChevronRight,
  CircleGauge,
  Clock3,
  Eye,
  FileSearch,
  Flag,
  Globe2,
  GraduationCap,
  Image,
  Landmark,
  LockKeyhole,
  Medal,
  MessageCircle,
  Newspaper,
  Play,
  RefreshCcw,
  ScanSearch,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Timer,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { ACTIONS, CASE_BANK, DEFAULT_PACK_ID, VERDICTS, actionLabel, verdictLabel, getCase, getPack } from "./cases";
import { PostMedia } from "./PostMedia";
import { classApi } from "./api";
import {
  clearRun,
  createRun,
  loadRun,
  saveRun,
  scoreCase,
  scoreTotals,
  submissionPayload,
  totalScore,
  purchaseInvestigation,
} from "./gameEngine";
import { Button } from "./Button";
import "./theme.css";

const iconMap = {
  calendar: CalendarDays,
  chart: BarChart3,
  clock: Clock3,
  file: FileSearch,
  fingerprint: ScanSearch,
  flag: Flag,
  globe: Globe2,
  image: Image,
  landmark: Landmark,
  message: MessageCircle,
  messages: MessageCircle,
  newspaper: Newspaper,
  scan: ScanSearch,
  send: Send,
  user: UserRound,
  users: Users,
};

function Brand({ compact = false }) {
  return (
    <div className={`tr-brand ${compact ? "is-compact" : ""}`}>
      <span className="tr-brand-mark"><ShieldCheck size={compact ? 19 : 25} /></span>
      <span>TRUTH <b>RUSH</b></span>
    </div>
  );
}

function Pill({ children, tone = "default" }) {
  return <span className={`tr-pill is-${tone}`}>{children}</span>;
}

function ErrorBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="tr-alert is-error" role="alert">
      <span>{message}</span>
      {onClose && <button aria-label="Đóng thông báo" onClick={onClose}><X size={18} /></button>}
    </div>
  );
}

function HomeScreen({ savedRun, onStart, onResume, onTeacher }) {
  const [name, setName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    const cleanName = name.trim();
    const code = classCode.trim().toUpperCase();
    if (!cleanName) return setError("Hãy nhập tên hoặc biệt danh của bạn.");
    setBusy(true);
    setError("");
    try {
      if (code) {
        const joined = await classApi.join(code, cleanName);
        onStart({ name: cleanName, classCode: joined.code, participantToken: joined.participantToken }, joined.packId);
      } else {
        onStart({ name: cleanName, classCode: null, participantToken: null }, DEFAULT_PACK_ID);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="tr-home">
      <div className="tr-home-glow" />
      <section className="tr-home-copy">
        <Brand />
        <Pill tone="live"><span className="tr-live-dot" /> 8 hồ sơ · một hành trình kiểm chứng</Pill>
        <h1>Bạn có tin điều<br /><em>đang lan truyền?</em></h1>
        <p>Điều tra những bài đăng gây sốt, chọn bằng chứng đáng giá và đưa ra phán quyết trước khi nhấn chia sẻ.</p>
        <div className="tr-home-stats">
          <span><b>{CASE_BANK.length}</b> vụ việc</span>
          <span><b>24–30</b> phút</span>
          <span><b>{CASE_BANK.length * 100}</b> điểm</span>
        </div>
      </section>

      <section className="tr-start-card">
        <div className="tr-card-kicker"><BrainCircuit size={18} /> Bắt đầu điều tra</div>
        <h2>Danh tính điều tra viên</h2>
        <p>Không cần tài khoản. Mã lớp chỉ dùng khi giáo viên đã tạo phiên.</p>
        <form onSubmit={submit}>
          <p className="tr-field-hint">Chơi trọn 8 hồ sơ, từ làm quen đến kiểm chứng nâng cao.</p>
          <label>
            Tên của bạn
            <input className="tr-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder="Ví dụ: Minh Anh" autoComplete="nickname" />
          </label>
          <label>
            Mã lớp <span>không bắt buộc</span>
            <input className="tr-input tr-code-input" value={classCode} onChange={(e) => setClassCode(e.target.value.toUpperCase())} maxLength={6} placeholder="ABC123" autoCapitalize="characters" />
          </label>
          <ErrorBanner message={error} onClose={() => setError("")} />
          <Button type="submit" isLoading={busy} className="tr-btn-wide">
            {classCode.trim() ? "VÀO LỚP & BẮT ĐẦU" : "BẮT ĐẦU CHƠI SOLO"} <ChevronRight size={19} />
          </Button>
        </form>
        {savedRun && (
          <button className="tr-resume" onClick={onResume}>
            <Play size={17} fill="currentColor" />
            <span>Tiếp tục lượt của <b>{savedRun.player.name}</b></span>
            <ChevronRight size={18} />
          </button>
        )}
        <button className="tr-text-button" onClick={onTeacher}><GraduationCap size={17} /> Tôi là giáo viên</button>
      </section>
    </main>
  );
}

function Tutorial({ onStart, packId }) {
  const steps = [
    [Eye, "Đọc phản xạ đầu tiên", "Chọn phán quyết ban đầu trước khi xem bằng chứng."],
    [FileSearch, "Điều tra có giới hạn", "Dùng điểm điều tra cho những kiểm tra bạn thấy quan trọng."],
    [ShieldCheck, "Quyết định có trách nhiệm", "Kết luận, chọn độ tự tin và hành động tiếp theo."],
  ];
  return (
    <main className="tr-page tr-tutorial">
      <Brand compact />
      <div className="tr-page-intro">
        <Pill tone="info">HỒ SƠ HƯỚNG DẪN · {getPack(packId)?.label}</Pill>
        <h1>Ba bước để không bị cuốn theo đám đông</h1>
        <p>Thay đổi ý kiến sau khi thấy bằng chứng tốt là một kỹ năng, không phải thất bại. Mọi nhân vật, nguồn và hình ảnh ở đây đều là mô phỏng để học tập.</p>
      </div>
      <div className="tr-tutorial-grid">
        {steps.map(([Icon, title, text], index) => (
          <article className="tr-tutorial-card" key={title}>
            <span className="tr-step-number">0{index + 1}</span>
            <Icon size={26} />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <Button onClick={onStart} className="tr-btn-wide">MỞ HỒ SƠ ĐẦU TIÊN <ChevronRight size={19} /></Button>
    </main>
  );
}

function GameHeader({ caseData, caseIndex, caseCount, progress, seconds }) {
  const urgent = seconds !== null && seconds <= 10;
  const warning = seconds !== null && seconds <= 30;
  return (
    <header className="tr-game-header">
      <div className="tr-game-header-inner">
        <Brand compact />
        <div className="tr-header-progress">
          <span>HỒ SƠ {caseIndex + 1} / {caseCount} · {caseData.difficulty}</span>
          <div><i style={{ width: `${((caseIndex + 1) / caseCount) * 100}%` }} /></div>
        </div>
        <div className="tr-header-meters">
          <Pill tone="points"><ScanSearch size={15} /> {progress.remainingPoints} điểm</Pill>
          {caseData.timerSeconds && (
            <Pill tone={urgent ? "danger" : warning ? "warning" : "default"}><Timer size={15} /> {["INITIAL", "INVESTIGATION"].includes(progress.step) ? `${seconds ?? caseData.timerSeconds}s` : "Đã kết thúc điều tra"}</Pill>
          )}
        </div>
      </div>
    </header>
  );
}

function ViralPost({ data, compact = false }) {
  return (
    <article className={`tr-post ${compact ? "is-compact" : ""}`}>
      <div className="tr-post-author">
        <div className="tr-avatar">{data.author.slice(0, 1)}</div>
        <div><b>{data.author}</b><span>{data.handle} · {data.time}</span></div>
        <span className="tr-more">•••</span>
      </div>
      <Pill tone="danger">{data.marker}</Pill>
      <h2>{data.headline}</h2>
      {!compact ? <p>{data.body}</p> : <details className="tr-full-post"><summary>Đọc toàn bộ bài đăng</summary><p>{data.body}</p></details>}
      <PostMedia data={data} />
      {!compact && (
        <div className="tr-engagement">
          <span>♥ {data.likes}</span><span><MessageCircle size={15} /> {data.comments}</span><span><Share2 size={15} /> {data.shares}</span>
        </div>
      )}
    </article>
  );
}

function DecisionLayout({ eyebrow, title, hint, children }) {
  return (
    <section className="tr-decision">
      <div className="tr-decision-heading">
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        {hint && <p>{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function VerdictChoices({ onChoose }) {
  return (
    <div className="tr-choice-grid">
      {VERDICTS.map((item, index) => (
        <button className="tr-choice" onClick={() => onChoose(item.id)} key={item.id}>
          <span>0{index + 1}</span><div><b>{item.label}</b><small>{item.description}</small></div><ChevronRight size={19} />
        </button>
      ))}
    </div>
  );
}

function InitialScreen({ caseData, onChoose }) {
  return (
    <div className="tr-game-layout">
      <ViralPost data={caseData.post} />
      <DecisionLayout eyebrow="PHẢN XẠ ĐẦU TIÊN" title="Bạn nghĩ bài đăng này thế nào?" hint="Chưa có bằng chứng bổ sung. Hãy ghi lại ấn tượng ban đầu.">
        <VerdictChoices onChoose={onChoose} />
      </DecisionLayout>
    </div>
  );
}

function EvidenceSheet({ check, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (check && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
      dialogRef.current.scrollTop = 0;
      dialogRef.current.querySelector("h2")?.focus({ preventScroll: true });
    }
  }, [check]);
  if (!check) return null;
  const Icon = iconMap[check.icon] || FileSearch;
  return (
      <dialog ref={dialogRef} className="tr-evidence-sheet tr-native-dialog" aria-label={check.title} onCancel={(event) => { event.preventDefault(); closeRef.current(); }}>
        <div className="tr-sheet-handle" />
        <div className="tr-sheet-title"><span><Icon size={22} /></span><div><small>KẾT QUẢ KIỂM TRA</small><h2 tabIndex={-1}>{check.title}</h2></div></div>
        <p className="tr-evidence-copy">{check.evidence}</p>
        {check.source && <p className="tr-evidence-source">Nguồn: {check.source} · mô phỏng</p>}
        {check.table && <div className="tr-evidence-table"><table><caption>Số liệu trong tài liệu được kiểm tra</caption><thead><tr>{check.table.columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead><tbody>{check.table.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>}
        <div className="tr-observation"><Sparkles size={18} /><div><b>Điểm cần nhớ</b><p>{check.note}</p></div></div>
        <Button onClick={onClose} className="tr-btn-wide">ĐÓNG BẰNG CHỨNG</Button>
      </dialog>
  );
}

function EvidenceNotebook({ caseData, progress, onOpen }) {
  if (!progress.usedInvestigations.length) return null;
  return <div className="tr-notebook"><b><BookOpenCheck size={18} /> Sổ bằng chứng · {progress.usedInvestigations.length}</b>
    {progress.usedInvestigations.map((id) => {
      const check = caseData.checks.find((item) => item.id === id);
      return <button key={id} onClick={() => onOpen(check)}><Check size={14} /><span>{check.title}</span><small>Đọc lại</small></button>;
    })}
  </div>;
}

function InvestigationScreen({ caseData, progress, onCheck, onFinish, onOpenEvidence }) {
  const used = new Set(progress.usedInvestigations);
  return (
    <>
      <div className="tr-investigation-layout">
        <aside><ViralPost data={caseData.post} compact /></aside>
        <section>
          <div className="tr-decision-heading">
            <span>PHÒNG ĐIỀU TRA</span>
            <h1>Bạn sẽ kiểm tra điều gì?</h1>
            <p>Bạn không đủ điểm để mở mọi thứ. Hãy ưu tiên bằng chứng có khả năng kiểm chứng trực tiếp.</p>
          </div>
          <div className="tr-check-list">
            {caseData.checks.map((check) => {
              const Icon = iconMap[check.icon] || FileSearch;
              const done = used.has(check.id);
              const unaffordable = check.cost > progress.remainingPoints;
              return (
                <button key={check.id} disabled={!done && unaffordable} className={`tr-check ${done ? "is-done" : ""}`} onClick={() => done ? onOpenEvidence(check) : onCheck(check)}>
                  <span className="tr-check-icon">{done ? <Check size={21} /> : <Icon size={21} />}</span>
                  <span><b>{check.label}</b><small>{done ? "Đã lưu bằng chứng" : check.cost === 2 ? "Kiểm tra chuyên sâu" : "Kiểm tra nhanh"}</small></span>
                  <Pill tone={done ? "success" : "points"}>{done ? "XONG" : `−${check.cost}`}</Pill>
                </button>
              );
            })}
          </div>
          <EvidenceNotebook caseData={caseData} progress={progress} onOpen={onOpenEvidence} />
          <Button onClick={onFinish} variant="secondary" className="tr-btn-wide">KẾT THÚC ĐIỀU TRA <ChevronRight size={18} /></Button>
        </section>
      </div>
    </>
  );
}

function FinalVerdictScreen({ progress, onChoose }) {
  return (
    <DecisionLayout eyebrow="PHÁN QUYẾT CUỐI" title="Bằng chứng có thay đổi kết luận của bạn?" hint={<>Ấn tượng ban đầu: <b>{verdictLabel(progress.initialVerdict)}</b></>}>
      <VerdictChoices onChoose={onChoose} />
    </DecisionLayout>
  );
}

function ConfidenceScreen({ onChoose }) {
  return (
    <DecisionLayout eyebrow="HIỆU CHỈNH ĐỘ TIN CẬY" title="Bạn chắc chắn đến mức nào?" hint="Tự tin cao được thưởng nhiều hơn khi đúng, nhưng cũng bị trừ nhiều hơn khi sai.">
      <div className="tr-confidence">
        {[50, 60, 70, 80, 90, 100].map((value) => (
          <button key={value} onClick={() => onChoose(value)}><CircleGauge size={21} /><b>{value}%</b></button>
        ))}
      </div>
    </DecisionLayout>
  );
}

function ActionScreen({ onChoose }) {
  return (
    <DecisionLayout eyebrow="HÀNH ĐỘNG CÓ TRÁCH NHIỆM" title="Bạn sẽ làm gì tiếp theo?" hint="Một phán quyết tốt cần đi cùng hành động phù hợp.">
      <div className="tr-action-grid">
        {ACTIONS.map((item) => {
          const Icon = iconMap[item.icon] || ShieldCheck;
          return <button key={item.id} onClick={() => onChoose(item.id)}><Icon size={25} /><div><b>{item.label}</b><span>{item.description}</span></div><ChevronRight size={18} /></button>;
        })}
      </div>
    </DecisionLayout>
  );
}

function ScoreRows({ score }) {
  const rows = [
    ["Độ chính xác", score.accuracy],
    ["Chất lượng điều tra", score.investigation],
    ["Hành động có trách nhiệm", score.responsibility],
    ["Độ tự tin", score.confidence],
    ["Điều chỉnh nhận định", score.adaptability],
  ];
  return <div className="tr-score-rows">{rows.map(([label, value]) => <div key={label}><span>{label}</span><b className={value < 0 ? "is-negative" : ""}>{value > 0 ? "+" : ""}{value}</b></div>)}</div>;
}

function RevealScreen({ caseData, progress, isLast, onNext }) {
  const correct = progress.finalVerdict === caseData.correctVerdict;
  const missed = caseData.checks.filter((x) => x.strong && !progress.usedInvestigations.includes(x.id));
  return (
    <section className="tr-reveal">
      <div className={`tr-reveal-result ${correct ? "is-correct" : "is-wrong"}`}>
        <span>{correct ? <Check size={28} /> : <X size={28} />}</span>
        <div><small>PHÁN QUYẾT CỦA BẠN</small><h1>{verdictLabel(progress.finalVerdict)}</h1><b>{correct ? "CHÍNH XÁC" : `ĐÁP ÁN: ${verdictLabel(caseData.correctVerdict)}`}</b></div>
        <strong>+{progress.score.total}</strong>
      </div>
      <div className="tr-reveal-grid">
        <article className="tr-explanation-card">
          <Pill tone="info">KẾT LUẬN HỒ SƠ</Pill>
          <h2>{caseData.title}</h2>
          <p>{caseData.explanation}</p>
          {caseData.pitfalls && <div className="tr-pitfalls"><b>Hai điểm dễ nhầm</b><ul>{caseData.pitfalls.map((text) => <li key={text}>{text}</li>)}</ul></div>}
          <div className="tr-lesson"><BrainCircuit size={21} /><div><small>BÀI HỌC</small><b>{caseData.lesson}</b></div></div>
          <div className="tr-action-answer"><span>Hành động phù hợp</span><b>{actionLabel(caseData.bestAction)}</b></div>
        </article>
        <article className="tr-score-card">
          <div><span>ĐIỂM HỒ SƠ</span><strong>{progress.score.total}<small>/100</small></strong></div>
          <ScoreRows score={progress.score} />
          {missed.length > 0 && <p className="tr-missed"><FileSearch size={17} /> Bằng chứng mạnh chưa mở: {missed.map((x) => x.label).join(", ")}.</p>}
        </article>
      </div>
      <Button onClick={onNext} className="tr-btn-wide">{isLast ? "XEM KẾT QUẢ CUỐI" : "MỞ HỒ SƠ TIẾP THEO"} <ChevronRight size={19} /></Button>
    </section>
  );
}

function getTitle(totals, count) {
  if (totals.accuracy >= count * 35 && totals.investigation >= count * 17.5) return "NHÀ PHÂN TÍCH BẰNG CHỨNG";
  if (totals.responsibility >= count * 17.5) return "NGƯỜI CHIA SẺ CÓ TRÁCH NHIỆM";
  if (totals.adaptability >= count * 2.5) return "THÁM TỬ BỐI CẢNH";
  return "NGƯỜI SĂN NGUỒN";
}

function ResultScreen({ run, onReview, onClassResults, onRestart, onRetrySubmit, submitting, storageError }) {
  const totals = scoreTotals(run);
  const count = run.cases.length;
  const improved = run.cases.filter((x) => x.initialVerdict !== getCase(x.caseId).correctVerdict && x.finalVerdict === getCase(x.caseId).correctVerdict).length;
  const initialCorrect = run.cases.filter((x) => x.initialVerdict === getCase(x.caseId).correctVerdict).length;
  const finalCorrect = run.cases.filter((x) => x.finalVerdict === getCase(x.caseId).correctVerdict).length;
  return (
    <main className="tr-page tr-results">
      <Brand compact />
      <ErrorBanner message={storageError} />
      <section className="tr-result-hero">
        <Pill tone="success"><Check size={14} /> ĐÃ KHÉP LẠI {count} HỒ SƠ</Pill>
        <p className="tr-field-hint">Bộ {getPack(run.packId)?.label}</p>
        <h1>TRUTH RUSH COMPLETE</h1>
        <div className="tr-total-score"><strong>{totalScore(run)}</strong><span>/ {count * 100}</span></div>
        <Pill tone="award"><Medal size={15} /> {getTitle(totals, count)}</Pill>
        {run.player.classCode && <p className="tr-submit-state">{run.submitted ? "Kết quả đã được gửi về lớp." : run.submitError || "Đang gửi kết quả về lớp…"}</p>}
      </section>
      <section className="tr-result-grid">
        <article className="tr-metric-card"><span>Chính xác</span><b>{totals.accuracy}<small>/{count * 40}</small></b></article>
        <article className="tr-metric-card"><span>Điều tra</span><b>{totals.investigation}<small>/{count * 25}</small></b></article>
        <article className="tr-metric-card"><span>Trách nhiệm</span><b>{totals.responsibility}<small>/{count * 20}</small></b></article>
        <article className="tr-metric-card"><span>Tự tin</span><b>{totals.confidence}<small>/{count * 10}</small></b></article>
      </section>
      <section className="tr-reasoning-card">
        <div><span>Đúng từ đầu</span><b>{initialCorrect} / {count}</b></div>
        <div><span>Đúng sau điều tra</span><b>{finalCorrect} / {count}</b></div>
        <div><span>Nhận định được cải thiện</span><b>{improved}</b></div>
      </section>
      <div className="tr-result-actions">
        <Button onClick={onReview}>XEM LẠI HỒ SƠ</Button>
        {run.player.classCode && <Button variant="secondary" disabled={!run.submitted} onClick={onClassResults}><Users size={18} /> KẾT QUẢ LỚP</Button>}
        {run.submitError && <Button variant="secondary" isLoading={submitting} onClick={onRetrySubmit}><RefreshCcw size={18} /> GỬI LẠI KẾT QUẢ</Button>}
        <Button variant="ghost" onClick={onRestart}><RefreshCcw size={18} /> CHƠI LẠI</Button>
      </div>
    </main>
  );
}

function ReviewScreen({ run, onBack }) {
  return (
    <main className="tr-page">
      <button className="tr-back" onClick={onBack}><ArrowLeft size={18} /> Quay lại kết quả</button>
      <div className="tr-page-intro"><Pill tone="info">HỒ SƠ ĐÃ ĐÓNG</Pill><h1>Xem lại lập luận</h1><p>So sánh phản xạ ban đầu với quyết định sau khi điều tra.</p></div>
      <div className="tr-review-list">
        {run.cases.map((progress, index) => {
          const item = getCase(progress.caseId);
          return <article key={item.id}><div className="tr-review-index">0{index + 1}</div><div><Pill tone={progress.finalVerdict === item.correctVerdict ? "success" : "danger"}>{verdictLabel(progress.finalVerdict)}</Pill><h2>{item.title}</h2><p>{item.explanation}</p><span>Ban đầu: <b>{verdictLabel(progress.initialVerdict)}</b> · Hành động: <b>{actionLabel(progress.responsibleAction)}</b></span><details className="tr-review-evidence"><summary>Đọc tất cả bằng chứng của hồ sơ</summary>{item.checks.map((check) => <section key={check.id}><h3>{check.label}{progress.usedInvestigations.includes(check.id) ? " · đã mở" : " · chưa mở"}</h3><p>{check.evidence}</p></section>)}</details></div><strong>{progress.score.total}</strong></article>;
        })}
      </div>
    </main>
  );
}

function Distribution({ title, values = [] }) {
  const total = values.reduce((sum, item) => sum + item.count, 0) || 1;
  return (
    <div className="tr-distribution"><h4>{title}</h4>{VERDICTS.map((verdict) => {
      const count = values.find((x) => (x.verdict ?? x.name) === verdict.id)?.count || 0;
      const percent = Math.round((count / total) * 100);
      return <div key={verdict.id}><span>{verdict.label}</span><i><b style={{ width: `${percent}%` }} /></i><em>{percent}%</em></div>;
    })}</div>
  );
}

function ClassResults({ run, onBack }) {
  const [data, setData] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [error, setError] = useState("");
  const [reloadIndex, setReloadIndex] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    Promise.all([
      classApi.stats(run.player.classCode, run.player.participantToken),
      classApi.leaderboard(run.player.classCode, run.player.participantToken),
    ]).then(([stats, board]) => { if (active) { setData(stats); setLeaders(board); } }).catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [run, reloadIndex]);
  return (
    <main className="tr-page">
      <button className="tr-back" onClick={onBack}><ArrowLeft size={18} /> Quay lại kết quả</button>
      <div className="tr-page-intro"><Pill tone="live">LỚP {run.player.classCode}</Pill><h1>Bức tranh của cả lớp</h1><p>Dữ liệu chỉ gồm những người đã hoàn thành.</p></div>
      <ErrorBanner message={error} />
      {error && <Button variant="secondary" onClick={() => setReloadIndex((index) => index + 1)}>THỬ TẢI LẠI</Button>}
      {!data && !error && <div className="tr-loading"><span className="tr-spinner" /> Đang tổng hợp kết quả…</div>}
      {data && <ClassDashboard data={data} leaders={leaders} />}
    </main>
  );
}

function ClassDashboard({ data, leaders }) {
  const checkLabel = (id) => {
    const [caseId, checkId] = id.split(":");
    if (checkId) return `${getCase(caseId)?.title}: ${getCase(caseId)?.checks.find((item) => item.id === checkId)?.label ?? checkId}`;
    return CASE_BANK.flatMap((item) => item.checks).find((item) => item.id === id)?.label ?? id;
  };
  return (
    <>
      <section className="tr-class-metrics">
        <div><span>Đã hoàn thành</span><b>{data.playersCompleted}<small>/{data.playersJoined}</small></b></div>
        <div><span>Điểm trung bình</span><b>{Math.round(data.averageScore)}<small>/{(data.opinions?.length ?? CASE_BANK.length) * 100}</small></b></div>
        <div><span>Độ chính xác TB</span><b>{Math.round(data.averageAccuracy)}</b></div>
        <div><span>Điều tra TB</span><b>{Math.round(data.averageInvestigation)}</b></div>
        <div><span>Trách nhiệm TB</span><b>{Math.round(data.averageResponsibility)}</b></div>
      </section>
      {data.opinions?.map((opinion, index) => <section className="tr-opinion-card" key={opinion.caseId}><div className="tr-section-title"><BrainCircuit size={21} /><div><small>HỒ SƠ {index + 1}</small><h2>{getCase(opinion.caseId)?.title ?? "Ý kiến thay đổi sau điều tra"}</h2></div></div><div className="tr-distribution-grid"><Distribution title="TRƯỚC ĐIỀU TRA" values={opinion.initial} /><Distribution title="SAU ĐIỀU TRA" values={opinion.final} /></div></section>)}
      <section className="tr-insight-grid">
        <article><h3>Kiểm tra được dùng nhiều</h3>{data.mostUsedInvestigations?.length ? data.mostUsedInvestigations.map((item) => <div key={item.name}><span>{checkLabel(item.name)}</span><b>{item.count}</b></div>) : <p>Chưa có dữ liệu.</p>}</article>
        <article><h3>Bằng chứng mạnh bị bỏ lỡ</h3>{data.mostMissedStrongEvidence?.length ? data.mostMissedStrongEvidence.map((item) => <div key={item.name}><span>{checkLabel(item.name)}</span><b>{item.count}</b></div>) : <p>Không có.</p>}</article>
        <article><h3>Hành động sau phán quyết</h3>{data.responsibleActions?.length ? data.responsibleActions.map((item) => <div key={item.name}><span>{actionLabel(item.name)}</span><b>{item.count}</b></div>) : <p>Chưa có dữ liệu.</p>}</article>
      </section>
      <section className="tr-leaderboard"><div className="tr-section-title"><Medal size={21} /><h2>Điểm nổi bật</h2></div>{leaders.length === 0 ? <p>Chưa có kết quả.</p> : leaders.slice(0, 10).map((item, index) => <div key={item.playerName}><span className="tr-rank">{index + 1}</span><b>{item.playerName}</b><span>{item.totalScore} điểm</span></div>)}</section>
    </>
  );
}

function loadTeacherSession() {
  try {
    const value = JSON.parse(sessionStorage.getItem("truth-rush-teacher"));
    return value && /^[A-Z2-9]{6}$/.test(value.code) && /^[A-Fa-f0-9]{64}$/.test(value.teacherToken) && getPack(value.packId) ? value : null;
  } catch { return null; }
}

function TeacherScreen({ onHome }) {
  const [session, setSession] = useState(loadTeacherSession);
  const [stats, setStats] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function createSession() {
    setBusy(true); setError("");
    try {
      const created = await classApi.create();
      setSession(created);
      try { sessionStorage.setItem("truth-rush-teacher", JSON.stringify(created)); }
      catch { setError("Không lưu được phiên giáo viên. Giữ tab này mở để tiếp tục xem lớp."); }
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  useEffect(() => {
    if (!session) return undefined;
    let active = true;
    let inFlight = false;
    async function refresh() {
      if (inFlight) return;
      inFlight = true;
      try {
        const [nextStats, nextLeaders] = await Promise.all([classApi.stats(session.code, session.teacherToken), classApi.leaderboard(session.code, session.teacherToken)]);
        if (active) { setStats(nextStats); setLeaders(nextLeaders); setError(""); }
      } catch (err) { if (active) setError(err.message); }
      finally { inFlight = false; }
    }
    refresh();
    const id = window.setInterval(refresh, 5000);
    return () => { active = false; window.clearInterval(id); };
  }, [session]);
  return (
    <main className="tr-page tr-teacher">
      <button className="tr-back" onClick={onHome}><ArrowLeft size={18} /> Trang người chơi</button>
      <Brand compact />
      {!session ? (
        <section className="tr-teacher-empty">
          <span><GraduationCap size={34} /></span>
          <Pill tone="info">CHẾ ĐỘ LỚP HỌC</Pill>
          <h1>Tạo một phiên cho cả lớp</h1>
          <p>Học sinh nhập mã rồi chơi theo tốc độ riêng. Bảng này tự cập nhật khi từng người hoàn thành.</p>
          <p className="tr-field-hint">Cả lớp chơi cùng một bộ 8 hồ sơ · tối đa 800 điểm.</p>
          <ErrorBanner message={error} />
          <Button onClick={createSession} isLoading={busy}>TẠO MÃ LỚP <ChevronRight size={18} /></Button>
        </section>
      ) : (
        <>
          <section className="tr-session-code"><div><small>MÃ LỚP · BỘ {getPack(session.packId)?.label}</small><strong>{session.code}</strong><p>Yêu cầu học sinh nhập mã này ở màn hình bắt đầu.</p></div><span><LockKeyhole size={28} /> Phiên riêng tư</span></section>
          {session.packId !== DEFAULT_PACK_ID && <p className="tr-field-hint">Đây là phiên cũ gồm 4 hồ sơ. Chọn “TẠO LỚP KHÁC” để tạo phiên đủ 8 hồ sơ.</p>}
          <Button variant="ghost" onClick={() => { setSession(null); setStats(null); setLeaders([]); setError(""); try { sessionStorage.removeItem("truth-rush-teacher"); } catch {} }}>TẠO LỚP KHÁC</Button>
          <ErrorBanner message={error} />
          {!stats ? <div className="tr-loading"><span className="tr-spinner" /> Đang mở bảng điều khiển…</div> : <ClassDashboard data={stats} leaders={leaders} />}
        </>
      )}
    </main>
  );
}

export function TruthRushApp() {
  const [savedRun, setSavedRun] = useState(() => loadRun());
  const [run, setRun] = useState(null);
  const [view, setView] = useState(() => window.location.pathname.startsWith("/teacher") ? "TEACHER" : "GAME");
  const [subview, setSubview] = useState("MAIN");
  const [evidence, setEvidence] = useState(null);
  const [seconds, setSeconds] = useState(null);
  const [submissionAttempt, setSubmissionAttempt] = useState(0);
  const [storageError, setStorageError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const progress = run ? run.cases[run.caseIndex] : null;
  const caseData = progress ? getCase(progress.caseId) : null;

  function commit(mutator) {
    setRun((current) => {
      // Ignore a second click from a screen that already advanced.
      if (!current || current.runId !== run?.runId || current.status !== run.status
        || current.caseIndex !== run.caseIndex || current.cases[current.caseIndex].step !== progress.step) return current;
      const next = structuredClone(current);
      mutator(next);
      return next;
    });
  }

  useEffect(() => {
    if (run) setStorageError(saveRun(run) ? "" : "Trình duyệt không lưu được tiến độ. Lượt chơi vẫn tiếp tục, nhưng hãy giữ trang mở.");
  }, [run]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const heading = document.querySelector("main h1");
    if (heading && !evidence) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true }); }
  }, [run?.status, run?.caseIndex, progress?.step, subview, view]);

  function navigate(next) {
    const path = next === "TEACHER" ? "/teacher" : "/";
    window.history.pushState({}, "", path);
    setView(next);
  }

  useEffect(() => {
    const onPop = () => setView(window.location.pathname.startsWith("/teacher") ? "TEACHER" : "GAME");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (!caseData?.timerSeconds || progress?.step !== "INVESTIGATION") { setSeconds(null); return undefined; }
    if (!progress.investigationDeadline) commit((next) => { next.cases[next.caseIndex].investigationDeadline = Date.now() + caseData.timerSeconds * 1000; });
    const deadline = progress.investigationDeadline || Date.now() + caseData.timerSeconds * 1000;
    const tick = () => setSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [caseData?.id, progress?.step, progress?.investigationDeadline]);

  useEffect(() => {
    if (seconds === 0 && progress?.step === "INVESTIGATION") commit((next) => { next.cases[next.caseIndex].step = "FINAL"; });
  }, [seconds, progress?.step]);

  useEffect(() => {
    if (!run || run.status !== "RESULT" || !run.player.classCode || run.submitted) return;
    let cancelled = false;
    setSubmitting(true);
    classApi.submit(run.player.classCode, submissionPayload(run)).then(() => {
      if (!cancelled) { setSubmitting(false); commit((next) => { next.submitted = true; next.submitError = null; }); }
    }).catch((err) => {
      if (!cancelled) { setSubmitting(false); commit((next) => { next.submitError = `Chưa gửi được kết quả: ${err.message}`; }); }
    });
    return () => { cancelled = true; };
  }, [run?.status, run?.submitted, submissionAttempt]);

  function start(player, packId) {
    const next = createRun(player, packId);
    setRun(next);
    setSavedRun(next);
  }

  function restart() {
    clearRun();
    setRun(null);
    setSavedRun(null);
    setSubview("MAIN");
    setEvidence(null);
    setStorageError("");
  }

  if (view === "TEACHER") return <div className="truth-rush-root"><TeacherScreen onHome={() => navigate("GAME")} /></div>;
  if (!run) return <div className="truth-rush-root"><HomeScreen savedRun={savedRun} onStart={start} onResume={() => setRun(savedRun)} onTeacher={() => navigate("TEACHER")} /></div>;
  if (run.status === "TUTORIAL") return <div className="truth-rush-root"><ErrorBanner message={storageError} /><Tutorial packId={run.packId} onStart={() => commit((next) => { next.status = "PLAYING"; })} /></div>;
  if (run.status === "RESULT") {
    if (subview === "REVIEW") return <div className="truth-rush-root"><ReviewScreen run={run} onBack={() => setSubview("MAIN")} /></div>;
    if (subview === "CLASS") return <div className="truth-rush-root"><ClassResults run={run} onBack={() => setSubview("MAIN")} /></div>;
    return <div className="truth-rush-root"><ResultScreen run={run} submitting={submitting} storageError={storageError} onReview={() => setSubview("REVIEW")} onClassResults={() => setSubview("CLASS")} onRestart={restart} onRetrySubmit={() => setSubmissionAttempt((value) => value + 1)} /></div>;
  }

  let content;
  if (progress.step === "INITIAL") content = <InitialScreen caseData={caseData} onChoose={(value) => commit((next) => { const item = next.cases[next.caseIndex]; item.initialVerdict = value; item.step = "INVESTIGATION"; if (caseData.timerSeconds) item.investigationDeadline = Date.now() + caseData.timerSeconds * 1000; })} />;
  if (progress.step === "INVESTIGATION") content = <InvestigationScreen caseData={caseData} progress={progress} onOpenEvidence={setEvidence} onCheck={(check) => {
    if (progress.investigationDeadline !== null && Date.now() >= progress.investigationDeadline) return;
    commit((next) => { purchaseInvestigation(caseData, next.cases[next.caseIndex], check.id); });
    setEvidence(check);
  }} onFinish={() => commit((next) => { next.cases[next.caseIndex].step = "FINAL"; })} />;
  if (progress.step === "FINAL") content = <FinalVerdictScreen progress={progress} onChoose={(value) => commit((next) => { const item = next.cases[next.caseIndex]; item.finalVerdict = value; item.step = "CONFIDENCE"; })} />;
  if (progress.step === "CONFIDENCE") content = <ConfidenceScreen onChoose={(value) => commit((next) => { const item = next.cases[next.caseIndex]; item.confidence = value; item.step = "ACTION"; })} />;
  if (progress.step === "ACTION") content = <ActionScreen onChoose={(value) => commit((next) => { const item = next.cases[next.caseIndex]; item.responsibleAction = value; item.score = scoreCase(caseData, item); item.step = "REVEAL"; })} />;
  if (progress.step === "REVEAL") content = <RevealScreen caseData={caseData} progress={progress} isLast={run.caseIndex === run.cases.length - 1} onNext={() => commit((next) => { if (next.caseIndex === next.cases.length - 1) next.status = "RESULT"; else next.caseIndex += 1; })} />;

  return (
    <div className="truth-rush-root">
      <GameHeader caseData={caseData} caseIndex={run.caseIndex} caseCount={run.cases.length} progress={progress} seconds={seconds} />
      <main className="tr-game-main"><ErrorBanner message={storageError} />{["FINAL", "CONFIDENCE", "ACTION"].includes(progress.step) && <EvidenceNotebook caseData={caseData} progress={progress} onOpen={setEvidence} />}{content}</main>
      <EvidenceSheet check={evidence && progress.usedInvestigations.includes(evidence.id) ? evidence : null} onClose={() => setEvidence(null)} />
    </div>
  );
}

export default TruthRushApp;
