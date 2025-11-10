  import React, { useState, useEffect } from 'react';
  import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
  } from 'recharts';

  // --- Component สำหรับหน้าเลือกโปรไฟล์ ---
  const ProfileSelection = ({ onSelectProfile }) => {
    const profiles = [
      { id: 'Pad', name: 'คุณปัด', emoji: '⛄' },
      { id: 'Pong', name: 'คุณป้อง', emoji: '⚡' },
      { id: 'Manun', name: 'คุณมนูญ', emoji: '🍵' },
      { id: 'Nuch', name: 'คุณนุช', emoji: '🧣' },
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
                ${selectedProfileId === profile.id ? 'scale-105' : ''}`}
              onClick={() => handleProfileClick(profile.id)}
            >
              <div
                className={`w-36 h-36 sm:w-40 sm:h-40 rounded-2xl shadow-lg flex items-center justify-center text-7xl
                        bg-gradient-to-br from-green-400 to-green-600 text-white transition-all duration-300
                        ${
                          selectedProfileId === profile.id
                            ? 'ring-4 ring-green-400 shadow-2xl'
                            : 'opacity-80 hover:opacity-100'
                        }`}
              >
                {profile.emoji}
              </div>
              <div
                className={`mt-4 text-xl sm:text-2xl font-medium transition-colors duration-300 
                        ${
                          selectedProfileId === profile.id
                            ? 'text-green-700'
                            : 'text-gray-500'
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
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 hover:shadow-lg'
                    : 'bg-gray-300 text-gray-400 cursor-not-allowed'
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

  // --- Dashboard เวอร์ชันใหม่ ---
  const Dashboard = ({ profile, onLogout }) => {
    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [history, setHistory] = useState([]);

    // นี่คือส่วนที่แก้ไขแล้ว ถูกต้องครับ!
    // We are hardcoding the production URL to fix the build warning.
    // To use environment variables (like for local development),
    // you may need to adjust your project's build target (e.g., in vite.config.js) to support 'import.meta'
    const BACKEND_API_URL = 'https://pmi-project.onrender.com'; //URL มันเปลี่ยนแปลงตามที่ Deploy ไว้

    // ✅ โหลดข้อมูลย้อนหลัง
    useEffect(() => {
      fetchHistory();
    }, [profile.id]);

    const fetchHistory = async () => {
      try {
        const response = await fetch(
          `${BACKEND_API_URL}/api/pressures/${profile.id}`
        );
        
        if (!response.ok) {
          // ถ้าเซิร์ฟเวอร์ตอบกลับมาว่าไม่ OK (เช่น 404, 500)
          throw new Error('Server response was not ok');
        }

        const data = await response.json();
        setHistory(data);

      } catch (error) {
        console.error('Error fetching history:', error);
        // แสดงข้อผิดพลาดบนหน้าจอผู้ใช้
        setMessage({ type: 'error', text: '❌ ไม่สามารถดึงข้อมูลย้อนหลังได้' });
      }
    };

    // ✅ บันทึกข้อมูลใหม่
    const handleSubmit = async (event) => {
      event.preventDefault();
      setMessage({ type: '', text: '' });

      if (!systolic || !diastolic) {
        setMessage({ type: 'error', text: '⚠️ กรุณากรอกค่าความดันให้ครบ' });
        return;
      }

      try {
        const response = await fetch(`${BACKEND_API_URL}/api/submit-pressure`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: profile.id,
            systolic: parseInt(systolic),
            diastolic: parseInt(diastolic),
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setMessage({ type: 'success', text: '✅ บันทึกข้อมูลสำเร็จ!' });
          setSystolic('');
          setDiastolic('');
          // เพิ่มข้อมูลใหม่เข้าไปใน state โดยไม่ต้องโหลดใหม่ทั้งหน้า
          setHistory((prev) => [data.newEntry, ...prev.filter(item => item.id !== data.newEntry.id)]); // ป้องกันการซ้ำซ้อน
        } else {
          setMessage({ type: 'error', text: data.message || '❌ เกิดข้อผิดพลาด' });
        }
      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: '❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้' });
      }
    };

    // ✅ ลบข้อมูลย้อนหลัง
    const handleDelete = async (id) => {
      // เปลี่ยนจาก confirm() ที่อาจถูกเบราว์เซอร์บล็อก
      if (!window.confirm('คุณต้องการลบข้อมูลนี้ใช่หรือไม่?')) return;
      
      try {
        const response = await fetch(`${BACKEND_API_URL}/api/pressures/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setHistory((prev) => prev.filter((item) => item.id !== id));
          setMessage({ type: 'success', text: '🗑️ ลบข้อมูลเรียบร้อยแล้ว' });
        } else {
          setMessage({ type: 'error', text: '❌ ลบข้อมูลไม่สำเร็จ' });
        }
      } catch(err) {
        console.error(err);
        setMessage({ type: 'error', text: '❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้' });
      }
    };
    
    // จัดการรูปแบบข้อมูลสำหรับกราฟ (ต้องเรียงจากเก่าไปใหม่)
    const chartData = [...history].map(item => ({
        ...item,
        // แปลงวันที่ (ถ้าจำเป็น) แต่ recharts มักจะแสดง string ได้ดี
        date: item.date // สมมติว่า item.date เป็น string ที่อ่านง่าย
    })).reverse(); // .reverse() เพื่อให้กราฟแสดงจากซ้าย (เก่า) ไปขวา (ใหม่)


    return (
      <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 pt-10 p-4 font-Kanit">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl text-center">
          {/* ส่วนโปรไฟล์ */}
          <div className="text-right text-gray-600 text-sm mb-6">
            สวัสดี, <strong>{profile.name}</strong> {profile.emoji}
            (<a
              href="#"
              onClick={onLogout}
              className="text-blue-600 hover:underline ml-1"
            >
              เปลี่ยนโปรไฟล์
            </a>)
          </div>
          <h1 className="text-3xl font-semibold text-green-600 mb-6">
            🩺 บันทึกความดันโลหิต
          </h1>

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
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
              บันทึกข้อมูล
            </button>
          </form>

          {message.text && (
            <div
              className={`mt-6 p-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* ✅ กราฟข้อมูล */}
          {history.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">
                📈 กราฟความดันย้อนหลัง
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
              📊 ความดันย้อนหลัง
            </h2>
            {history.length > 0 ? (
              <ul className="space-y-2">
                {history.map((item) => ( // ลบ index ออกถ้า id มีอยู่แล้ว
                  <li
                    key={item.id} // ใช้ id ที่มาจาก database เป็น key
                    className="border rounded-lg p-2 flex justify-between items-center"
                  >
                    <div>
                      <span className="text-gray-600">{item.date}</span>
                      <span className="font-medium ml-3">
                        {item.systolic}/{item.diastolic} mmHg
                      </span>
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
            ) : (
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
      const storedProfileId = localStorage.getItem('pmiProfileId');
      const storedProfileName = localStorage.getItem('pmiProfileName');
      const storedProfileEmoji = localStorage.getItem('pmiProfileEmoji');

      if (storedProfileId && storedProfileName) {
        setLoggedInProfile({
          id: storedProfileId,
          name: storedProfileName,
          emoji: storedProfileEmoji,
        });
      }
    }, []);

    const handleSelectProfile = (profile) => {
      setLoggedInProfile(profile);
      localStorage.setItem('pmiProfileId', profile.id);
      localStorage.setItem('pmiProfileName', profile.name);
      localStorage.setItem('pmiProfileEmoji', profile.emoji);
    };

    const handleLogout = (e) => {
      e.preventDefault();
      setLoggedInProfile(null);
      localStorage.clear();
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