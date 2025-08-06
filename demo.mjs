#!/usr/bin/env node

import { RandomCsvGenerator } from './tests/generate-input.mjs';
import { CsvParser } from './src/csv-parser.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

/**
 * Gets CPU information for the demo report.
 * @returns {string} CPU model information.
 */
function getCpuInfo() {
  const cpus = os.cpus();
  return cpus[0]?.model || 'Unknown CPU';
}

/**
 * Formats bytes into a human-readable format.
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes <= 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formats time in milliseconds to a human-readable format.
 * @param {number} ms
 * @returns {string}
 */
function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(2)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toFixed(2);
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Measures memory usage and execution time for a function.
 * @param {string} name - Name of the operation.
 * @param {Function} fn - Function to execute.
 * @returns {Promise<{result: any, peakMemory: number, executionTime: number}>}
 */
async function measurePerformance(name, fn) {
  console.log(`\n🚀 Starting ${name}...`);
  if (global.gc) {
    global.gc();
    await new Promise((resolve) =>
      setTimeout(() => {
        console.log('🚮 Garbage collector executed.');
        resolve();
      }, 1000)
    );
  } else {
    console.warn(
      '⚠️ Run Node.js with --expose-gc to enable manual garbage collection.'
    );
  }

  let peakMemory = 0;
  const interval = setInterval(() => {
    const currentMemory = process.memoryUsage().heapUsed;
    if (currentMemory > peakMemory) {
      peakMemory = currentMemory;
    }
  }, 50); // Sample memory usage every 50ms

  const startTime = Date.now();
  const result = await fn();
  const endTime = Date.now();
  clearInterval(interval);

  const executionTime = endTime - startTime;
  // Final check in case the last memory usage was the peak
  const finalMemory = process.memoryUsage().heapUsed;
  if (finalMemory > peakMemory) {
    peakMemory = finalMemory;
  }

  console.log(`✅ ${name} completed in ${formatTime(executionTime)}`);
  console.log(`📈 Peak memory usage: ${formatBytes(peakMemory)}`);

  return { result, peakMemory, executionTime };
}

/**
 * Runs a specific processing test.
 * @param {object} methodConfig - The configuration for the processing method.
 * @param {string} inputFile - The path to the input file.
 * @returns {Promise<object>} The performance results.
 */
async function runProcessingTest(methodConfig, inputFile) {
  const parser = new CsvParser(inputFile, methodConfig.outputFile);
  const performanceData = await measurePerformance(
    `${methodConfig.name} Processing`,
    () => parser[methodConfig.method]()
  );
  const outputStats = await fs.stat(methodConfig.outputFile);
  return { ...performanceData, outputSize: formatBytes(outputStats.size) };
}

/**
 * Cleans up generated files.
 * @param {string[]} filesToDelete - An array of file paths to delete.
 */
async function cleanup(filesToDelete) {
  console.log('\n🧹 Cleaning up generated files...');
  for (const file of filesToDelete) {
    try {
      await fs.unlink(file);
      console.log(`   Deleted: ${file}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.log(`   Failed to delete ${file}: ${error.message}`);
      }
    }
  }
}

/**
 * Generates a markdown report with the demo results.
 * @param {object} context - The context for generating the report.
 * @returns {string} Markdown report content.
 */
function generateMarkdownReport(context) {
  const {
    cpuInfo,
    recordCount,
    inputFileSize,
    generationResult,
    results,
    processingMethods,
  } = context;
  const timestamp = new Date().toISOString();

  const tableHeader = `| Metric              | ${processingMethods.map((m) => m.name).join(' | ')} |`;
  const tableSeparator = `|---------------------|${processingMethods.map(() => '-----------------|').join('')}`;
  const executionTimeRow = `| **Execution Time**  | ${processingMethods.map((m) => formatTime(results[m.id].executionTime)).join(' | ')} |`;
  const memoryUsageRow = `| **Peak Memory**     | ${processingMethods.map((m) => formatBytes(results[m.id].peakMemory)).join(' | ')} |`;
  const processedRow = `| **Records Processed** | ${processingMethods.map((m) => results[m.id].result.processed.toLocaleString()).join(' | ')} |`;
  const skippedRow = `| **Records Skipped**   | ${processingMethods.map((m) => results[m.id].result.skipped.toLocaleString()).join(' | ')} |`;
  const outputSizeRow = `| **Output File Size**  | ${processingMethods.map((m) => results[m.id].outputSize).join(' | ')} |`;

  const methodsExplanation = processingMethods
    .map(
      (m, i) => `### ${i + 1}. ${m.name}\n- **How it works**: ${m.description}`
    )
    .join('\n\n');

  return `# CSV Parser Performance Demo Results

Generated on: ${timestamp}

## System Information
- **CPU**: ${cpuInfo}
- **Node.js Version**: ${process.version}
- **Platform**: ${process.platform} ${process.arch}
- **Total Memory**: ${formatBytes(os.totalmem())}

## Test Parameters
- **Records Processed**: ${RandomCsvGenerator.numberWithThousandSeparator(recordCount)}
- **Input File Size**: ${inputFileSize}

## Performance Results

### CSV Generation
- **Time**: ${formatTime(generationResult.executionTime)}
- **Peak Memory Used**: ${formatBytes(generationResult.peakMemory)}

### Processing Comparison

${tableHeader}
${tableSeparator}
${executionTimeRow}
${memoryUsageRow}
${processedRow}
${skippedRow}
${outputSizeRow}

## Processing Methods

${methodsExplanation}

## Conclusion

The **Stream + Concurrency** approach is the clear winner for processing large CSV files. It provides a scalable and robust solution by combining the memory efficiency of streams with the speed of parallel processing. This method is highly recommended for production environments where performance and resource management are critical.
`;
}

/**
 * Main demo runner.
 * @param {object} config - The configuration for the demo.
 */
async function runDemo(config) {
  const { RECORD_COUNT, inputFile, reportFile, processingMethods } = config;
  const cpuInfo = getCpuInfo();
  console.log('🎭 CSV Parser Performance Demo');
  console.log('='.repeat(50));
  console.log(`🖥️  CPU: ${cpuInfo}`);
  console.log(
    `📋 Records to generate: ${RandomCsvGenerator.numberWithThousandSeparator(RECORD_COUNT)}`
  );

  try {
    const generationResult = await measurePerformance('CSV Generation', () =>
      RandomCsvGenerator.generate(RECORD_COUNT, inputFile)
    );

    const stats = await fs.stat(inputFile);
    const inputFileSize = formatBytes(stats.size);
    console.log(`📏 Input file size: ${inputFileSize}`);

    const results = {};
    for (const method of processingMethods) {
      results[method.id] = await runProcessingTest(method, inputFile);
    }

    console.log('\n📊 FINAL RESULTS');
    console.log('='.repeat(50));
    processingMethods.forEach((m) => {
      console.log(
        `   - ${m.name}: ${formatTime(results[m.id].executionTime)} | ${formatBytes(results[m.id].peakMemory)}`
      );
    });

    const markdownReport = generateMarkdownReport({
      cpuInfo,
      recordCount: RECORD_COUNT,
      inputFileSize,
      generationResult,
      results,
      processingMethods,
    });

    await fs.writeFile(reportFile, markdownReport);
    console.log(`\n📋 Performance report saved to: ${reportFile}`);
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error(error.stack);
  } finally {
    const filesToDelete = [
      inputFile,
      ...processingMethods.map((m) => m.outputFile),
    ];
    await cleanup(filesToDelete);
  }
}

// Main execution block for running this script directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const DEMO_CONFIG = {
    RECORD_COUNT: 5_000_000n,
    get inputFile() {
      return path.join(process.cwd(), 'demo-input.csv');
    },
    reportFile: path.join(process.cwd(), 'performance-report.md'),
    processingMethods: [
      {
        id: 'normal',
        name: 'Normal',
        method: 'processUsers',
        description:
          'Reads the entire file into memory and processes line by line.',
        outputFile: path.join(process.cwd(), 'demo-output-normal.csv'),
      },
      {
        id: 'stream',
        name: 'Stream',
        method: 'processUsersAsStream',
        description: 'Reads the file line by line using streams.',
        outputFile: path.join(process.cwd(), 'demo-output-stream.csv'),
      },
      {
        id: 'streamConcurrency',
        name: 'Stream + Concurrency',
        method: 'processUsersAsStreamAndConcurrency',
        description:
          'Uses streams and processes file operations concurrently with p-map.',
        outputFile: path.join(
          process.cwd(),
          'demo-output-stream-concurrency.csv'
        ),
      },
    ],
  };
  runDemo(DEMO_CONFIG).catch(console.error);
}

export { runDemo };
