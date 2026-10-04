import React, { useState } from "react";
import { Button } from "./Button";
import { Search, ShieldAlert, CheckCircle2 } from "lucide-react";

export const Home = ({ onStart }) => {
  const [name, setName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    // Simulate loading/saving before starting
    setTimeout(() => {
      onStart({ name, classCode });
      setLoading(false);
    }, 500);
  };

  return (
    <div className="tr-container tr-flex-col tr-gap-lg" style={{ minHeight: "100vh", padding: "48px 24px" }}>
      
      <div style={{ textAlign: "center" }}>
        <h1 className="tr-h1" style={{ marginBottom: "8px" }}>
          TRUTH <span className="tr-text-accent">RUSH</span>
        </h1>
        <p className="tr-text-secondary tr-body">
          Sự thật không phải lúc nào cũng được số đông tin.
        </p>
      </div>

      <div className="tr-card tr-flex-col tr-gap-md" style={{ marginTop: "24px" }}>
        <h2 className="tr-h3">Bắt đầu điều tra</h2>
        <form onSubmit={handleStart} className="tr-flex-col tr-gap-md">
          <input
            type="text"
            className="tr-input"
            placeholder="Tên của bạn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={24}
          />
          <input
            type="text"
            className="tr-input"
            placeholder="Mã lớp (Tùy chọn)"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
            maxLength={10}
          />
          <Button type="submit" disabled={!name.trim()} isLoading={loading}>
            Bắt đầu
          </Button>
        </form>
      </div>

      <div className="tr-flex-col tr-gap-md" style={{ marginTop: "32px" }}>
        <h2 className="tr-h3" style={{ textAlign: "center" }}>Hướng dẫn nhanh</h2>
        
        <div className="tr-card tr-flex-row tr-gap-md tr-items-center">
          <Search className="tr-text-accent" size={32} style={{ flexShrink: 0 }} />
          <div>
            <div className="tr-h3" style={{ fontSize: "1rem" }}>1. Kiểm chứng</div>
            <p className="tr-body-sm tr-text-secondary">Dùng điểm điều tra để kiểm tra tác giả, nguồn hoặc số liệu.</p>
          </div>
        </div>

        <div className="tr-card tr-flex-row tr-gap-md tr-items-center">
          <ShieldAlert className="tr-text-accent" size={32} style={{ flexShrink: 0 }} />
          <div>
            <div className="tr-h3" style={{ fontSize: "1rem" }}>2. Đánh giá</div>
            <p className="tr-body-sm tr-text-secondary">Đưa ra kết luận cuối cùng dựa trên bằng chứng bạn thu thập được.</p>
          </div>
        </div>

        <div className="tr-card tr-flex-row tr-gap-md tr-items-center">
          <CheckCircle2 className="tr-text-accent" size={32} style={{ flexShrink: 0 }} />
          <div>
            <div className="tr-h3" style={{ fontSize: "1rem" }}>3. Hành động</div>
            <p className="tr-body-sm tr-text-secondary">Chia sẻ sự thật, báo cáo tin giả hoặc bổ sung ngữ cảnh.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
