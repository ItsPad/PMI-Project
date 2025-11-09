// เราไม่ต้องการ dotenv อีกต่อไป เพราะเราจะไม่อ่าน .env
// require('dotenv').config(); 
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();

// --- ตัวแปรสำคัญ ---
const PORT = process.env.PORT || 5000; // Render จะตั้ง PORT ให้เราอัตโนมัติ
const frontendURL = 'https://pmi-project-1.onrender.com';

// --- Firebase Admin SDK Setup (วิธีที่ง่ายที่สุด) ---
// 1. อ่านไฟล์ .json โดยตรง (อ้างอิงจากชื่อไฟล์ในรูป GitHub ของคุณ)
// !!! สำคัญ: ตรวจสอบว่าชื่อไฟล์นี้ตรงกับใน GitHub ของคุณ !!!
const serviceAccount = require('./pmi-project-39c76-firebase-adminsdk-fbsvc-996096f856.json'); 

let db;
try {
  // 2. ใช้ serviceAccount ที่ require เข้ามาโดยตรง
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  db = admin.firestore();
  console.log('✅ เชื่อมต่อ Firebase Firestore เรียบร้อยแล้ว (อ่านจากไฟล์โดยตรง)');

} catch (e) {
  console.error('❌ FATAL ERROR: ไม่สามารถอ่านไฟล์ service account .json', e.message);
  process.exit(1);
}

// --- Middleware ---
app.use(express.json()); // สำหรับอ่าน JSON ใน Body

// --- CORS Setup ---
// อนุญาตทั้ง localhost ตอนพัฒนา และเว็บที่ Deploy แล้ว
const allowedOrigins = [
  frontendURL, 
  'http://localhost:5173' 
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


// --- API Endpoints ---
// (โค้ดส่วน API เหมือนเดิมทุกประการ ไม่มีการเปลี่ยนแปลง)

// API สำหรับเช็คสถานะ Backend
app.get('/', (req, res) => {
  res.send('🎉 PMI Project Backend กำลังทำงาน! (Easy Version)');
});

// API สำหรับบันทึกข้อมูลความดัน
app.post('/api/submit-pressure', async (req, res) => {
  const { systolic, diastolic, userId } = req.body;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ message: '⚠️ กรุณาระบุ userId' });
  }
  if (typeof systolic !== 'number' || typeof diastolic !== 'number' || systolic <= 0 || diastolic <= 0) {
    return res.status(400).json({ message: '⚠️ กรุณาระบุค่า systolic และ diastolic ที่ถูกต้อง' });
  }

  try {
    const timestamp = new Date(); 
    
    const docRef = await db.collection('blood_pressure').add({
      userId: userId,
      systolic: systolic,
      diastolic: diastolic,
      timestamp: timestamp 
    });

    console.log(`✅ บันทึกข้อมูลของ ${userId} (ID: ${docRef.id}) เรียบร้อย`);

    const newEntry = {
      id: docRef.id,
      systolic: systolic,
      diastolic: diastolic,
      date: timestamp.toLocaleString('th-TH', { 
        dateStyle: 'short',
        timeStyle: 'short',
      })
    };

    res.status(201).json({
      message: '✅ บันทึกข้อมูลเรียบร้อย!',
      newEntry: newEntry 
    });

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูลลง Firestore:', error.message);
    res.status(500).json({ message: '❌ ไม่สามารถบันทึกข้อมูลลง Firebase ได้' });
  }
});

// API สำหรับดึงข้อมูลความดันย้อนหลังตาม userId
app.get('/api/pressures/:userId', async (req, res) => {
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

// API สำหรับลบข้อมูล
app.delete('/api/pressures/:id', async (req, res) => {
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