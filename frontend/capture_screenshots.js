import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, '..', 'assets', 'screenshots');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

(async () => {
    console.log("Launching Edge headless to capture screenshots...");
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    
    const browser = await puppeteer.launch({
        executablePath: edgePath,
        headless: true,
        defaultViewport: { width: 1440, height: 900 }
    });

    const page = await browser.newPage();

    // 1. Landing Page
    console.log("Capturing 01_landing_page.png...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outputDir, '01_landing_page.png') });

    // 2. Login Page
    console.log("Navigating to Login Page...");
    const enterBtn = await page.$('button');
    if (enterBtn) {
        await enterBtn.click();
        await new Promise(r => setTimeout(r, 1500));
    }
    await page.screenshot({ path: path.join(outputDir, '02_login_page.png') });

    // 3. Login & Dashboard Page
    console.log("Submitting login and capturing 03_dashboard_page.png...");
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outputDir, '03_dashboard_page.png') });

    // Helper to click sidebar nav by text
    const clickSidebar = async (label) => {
        const items = await page.$$('aside nav div');
        for (const item of items) {
            const text = await page.evaluate(el => el.textContent, item);
            if (text.toLowerCase().includes(label.toLowerCase())) {
                await item.click();
                await new Promise(r => setTimeout(r, 1500));
                return true;
            }
        }
        return false;
    };

    // 4. Melanoma Diagnostics / Predictor
    console.log("Capturing 04_predictor_page.png...");
    await clickSidebar('Melanoma Diagnostics');
    await page.screenshot({ path: path.join(outputDir, '04_predictor_page.png') });

    // 5. Federated Network / FL Simulation
    console.log("Capturing 05_fl_simulation_page.png...");
    await clickSidebar('Federated Network');
    await page.screenshot({ path: path.join(outputDir, '05_fl_simulation_page.png') });

    // 6. Clinical Safety & XAI / Architecture
    console.log("Capturing 06_architecture_page.png...");
    await clickSidebar('Clinical Safety');
    await page.screenshot({ path: path.join(outputDir, '06_architecture_page.png') });

    // 7. Patient Consultation Records / Clinical Data
    console.log("Capturing 07_clinical_data_page.png...");
    await clickSidebar('Patient Records');
    await page.screenshot({ path: path.join(outputDir, '07_clinical_data_page.png') });

    // 8. Clinic Settings / System Config
    console.log("Capturing 08_system_config_page.png...");
    await clickSidebar('Clinic Settings');
    await page.screenshot({ path: path.join(outputDir, '08_system_config_page.png') });

    console.log("All screenshots successfully captured and saved to assets/screenshots/!");
    await browser.close();
})();
