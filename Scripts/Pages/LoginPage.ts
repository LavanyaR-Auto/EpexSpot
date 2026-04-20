import { expect, type Locator, type Page, BrowserContext } from "@playwright/test";
import { shortwait } from "../Utils/Timeouts";

export class LoginPage {
    readonly page: Page;
    readonly context: BrowserContext;
    readonly FilterHeader: Locator;
    readonly beginButton: Locator;

    constructor(page: Page, context: BrowserContext) {
        this.page = page;
        this.context = context;
        this.FilterHeader = page.getByText("Select your filters");
        this.beginButton = page.locator("#amzn-captcha-verify-button");
    }

    async NavigateToMarketData(URL: string) {
        // Navigate to the market data page
        await this.page.goto(URL);

        //Check if session is already loaded and return if it is
        const isInsideApp = await this.FilterHeader.isVisible().catch(() => false);
        if (isInsideApp) {
            console.log("✓ Session loaded, no CAPTCHA");
            return;
        }

        // If not, wait for the CAPTCHA to appear and prompt the user to solve it
        else{
            console.log("CAPTCHA detected, Solve it to continue...");
            await this.beginButton.click();
            console.log("⚠️  SOLVE THE CAPTCHA NOW - 30 seconds!");
            await this.FilterHeader.waitFor({ timeout: 30000 });
            await this.context.storageState({ path: 'auth.json' }); // Save session after CAPTCHA is solved
            await this.page.waitForTimeout(shortwait);
            return;
        }
    }
}