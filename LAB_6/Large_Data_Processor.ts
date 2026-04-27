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

async function generateDummyLargeFile(filePath: string, linesCount: number) {
  console.log(`Creating test file with ${linesCount} lines...`);
  const writeStream = fs.createWriteStream(filePath);

  for (let i = 1; i <= linesCount; i++) {
    const level = Math.random() > 0.95 ? 'ERROR' : 'INFO';
    const line = `2026-04-27T14:00:00Z [${level}] This is simulated log message number ${i}\n`;
    
    if (!writeStream.write(line)) {
      await new Promise((resolve) => writeStream.once('drain', resolve));
    }
  }

  writeStream.end();
  return new Promise((resolve) => writeStream.once('finish', resolve));
}

async function runDemo() {
  const testFilePath = './massive_dataset.log';

  await generateDummyLargeFile(testFilePath, 500000);
  console.log('Test file created successfully.');

  await LargeDataProcessor.processLogFile(testFilePath);
}

runDemo();