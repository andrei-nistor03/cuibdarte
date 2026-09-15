import { chromium } from "playwright";

const outDir = "C:/Users/andre/AppData/Local/Temp/claude/g--Projects-Cuib-darte/91498e76-e144-431f-9d62-a219802944b2/scratchpad";

const browser = await chromium.launch();

for (const dpr of [1.25, 1.5, 2]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: dpr });
  await page.goto("http://localhost:5184/", { waitUntil: "networkidle" });
  await page.waitForTimeout(3500);

  const eventsBox = await page.locator("#events").boundingBox();
  await page.evaluate((y) => window.scrollTo(0, y), eventsBox.y + eventsBox.height - 200);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${outDir}/dpr-${dpr}-seam1.png`, clip: { x: 0, y: 0, width: 1440, height: 400 } });
  await page.close();
}

await browser.close();
