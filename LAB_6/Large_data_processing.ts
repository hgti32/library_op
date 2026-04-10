// @ts-ignore
import * as fs from 'fs';
// @ts-ignore
import * as readline from 'readline';

export async function processLargeData(filePath: string): Promise<void> {
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    console.log('Starting incremental data processing...');

    let lineCount = 0;

    for await (const line of rl) {
        lineCount++;

        if (lineCount % 1000 === 0) {
            // @ts-ignore
            const memoryUsed = process.memoryUsage().heapUsed / 1024 / 1024;
            console.log(`Processed ${lineCount} lines. Memory Usage: ${memoryUsed.toFixed(2)} MB`);
        }
    }

    console.log(`Processing complete. Total lines processed: ${lineCount}`);
}