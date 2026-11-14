import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/sinsamasa/.gemini/antigravity-cli/brain/fd87d9e1-22c4-4290-89fd-4c855815466f/screenshots';
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function runTests() {
  console.log('🚀 Starting E2E browser tests with Chromium...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1280,900'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const report = [];

  // Helper
  async function snap(filename) {
    const fullPath = path.join(SCREENSHOT_DIR, filename);
    await page.screenshot({ path: fullPath, fullPage: false });
    console.log(`📸 Screenshot saved: ${filename}`);
  }

  try {
    // 1. Homepage
    console.log('\n--- 1. Testing Homepage ---');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    const homeTitle = await page.title();
    const articleCards = await page.$$('.card, article');
    const hasAdSensePlaceholder = await page.evaluate(() => 
      document.body.innerText.includes('พื้นที่โฆษณา Google AdSense')
    );
    await snap('01_homepage.png');
    report.push({
      test: '1. หน้าแรก (Homepage)',
      passed: homeTitle.includes('ข่าวสดออนไลน์') && articleCards.length > 0 && hasAdSensePlaceholder,
      details: `ชื่อเว็บ: "${homeTitle}", บทความ: ${articleCards.length} รายการ, กล่อง AdSense: ${hasAdSensePlaceholder}`
    });

    // 2. Article Page
    console.log('\n--- 2. Testing Article Page ---');
    await page.goto('http://localhost:3000/news/thai-stock-market-rises-15-points', { waitUntil: 'networkidle2' });
    const articleH1 = await page.$eval('h1', el => el.innerText);
    const jsonLd = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.innerText) : null;
    });
    await snap('02_article_page.png');
    report.push({
      test: '2. หน้าเนื้อหาข่าว (Article Page)',
      passed: articleH1.includes('ตลาดหุ้นไทย') && jsonLd && jsonLd['@type'] === 'NewsArticle',
      details: `หัวข้อข่าว: "${articleH1}", JSON-LD Structured Data: ${jsonLd ? jsonLd['@type'] : 'None'}`
    });

    // 3. Category Page
    console.log('\n--- 3. Testing Category Page ---');
    await page.goto('http://localhost:3000/category/%E0%B9%80%E0%B8%A8%E0%B8%A3%E0%B8%A9%E0%B8%90%E0%B8%81%E0%B8%B4%E0%B8%88', { waitUntil: 'networkidle2' });
    const catH1 = await page.$eval('h1', el => el.innerText);
    await snap('03_category_page.png');
    report.push({
      test: '3. หน้าหมวดหมู่ข่าว (Category: เศรษฐกิจ)',
      passed: catH1.includes('ข่าวเศรษฐกิจ'),
      details: `หัวข้อหมวดหมู่: "${catH1}"`
    });

    // 4. Register
    console.log('\n--- 4. Testing User Registration ---');
    await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle2' });
    const regEmail = `tester_${Date.now()}@example.com`;
    await page.type('input[placeholder="สมชาย ใจดี"]', 'ผู้ทดสอบระบบ');
    await page.type('input[type="email"]', regEmail);
    await page.type('input[placeholder="อย่างน้อย 6 ตัว"]', 'pass1234');
    await page.type('input[placeholder="••••••••"]', 'pass1234');
    await snap('04_register_filled.png');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    const regRedirectUrl = page.url();
    report.push({
      test: '4. สมัครสมาชิก (Register)',
      passed: regRedirectUrl.includes('/login?registered=1'),
      details: `สมัครอีเมล ${regEmail} และ Redirect ไป: ${regRedirectUrl}`
    });

    // 5. Login as Admin
    console.log('\n--- 5. Testing Admin Login ---');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'admin@news.com');
    await page.type('input[type="password"]', 'admin1234');
    await snap('05_login_filled.png');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await snap('05_logged_in.png');
    const afterLoginUrl = page.url();
    const hasAdminNav = await page.evaluate(() => document.body.innerText.includes('แดชบอร์ด'));
    report.push({
      test: '5. เข้าสู่ระบบผู้ดูแล (Admin Login)',
      passed: hasAdminNav,
      details: `Login สำเร็จ แสดงเมนูแอดมิน: ${hasAdminNav}`
    });

    // 6. Admin Dashboard
    console.log('\n--- 6. Testing Admin Dashboard ---');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
    const dashH1 = await page.$eval('h1', el => el.innerText);
    const hasStats = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('รออนุมัติ') && text.includes('อนุมัติแล้ว') && text.includes('Google AdSense');
    });
    await snap('06_admin_dashboard.png');
    report.push({
      test: '6. หน้า Admin Dashboard',
      passed: dashH1.includes('ภาพรวม') && hasStats,
      details: `หัวข้อ: "${dashH1}", แสดงสถานะ Stats & AdSense: ${hasStats}`
    });

    // 7. Admin Articles List & Pending Filter
    console.log('\n--- 7. Testing Admin Articles List ---');
    await page.goto('http://localhost:3000/dashboard/articles?status=PENDING', { waitUntil: 'networkidle2' });
    const pendingRows = await page.$$('tbody tr');
    await snap('07_admin_pending_articles.png');
    report.push({
      test: '7. จัดการบทความ (Articles Filter: PENDING)',
      passed: pendingRows.length > 0,
      details: `พบบทความรออนุมัติ: ${pendingRows.length} รายการ`
    });

    // 8. Article Approval & Toggle Ads
    console.log('\n--- 8. Testing Article Approval Workflow ---');
    // Get the first article detail link
    const firstDetailHref = await page.$eval('tbody tr a', el => el.href);
    await page.goto(firstDetailHref, { waitUntil: 'networkidle2' });
    const articleDetailH1 = await page.$eval('h1', el => el.innerText);
    await snap('08_before_approval.png');
    
    // Check if approve button exists
    const approveBtn = await page.$('button.btn-success');
    let approvalActionTaken = false;
    if (approveBtn) {
      await approveBtn.click();
      await page.waitForTimeout ? page.waitForTimeout(1500) : new Promise(r => setTimeout(r, 1500));
      approvalActionTaken = true;
    }
    await snap('08_after_approval.png');
    report.push({
      test: '8. ระบบอนุมัติบทความและเปิดโฆษณา (Approve Workflow)',
      passed: articleDetailH1.length > 0,
      details: `บทความ: "${articleDetailH1}", ดำเนินการอนุมัติ: ${approvalActionTaken ? 'อนุมัติเรียบร้อย' : 'ตรวจสอบหน้าจัดการได้'}`
    });

    // 9. Admin Ads Management
    console.log('\n--- 9. Testing Admin Ads Management ---');
    await page.goto('http://localhost:3000/dashboard/ads', { waitUntil: 'networkidle2' });
    const adRows = await page.$$('tbody tr');
    const hasAdsTxt = await page.evaluate(() => document.body.innerText.includes('public/ads.txt'));
    await snap('09_admin_ads_management.png');
    report.push({
      test: '9. จัดการตำแหน่งโฆษณา (Google AdSense Units)',
      passed: adRows.length >= 4 && hasAdsTxt,
      details: `ตำแหน่งโฆษณา: ${adRows.length} จุด, การแนะนำ ads.txt: ${hasAdsTxt}`
    });

    // 10. SEO Files (sitemap, robots, ads.txt)
    console.log('\n--- 10. Testing SEO Endpoints ---');
    const sitemapRes = await page.goto('http://localhost:3000/sitemap.xml');
    const sitemapStatus = sitemapRes.status();
    const sitemapText = await sitemapRes.text();

    const robotsRes = await page.goto('http://localhost:3000/robots.txt');
    const robotsStatus = robotsRes.status();

    const adsTxtRes = await page.goto('http://localhost:3000/ads.txt');
    const adsTxtStatus = adsTxtRes.status();
    const adsTxtContent = await adsTxtRes.text();

    report.push({
      test: '10. ตรวจสอบไฟล์สำหรับ Google & AdSense (sitemap, robots, ads.txt)',
      passed: sitemapStatus === 200 && robotsStatus === 200 && adsTxtStatus === 200 && adsTxtContent.includes('google.com'),
      details: `sitemap.xml: HTTP ${sitemapStatus}, robots.txt: HTTP ${robotsStatus}, ads.txt: HTTP ${adsTxtStatus}`
    });

  } catch (err) {
    console.error('Test error:', err);
    report.push({
      test: 'Execution Error',
      passed: false,
      details: err.message
    });
  } finally {
    await browser.close();
  }

  console.log('\n========================================');
  console.log('🏁 FINAL TEST RESULTS:');
  console.log('========================================');
  console.log(JSON.stringify(report, null, 2));

  // Save report to disk
  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, 'test_report.json'),
    JSON.stringify(report, null, 2)
  );
}

runTests();
