require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();

// --- ตัวแปรสำคัญ ---
const PORT = process.env.PORT || 5000; // แก้ไข: ลบตัวที่ซ้ำซ้อนด้านบนออก
const frontendURL = 'https://pmi-project-1.onrender.com';

// --- Firebase Admin SDK Setup (แก้ไขใหม่ทั้งหมด) ---
// อ่านค่า JSON ทั้งหมดจาก Environment Variable ที่ชื่อ "FIREBASE_SERVICE_ACCOUNT"
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountJson) {
  console.error('❌ FATAL ERROR: ไม่ได้ตั้งค่า Environment Variable "FIREBASE_SERVICE_ACCOUNT"');
  // ถ้าไม่มี Key นี้ ให้หยุดการทำงานทันที
  process.exit(1);
}

let db;
try {
  // แปลง String JSON จาก Environment Variable กลับเป็น Object
  const serviceAccount = JSON.parse(serviceAccountJson);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  db = admin.firestore();
  console.log('✅ เชื่อมต่อ Firebase Firestore เรียบร้อยแล้ว');

} catch (e) {
  console.error('❌ FATAL ERROR: ไม่สามารถ parse JSON จาก FIREBASE_SERVICE_ACCOUNT', e.message);
  process.exit(1);
}

// --- Middleware ---
app.use(express.json()); // สำหรับอ่าน JSON ใน Body

// --- CORS Setup (แก้ไขใหม่) ---
// รายการ URL ที่อนุญาตให้เชื่อมต่อ
const allowedOrigins = [
  frontendURL, // URL ของ Frontend ที่ Deploy แล้ว
  'http://localhost:5173' // URL ของ Frontend ตอนพัฒนา (Vite)
];

app.use(cors({
  origin: function (origin, callback) {
    // อนุญาตถ้า Request มาจากหนึ่งใน allowedOrigins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: ไม่อนุญาตให้เชื่อมต่อจาก Origin นี้'));
    }
  },
  methods: ['GET', 'POST', 'DELETE'], // อนุญาต Method DELETE ด้วย
  allowedHeaders: ['Content-Type'],
}));


// --- API Endpoints ---

// API สำหรับเช็คสถานะ Backend
app.get('/', (req, res) => {
  res.send('🎉 PMI Project Backend กำลังทำงาน!');
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
    const timestamp = new Date(); // สร้าง timestamp ทันที
    
    const docRef = await db.collection('blood_pressure').add({
      userId: userId,
      systolic: systolic,
      diastolic: diastolic,
      timestamp: timestamp // บันทึกเป็น Timestamp Object
    });

    console.log(`✅ บันทึกข้อมูลของ ${userId} (ID: ${docRef.id}) เรียบร้อย`);

    // (แก้ไข) สร้าง object ที่จะส่งกลับให้ Frontend (ให้ตรงกับที่ history คาดหวัง)
    const newEntry = {
      id: docRef.id,
      systolic: systolic,
      diastolic: diastolic,
      date: timestamp.toLocaleString('th-TH', { // แปลงเป็น String ที่อ่านง่าย
        dateStyle: 'short',
        timeStyle: 'short',
      })
    };

    res.status(201).json({
      message: '✅ บันทึกข้อมูลเรียบร้อย!',
      newEntry: newEntry // (แก้ไข) ส่ง newEntry กลับไปให้ Frontend ใช้ได้เลย
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
      .orderBy('timestamp', 'desc') // เรียงจากใหม่ไปเก่า
      .limit(10) // ดึงมาแค่ 10 รายการล่าสุด
      .get();

    if (snapshot.empty) {
      return res.status(200).json([]); // ถ้าไม่มีข้อมูลเลยก็ส่ง array ว่าง
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

// (ใหม่) API สำหรับลบข้อมูล
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