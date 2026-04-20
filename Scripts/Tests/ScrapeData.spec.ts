import {test} from "@playwright/test";
import {LoginPage} from "../Pages/LoginPage";
import {HomePage} from "../Pages/HomePage";
import { BASE_URL } from "../../playwright.config";
import fs from "fs";

test.describe("Scrape Data", () => {
    // Use existing session if available, otherwise start with a fresh session
    test.use({ 
        storageState: fs.existsSync('auth.json') ? 'auth.json' : undefined
    });

    test("Market Data Extraction", async ({page, context}) => {
        // Initialize page objects
        const loginPage = new LoginPage(page, context);
        const homePage = new HomePage(page);

        // Navigate to the market data page and handle CAPTCHA if necessary
        await loginPage.NavigateToMarketData(`${BASE_URL}`);

        // Select filters
        await homePage.SelectTradingModality("Continuous");
        await homePage.SelectDeliveryDate(0); // Select today's date. You can change the number to select a different date (e.g., 1 for tomorrow, -1 for yesterday)
        await homePage.SelectProduct("30min");
        await homePage.SelectView("Table");
        await homePage.SelectMarketArea("GB");

        // Extract and save data to CSV
        await homePage.ExtractTableData();
    });
});