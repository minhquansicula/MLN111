import React, { useState } from "react";
import { Button } from "./Button";
import { CASES, VERDICTS, ACTIONS } from "./data";
import { MessageSquare, Heart, Share2, Search, ArrowRight, ShieldCheck, AlertTriangle, AlertCircle, HelpCircle } from "lucide-react";

export const CaseView = ({ onFinish }) => {
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [step, setStep] = useState("INITIAL_OPINION"); // INITIAL_OPINION, INVESTIGATION, FINAL_VERDICT, CONFIDENCE, ACTION, REVEAL
  
  const [initialVerdict, setInitialVerdict] = useState(null);
  const [finalVerdict, setFinalVerdict] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [action, setAction] = useState(null);
  
  const [points, setPoints] = useState(CASES[currentCaseIndex].investigationPoints);
  const [checkedIds, setCheckedIds] = useState([]);
  
  const currentCase = CASES[currentCaseIndex];

  const handleBuyCheck = (check) => {
    if (points >= check.cost && !checkedIds.includes(check.id)) {
      setPoints(p => p - check.cost);
      setCheckedIds(prev => [...prev, check.id]);
    }
  };

  const getVerdictIcon = (v) => {
    switch (v) {
      case "TRUE": return <ShieldCheck className="tr-text-success" />;
      case "FALSE": return <AlertTriangle className="tr-text-danger" />;
      case "MISLEADING": return <AlertCircle className="tr-text-accent" />;
      default: return <HelpCircle className="tr-text-secondary" />;
    }
  };

  const renderPost = () => (
    <div className="tr-card" style={{ padding: "24px", marginBottom: "24px" }}>
      <div className="tr-flex-row tr-items-center tr-gap-sm" style={{ marginBottom: "16px" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "var(--tr-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
          {currentCase.post.avatar}
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>{currentCase.post.author}</div>
          <div className="tr-text-secondary tr-body-sm">{currentCase.post.time}</div>
        </div>
      </div>
      <div style={{ fontSize: "1.125rem", whiteSpace: "pre-wrap", marginBottom: "24px" }}>
        {currentCase.post.content}
      </div>
      <div className="tr-flex-row tr-justify-between tr-text-secondary tr-body-sm" style={{ borderTop: "1px solid var(--tr-border)", paddingTop: "16px" }}>
        <span className="tr-flex-row tr-items-center tr-gap-xs"><Heart size={16}/> {currentCase.post.likes}</span>
        <span className="tr-flex-row tr-items-center tr-gap-xs"><MessageSquare size={16}/> {currentCase.post.comments}</span>
        <span className="tr-flex-row tr-items-center tr-gap-xs"><Share2 size={16}/> {currentCase.post.shares}</span>
      </div>
    </div>
  );

  return (
    <div className="tr-container tr-flex-col" style={{ minHeight: "100vh", padding: "32px 16px" }}>
      {/* Header */}
      <div className="tr-flex-row tr-justify-between tr-items-center" style={{ marginBottom: "24px" }}>
        <div className="tr-text-secondary tr-body-sm" style={{ letterSpacing: "1px" }}>CASE {currentCaseIndex + 1} / {CASES.length}</div>
        {step === "INVESTIGATION" && (
          <div className="tr-flex-row tr-items-center tr-gap-sm" style={{ backgroundColor: "var(--tr-bg-surface)", padding: "8px 16px", borderRadius: "20px" }}>
            <Search size={16} className="tr-text-accent" />
            <span style={{ fontWeight: 600 }}>{points} điểm</span>
          </div>
        )}
      </div>

      {/* Step 1: Initial Opinion */}
      {step === "INITIAL_OPINION" && (
        <div className="tr-fade-in">
          {renderPost()}
          <h2 className="tr-h2" style={{ textAlign: "center", marginBottom: "24px" }}>Ấn tượng ban đầu của bạn?</h2>
          <div className="tr-flex-col tr-gap-md">
            {Object.entries(VERDICTS).map(([key, label]) => (
              <Button key={key} variant="secondary" onClick={() => { setInitialVerdict(key); setStep("INVESTIGATION"); }}>
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Investigation */}
      {step === "INVESTIGATION" && (
        <div className="tr-fade-in">
          <div className="tr-card" style={{ marginBottom: "24px", opacity: 0.8, scale: 0.95 }}>
            <div className="tr-body-sm tr-text-secondary">Bài đăng tóm tắt:</div>
            <div style={{ fontWeight: 500 }}>{currentCase.post.content.split('\n')[0]}...</div>
          </div>
          
          <h3 className="tr-h3" style={{ marginBottom: "16px" }}>Công cụ điều tra</h3>
          <div className="tr-flex-col tr-gap-sm" style={{ marginBottom: "32px" }}>
            {currentCase.checks.map(check => {
              const isChecked = checkedIds.includes(check.id);
              const canBuy = points >= check.cost;
              return (
                <div key={check.id} className="tr-card tr-flex-row tr-justify-between tr-items-center" style={{ padding: "16px", borderColor: isChecked ? "var(--tr-success)" : "var(--tr-border)" }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{check.label}</div>
                    <div className="tr-text-secondary tr-body-sm">{check.cost} điểm</div>
                  </div>
                  {isChecked ? (
                    <span className="tr-text-success tr-body-sm" style={{ fontWeight: "bold" }}>ĐÃ KIỂM TRA</span>
                  ) : (
                    <Button variant="secondary" disabled={!canBuy} onClick={() => handleBuyCheck(check)} style={{ padding: "8px 16px" }}>
                      Mua
                    </Button>
                  )}
                  {isChecked && (
                    <div style={{ flexBasis: "100%", marginTop: "12px", padding: "12px", backgroundColor: "var(--tr-bg)", borderRadius: "8px", borderLeft: "3px solid var(--tr-success)" }}>
                      {check.result}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Button variant="primary" style={{ width: "100%" }} onClick={() => setStep("FINAL_VERDICT")}>
            Kết thúc điều tra <ArrowRight size={18} />
          </Button>
        </div>
      )}

      {/* Step 3: Final Verdict */}
      {step === "FINAL_VERDICT" && (
        <div className="tr-fade-in">
          <h2 className="tr-h2" style={{ textAlign: "center", marginBottom: "8px" }}>Kết luận cuối cùng?</h2>
          <p className="tr-text-secondary" style={{ textAlign: "center", marginBottom: "24px" }}>Nhận định ban đầu của bạn: <strong>{VERDICTS[initialVerdict]}</strong></p>
          <div className="tr-flex-col tr-gap-md">
            {Object.entries(VERDICTS).map(([key, label]) => (
              <Button key={key} variant="secondary" onClick={() => { setFinalVerdict(key); setStep("CONFIDENCE"); }}>
                <span className="tr-flex-row tr-items-center tr-gap-sm">{getVerdictIcon(key)} {label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Confidence */}
      {step === "CONFIDENCE" && (
        <div className="tr-fade-in">
          <h2 className="tr-h2" style={{ textAlign: "center", marginBottom: "8px" }}>Bạn chắc chắn bao nhiêu %?</h2>
          <p className="tr-text-secondary" style={{ textAlign: "center", marginBottom: "24px" }}>Độ tự tin càng cao, điểm cộng/trừ càng lớn.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[50, 60, 70, 80, 90, 100].map(val => (
              <Button key={val} variant="secondary" onClick={() => { setConfidence(val); setStep("ACTION"); }}>
                {val}%
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Action */}
      {step === "ACTION" && (
        <div className="tr-fade-in">
          <h2 className="tr-h2" style={{ textAlign: "center", marginBottom: "24px" }}>Bạn sẽ làm gì tiếp theo?</h2>
          <div className="tr-flex-col tr-gap-md">
            {Object.entries(ACTIONS).map(([key, label]) => (
              <Button key={key} variant="secondary" onClick={() => { setAction(key); setStep("REVEAL"); }}>
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Step 6: Reveal */}
      {step === "REVEAL" && (
        <div className="tr-fade-in tr-card" style={{ border: "2px solid var(--tr-accent)", padding: "32px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div className="tr-text-secondary tr-body-sm" style={{ marginBottom: "8px" }}>KẾT QUẢ SỰ THẬT</div>
            <h1 className="tr-h1 tr-text-accent" style={{ marginBottom: "8px" }}>{VERDICTS[currentCase.correctVerdict]}</h1>
            <p style={{ fontSize: "1.125rem", fontWeight: 500 }}>Lựa chọn của bạn: {finalVerdict === currentCase.correctVerdict ? <span className="tr-text-success">Chính xác</span> : <span className="tr-text-danger">Sai</span>}</p>
          </div>
          
          <div style={{ backgroundColor: "var(--tr-bg)", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
            <h3 className="tr-h3" style={{ marginBottom: "8px" }}>Vì sao?</h3>
            <p className="tr-text-secondary">{currentCase.explanation}</p>
          </div>

          <div style={{ backgroundColor: "var(--tr-bg)", padding: "16px", borderRadius: "8px", marginBottom: "32px", borderLeft: "4px solid var(--tr-accent)" }}>
            <h3 className="tr-h3" style={{ marginBottom: "8px" }}>Bạn có bỏ lỡ gì không?</h3>
            <p className="tr-text-secondary">{currentCase.missedEvidence}</p>
          </div>

          <Button variant="primary" style={{ width: "100%" }} onClick={() => {
            if (currentCaseIndex < CASES.length - 1) {
              // Next case logic
            } else {
              onFinish({ initialVerdict, finalVerdict, confidence, action, checkedIds });
            }
          }}>
            Hoàn tất Case
          </Button>
        </div>
      )}

    </div>
  );
};
