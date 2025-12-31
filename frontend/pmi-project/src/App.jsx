import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- 🎆 Global Styles & Animations ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;700&display=swap');
    
    .font-Kanit { font-family: 'Kanit', sans-serif; }
    
    /* Animation: Confetti (กระดาษโปรย) */
    @keyframes confetti-fall {
      0% { transform: translateY(-10vh) rotate(0deg) scale(1); opacity: 1; }
      100% { transform: translateY(110vh) rotate(720deg) scale(0.5); opacity: 0; }
    }
    
    /* Animation: Glow (แสงวูบวาบ) */
    @keyframes gold-glow {
      0%, 100% { box-shadow: 0 0 10px #fbbf24, 0 0 20px #d97706; }
      50% { box-shadow: 0 0 20px #fcd34d, 0 0 40px #b45309; }
    }

    @keyframes text-shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    .animate-confetti {
      animation-name: confetti-fall;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }

    .text-gradient-gold {
      background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      background-size: 200% auto;
      animation: text-shimmer 3s linear infinite;
    }

    .bg-midnight-sky {
      background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
    }

    .bg-gold-pattern {
      background-color: #ffffff;
      background-image: radial-gradient(#fbbf24 0.5px, transparent 0.5px), radial-gradient(#fbbf24 0.5px, #ffffff 0.5px);
      background-size: 20px 20px;
      background-position: 0 0, 10px 10px;
      opacity: 0.1;
    }
  `}</style>
);

// --- 🎉 Component: Confetti (กระดาษโปรยหลากสี) ---
const ConfettiOverlay = ({ count = 40 }) => {
  const colors = ['#FFD700', '#C0C0C0', '#FF69B4', '#00BFFF', '#FF4500']; // Gold, Silver, Pink, Blue, Red
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-sm animate-confetti"
          style={{
            width: `${Math.random() * 8 + 4}px`,
            height: `${Math.random() * 10 + 5}px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            animationDuration: `${Math.random() * 3 + 4}s`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: 0.8,
          }}
        ></div>
      ))}
    </div>
  );
};

// --- ✨ Component: 2026 Header Decoration ---
const NewYearHeader = () => (
  <div className="absolute top-0 left-0 w-full z-10 flex justify-center overflow-hidden py-4">
    <div className="text-4xl md:text-6xl font-bold tracking-widest opacity-10 select-none text-white animate-pulse">
      2026 • 2026 • 2026
    </div>
  </div>
);

// --- 👇 BackendLoadingScreen (ธีมปีใหม่) ---
const BackendLoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-midnight-sky text-white p-4 font-Kanit relative overflow-hidden">
    <GlobalStyles />
    <ConfettiOverlay count={50} />
    
    <div className="relative z-10 text-center p-10 bg-black/40 backdrop-blur-md rounded-3xl shadow-2xl border border-yellow-500/30">
      <div className="mb-6 relative">
          <div className="text-7xl animate-bounce">🎇</div>
      </div>
      
      {/* Loading Spinner แบบวงกลมทอง */}
      <div className="w-16 h-16 border-4 border-yellow-200/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-6"></div>

      <h1 className="text-3xl font-bold text-gradient-gold mb-2">
        กำลังนับถอยหลัง...
      </h1>
      <p className="text-gray-300 font-light tracking-wide">
        Connecting to 2026 Server... 🚀
      </p>
    </div>
  </div>
);

// --- 👇 BackendErrorScreen (ธีมปีใหม่) ---
const BackendErrorScreen = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 font-Kanit relative overflow-hidden">
    <GlobalStyles />
    <ConfettiOverlay />
    
    <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center max-w-md border border-red-500/50 z-10">
        <div className="text-6xl mb-4">😵‍💫</div>
        <h1 className="text-2xl font-bold mb-2 text-red-400">สัญญาณแฮงค์!</h1>
        <h2 className="text-lg font-semibold mb-4 text-gray-300">การเชื่อมต่อสะดุด</h2>
        <p className="text-gray-400 mb-6 font-light">
          ดูเหมือนเครือข่ายจะฉลองหนักไปหน่อย ลองเชื่อมต่อใหม่อีกครั้งนะ
        </p>
        <button
          onClick={onRetry}
          className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(234,179,8,0.5)]"
        >
          🎆 ลองใหม่อีกครั้ง
        </button>
    </div>
  </div>
);

// --- Component สำหรับหน้าเลือกโปรไฟล์ (ธีมปีใหม่) ---
const ProfileSelection = ({ onSelectProfile }) => {
  const profiles = [
    { id: "Pad", name: "คุณปัด", emoji: "😎", role: "Party Starter" },
    { id: "Pong", name: "คุณป้อง", emoji: "🍾", role: "Champagne Popped" },
    { id: "Manun", name: "คุณมนูญ", emoji: "🎆", role: "Firework Master" },
    { id: "Nuch", name: "คุณนุช", emoji: "💃", role: "Dancing Queen" },
  ];

  const [selectedProfileId, setSelectedProfileId] = useState(null);

  const handleProfileClick = (profileId) => {
    setSelectedProfileId(profileId);
  };

  const handleEnterClick = () => {
    if (selectedProfileId) {
      const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
      onSelectProfile(selectedProfile);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-midnight-sky text-white p-4 font-Kanit relative overflow-hidden">
      <GlobalStyles />
      <ConfettiOverlay count={60} />
      <NewYearHeader />

      <h1 className="text-5xl sm:text-7xl font-bold mb-2 text-gradient-gold tracking-tighter relative z-10 mt-10 text-center drop-shadow-lg">
       HAPPY NEW YEAR
      </h1>
      <div className="text-4xl font-bold text-yellow-500/80 mb-8 tracking-[0.5em] z-10">2026</div>

      <h2 className="text-xl font-light mb-10 text-gray-300 relative z-10 flex items-center gap-2">
        <span>🥂</span> ใครพร้อมจะสุขภาพดีในปีใหม่?
      </h2>

      <div className="flex flex-wrap justify-center gap-6 mb-12 relative z-10">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className={`flex flex-col items-center cursor-pointer transition-all duration-300 transform group
              ${selectedProfileId === profile.id ? "scale-110 -translate-y-4" : "hover:scale-105"}`}
            onClick={() => handleProfileClick(profile.id)}
          >
            <div className="relative">
                {/* Crown for selected */}
                {selectedProfileId === profile.id && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl animate-bounce z-20">👑</div>
                )}
                
                <div
                className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center text-6xl relative z-10 border-4 backdrop-blur-sm
                        transition-all duration-300 overflow-hidden shadow-2xl
                        ${
                            selectedProfileId === profile.id
                            ? "border-yellow-400 bg-yellow-400/20 shadow-[0_0_30px_rgba(250,204,21,0.6)]"
                            : "border-gray-600 bg-white/5 hover:border-yellow-200 hover:bg-white/10"
                        }`}
                >
                <span className="drop-shadow-md transform transition-transform group-hover:rotate-12 group-hover:scale-110">{profile.emoji}</span>
                </div>
            </div>
            
            <div
              className={`mt-4 px-5 py-1 rounded-full text-lg font-bold transition-all duration-300
                  ${
                    selectedProfileId === profile.id
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg scale-110"
                      : "text-gray-400 group-hover:text-yellow-200"
                  }`}
            >
              {profile.name}
            </div>
          </div>
        ))}
      </div>

      <button
        className={`px-12 py-4 rounded-full text-xl font-bold shadow-2xl transition-all duration-500 relative z-10 border border-white/20
            ${
              selectedProfileId
                ? "bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black hover:scale-105 hover:shadow-[0_0_40px_rgba(234,179,8,0.6)]"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
        onClick={handleEnterClick}
        disabled={!selectedProfileId}
      >
        {selectedProfileId ? "🎉 เริ่มต้นปีใหม่สุขภาพดี 🎉" : "เลือกโปรไฟล์ของคุณ"}
      </button>

      {/* Decorative Light Glow at bottom */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-yellow-500/20 to-transparent z-0"></div>
    </div>
  );
};

// --- Component ย่อยสำหรับแสดงผลสถิติ (ธีมปีใหม่) ---
const StatsDisplay = ({ stats, isLoading }) => {
  // Card สไตล์ Elegant Dark/Gold
  const cardStyle = "mb-6 p-6 bg-white border-2 border-yellow-100 rounded-3xl text-center shadow-lg relative overflow-hidden";
  
  if (isLoading) {
    return (
      <div className={cardStyle}>
        <p className="text-yellow-600 font-medium animate-pulse">กำลังประมวลผลข้อมูลปี 2026... ⏳</p>
      </div>
    );
  }

  if (stats.count === 0) {
    return (
      <div className={cardStyle}>
        <div className="text-4xl mb-2">📜</div>
        <p className="text-gray-500 font-medium">
           New Year's List ยังว่างอยู่ (เริ่มบันทึกกันเถอะ!)
        </p>
      </div>
    );
  }

  let colorClass = "text-green-600";
  let bgBadge = "bg-green-100";
  let emoji = "✨";
  let advice = "สุดยอด! ขอให้แข็งแรงตลอดปี";

  if (stats.assessment.includes("สูง")) { 
      colorClass = "text-red-600"; 
      bgBadge = "bg-red-100";
      emoji = "🚨";
      advice = "ปีใหม่นี้ ดูแลความดันหน่อยนะ";
  }
  if (stats.assessment.includes("ต่ำ")) { 
      colorClass = "text-blue-500"; 
      bgBadge = "bg-blue-100";
      emoji = "❄️"; 
      advice = "พักผ่อนเยอะๆ หลังปาร์ตี้";
  }
  if (stats.assessment.includes("ค่อนข้าง")) { 
      colorClass = "text-yellow-600"; 
      bgBadge = "bg-yellow-100";
      emoji = "⚠️"; 
      advice = "คุมอาหารฉลองปีใหม่ด้วยนะ";
  }

  return (
    <div className={cardStyle}>
      {/* ริบบิ้นมุมทอง */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200"></div>

      <h2 className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-2">
        STATS (LAST {stats.count})
      </h2>
      <div className="flex items-end justify-center gap-2 mb-3">
          <span className="text-5xl font-bold text-gray-800 tracking-tighter drop-shadow-sm">{stats.avgSys}</span>
          <span className="text-3xl text-yellow-500 font-light">/</span>
          <span className="text-5xl font-bold text-gray-800 tracking-tighter drop-shadow-sm">{stats.avgDia}</span>
          <span className="text-sm text-gray-400 font-medium mb-2 ml-1">mmHg</span>
      </div>
      
      <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full ${bgBadge} ${colorClass} font-bold text-lg shadow-inner`}>
        <span>{emoji}</span>
        <span>{stats.assessment}</span>
      </div>
      <p className="mt-3 text-sm text-gray-500 italic">"{advice}"</p>
    </div>
  );
};

const getPressureAssessment = (sys, dia) => {
  if (sys === 0 || dia === 0) return "";
  if (sys < 90 || dia < 60) return "ความดันต่ำ";
  if (sys > 140 || dia > 90) return "ความดันสูง";
  if (sys >= 130 || dia >= 85) return "ค่อนข้างสูง";
  if (sys >= 120 && dia >= 80) return "ปกติ-สูง";
  return "ปกติ";
};

// --- Dashboard (ธีม Happy New Year 2026) ---
const Dashboard = ({ profile, onLogout }) => {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [feeling, setFeeling] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ avgSys: 0, avgDia: 0, count: 0, assessment: "" });
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const BACKEND_API_URL = "https://pmi-project.onrender.com";

  const fetchStats = async () => {
    setIsStatsLoading(true);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/stats/${profile.id}`);
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      const assessmentText = getPressureAssessment(data.avgSys, data.avgDia);
      setStats({
        avgSys: data.avgSys,
        avgDia: data.avgDia,
        count: data.count,
        assessment: assessmentText,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, [profile.id]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/pressures/${profile.id}`);
      if (!response.ok) throw new Error("Server response was not ok");
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
      setMessage({ type: "error", text: "❌ ไม่สามารถดึงข้อมูลย้อนหลังได้" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!systolic || !diastolic) {
      setMessage({ type: "error", text: "⚠️ กรุณากรอกตัวเลขให้ครบนะ" });
      return;
    }
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/submit-pressure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.id,
          systolic: parseInt(systolic),
          diastolic: parseInt(diastolic),
          feeling: feeling || null,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: "success", text: "🎆 บันทึกสำเร็จ! สุขภาพดีรับปีใหม่" });
        setSystolic(""); setDiastolic(""); setFeeling("");
        setHistory((prev) => [data.newEntry, ...prev.filter((item) => item.id !== data.newEntry.id)]);
        fetchStats();
      } else {
        setMessage({ type: "error", text: data.message || "❌ เกิดข้อผิดพลาด" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "❌ ส่งข้อมูลไม่สำเร็จ" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("แน่ใจนะว่าจะลบข้อมูลนี้?")) return;
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/pressures/${id}`, { method: "DELETE" });
      if (response.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
        setMessage({ type: "success", text: "🗑️ ลบทิ้งเรียบร้อย" });
        fetchStats();
      }
    } catch (err) {
      setMessage({ type: "error", text: "❌ ลบไม่ได้" });
    }
  };

  const chartData = [...history].map((item) => ({ ...item, date: item.date })).reverse();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-12 p-4 font-Kanit bg-gray-50 relative overflow-hidden">
      <GlobalStyles />
      <ConfettiOverlay count={20} />
      <div className="absolute inset-0 bg-gold-pattern z-0 pointer-events-none"></div>
      
      {/* Main Card Container */}
      <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-2xl w-full max-w-2xl text-center border-t-8 border-yellow-400 relative z-10">
        
        {/* Header Profile */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
           <div className="text-left">
              <span className="block text-yellow-600 text-[10px] font-bold uppercase tracking-widest">Active User</span>
              <span className="text-xl font-bold text-gray-800 flex items-center gap-2">
                 {profile.emoji} {profile.name}
              </span>
           </div>
           <button onClick={onLogout} className="text-xs font-semibold text-gray-500 hover:text-red-500 bg-gray-100 px-4 py-2 rounded-full transition-colors border border-transparent hover:border-red-200">
             Logout 🚪
           </button>
        </div>

        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-800 mb-6 drop-shadow-sm flex items-center justify-center gap-2">
          🎯 Health Goals 2026
        </h1>

        <StatsDisplay stats={stats} isLoading={isStatsLoading} />

        {/* Input Form Area */}
        <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-inner relative mb-8">
            <div className="absolute -top-3 left-4 bg-gray-800 text-yellow-400 px-4 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
               <span>✏️</span> New Entry
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                    <label className="text-xs text-gray-500 mb-1 block text-left pl-1 uppercase font-semibold">Systolic (บน)</label>
                    <input
                        type="number"
                        placeholder="120"
                        value={systolic}
                        onChange={(e) => setSystolic(e.target.value)}
                        className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 focus:outline-none text-center text-xl font-bold text-gray-800 placeholder-gray-300 bg-white transition-all"
                    />
                </div>
                <div className="relative">
                    <label className="text-xs text-gray-500 mb-1 block text-left pl-1 uppercase font-semibold">Diastolic (ล่าง)</label>
                    <input
                        type="number"
                        placeholder="80"
                        value={diastolic}
                        onChange={(e) => setDiastolic(e.target.value)}
                        className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none text-center text-xl font-bold text-gray-800 placeholder-gray-300 bg-white transition-all"
                    />
                </div>
            </div>

            <select
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                className="w-full p-3 border-2 border-gray-100 rounded-xl text-gray-700 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:outline-none bg-white transition-all"
            >
                <option value="">-- ความรู้สึกวันนี้ 🎇 --</option>
                <option value="สดชื่น">😎 สดชื่น (Ready for 2026)</option>
                <option value="ปกติ">🙂 ปกติ</option>
                <option value="ตึงเครียด">🤯 ตึงเครียด/งานหนัก</option>
                <option value="แฮงค์/เพลีย">🥴 เพลีย</option>
                <option value="ไม่สบาย">🤒 ไม่สบาย</option>
            </select>

            <button
                type="submit"
                className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-yellow-400 py-3 rounded-xl hover:shadow-lg hover:shadow-yellow-500/20 transition-all font-bold text-lg border border-gray-800 mt-2 active:scale-95"
            >
                บันทึกข้อมูล 🚀
            </button>
            </form>
        </div>

        {/* Message Box */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl font-medium flex items-center justify-center gap-2 animate-pulse ${
              message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
            }`}>
            <span>{message.type === "success" ? "✅" : "❌"}</span>
            {message.text}
          </div>
        )}

        {/* Chart Section */}
        {history.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="text-yellow-500">📈</span> Trends
            </h2>
            <div className="p-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickMargin={10} />
                  <YAxis domain={[50, 180]} stroke="#9ca3af" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Line type="monotone" dataKey="systolic" stroke="#eab308" strokeWidth={3} dot={{ r: 4, fill: '#eab308', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* History List */}
        <div className="text-left">
          <h2 className="text-lg font-bold text-gray-700 mb-4 pl-2 border-l-4 border-yellow-400">
            🗓️ ประวัติ (History)
          </h2>
          
          {history.length > 0 ? (
            <ul className="space-y-3">
              {history.map((item) => (
                <li key={item.id} className="group bg-white border border-gray-100 rounded-xl p-3 flex justify-between items-center shadow-sm hover:shadow-md hover:border-yellow-300 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center bg-gray-50 text-gray-500 text-[10px] font-bold w-12 h-12 rounded-lg border border-gray-200">
                        <span>{item.date.split(' ')[0].split('/')[0]}</span>
                        <span className="text-xs text-gray-800">{item.date.split(' ')[0].split('/')[1]}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-xl leading-none font-Kanit tracking-tight">
                        {item.systolic} <span className="text-gray-300 text-base">/</span> {item.diastolic}
                        </span>
                        {item.feeling && <span className="text-xs text-gray-400 mt-1 flex items-center gap-1">📝 {item.feeling}</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all">
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="text-4xl grayscale opacity-30 mb-2">🎈</div>
                <p className="text-gray-400">เริ่มบันทึกสุขภาพต้อนรับปีใหม่กัน!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 👇 App หลัก ---
function ChristmasHealthApp() {
  const [loggedInProfile, setLoggedInProfile] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");
  const BACKEND_API_URL = "https://pmi-project.onrender.com";

  const checkBackendStatus = async () => {
    setBackendStatus("checking");
    try {
      const response = await fetch(BACKEND_API_URL + "/");
      if (!response.ok) throw new Error("Backend not healthy");
      setBackendStatus("ready");
    } catch (err) {
      setBackendStatus("error");
    }
  };

  useEffect(() => { checkBackendStatus(); }, []);

  useEffect(() => {
    const stored = localStorage.getItem("pmiProfile");
    if (stored) setLoggedInProfile(JSON.parse(stored));
  }, []);

  const handleSelectProfile = (profile) => {
    setLoggedInProfile(profile);
    localStorage.setItem("pmiProfile", JSON.stringify(profile));
  };

  const handleLogout = (e) => {
    e.preventDefault();
    setLoggedInProfile(null);
    localStorage.removeItem("pmiProfile");
  };

  if (backendStatus === "checking") return <BackendLoadingScreen />;
  if (backendStatus === "error") return <BackendErrorScreen onRetry={checkBackendStatus} />;

  return loggedInProfile ? (
    <Dashboard profile={loggedInProfile} onLogout={handleLogout} />
  ) : (
    <ProfileSelection onSelectProfile={handleSelectProfile} />
  );
}

export default ChristmasHealthApp;