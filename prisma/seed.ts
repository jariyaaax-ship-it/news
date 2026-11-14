import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('admin1234', 12);
  const admin = await db.user.upsert({
    where: { email: 'admin@news.com' },
    update: {},
    create: {
      name: 'ผู้ดูแลระบบ',
      email: 'admin@news.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Writer user
  const writerPassword = await bcrypt.hash('writer1234', 12);
  const writer = await db.user.upsert({
    where: { email: 'writer@news.com' },
    update: {},
    create: {
      name: 'นักข่าวทดสอบ',
      email: 'writer@news.com',
      password: writerPassword,
      role: 'WRITER',
    },
  });
  console.log('✅ Writer created:', writer.email);

  // Sample articles
  const articles = [
    {
      title: 'ตลาดหุ้นไทยปรับตัวเพิ่มขึ้น 15 จุด ท่ามกลางกระแสเงินทุนไหลเข้า',
      slug: 'thai-stock-market-rises-15-points',
      excerpt: 'ตลาดหลักทรัพย์แห่งประเทศไทยปรับตัวเพิ่มขึ้น 15 จุด จากกระแสเงินทุนต่างชาติที่ไหลเข้ามาในภูมิภาค',
      content: '<p>ตลาดหลักทรัพย์แห่งประเทศไทย (SET) ปรับตัวเพิ่มขึ้น 15 จุด หรือ 1.2% ในวันนี้ ท่ามกลางกระแสเงินทุนต่างชาติที่ไหลเข้ามาในภูมิภาคเอเชียตะวันออกเฉียงใต้</p><h2>ปัจจัยหนุน</h2><p>นักวิเคราะห์ระบุว่า การปรับตัวขึ้นในวันนี้มาจากหลายปัจจัย ทั้งข้อมูลเศรษฐกิจที่แข็งแกร่ง และความคาดหวังว่าธนาคารกลางสหรัฐจะลดดอกเบี้ย</p><p>หุ้นกลุ่มธนาคารและพลังงานนำการขึ้น โดยเฉพาะหุ้นในกลุ่มธนาคารขนาดใหญ่ที่ปรับตัวขึ้นเฉลี่ย 2-3%</p>',
      category: 'เศรษฐกิจ',
      status: 'APPROVED' as const,
      showAds: true,
    },
    {
      title: 'ทีมชาติไทยเตรียมลงสนามฟุตบอลโลกรอบคัดเลือก พบ เวียดนาม',
      slug: 'thai-national-team-world-cup-qualifier-vietnam',
      excerpt: 'ทีมชาติไทยเตรียมความพร้อมอย่างเต็มที่ก่อนลงสนามในศึกฟุตบอลโลก 2026 รอบคัดเลือก',
      content: '<p>ทีมชาติไทยกำลังเตรียมความพร้อมอย่างเต็มที่สำหรับการแข่งขันฟุตบอลโลก 2026 รอบคัดเลือก ซึ่งจะพบกับทีมชาติเวียดนาม</p><h2>แนวรับที่แข็งแกร่ง</h2><p>โค้ชชาวญี่ปุ่นได้วางแผนยุทธวิธีที่เน้นการป้องกันที่มั่นคง พร้อมทั้งโจมตีแบบสายฟ้าแลบในโอกาสที่เหมาะสม</p>',
      category: 'กีฬา',
      status: 'APPROVED' as const,
      showAds: true,
    },
    {
      title: 'AI เปลี่ยนโลก: อนาคตของการทำงานในยุคปัญญาประดิษฐ์',
      slug: 'ai-changes-world-future-of-work',
      excerpt: 'ปัญญาประดิษฐ์กำลังเปลี่ยนแปลงรูปแบบการทำงานอย่างรวดเร็ว บางอาชีพหายไป บางอาชีพใหม่เกิดขึ้น',
      content: '<p>ปัญญาประดิษฐ์ (AI) กำลังปฏิวัติโลกของการทำงานในแบบที่ไม่เคยเกิดขึ้นมาก่อน รายงานจาก World Economic Forum ระบุว่าภายในปี 2030 งาน 85 ล้านตำแหน่งจะหายไป แต่จะมีงานใหม่เกิดขึ้น 97 ล้านตำแหน่ง</p><h2>อาชีพที่ได้รับผลกระทบ</h2><p>งานที่ต้องใช้การทำซ้ำ เช่น การป้อนข้อมูล การตรวจสอบเอกสาร และงานบัญชีพื้นฐาน มีแนวโน้มจะถูกแทนที่ด้วย AI</p><h2>ทักษะแห่งอนาคต</h2><p>ทักษะที่ต้องการมากที่สุดคือ ความคิดสร้างสรรค์ การวิเคราะห์เชิงวิพากษ์ และความเข้าใจในเทคโนโลยี AI</p>',
      category: 'เทคโนโลยี',
      status: 'APPROVED' as const,
      showAds: false,
    },
    {
      title: 'ผลการเลือกตั้งท้องถิ่น: พรรค ก. คว้าเสียงข้างมากใน 5 จังหวัด',
      slug: 'local-election-party-wins-5-provinces',
      excerpt: 'ผลการนับคะแนนเลือกตั้งท้องถิ่นอย่างไม่เป็นทางการ พรรค ก. นำในหลายเขต',
      content: '<p>ผลการเลือกตั้งท้องถิ่นอย่างไม่เป็นทางการแสดงให้เห็นว่า พรรค ก. ได้รับคะแนนเสียงข้างมากใน 5 จังหวัดหลัก</p><p>การเลือกตั้งครั้งนี้มีผู้ออกมาใช้สิทธิ์สูงถึง 72% ซึ่งสูงกว่าครั้งที่ผ่านมา</p>',
      category: 'การเมือง',
      status: 'PENDING' as const,
      showAds: false,
    },
    {
      title: 'ดารานักแสดงชื่อดังประกาศแต่งงาน แฟนคลับแห่อวยพร',
      slug: 'celebrity-announces-marriage',
      excerpt: 'นักแสดงชื่อดังประกาศข่าวดีว่าเตรียมจะแต่งงานกับคู่รัก',
      content: '<p>นักแสดงชื่อดังได้ประกาศข่าวดีผ่านโซเชียลมีเดียว่าเตรียมจะแต่งงานกับคู่รักในเร็ว ๆ นี้</p><p>แฟนคลับจากทั่วประเทศต่างส่งคำอวยพรและแสดงความยินดีเป็นจำนวนมาก</p>',
      category: 'บันเทิง',
      status: 'APPROVED' as const,
      showAds: true,
    },
    {
      title: '5 วิธีดูแลสุขภาพในช่วงอากาศเปลี่ยน ป้องกันไข้หวัด',
      slug: 'health-tips-prevent-cold-weather-change',
      excerpt: 'ช่วงอากาศเปลี่ยนแปลงบ่อยทำให้ร่างกายอ่อนแอ ต่อไปนี้คือ 5 วิธีดูแลตัวเองให้ห่างไกลโรค',
      content: '<p>ในช่วงที่อากาศเปลี่ยนแปลง ร่างกายของเรามักต้องปรับตัวอยู่บ่อยครั้ง ทำให้ภูมิคุ้มกันอ่อนแอและเสี่ยงต่อการเป็นไข้หวัด</p><h2>1. ดื่มน้ำมาก ๆ</h2><p>การดื่มน้ำ 8-10 แก้วต่อวัน ช่วยให้ร่างกายชุ่มชื้นและระบบภูมิคุ้มกันทำงานได้ดีขึ้น</p><h2>2. นอนหลับพักผ่อนให้เพียงพอ</h2><p>การนอนหลับ 7-8 ชั่วโมงต่อคืน เป็นสิ่งจำเป็นสำหรับการฟื้นฟูร่างกาย</p><h2>3. รับประทานอาหารที่มีประโยชน์</h2><p>เน้นอาหารที่มีวิตามิน C และ D เพื่อเสริมภูมิคุ้มกัน</p>',
      category: 'สุขภาพ',
      status: 'APPROVED' as const,
      showAds: true,
    },
  ];

  for (const article of articles) {
    await db.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        ...article,
        authorId: writer.id,
        publishedAt: article.status === 'APPROVED' ? new Date() : null,
      },
    });
  }
  console.log(`✅ ${articles.length} articles seeded`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
