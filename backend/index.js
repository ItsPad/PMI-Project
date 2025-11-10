// เราไม่ต้องการ dotenv อีกต่อไป เพราะเราจะไม่อ่าน .env
// require('dotenv').config(); 
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();

// --- ตัวแปรสำคัญ ---
const PORT = process.env.PORT || 3000; // Render จะตั้ง PORT ให้เราอัตโนมัติ
const frontendURL = 'https://pmi-project-frontend.onrender.com';

let db;
try {
  // 1. ดึงค่า Key ที่เป็น String จาก Environment Variable
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountString) {
    throw new Error('ไม่พบ FIREBASE_SERVICE_ACCOUNT ใน Environment Variables');
  }

  // 2. แปลง String กลับเป็น Object ที่ Firebase อ่านได้
  const serviceAccount = JSON.parse(serviceAccountString);

  // 3. เชื่อมต่อ Firebase โดยใช้ Object นั้น
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
  const { systolic, diastolic, userId, feeling } = req.body;

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
      feeling: feeling,
      timestamp: timestamp 
    }); 

    console.log(`✅ บันทึกข้อมูลของ ${userId} (ID: ${docRef.id}) เรียบร้อย`);

    const newEntry = {
      id: docRef.id,
      systolic: systolic,
      diastolic: diastolic,
      feeling: feeling,
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
        feeling: d.feeling,
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

//API สำหรับการทำข้อมูลเฉลี่ย7วัน
app.get('/api/stats/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ message: '⚠️ กรุณาระบุ userId ให้ถูกต้อง' });
  }

  try {
    // 1. คำนวณวันที่ 7 วันก่อน
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0); // 👈 เริ่มนับจากเที่ยงคืนของ 7 วันก่อน

    // 2. Query ข้อมูลทั้งหมดใน 7 วันที่ผ่านมา
    const snapshot = await db.collection('blood_pressure')
      .where('userId', '==', userId)
      .where('timestamp', '>=', sevenDaysAgo) // 👈 ดึงเฉพาะข้อมูลที่ใหม่กว่า 7 วันที่แล้ว
      .get();

    if (snapshot.empty) {
      // ไม่มีข้อมูลใน 7 วัน
      return res.status(200).json({ avgSys: 0, avgDia: 0, count: 0 });
    }

    // 3. คำนวณค่าเฉลี่ย
    let totalSys = 0;
    let totalDia = 0;
    const count = snapshot.docs.length;

    snapshot.docs.forEach(doc => {
      totalSys += doc.data().systolic;
      totalDia += doc.data().diastolic;
    });

    const avgSys = count > 0 ? Math.round(totalSys / count) : 0;
    const avgDia = count > 0 ? Math.round(totalDia / count) : 0;

    // 4. ส่งค่าเฉลี่ยกลับไป
    res.status(200).json({ avgSys, avgDia, count });

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการคำนวณสถิติ:', error.message);
    res.status(500).json({ message: '❌ ไม่สามารถดึงข้อมูลสถิติได้' });
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