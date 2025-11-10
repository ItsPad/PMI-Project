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

// --- Component สำหรับหน้าเลือกโปรไฟล์ ---
const ProfileSelection = ({ onSelectProfile }) => {
  const profiles = [
    { id: "Pad", name: "คุณปัด", emoji: "⛄" },
    { id: "Pong", name: "คุณป้อง", emoji: "⚡" },
    { id: "Manun", name: "คุณมนูญ", emoji: "🍵" },
    { id: "Nuch", name: "คุณนุช", emoji: "🧣" },
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-100 via-white to-green-50 text-gray-800 p-4 font-Kanit">
      <h1 className="text-4xl sm:text-5xl font-bold mb-12 text-green-700 tracking-wide">
        ใครกำลังใช้งานอยู่?
      </h1>

      <div className="flex flex-wrap justify-center gap-8 mb-10">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className={`flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-105 
              ${selectedProfileId === profile.id ? "scale-105" : ""}`}
            onClick={() => handleProfileClick(profile.id)}
          >
            <div
              className={`w-36 h-36 sm:w-40 sm:h-40 rounded-2xl shadow-lg flex items-center justify-center text-7xl
                      bg-gradient-to-br from-green-400 to-green-600 text-white transition-all duration-300
                      ${
                        selectedProfileId === profile.id
                          ? "ring-4 ring-green-400 shadow-2xl"
                          : "opacity-80 hover:opacity-100"
                      }`}
            >
              {profile.emoji}
            </div>
            <div
              className={`mt-4 text-xl sm:text-2xl font-medium transition-colors duration-300 
                      ${
                        selectedProfileId === profile.id
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}
            >
              {profile.name}
            </div>
          </div>
        ))}
      </div>

      <button
        id="enterButton"
        className={`px-12 py-3 rounded-full text-xl font-semibold shadow-md transition-all duration-300
            ${
              selectedProfileId
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 hover:shadow-lg"
                : "bg-gray-300 text-gray-400 cursor-not-allowed"
            }`}
        onClick={handleEnterClick}
        disabled={!selectedProfileId}
      >
        เข้าสู่ระบบสุขภาพ
      </button>

      <p className="mt-6 text-sm text-gray-500">
        ดูแลสุขภาพของคุณ เริ่มจากที่นี่ 💚
      </p>
    </div>
  );
};

// --- 👇 [ใหม่] Component ย่อยสำหรับแสดงผลสถิติ ---
const StatsDisplay = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-500">กำลังคำนวณค่าเฉลี่ย 7 วัน...</p>
      </div>
    );
  }

  if (stats.count === 0) {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-500">
          ยังไม่มีข้อมูลสำหรับคำนวณค่าเฉลี่ย 7 วัน
        </p>
      </div>
    );
  }

  // ประเมินผลและกำหนดสี
  let colorClass = "text-green-600"; // ปกติ
  if (stats.assessment.includes("สูง")) colorClass = "text-red-600";
  if (stats.assessment.includes("ต่ำ")) colorClass = "text-blue-600";
  if (stats.assessment.includes("ค่อนข้าง")) colorClass = "text-yellow-600";

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">
        ค่าเฉลี่ย 7 วันที่ผ่านมา ({stats.count} ครั้ง)
      </h2>
      <p className="text-3xl font-bold text-gray-800">
        {stats.avgSys} / {stats.avgDia}{" "}
        <span className="text-lg font-normal">mmHg</span>
      </p>
      <p className={`text-xl font-semibold mt-1 ${colorClass}`}>
        {stats.assessment}
      </p>
    </div>
  );
};

// --- 👇 [ใหม่] ฟังก์ชันประเมินความดัน ---
const getPressureAssessment = (sys, dia) => {
  if (sys === 0 || dia === 0) return "";
  if (sys < 90 || dia < 60) return "ความดันต่ำ";
  if (sys > 140 || dia > 90) return "ความดันสูง";
  if (sys >= 130 || dia >= 85) return "ค่อนข้างสูง";
  if (sys >= 120 && dia >= 80) return "ปกติ-สูง";
  return "ปกติ";
};

// --- Dashboard เวอร์ชันใหม่ ---
const Dashboard = ({ profile, onLogout }) => {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [feeling, setFeeling] = useState(""); // 👈 เพิ่ม state สำหรับ feeling
  const [message, setMessage] = useState({ type: "", text: "" });
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 👈 เพิ่ม state สำหรับสถิติ
  const [stats, setStats] = useState({
    avgSys: 0,
    avgDia: 0,
    count: 0,
    assessment: "",
  });
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const BACKEND_API_URL = "https://pmi-project.onrender.com"; // 👈 URL ของ Backend ที่ Deploy

  // ✅ [ใหม่] ฟังก์ชันสำหรับดึงสถิติ
  const fetchStats = async () => {
    setIsStatsLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/api/stats/${profile.id}`
      );
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
      // ถ้าโหลดสถิติล่ม ก็ไม่เป็นไร ไม่ต้องโชว์ Error
    } finally {
      setIsStatsLoading(false);
    }
  };

  // ✅ โหลดข้อมูลย้อนหลัง
  useEffect(() => {
    fetchHistory();
    fetchStats(); // 👈 โหลดสถิติด้วย
  }, [profile.id]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(
        `${BACKEND_API_URL}/api/pressures/${profile.id}`
      );

      if (!response.ok) {
        throw new Error("Server response was not ok");
      }

      const data = await response.json();
      setHistory(data);

      if (data.length === 0) {
        setMessage({
          type: "success",
          text: "✅ เชื่อมต่อสำเร็จ! (ยังไม่มีข้อมูลให้แสดง)",
        });
      } else {
        setMessage({ type: "", text: "" });
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      setMessage({ type: "error", text: "❌ ไม่สามารถดึงข้อมูลย้อนหลังได้" });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ บันทึกข้อมูลใหม่
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    if (!systolic || !diastolic) {
      // 👈 ไม่บังคับให้กรอก feeling
      setMessage({ type: "error", text: "⚠️ กรุณากรอกค่าความดันให้ครบ" });
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
          feeling: feeling || null, // 👈 ส่ง feeling ไปด้วย
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ type: "success", text: "✅ บันทึกข้อมูลสำเร็จ!" });
        setSystolic("");
        setDiastolic("");
        setFeeling(""); // 👈 เคลียร์ feeling

        // เพิ่มข้อมูลใหม่เข้าไปใน state
        setHistory((prev) => [
          data.newEntry,
          ...prev.filter((item) => item.id !== data.newEntry.id),
        ]);
        fetchStats(); // 👈 อัปเดตสถิติใหม่
      } else {
        setMessage({
          type: "error",
          text: data.message || "❌ เกิดข้อผิดพลาด",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
      });
    }
  };

  // ✅ ลบข้อมูลย้อนหลัง
  const handleDelete = async (id) => {
    if (!window.confirm("คุณต้องการลบข้อมูลนี้ใช่หรือไม่?")) return;

    try {
      const response = await fetch(`${BACKEND_API_URL}/api/pressures/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
        setMessage({ type: "success", text: "🗑️ ลบข้อมูลเรียบร้อยแล้ว" });
        fetchStats(); // 👈 อัปเดตสถิติใหม่
      } else {
        setMessage({ type: "error", text: "❌ ลบข้อมูลไม่สำเร็จ" });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
      });
    }
  };

  // จัดการรูปแบบข้อมูลสำหรับกราฟ (ต้องเรียงจากเก่าไปใหม่)
  const chartData = [...history]
    .map((item) => ({
      ...item,
      date: item.date,
    }))
    .reverse();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-10 p-4 font-Kanit bg-gradient-to-b from-green-100 to-white">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl text-center">
        {/* ส่วนโปรไฟล์ */}
        <div className="text-right text-gray-600 text-sm mb-6">
          สวัสดี, <strong>{profile.name}</strong> {profile.emoji}(
          <a
            href="#"
            onClick={onLogout}
            className="text-blue-600 hover:underline ml-1"
          >
            เปลี่ยนโปรไฟล์
          </a>
          )
        </div>

        <h1 className="text-3xl font-semibold text-green-600 mb-6">
          🩺 บันทึกความดันโลหิต
        </h1>

        {/* --- 👇 [ใหม่] แสดงผลสถิติ --- */}
        <StatsDisplay stats={stats} isLoading={isStatsLoading} />

        {/* แสดง "กำลังโหลด..." */}
        {isLoading && (
          <div className="mt-6 p-3 rounded-lg bg-blue-100 text-blue-700">
            กำลังโหลดข้อมูลจากเซิร์ฟเวอร์ กรุณารอสักครู่ใช้เวลาประมาณ 30
            วินาที... 🔄
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="number"
            placeholder="ตัวบน (Systolic)"
            value={systolic}
            onChange={(e) => setSystolic(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="number"
            placeholder="ตัวล่าง (Diastolic)"
            value={diastolic}
            onChange={(e) => setDiastolic(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />

          {/* --- 👇 [ใหม่] Dropdown ความรู้สึก --- */}
          <select
            value={feeling}
            onChange={(e) => setFeeling(e.target.value)}
            className="w-full p-3 border rounded-lg text-gray-700"
          >
            <option value="">-- ความรู้สึกวันนี้ (ไม่บังคับ) --</option>
            <option value="ดีมาก">😊 ดีมาก</option>
            <option value="ปกติ">🙂 ปกติ</option>
            <option value="หน่วงๆ">😟 หน่วงๆ</option>
            <option value="ไม่ค่อยดี">🤢 ไม่ค่อยดี</option>
          </select>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            บันทึกข้อมูล
          </button>
        </form>

        {/* แสดง Message (Error/Success) ต่อเมื่อ "ไม่ได้" โหลดอยู่ */}
        {!isLoading && message.text && (
          <div
            className={`mt-6 p-3 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* ✅ กราฟข้อมูล */}
        {history.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              📈 กราฟความดันย้อนหลัง (สูงสุด 10 ครั้ง)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[50, 200]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  stroke="#ef4444"
                  name="Systolic (บน)"
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  stroke="#3b82f6"
                  name="Diastolic (ล่าง)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ✅ แสดงรายการ */}
        <div className="mt-8 text-left">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            📊 ความดันย้อนหลัง (สูงสุด 10 ครั้ง)
          </h2>

          {/* แสดง List ถ้ามีข้อมูล */}
          {history.length > 0 && (
            <ul className="space-y-2">
              {history.map((item) => (
                <li
                  key={item.id}
                  className="border rounded-lg p-2 flex justify-between items-center"
                >
                  <div>
                    <span className="text-gray-600">{item.date}</span>
                    <span className="font-medium ml-3">
                      {item.systolic}/{item.diastolic} mmHg
                    </span>
                    {/* --- 👇 [ใหม่] แสดง feeling --- */}
                    {item.feeling && (
                      <span className="text-sm text-gray-500 ml-2 italic">
                        ({item.feeling})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑️ ลบ
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* แสดง "ยังไม่มีข้อมูล" ต่อเมื่อ "ไม่ได้โหลด" และ "ไม่มีข้อมูล" */}
          {!isLoading && history.length === 0 && (
            <p className="text-gray-500">ยังไม่มีข้อมูล</p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- App หลัก ---
function App() {
  const [loggedInProfile, setLoggedInProfile] = useState(null);

  useEffect(() => {
    // 💡 ใช้ JSON.parse เพื่อความสะอาด
    const storedProfileString = localStorage.getItem("pmiProfile");
    if (storedProfileString) {
      try {
        setLoggedInProfile(JSON.parse(storedProfileString));
      } catch (e) {
        localStorage.removeItem("pmiProfile");
      }
    }
  }, []);

  const handleSelectProfile = (profile) => {
    setLoggedInProfile(profile);
    // 💡 เก็บเป็น JSON ก้อนเดียว
    localStorage.setItem("pmiProfile", JSON.stringify(profile));
  };

  const handleLogout = (e) => {
    e.preventDefault();
    setLoggedInProfile(null);
    localStorage.removeItem("pmiProfile");
  };

  return (
    <>
      {loggedInProfile ? (
        <Dashboard profile={loggedInProfile} onLogout={handleLogout} />
      ) : (
        <ProfileSelection onSelectProfile={handleSelectProfile} />
      )}
    </>
  );
}

export default App;
