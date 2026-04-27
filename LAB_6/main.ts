const fs = require("fs");
const readline = require("readline");

class LargeDataProcessor {
  static async processLogFile(filePath: string): Promise<void> {
    console.log(`Starting to process file: ${filePath}...`);
    const startTime = performance.now();

    const fileStream = fs.createReadStream(filePath, { encoding: "utf-8" });

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let processedLines = 0;
    let errorCount = 0;

    try {
      for await (const line of rl) {
        processedLines++;

        if (line.includes("[ERROR]")) {
          errorCount++;
        }

        if (processedLines % 100000 === 0) {
          console.log(`Processed lines: ${processedLines}...`);
        }
      }
    } catch (error) {
      console.error(`Error reading stream:`, error);
    }

    const executionTime = ((performance.now() - startTime) / 1000).toFixed(2);

    console.log("\n--- Processing Completed ---");
    console.log(`Total lines read: ${processedLines}`);
    console.log(`Errors found: ${errorCount}`);
    console.log(`Execution time: ${executionTime} seconds`);
  }
}
