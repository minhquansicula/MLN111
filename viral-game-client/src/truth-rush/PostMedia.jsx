import React, { useState } from "react";

function Frame({ children, label }) {
  return (
    <svg viewBox="0 0 720 400" role="img" aria-label={label} className="tr-media-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="720" height="400" rx="16" fill="#101b2e" />
      <path d="M0 80H720M0 160H720M0 240H720M0 320H720M120 0V400M240 0V400M360 0V400M480 0V400M600 0V400" stroke="#20314a" strokeOpacity=".5" />
      {children}
      <text x="680" y="380" fill="#8499b7" textAnchor="end" fontSize="13">TRUTH RUSH · MÔ PHỎNG</text>
    </svg>
  );
}

function Document({ email = false }) {
  return <>
    <rect x="76" y="38" width="568" height="316" rx="12" fill="#eaf0f5" />
    <rect x="76" y="38" width="568" height="51" rx="12" fill="#d5e0ec" />
    <circle cx="103" cy="63" r="5" fill="#e1717c" /><circle cx="121" cy="63" r="5" fill="#d0a951" /><circle cx="139" cy="63" r="5" fill="#64a78b" />
    <text x="176" y="69" fontSize="16" fill="#4b5f7a">{email ? "Hộp thư · Thông báo môn học" : "S1 · AN PHÚ ⇄ NAM SƠN"}</text>
    <text x="105" y="130" fontSize="18" fill="#576b83">{email ? "Từ: Giảng viên phụ trách" : "Dành cho sinh viên có thẻ hợp lệ"}</text>
    <text x="105" y="181" fontSize="30" fontWeight="700" fill="#182d4b">{email ? "Bài tập số 2: được dùng AI" : "0đ / lượt"}</text>
    <path d="M105 216H557M105 238H587M105 260H495" stroke="#b7c8d8" strokeWidth="8" strokeLinecap="round" />
    {email ? <>
      <rect x="76" y="281" width="568" height="73" fill="#0c1524" />
      <path d="M76 282H644" stroke="#f7c94b" strokeWidth="2" strokeDasharray="10 7" />
      <text x="360" y="321" textAnchor="middle" fontSize="16" fill="#b4c3d8">PHẦN BÊN DƯỚI ĐÃ BỊ CẮT</text>
    </> : <text x="105" y="310" fontSize="22" fill="#385673">THỨ HAI – THỨ SÁU</text>}
  </>;
}

export function PostMedia({ data }) {
  const [imageFailed, setImageFailed] = useState(false);
  let graphic;
  switch (data.media) {
    case "flood":
      graphic = imageFailed ? <div className="tr-image-error" role="status">Không tải được ảnh. {data.mediaAlt}</div> : <img src="/images/truth-rush/campus-flood.png" width="1536" height="1024" alt={data.mediaAlt} onError={() => setImageFailed(true)} decoding="async" />;
      break;
    case "scholarship":
      graphic = <Frame label={data.mediaAlt}>
        <circle cx="620" cy="-20" r="220" fill="#f7c94b" fillOpacity=".08" />
        <text x="48" y="68" fill="#9eb5d5" fontSize="18" letterSpacing="3">CƠ HỘI SINH VIÊN 24H</text>
        <text x="48" y="121" fill="#fff" fontSize="30" fontWeight="700">HỌC BỔNG HỖ TRỢ</text>
        <text x="44" y="208" fill="#f7c94b" fontSize="78" fontWeight="800">5.000.000đ</text>
        <text x="48" y="256" fill="#cad9ed" fontSize="22">200 SUẤT · HẠN ĐĂNG KÝ 22:00</text>
        <rect x="48" y="288" width="442" height="54" rx="8" fill="#f7c94b" />
        <text x="269" y="323" textAnchor="middle" fill="#172133" fontSize="20" fontWeight="700">CHIA SẺ BÀI &amp; ĐĂNG KÝ</text>
      </Frame>;
      break;
    case "statistics":
      graphic = <Frame label={data.mediaAlt}>
        <text x="48" y="62" fill="#c6d6eb" fontSize="21">SỐ CA TRƯỢT MÔN</text>
        <path d="M78 315H632" stroke="#8299b7" strokeWidth="2" />
        <rect x="144" y="253" width="136" height="60" rx="6" fill="#608dca" />
        <rect x="416" y="73" width="136" height="240" rx="6" fill="#ff8298" />
        <text x="660" y="89" textAnchor="end" fill="#ff8298" fontSize="50" fontWeight="800">+300%</text>
        <text x="212" y="342" textAnchor="middle" fill="#bbcbe0" fontSize="19">Kỳ trước</text>
        <text x="484" y="342" textAnchor="middle" fill="#bbcbe0" fontSize="19">Kỳ này</text>
        <text x="48" y="91" fill="#8196b4" fontSize="16">Biểu đồ trong bài đăng</text>
      </Frame>;
      break;
    case "email":
      graphic = <Frame label={data.mediaAlt}><Document email /></Frame>;
      break;
    case "security":
      graphic = <Frame label={data.mediaAlt}>
        <rect x="42" y="37" width="636" height="312" rx="12" fill="#090f1b" stroke="#3b536f" />
        <text x="66" y="76" fill="#6ecfae" fontSize="20" fontFamily="monospace">dataset_preview.csv</text>
        <text x="66" y="117" fill="#7f95b5" fontSize="17" fontFamily="monospace">email                  department</text>
        {[0, 1, 2, 3, 4].map((row) => <g key={row}>
          <text x="66" y={156 + row * 35} fill="#bfcee1" fontSize="17" fontFamily="monospace">sv***{row + 1}@example.invalid</text>
          <rect x="441" y={141 + row * 35} width="162" height="19" rx="3" fill="#263850" />
        </g>)}
      </Frame>;
      break;
    case "research":
      graphic = <Frame label={data.mediaAlt}>
        <text x="45" y="60" fill="#b5c9e6" fontSize="20">ĐỒ HỌA: KHẢ NĂNG NHỚ TRÍCH DẪN</text>
        <text x="680" y="107" textAnchor="end" fill="#f7c94b" fontSize="53" fontWeight="800">−40%</text>
        <path d="M87 302H626" stroke="#8096b2" strokeWidth="2" />
        <rect x="140" y="111" width="148" height="189" rx="7" fill="#75a9ee" />
        <rect x="422" y="187" width="148" height="113" rx="7" fill="#f7c94b" />
        <text x="214" y="95" textAnchor="middle" fill="#a6c8f7" fontSize="30" fontWeight="700">20%</text>
        <text x="496" y="172" textAnchor="middle" fill="#f7c94b" fontSize="30" fontWeight="700">12%</text>
        <text x="214" y="337" textAnchor="middle" fill="#c4d3e6" fontSize="20">Không dùng AI</text>
        <text x="496" y="337" textAnchor="middle" fill="#c4d3e6" fontSize="20">Dùng AI</text>
      </Frame>;
      break;
    case "shuttle":
      graphic = <Frame label={data.mediaAlt}><Document /></Frame>;
      break;
    case "audio":
      graphic = <Frame label={data.mediaAlt}>
        <text x="44" y="60" fill="#95aece" fontSize="18" letterSpacing="2">ĐOẠN GHI ÂM · NGUỒN ẨN DANH</text>
        {Array.from({ length: 52 }, (_, i) => {
          const height = 16 + ((i * 31 + 17) % 90);
          return <rect key={i} x={48 + i * 12} y={161 - height / 2} width="5" height={height} rx="2.5" fill={i < 30 ? "#f7c94b" : "#6885ab"} />;
        })}
        <text x="48" y="236" fill="#c4d1e3" fontSize="18">00:00</text><text x="666" y="236" textAnchor="end" fill="#c4d1e3" fontSize="18">00:18</text>
        <text x="48" y="293" fill="#f1f5fa" fontSize="24">“mức điều chỉnh hai mươi lăm phần trăm…”</text>
        <text x="48" y="327" fill="#8c9fba" fontSize="18">Bản chép lời · chưa có ngữ cảnh đầy đủ</text>
      </Frame>;
      break;
    default:
      graphic = null;
  }
  if (!graphic) return null;
  return <figure className="tr-post-media">{graphic}<figcaption>{data.caption}</figcaption></figure>;
}
