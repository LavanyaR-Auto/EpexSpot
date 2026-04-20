import { expect, type Locator, type Page} from "@playwright/test";
import { shortwait } from "../Utils/Timeouts";
import * as fs from 'fs';
import { GetFormattedDate } from "../Utils/DateUtils";
import { time } from "console";

export class HomePage {
    readonly page: Page;
    readonly TradingModalityAuction: Locator;
    readonly TradingModalityContinous: Locator;
    readonly TradingModalityCapacityAuction: Locator;
    readonly TradingModalityGuranteesOfOrigin: Locator;
    readonly DeliveryDate: Locator;
    readonly Product60min: Locator;
    readonly Product30min: Locator;
    readonly Product15min: Locator;
    readonly ViewMap: Locator;
    readonly ViewTable: Locator;
    readonly ViewGraph: Locator;
    readonly MarketAreaBE: Locator;
    readonly MarketAreaCH: Locator;
    readonly MarketAreaDE: Locator;
    readonly MarketAreaFR: Locator;
    readonly MarketAreaGB: Locator;
    readonly MarketAreaNL: Locator;
    readonly TableHourItems: Locator;

    constructor(page: Page) {
        this.page = page;
        this.TradingModalityAuction = page.locator('input[name="filters[modality]"][value="Auction"]');
        this.TradingModalityContinous = page.locator('input[name="filters[modality]"][value="Continuous"]');
        this.TradingModalityCapacityAuction = page.locator('input[name="filters[modality]"][value="Capacity Auction"]');
        this.TradingModalityGuranteesOfOrigin = page.locator('input[name="filters[modality]"][value="Guarantees of Origin"]');
        this.DeliveryDate = page.locator('input[name="filters[delivery_date]"]');
        this.Product60min = page.locator('input[name="filters[product]"][value="60"]');
        this.Product30min = page.locator('input[name="filters[product]"][value="30"]');
        this.Product15min = page.locator('input[name="filters[product]"][value="15"]');
        this.ViewMap = page.locator('input[name="filters[data_mode]"][value="map"]');
        this.ViewTable = page.locator('input[name="filters[data_mode]"][value="table"]');
        this.ViewGraph = page.locator('input[name="filters[data_mode]"][value="graph"]');
        this.MarketAreaBE = page.locator('input[name="filters[market_area]"][value="BE"]');
        this.MarketAreaCH = page.locator('input[name="filters[market_area]"][value="CH"]');
        this.MarketAreaDE = page.locator('input[name="filters[market_area]"][value="DE"]');
        this.MarketAreaFR = page.locator('input[name="filters[market_area]"][value="FR"]');
        this.MarketAreaGB = page.locator('input[name="filters[market_area]"][value="GB"]');
        this.MarketAreaNL = page.locator('input[name="filters[market_area]"][value="NL"]');
        this.TableHourItems = page.locator('.js-table-times ul li.no-children a');
    }

    // Method to select trading modality filter
    async SelectTradingModality(modality: string) {
        switch (modality) {
            case "Auction":
                await this.TradingModalityAuction.check();
                break;
            case "Continuous":
                await this.TradingModalityContinous.check();
                break;
            case "Capacity Auction":
                await this.TradingModalityCapacityAuction.check();
                break;
            case "Gurantees of Origin":
                await this.TradingModalityGuranteesOfOrigin.check();
                break;
            default:
                throw new Error(`Invalid trading modality: ${modality}`);
        }
        await this.page.waitForTimeout(shortwait);
    }

    // Method to select delivery date
    async SelectDeliveryDate(daysToAdd: number) {
        const date = GetFormattedDate(daysToAdd);
        await this.DeliveryDate.click();
        await this.DeliveryDate.fill("");
        await this.DeliveryDate.fill(date);
        await this.page.keyboard.press("Enter");
        await this.page.locator("body").click(); // Click outside to close the date picker
        await this.page.waitForTimeout(shortwait);
    }

    // Method to select product filter
    async SelectProduct(product: string) {
        switch (product) {
            case "60min":
                await this.Product60min.check();
                break;
            case "30min":
                await this.Product30min.check();
                break;
            case "15min":
                await this.Product15min.check();
                break;
            default:
                throw new Error(`Invalid product: ${product}`);
        }
        await this.page.waitForTimeout(shortwait);
    }

    // Method to select view filter
    async SelectView(view: string) {
        switch (view) {
            case "Map":
                await this.ViewMap.check();
                break;
            case "Table":
                await this.ViewTable.check();
                break;
            case "Graph":
                await this.ViewGraph.check();
                break;
            default:
                throw new Error(`Invalid view: ${view}`);
        }
        await this.page.waitForTimeout(shortwait);
    }

    // Method to select market area filter
    async SelectMarketArea(marketArea: string) {
        switch (marketArea) {
            case "BE":
                await this.MarketAreaBE.check();
                break;
            case "CH":
                await this.MarketAreaCH.check();
                break;
            case "DE":
                await this.MarketAreaDE.check();
                break;
            case "FR":
                await this.MarketAreaFR.check();
            case "GB":
                await this.MarketAreaGB.check();
                break;
            case "NL":
                await this.MarketAreaNL.check();
                break;
            default:
                throw new Error(`Invalid market area: ${marketArea}`);
        }
        await this.page.waitForTimeout(shortwait);
    }

    // Method to extract table data and save it to a CSV file
    async ExtractTableData() {
        //Capture hours
        const hourItems = this.TableHourItems;
        
        //Cature data
        const dataRows = this.page.locator('table tbody tr.lvl-1')
        const dataRowsCount = await dataRows.count();

        // Extract hours and corresponding data into an array of objects
        const data = []; 
        for (let i = 0; i < dataRowsCount; i++) {
            const cells = dataRows.nth(i).locator('td');
            const hour = await hourItems.nth(i).innerText();
            data.push({
                hours: hour.trim(),
                low: await cells.nth(0).innerText(),
                high: await cells.nth(1).innerText(),
                last: await cells.nth(2).innerText(),
                weightAvg: await cells.nth(3).innerText(),
            });
        }

        // Create CSV content
        const headers = 'Hours,Low,High,Last,Weight Avg.';
        const rows = data.map(row =>
            `${row.hours},${row.low},${row.high},${row.last},${row.weightAvg}`
        );

        // Format date and time for filename
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');

        // Save data to CSV
        const csv = [headers, ...rows].join('\n');
        const dir = './Output';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(`${dir}/market-data-${date}_${time}.csv`, csv, 'utf-8');
        console.log(`✓ CSV saved to market-data-${date}_${time}.csv`);
    }
}