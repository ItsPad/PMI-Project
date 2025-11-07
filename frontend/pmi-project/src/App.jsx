import React, { useState, useEffect } from 'react';

// --- Component สำหรับหน้าเลือกโปรไฟล์ ---
const ProfileSelection = ({ onSelectProfile }) => {
  const profiles = [
    { id: 'Pad', name: 'คุณปัด', emoji: '🌟' },
    { id: 'Pong', name: 'คุณป้อง', emoji: '🐶' },
    { id: 'Manun', name: 'คุณมนูญ', emoji: '👴' },
    { id: 'Nuch', name: 'คุณนุช', emoji: '👵' },
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

const Dashboard = ({ profile, onLogout }) => {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // ✅ เพิ่ม state สำหรับสถานะโหลด
  const [history, setHistory] = useState([]); // ✅ เพิ่ม state สำหรับข้อมูลย้อนหลัง
  const BACKEND_API_URL = 'http://localhost:3000/api/pressures';

  // Helper function สำหรับ format วันที่
  const formatDate = (dateInput) => {
    if (!dateInput) return 'ไม่มีเวลา';
    let date;
    try {
      date = new Date(dateInput);
    } catch (e) {
      console.error("Error creating Date object from:", dateInput, e);
      return String(dateInput);
    }

    if (isNaN(date.getTime())) {
      return String(dateInput);
    }

    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return date.toLocaleDateString('th-TH', options);
  };

  // 📡 ดึงข้อมูลย้อนหลัง
  const fetchPressureData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_API_URL}/${profile.id}`);
      const data = await res.json();
      setHistory(data || []);
    } catch (err) {
      console.error('❌ ดึงข้อมูลไม่สำเร็จ:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ดึงข้อมูลทันทีเมื่อเลือกโปรไฟล์
  useEffect(() => {
    fetchPressureData();
  }, [profile.id]);

  // ...ส่วนอื่นๆ เช่นฟอร์มบันทึกและแสดงข้อมูล
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
