import { chromium } from "playwright";

const outDir = "C:/Users/andre/AppData/Local/Temp/claude/g--Projects-Cuib-darte/91498e76-e144-431f-9d62-a219802944b2/scratchpad";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
await page.goto("http://localhost:5184/", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);

const eventsBox = await page.locator("#events").boundingBox();
const bookingBox = await page.locator("#reservation").boundingBox();

// Zoom tightly on the seam between Events and Booking: bottom of events
// through the first ~250px of Booking, so any bleed at the TOP of Booking
// (the section AFTER the seam) is visible.
if (eventsBox) {
  const y = eventsBox.y + eventsBox.height - 150;
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${outDir}/seam1-tight.png`, clip: { x: 0, y: 0, width: 1440, height: 500 } });
}

// Zoom tightly on the seam between Booking and Footer.
const footerBox = await page.locator("footer").boundingBox();
if (footerBox) {
  const y = footerBox.y - 150;
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${outDir}/seam2-tight.png`, clip: { x: 0, y: 0, width: 1440, height: 500 } });
}

await browser.close();
