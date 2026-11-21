const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FFMPEG_PATH = 'C:\\Program Files\\BlueStacks_nxt\\ffmpeg.exe';
const FRAMES_DIR = path.join(__dirname, 'temp_frames');
const OUTPUT_VIDEO = path.join(__dirname, 'lms_project_walkthrough.mp4');
const TARGET_DURATION_SEC = 60; // 1-minute video

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function smoothScroll(page, distance, duration) {
  const steps = 25;
  const stepDistance = distance / steps;
  const stepDelay = duration / steps;
  for (let i = 0; i < steps; i++) {
    await page.evaluate((d) => window.scrollBy({ top: d, behavior: 'smooth' }), stepDistance);
    await sleep(stepDelay);
  }
}

async function typeRealistic(page, selector, text, delayMs = 45) {
  try {
    await page.waitForSelector(selector, { timeout: 3000 });
    await page.focus(selector);
    for (const char of text) {
      await page.keyboard.type(char, { delay: delayMs });
    }
  } catch (e) {
    console.warn(`Could not type into ${selector}:`, e.message);
  }
}

async function clickByText(page, tag, text) {
  try {
    return await page.evaluate((tag, text) => {
      const elements = Array.from(document.querySelectorAll(tag));
      const target = elements.find(el => el.textContent.trim().toLowerCase().includes(text.toLowerCase()));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.click();
        return true;
      }
      return false;
    }, tag, text);
  } catch (e) {
    return false;
  }
}

async function main() {
  console.log('[1/5] Preparing frames directory...');
  if (fs.existsSync(FRAMES_DIR)) {
    fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  console.log('[2/5] Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,720']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  let frameCount = 0;
  const cdp = await page.target().createCDPSession();

  cdp.on('Page.screencastFrame', async ({ data, sessionId }) => {
    frameCount++;
    const framePath = path.join(FRAMES_DIR, `frame_${String(frameCount).padStart(5, '0')}.jpg`);
    fs.writeFileSync(framePath, Buffer.from(data, 'base64'));
    try {
      await cdp.send('Page.screencastFrameAck', { sessionId });
    } catch (e) {}
  });

  console.log(`[3/5] Starting 60-second video capture...`);
  await cdp.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 85,
    everyNthFrame: 1
  });

  const startTime = Date.now();

  try {
    // ----------------------------------------------------
    // SCENE 1: Homepage & Login (0s - 8s)
    // ----------------------------------------------------
    console.log('Scene 1: Login Portal & Branding');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await sleep(2000);

    await typeRealistic(page, 'input[name="email"]', 'admin@lms.edu', 40);
    await sleep(400);
    await typeRealistic(page, 'input[name="password"]', 'password', 40);
    await sleep(800);
    await page.click('button[type="submit"]');
    await sleep(2500);

    // ----------------------------------------------------
    // SCENE 2: Admin Dashboard & Management (8s - 24s)
    // ----------------------------------------------------
    console.log('Scene 2: Admin Management & Tracking');
    // Scroll stats
    await smoothScroll(page, 300, 1200);
    await sleep(1000);
    await smoothScroll(page, -300, 1000);
    await sleep(800);

    // View Faculty Tab
    await clickByText(page, 'button', 'Faculty');
    await sleep(1800);
    await smoothScroll(page, 200, 800);
    await sleep(800);
    await smoothScroll(page, -200, 800);

    // View Student Tab
    await clickByText(page, 'button', 'Student');
    await sleep(1800);

    // View Tracking Tab
    await clickByText(page, 'button', 'Tracking');
    await sleep(1500);
    // Select course to show syllabus tracking and marks
    await page.evaluate(() => {
      const select = document.querySelector('select');
      if (select && select.options.length > 1) {
        select.selectedIndex = 1;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await sleep(2000);
    await smoothScroll(page, 350, 1200);
    await sleep(1200);
    await smoothScroll(page, -350, 1000);
    await sleep(800);

    // ----------------------------------------------------
    // SCENE 3: Local Ollama AI Chatbot Demo (24s - 38s)
    // ----------------------------------------------------
    console.log('Scene 3: Local Ollama AI Chatbot');
    // Open floating chat widget
    await page.evaluate(() => {
      const btn = document.querySelector('button.fixed.bottom-6.right-6');
      if (btn) btn.click();
    });
    await sleep(1800);

    // Type query to Ollama
    await typeRealistic(page, 'input[placeholder*="Ask"]', 'What are the departments and how many are there?', 35);
    await sleep(600);
    await page.keyboard.press('Enter');

    // Wait for real-time Ollama response to render
    await sleep(6000);

    // Close chatbot
    await page.evaluate(() => {
      const headerBtns = Array.from(document.querySelectorAll('button'));
      const closeSvgBtn = headerBtns.find(b => b.querySelector('path[d*="M6 18L18 6"]'));
      if (closeSvgBtn) closeSvgBtn.click();
    });
    await sleep(1200);

    // ----------------------------------------------------
    // SCENE 4: Faculty / Instructor Dashboard (38s - 49s)
    // ----------------------------------------------------
    console.log('Scene 4: Faculty Course Management');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await sleep(1200);

    await typeRealistic(page, 'input[name="email"]', 'praveen@lms.edu', 40);
    await sleep(300);
    await typeRealistic(page, 'input[name="password"]', 'password123', 40);
    await sleep(600);
    await page.click('button[type="submit"]');
    await sleep(2500);

    // Scroll courses and view modules
    await smoothScroll(page, 300, 1200);
    await sleep(1500);
    await smoothScroll(page, -300, 1200);
    await sleep(1000);

    // Click on first course
    const courseLink = await page.$('a[href*="/course/"]');
    if (courseLink) {
      await courseLink.click();
      await sleep(2500);
      await smoothScroll(page, 400, 1200);
      await sleep(1200);
      await smoothScroll(page, -400, 1000);
    }

    // ----------------------------------------------------
    // SCENE 5: Student Portal & Achievements (49s - 60s)
    // ----------------------------------------------------
    console.log('Scene 5: Student Portal & Achievements');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await sleep(1200);

    await typeRealistic(page, 'input[name="email"]', 'student@lms.edu', 40);
    await sleep(300);
    await typeRealistic(page, 'input[name="password"]', 'password123', 40);
    await sleep(600);
    await page.click('button[type="submit"]');
    await sleep(2500);

    // Scroll through student dashboard modules
    await smoothScroll(page, 300, 1200);
    await sleep(1000);

    // Click on Achievements tab
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const achv = links.find(l => l.textContent.includes('Achievements'));
      if (achv) achv.click();
    });
    await sleep(2500);

    // Showcase Achievements certificates
    await smoothScroll(page, 300, 1200);
    await sleep(1500);
    await smoothScroll(page, -300, 1200);

    // Ensure total duration reaches exactly 60 seconds
    const elapsed = (Date.now() - startTime) / 1000;
    if (elapsed < TARGET_DURATION_SEC) {
      const waitRemaining = (TARGET_DURATION_SEC - elapsed);
      console.log(`Holding final view for ${waitRemaining.toFixed(1)}s to complete 1 minute...`);
      await sleep(waitRemaining * 1000);
    }

  } catch (err) {
    console.error('Error during recording:', err);
  } finally {
    console.log('[4/5] Stopping screencast...');
    try {
      await cdp.send('Page.stopScreencast');
    } catch (e) {}
    await browser.close();
  }

  const durationSec = (Date.now() - startTime) / 1000;
  console.log(`Captured ${frameCount} frames over ${durationSec.toFixed(1)}s.`);

  if (frameCount === 0) {
    console.error('No frames captured!');
    return;
  }

  // Calculate framerate to produce exact 60-second video
  const fps = (frameCount / TARGET_DURATION_SEC).toFixed(2);
  console.log(`[5/5] Compiling 60s MP4 with FFmpeg at ${fps} fps...`);
  const ffmpegCmd = `"${FFMPEG_PATH}" -framerate ${fps} -i "${FRAMES_DIR}\\frame_%05d.jpg" -c:v libopenh264 -pix_fmt yuv420p "${OUTPUT_VIDEO}" -y`;

  execSync(ffmpegCmd, { stdio: 'inherit' });

  // Cleanup frames
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log('Video recording completed successfully!');
  console.log('Saved to:', OUTPUT_VIDEO);
}

main().catch(console.error);
