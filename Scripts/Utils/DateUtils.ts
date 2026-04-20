export function GetFormattedDate(daysToAdd: number): string {
    const date = new Date();
    const day = date.getDate() + daysToAdd;
    const year = date.getFullYear();
    const month = date.toLocaleString('en-GB', { month: 'short' }); // Get month in short format (e.g., "Apr")
    return `${day} ${month}. ${year}`;
}