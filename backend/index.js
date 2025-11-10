const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
// 👈 [ลบ] URLSearchParams (Discord ไม่ได้ใช้)
// const { URLSearchParams } = require('url'); 

const app = express();

// --- ตัวแปรสำคัญ ---
const PORT = process.env.PORT || 3000;
const frontendURL_Render = 'https://pmi-project.onrender.com';
const frontendURL_Local = 'http://localhost:5173';

// 👈 [เหมือนเดิม] Map ชื่อเล่น
const profileNames = {
  Pad: 'คุณปัด',
  Pong: 'คุณป้อง',
  Manun: 'คุณมนูญ',
  Nuch: 'คุณนุช',
};

// 👈 [ใหม่] Map สีสำหรับประเมินผล
const pressureColors = {
  'ความดันสูง': 15158332, // สีแดง
  'ค่อนข้างสูง': 15105570, // สีส้ม
  'ปกติ-สูง': 15844367, // สีเหลือง
  'ปกติ': 3066993, // สีเขียว
  'ความดันต่ำ': 3447003, // สีฟ้า
};

// 👈 [ใหม่] ฟังก์ชันประเมินผล (ย้ายมาจาก Frontend)
const getPressureAssessment = (sys, dia) => {
  if (sys < 90 || dia < 60) return 'ความดันต่ำ';
  if (sys > 140 || dia > 90) return 'ความดันสูง';
  if (sys >= 130 || dia >= 85) return 'ค่อนข้างสูง';
  if (sys >= 120 && dia >= 80) return 'ปกติ-สูง';
  return 'ปกติ';
};

let db;
try {
  // ... (ส่วนการเชื่อมต่อ Firebase เหมือนเดิมเป๊ะ) ...
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountString) {
    throw new Error('ไม่พบ FIREBASE_SERVICE_ACCOUNT ใน Environment Variables');
  }
  const serviceAccount = JSON.parse(serviceAccountString);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  db = admin.firestore();
  console.log('✅ เชื่อมต่อ Firebase Firestore เรียบร้อยแล้ว (อ่านจาก Environment Variable)');
} catch (e) {
  console.error('❌ FATAL ERROR: ไม่สามารถอ่าน Service Account จาก Environment Variable', e.message);
  process.exit(1);
}

// --- Middleware ---
app.use(express.json());

// --- CORS Setup ---
// ... (ส่วน CORS เหมือนเดิมเป๊ะ) ...
const allowedOrigins = [
  frontendURL_Render, 
  frontendURL_Local,
  'https://pmi-project-frontend.onrender.com'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: ไม่อนุญาตให้เชื่อมต่อจาก Origin นี้'));
    }
  },
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

// --- 👈 [ลบ] ฟังก์ชัน sendLineNotify ---
// (ลบฟังก์ชันของ LINE ทิ้งไป)

// --- 👈 [ใหม่] ฟังก์ชันสำหรับส่ง Discord Webhook ---
const sendDiscordNotify = async (userName, systolic, diastolic, feeling) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('❌ ไม่พบ DISCORD_WEBHOOK_URL ใน Environment Variables');
    return;
  }

  try {
    // 1. ประเมินผลและสี
    const assessment = getPressureAssessment(systolic, diastolic);
    const color = pressureColors[assessment] || 3447003; // (สีฟ้า Default)

    // 2. สร้าง "Fields" (ข้อมูลที่จะแสดง)
    let fields = [
      { name: "👤 ผู้ใช้", value: userName, inline: true },
      { name: "🩺 ความดัน", value: `${systolic} / ${diastolic} mmHg`, inline: true },
      { name: "📊 ผลประเมิน", value: assessment, inline: true }
    ];

    // 3. เพิ่ม "ความรู้สึก" (ถ้ามี)
    if (feeling) {
      fields.push({ name: "😊 ความรู้สึก", value: feeling, inline: true });
    }

    // 4. สร้าง Embed Payload (การ์ดสวยๆ)
    const payload = {
      // content: "มีข้อความใหม่!", // (สามารถใส่ข้อความ @tag ตรงนี้ได้)
      embeds: [
        {
          title: "🔔 บันทึกความดันโลหิตใหม่!",
          color: color,
          fields: fields,
          timestamp: new Date().toISOString()
        }
      ]
    };

    // 5. ส่ง Request ไปที่ Discord
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('✅ ส่ง Discord Webhook สำเร็จ!');
    } else {
      console.error(`❌ ส่ง Discord Webhook ไม่สำเร็จ: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดร้ายแรงขณะส่ง Discord Webhook:', error.message);
  }
};


// --- API Endpoints ---
app.get('/', (req, res) => {
  res.send('🎉 PMI Project Backend กำลังทำงาน! (v4 with Discord)');
});

// API สำหรับบันทึกข้อมูลความดัน
app.post('/api/submit-pressure', async (req, res) => {
  const { systolic, diastolic, userId, feeling } = req.body;

  // ... (ส่วน Validation เหมือนเดิม) ...
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ message: '⚠️ กรุณาระบุ userId' });
  }
  if (typeof systolic !== 'number' || typeof diastolic !== 'number' || systolic <= 0 || diastolic <= 0) {
    return res.status(400).json({ message: '⚠️ กรุณาระบุค่า systolic และ diastolic ที่ถูกต้อง' });
  }

  try {
    const timestamp = new Date(); 
    const feelingValue = feeling || null;

    // ... (ส่วนบันทึก Firebase เหมือนเดิม) ...
    const docRef = await db.collection('blood_pressure').add({
      userId: userId,
      systolic: systolic,
      diastolic: diastolic,
      feeling: feelingValue,
      timestamp: timestamp 
    }); 

    console.log(`✅ บันทึกข้อมูลของ ${userId} (ID: ${docRef.id}) เรียบร้อย`);

    const newEntry = {
      id: docRef.id,
      systolic: systolic,
      diastolic: diastolic,
      feeling: feelingValue,
      date: timestamp.toLocaleString('th-TH', { 
        dateStyle: 'short',
        timeStyle: 'short',
      })
    };

    // --- 👈 [ใหม่] เรียกส่ง Discord หลังจากบันทึกสำเร็จ ---
    try {
      const userName = profileNames[userId] || userId;
      
      // ส่งแบบ "Fire and Forget" (ไม่ต้องรอ)
      sendDiscordNotify(userName, systolic, diastolic, feelingValue); 

    } catch (notifyError) {
      console.error('❌ เกิด Error ตอนเตรียมส่ง Discord:', notifyError.message);
    }
    // ---------------------------------------------

    res.status(201).json({
      message: '✅ บันทึกข้อมูลเรียบร้อย!',
      newEntry: newEntry 
    });

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูลลง Firestore:', error.message);
    res.status(500).json({ message: '❌ ไม่สามารถบันทึกข้อมูลลง Firebase ได้' });
  }
});

// --- API อื่นๆ (GET /api/pressures, GET /api/stats, DELETE) ---
// --- (เหมือนเดิมทุกประการ ไม่ต้องแก้ไข) ---

// API สำหรับดึงข้อมูลความดันย้อนหลังตาม userId
app.get('/api/pressures/:userId', async (req, res) => {
  // ... (โค้ดเดิม)
  const { userId } = req.params;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ message: '⚠️ กรุณาระบุ userId ให้ถูกต้อง' });
  }
  try {
    const snapshot = await db.collection('blood_pressure')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc') 
      .limit(10)
      .get();
    if (snapshot.empty) {
      return res.status(200).json([]); 
    }
    const data = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        systolic: d.systolic,
        diastolic: d.diastolic,
        feeling: d.feeling || null,
        date: d.timestamp
          ? d.timestamp.toDate().toLocaleString('th-TH', {
              dateStyle: 'short',
              timeStyle: 'short',
            })
          : 'ไม่ทราบเวลา',
      };
    });
    res.status(200).json(data);
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการดึงข้อมูลย้อนหลัง:', error.message);
    res.status(500).json({ message: '❌ ไม่สามารถดึงข้อมูลจาก Firestore ได้' });
  }
});

//API สำหรับการทำข้อมูลเฉลี่ย (7 อันล่าสุด)
app.get('/api/stats/:userId', async (req, res) => {
  // ... (โค้ดเดิม)
  const { userId } = req.params;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ message: '⚠️ กรุณาระบุ userId ให้ถูกต้อง' });
  }
  try {
    const snapshot = await db.collection('blood_pressure')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(7)
      .get();
    if (snapshot.empty) {
      return res.status(200).json({ avgSys: 0, avgDia: 0, count: 0 });
    }
    let totalSys = 0;
    let totalDia = 0;
    const count = snapshot.docs.length;
    snapshot.docs.forEach(doc => {
      totalSys += doc.data().systolic;
      totalDia += doc.data().diastolic;
    });
    const avgSys = count > 0 ? Math.round(totalSys / count) : 0;
    const avgDia = count > 0 ? Math.round(totalDia / count) : 0;
    res.status(200).json({ avgSys, avgDia, count });
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการคำนวณสถิติ:', error.message);
    if (error.message.includes('index')) {
      console.error('🔥 HINT: คุณอาจจะต้องสร้าง Composite Index ใน Firestore! (สำหรับ userId (asc), timestamp (desc))');
    }
    res.status(500).json({ message: '❌ ไม่สามารถดึงข้อมูลสถิติได้' });
  }
});

// API สำหรับลบข้อมูล
app.delete('/api/pressures/:id', async (req, res) => {
  // ... (โค้ดเดิม)
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: '⚠️ กรุณาระบุ ID ของเอกสาร' });
  }
  try {
    const docRef = db.collection('blood_pressure').doc(id);
    await docRef.delete();
    console.log(`🗑️ ลบข้อมูล (ID: ${id}) เรียบร้อย`);
    res.status(200).json({ message: 'ลบข้อมูลเรียบร้อย' });
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการลบข้อมูล:', error.message);
    res.status(500).json({ message: '❌ ไม่สามารถลบข้อมูลได้' });
}
});


// --- Start Server ---
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));