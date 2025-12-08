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

// --- 🎨 Global Styles & Animations ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;700&display=swap');
    
    .font-Kanit { font-family: 'Kanit', sans-serif; }
    
    @keyframes snow {
      0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
      20% { opacity: 1; }
      100% { transform: translateY(110vh) translateX(20px) rotate(360deg); opacity: 0.3; }
    }
    
    @keyframes twinkle {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }

    .animate-snow {
      animation-name: snow;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }

    .animate-twinkle {
      animation: twinkle 2s infinite ease-in-out;
    }

    /* Pattern ไม้เท้ากวาด (Candy Cane) */
    .bg-candy-cane {
      background: repeating-linear-gradient(
        45deg,
        #ef4444,
        #ef4444 10px,
        #ffffff 10px,
        #ffffff 20px
      );
    }
    
    .bg-holly {
      background-color: #f0fdf4;
      background-image: radial-gradient(#dc2626 1px, transparent 1px), radial-gradient(#16a34a 1px, transparent 1px);
      background-size: 20px 20px;
      background-position: 0 0, 10px 10px;
    }

    /* หิมะเกาะบนกล่อง (Snow Cap) */
    .snow-cap::before {
      content: '';
      position: absolute;
      top: -10px;
      left: 0;
      right: 0;
      height: 20px;
      background: white;
      border-radius: 50% 50% 0 0 / 100% 100% 0 0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 0;
    }
  `}</style>
);

// --- ❄️ Component: หิมะตก ---
const SnowOverlay = ({ count = 30 }) => (
  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="absolute bg-white rounded-full opacity-60 animate-snow"
        style={{
          width: `${Math.random() * 6 + 4}px`,
          height: `${Math.random() * 6 + 4}px`,
          left: `${Math.random() * 100}%`,
          top: `-20px`,
          animationDuration: `${Math.random() * 5 + 5}s`,
          animationDelay: `${Math.random() * 5}s`,
          filter: 'blur(1px)',
        }}
      ></div>
    ))}
  </div>
);

// --- 💡 Component: ไฟประดับ ---
const ChristmasLights = () => (
  <div className="flex justify-center gap-4 mb-4 overflow-hidden py-2 absolute top-0 left-0 w-full z-10">
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className={`w-4 h-4 rounded-full shadow-lg animate-twinkle ${
          i % 3 === 0 ? "bg-red-500 shadow-red-500/50" : 
          i % 3 === 1 ? "bg-green-500 shadow-green-500/50" : "bg-yellow-400 shadow-yellow-400/50"
        }`}
        style={{ animationDelay: `${i * 0.2}s` }}
      ></div>
    ))}
  </div>
);

// --- 👇 BackendLoadingScreen (ธีมคริสต์มาส) ---
const BackendLoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-gray-800 p-4 font-Kanit relative overflow-hidden">
    <GlobalStyles />
    <SnowOverlay count={40} />
    
    <div className="relative z-10 text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-4 border-green-200">
      <div className="mb-6 relative">
         <div className="text-6xl animate-bounce">🎅</div>
         <div className="absolute -right-2 top-0 text-4xl animate-pulse">✨</div>
      </div>
      
      {/* Loading Spinner แบบวงกลมสีสลับ */}
      <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 border-b-green-600 rounded-full animate-spin mx-auto mb-4"></div>

      <h1 className="text-2xl font-bold text-red-700">
        กำลังปลุกคุณลุงซานต้า...
      </h1>
      <p className="text-green-800 mt-2 font-medium">
        (กวางเรนเดียร์กำลังวิ่งไปที่เซิร์ฟเวอร์ 🦌💨)
      </p>
    </div>
  </div>
);

// --- 👇 BackendErrorScreen (ธีมคริสต์มาส) ---
const BackendErrorScreen = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 text-red-800 p-4 font-Kanit relative overflow-hidden">
    <GlobalStyles />
    <SnowOverlay />
    
    <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md border-4 border-red-200 z-10">
        <div className="text-6xl mb-4">🥶</div>
        <h1 className="text-3xl font-bold mb-2 text-red-600">อุ๊ย! หนาวเกินไป</h1>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">การเชื่อมต่อแข็งตัว</h2>
        <p className="text-gray-600 mb-6">
          ดูเหมือนของขวัญจะส่งไม่ถึงเซิร์ฟเวอร์ ลองตรวจสอบอินเทอร์เน็ตดูนะ
        </p>
        <button
          onClick={onRetry}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-full font-bold hover:scale-105 transition-transform shadow-lg ring-4 ring-green-200"
        >
          🎁 ลองส่งใหม่อีกครั้ง
        </button>
    </div>
  </div>
);

// --- Component สำหรับหน้าเลือกโปรไฟล์ (ธีมคริสต์มาส) ---
const ProfileSelection = ({ onSelectProfile }) => {
  const profiles = [
    { id: "Pad", name: "คุณปัด", emoji: "🎅", role: "Santa" },
    { id: "Pong", name: "คุณป้อง", emoji: "🦌", role: "Reindeer" },
    { id: "Manun", name: "คุณมนูญ", emoji: "⛄", role: "Snowman" },
    { id: "Nuch", name: "คุณนุช", emoji: "🤶", role: "Mrs. Claus" },
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-red-50 via-white to-green-50 text-gray-800 p-4 font-Kanit relative overflow-hidden">
      <GlobalStyles />
      <SnowOverlay count={50} />
      <ChristmasLights />

      <h1 className="text-4xl sm:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-green-600 tracking-wide relative z-10 drop-shadow-sm mt-10 text-center">
       MERRY CHRISTMAS
      </h1>
      <h2 className="text-xl sm:text-2xl font-bold mb-10 text-gray-600 relative z-10">
        🎁 ใครกำลังใช้งานวันนี้?
      </h2>

      <div className="flex flex-wrap justify-center gap-6 mb-12 relative z-10">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className={`flex flex-col items-center cursor-pointer transition-all duration-300 transform group
              ${selectedProfileId === profile.id ? "scale-110 -translate-y-2" : "hover:scale-105"}`}
            onClick={() => handleProfileClick(profile.id)}
          >
            <div className="relative">
                {/* Snow Cap on Avatar */}
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-white rounded-t-full opacity-90 z-20 ${selectedProfileId === profile.id ? 'block' : 'hidden group-hover:block'}`}></div>
                
                <div
                className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full shadow-lg flex items-center justify-center text-6xl relative z-10 border-4
                        transition-all duration-300 overflow-hidden
                        ${
                            selectedProfileId === profile.id
                            ? "border-red-500 bg-red-50 shadow-red-200 shadow-2xl"
                            : "border-white bg-white hover:border-green-300"
                        }`}
                >
                <span className="drop-shadow-md transform transition-transform group-hover:rotate-12">{profile.emoji}</span>
                </div>
            </div>
            
            <div
              className={`mt-3 px-4 py-1 rounded-full text-lg font-bold transition-colors duration-300 shadow-sm
                  ${
                    selectedProfileId === profile.id
                      ? "bg-red-600 text-white"
                      : "bg-white text-gray-600 group-hover:text-green-600"
                  }`}
            >
              {profile.name}
            </div>
          </div>
        ))}
      </div>

      <button
        className={`px-10 py-4 rounded-full text-xl font-bold shadow-xl transition-all duration-300 relative z-10 border-4 border-white
            ${
              selectedProfileId
                ? "bg-gradient-to-r from-green-500 to-green-700 text-white hover:scale-105 hover:shadow-green-200/50"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
        onClick={handleEnterClick}
        disabled={!selectedProfileId}
      >
        {selectedProfileId ? "🎄 เข้าสู่ระบบสุขภาพ 🎄" : "เลือกชื่อผู้ใช้ก่อนนะ"}
      </button>

      <div className="absolute bottom-0 w-full h-12 bg-white rounded-t-[50%] opacity-80 z-0"></div>
    </div>
  );
};

// --- Component ย่อยสำหรับแสดงผลสถิติ (ธีมคริสต์มาส) ---
const StatsDisplay = ({ stats, isLoading }) => {
  // Card สไตล์กระดาษห่อของขวัญ
  const cardStyle = "mb-6 p-6 bg-white border-4 border-dashed border-red-200 rounded-3xl text-center shadow-lg relative overflow-hidden";
  
  if (isLoading) {
    return (
      <div className={cardStyle}>
        <p className="text-green-600 font-medium animate-pulse">กำลังคำนวณสถิติจากขั้วโลกเหนือ... ⏳</p>
      </div>
    );
  }

  if (stats.count === 0) {
    return (
      <div className={cardStyle}>
        <div className="text-4xl mb-2">📜</div>
        <p className="text-gray-500 font-medium">
          ยังไม่มีข้อมูลในรายการ (List ว่างเปล่า!)
        </p>
      </div>
    );
  }

  let colorClass = "text-green-600";
  let bgBadge = "bg-green-100";
  let emoji = "🌟";
  let advice = "ยอดเยี่ยมมาก!";

  if (stats.assessment.includes("สูง")) { 
      colorClass = "text-red-600"; 
      bgBadge = "bg-red-100";
      emoji = "🚨";
      advice = "ระวังสุขภาพด้วยนะ";
  }
  if (stats.assessment.includes("ต่ำ")) { 
      colorClass = "text-blue-500"; 
      bgBadge = "bg-blue-100";
      emoji = "❄️"; 
      advice = "พักผ่อนเยอะๆ";
  }
  if (stats.assessment.includes("ค่อนข้าง")) { 
      colorClass = "text-yellow-600"; 
      bgBadge = "bg-yellow-100";
      emoji = "⚠️"; 
      advice = "คุมอาหารหน่อยนะ";
  }

  return (
    <div className={cardStyle}>
      {/* ริบบิ้นมุม */}
      <div className="absolute top-0 right-0 -mr-2 -mt-2 w-16 h-16 overflow-hidden">
         <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-4 py-1 transform rotate-45 translate-x-4 translate-y-2 shadow-md">
            STATS
         </div>
      </div>

      <h2 className="text-gray-500 text-sm uppercase tracking-wider font-semibold mb-2">
        ค่าเฉลี่ย {stats.count} ครั้งล่าสุด
      </h2>
      <div className="flex items-end justify-center gap-2 mb-3">
          <span className="text-5xl font-bold text-gray-800 tracking-tighter">{stats.avgSys}</span>
          <span className="text-3xl text-gray-400 font-light">/</span>
          <span className="text-5xl font-bold text-gray-800 tracking-tighter">{stats.avgDia}</span>
          <span className="text-sm text-gray-500 font-medium mb-2 ml-1">mmHg</span>
      </div>
      
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${bgBadge} ${colorClass} font-bold text-lg`}>
        <span>{emoji}</span>
        <span>{stats.assessment}</span>
      </div>
      <p className="mt-2 text-sm text-gray-400 italic">"{advice}"</p>
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

// --- Dashboard (ธีมคริสต์มาสจัดเต็ม) ---
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

  // ... (Logic fetchStats, fetchHistory, handleSubmit, handleDelete เหมือนเดิม) ...
  // เพื่อความกระชับของโค้ด ผมจะละไว้ในส่วน Logic แต่เน้นที่ UI 
  // แต่ในการใช้งานจริงต้องใส่ Logic กลับเข้าไปด้วยนะครับ 
  // (ผมใส่คืนให้ครบถ้วนด้านล่างนี้ครับ)

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
      setMessage({ type: "error", text: "❌ ไม่สามารถดึงข้อมูลจากถุงของขวัญได้" });
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
        setMessage({ type: "success", text: "🎁 บันทึกลงสมุดเรียบร้อย!" });
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
    <div className="flex flex-col items-center justify-start min-h-screen pt-12 p-4 font-Kanit bg-holly relative overflow-hidden">
      <GlobalStyles />
      <SnowOverlay count={20} />
      <ChristmasLights />
      
      {/* Main Card Container */}
      <div className="bg-white/95 backdrop-blur p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-2xl text-center border-8 border-red-100 relative z-10">
        
        {/* Header Profile */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-dashed border-gray-200">
           <div className="text-left">
              <span className="block text-gray-400 text-xs font-bold uppercase tracking-wider">Current User</span>
              <span className="text-xl font-bold text-gray-800 flex items-center gap-2">
                 {profile.emoji} {profile.name}
              </span>
           </div>
           <button onClick={onLogout} className="text-sm font-semibold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1 rounded-full transition-colors">
             ออกจากระบบ 🚪
           </button>
        </div>

        <h1 className="text-3xl font-bold text-red-700 mb-6 drop-shadow-sm flex items-center justify-center gap-2">
          🩺 บันทึกความดัน
          <span className="text-2xl animate-bounce">🎄</span>
        </h1>

        <StatsDisplay stats={stats} isLoading={isStatsLoading} />

        {/* Input Form Area with Candy Cane Border Effect */}
        <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-100 relative mb-8">
            <div className="absolute -top-3 left-4 bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                📝 จดบันทึกวันนี้
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                    <label className="text-xs text-gray-500 mb-1 block text-left pl-1">ตัวบน (SYS)</label>
                    <input
                        type="number"
                        placeholder="120"
                        value={systolic}
                        onChange={(e) => setSystolic(e.target.value)}
                        className="w-full p-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-green-200 focus:outline-none text-center text-xl font-bold text-green-800 placeholder-green-200 bg-white"
                    />
                </div>
                <div className="relative">
                    <label className="text-xs text-gray-500 mb-1 block text-left pl-1">ตัวล่าง (DIA)</label>
                    <input
                        type="number"
                        placeholder="80"
                        value={diastolic}
                        onChange={(e) => setDiastolic(e.target.value)}
                        className="w-full p-3 border-2 border-red-200 rounded-xl focus:border-red-500 focus:ring-red-200 focus:outline-none text-center text-xl font-bold text-red-800 placeholder-red-200 bg-white"
                    />
                </div>
            </div>

            <select
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                className="w-full p-3 border-2 border-yellow-200 rounded-xl text-gray-700 focus:border-yellow-400 focus:outline-none bg-white"
            >
                <option value="">-- ความรู้สึกวันนี้ 🎁 --</option>
                <option value="ดีมาก">😊 ดีมาก (สดชื่นสุดๆ)</option>
                <option value="ปกติ">🙂 ปกติ</option>
                <option value="หน่วงๆ">😟 หน่วงๆ (เหมือนแบกถุงของขวัญ)</option>
                <option value="ไม่ค่อยดี">🤢 ไม่ค่อยดี (อยากพักผ่อน)</option>
            </select>

            <button
                type="submit"
                className="w-full bg-green-500 text-white py-3 rounded-xl hover:opacity-90 transition-all font-bold text-lg shadow-md border-2 border-white ring-2 ring-red-200 mt-2"
                style={{ textShadow: '0 2px 2px rgba(0, 0, 0, 0.5)' }}
            >
                <p className="text-white">
                  บันทึกข้อมูล 🎅
                </p>
            </button>
            </form>
        </div>

        {/* Message Box */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl font-medium flex items-center justify-center gap-2 animate-pulse ${
              message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
            <span>{message.type === "success" ? "✅" : "❌"}</span>
            {message.text}
          </div>
        )}

        {/* Chart Section */}
        {history.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="text-red-500">📈</span> กราฟสุขภาพ
            </h2>
            <div className="p-2 bg-white rounded-2xl border-2 border-gray-100 shadow-inner">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickMargin={10} />
                  <YAxis domain={[50, 180]} stroke="#9ca3af" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #fee2e2', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="systolic" stroke="#dc2626" strokeWidth={3} dot={{ r: 4, fill: '#dc2626', strokeWidth: 2, stroke: '#fff' }} />
                  <Line type="monotone" dataKey="diastolic" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* History List */}
        <div className="text-left">
          <h2 className="text-lg font-bold text-gray-700 mb-4 pl-2 border-l-4 border-green-500">
            📜 รายการย้อนหลัง (Naughty or Nice List)
          </h2>
          
          {history.length > 0 ? (
            <ul className="space-y-3">
              {history.map((item) => (
                <li key={item.id} className="group bg-white border border-gray-100 rounded-xl p-3 flex justify-between items-center shadow-sm hover:shadow-md hover:border-red-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-md">
                        {item.date.split(' ')[0]}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-lg leading-none">
                        {item.systolic} <span className="text-gray-300">/</span> {item.diastolic}
                        </span>
                        {item.feeling && <span className="text-xs text-gray-400">{item.feeling}</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400">ยังไม่มีข้อมูล... เริ่มต้นบันทึกกันเถอะ!</p>
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