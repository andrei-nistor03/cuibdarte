import { chromium } from "playwright";

const outDir = "C:/Users/andre/AppData/Local/Temp/claude/g--Projects-Cuib-darte/91498e76-e144-431f-9d62-a219802944b2/scratchpad";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
await page.goto("http://localhost:5184/", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);

// Hide Booking's own ambient-gradient div and grain-overlay div to isolate
await page.addStyleTag({
  content: `
    #reservation > div:nth-child(1) { display: none !important; }
    #reservation > div:nth-child(2) { display: none !important; }
  `,
});
await page.waitForTimeout(200);
await page.screenshot({ path: `${outDir}/full-desktop-3.png`, fullPage: true });

await browser.close();
