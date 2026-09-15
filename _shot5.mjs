import { chromium } from "playwright";

const outDir = "C:/Users/andre/AppData/Local/Temp/claude/g--Projects-Cuib-darte/91498e76-e144-431f-9d62-a219802944b2/scratchpad";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
await page.goto("http://localhost:5184/", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);

const eventsBox = await page.locator("#events").boundingBox();
const footerBox = await page.locator("footer").boundingBox();

// Non-fullPage screenshot: single viewport capture, no tile stitching.
await page.evaluate((y) => window.scrollTo(0, y), eventsBox.y + eventsBox.height - 600);
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}/single-viewport-seam1.png` });

await page.evaluate((y) => window.scrollTo(0, y), footerBox.y - 600);
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}/single-viewport-seam2.png` });

await browser.close();
