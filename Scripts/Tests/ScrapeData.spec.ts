import {test} from "@playwright/test";
import {LoginPage} from "../Pages/LoginPage";
import {HomePage} from "../Pages/HomePage";
import { BASE_URL } from "../../playwright.config";
import fs from "fs";

test.describe("Scrape Data", () => {
    test.use({ 
        storageState: fs.existsSync('auth.json') ? 'auth.json' : undefined
    });

    test("Market Data Extraction", async ({page, context}) => {
        const loginPage = new LoginPage(page, context);
        const homePage = new HomePage(page);

        await loginPage.NavigateToMarketData(`${BASE_URL}`);
        await homePage.SelectTradingModality("Continuous");
        await homePage.SelectDeliveryDate(0); // Select today's date. You can change the number to select a different date (e.g., 1 for tomorrow, -1 for yesterday)
        await homePage.SelectProduct("30min");
        await homePage.SelectView("Table");
        await homePage.SelectMarketArea("GB");
        await homePage.ExtractTableData();
    });
});