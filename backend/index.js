const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors'); // เพิ่ม CORS เข้ามา!
const app = express();
const PORT = process.env.PORT || 3000; // ใช้ Port จาก Environment Variable หรือ 3000

// --- Firebase Admin SDK Setup ---
// !!! สำคัญ: เปลี่ยนชื่อไฟล์ให้ตรงกับ Service Account Key ของคุณ !!!
const serviceAccount = require('./pmi-project-39c76-firebase-adminsdk-fbsvc-a1d4df47b5.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
console.log('✅ เชื่อมต่อ Firebase Firestore เรียบร้อยแล้ว');

// --- Middleware ---
app.use(express.json()); // สำหรับอ่าน JSON ใน Body ของ Request

// !!! สำคัญ: ตั้งค่า CORS !!!
// เราอนุญาตให้ Frontend ที่รันอยู่ที่ http://localhost:5173 (Default ของ Vite)
// สามารถเรียก API ของเราได้
app.use(cors({
  origin: 'http://localhost:5173', // หรือ URL ของ Frontend จริงๆ เมื่อ Deploy
  methods: ['GET', 'POST'],
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

  // ตรวจสอบข้อมูล
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ message: '⚠️ กรุณาระบุ userId' });
  }
  if (typeof systolic !== 'number' || typeof diastolic !== 'number' || systolic <= 0 || diastolic <= 0) {
    return res.status(400).json({ message: '⚠️ กรุณาระบุค่า systolic และ diastolic ที่ถูกต้อง' });
  }

  try {
    const docRef = await db.collection('blood_pressure').add({
      userId: userId,
      systolic: systolic,
      diastolic: diastolic,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ บันทึกข้อมูลของ ${userId} (ID: ${docRef.id}) เรียบร้อย`);

    res.status(201).json({
      message: '✅ บันทึกข้อมูลเรียบร้อย!',
      id: docRef.id,
      dataReceived: {
        userId: userId,
        systolic: systolic,
        diastolic: diastolic
      }
    });

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูลลง Firestore:', error.message);
    res.status(500).json({ message: '❌ ไม่สามารถบันทึกข้อมูลลง Firebase ได้' });
  }
});

// --- สั่งให้เซิร์ฟเวอร์เริ่มทำงาน ---
app.listen(PORT, () => {
  console.log(`🚀 เซิร์ฟเวอร์ PMI Project Backend เริ่มทำงานแล้วที่ http://localhost:${PORT}`);
});