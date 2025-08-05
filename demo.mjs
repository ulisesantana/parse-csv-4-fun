#!/usr/bin/env node

import { RandomCsvGenerator } from './tests/generate-input.mjs';
import { CsvParser } from './src/csv-parser.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

/**
 * Gets CPU information for the demo report
 * @returns {string} CPU model information
 */
function getCpuInfo() {
  const cpus = os.cpus();
  return cpus[0]?.model || 'Unknown CPU';
}

/**
 * Formats bytes into a human-readable format
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formats time in milliseconds to a human-readable format
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
 * Measures memory usage and execution time for a function
 * @param {string} name - Name of the operation
 * @param {Function} fn - Function to execute
 * @returns {Promise<{result: any, memoryUsed: number, executionTime: number}>}
 */
async function measurePerformance(name, fn) {
  console.log(`\n🚀 Starting ${name}...`);

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  const initialMemory = process.memoryUsage();
  const startTime = Date.now();

  const result = await fn();

  const endTime = Date.now();
  const finalMemory = process.memoryUsage();

  const executionTime = endTime - startTime;
  const memoryUsed = finalMemory.heapUsed - initialMemory.heapUsed;

  console.log(`✅ ${name} completed in ${formatTime(executionTime)}`);
  console.log(`📊 Memory used: ${formatBytes(memoryUsed)}`);
  console.log(`📈 Peak memory: ${formatBytes(finalMemory.heapUsed)}`);

  return { result, memoryUsed, executionTime };
}

/**
 * Cleans up test files
 * @param {string[]} files
 */
async function cleanup(files) {
  console.log('\n🧹 Cleaning up test files...');
  for (const file of files) {
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
 * Generates a markdown report with the demo results
 * @param {Object} params - Report parameters
 * @param {string} params.cpuInfo - CPU information
 * @param {number} params.recordCount - Number of records processed
 * @param {string} params.inputFileSize - Input file size
 * @param {Object} params.generationResult - Generation performance data
 * @param {Object} params.normalResult - Normal processing performance data
 * @param {Object} params.streamResult - Stream processing performance data
 * @param {string} params.normalOutputSize - Normal output file size
 * @param {string} params.streamOutputSize - Stream output file size
 * @returns {string} Markdown report content
 */
function generateMarkdownReport({
  cpuInfo,
  recordCount,
  inputFileSize,
  generationResult,
  normalResult,
  streamResult,
  normalOutputSize,
  streamOutputSize,
}) {
  const timestamp = new Date().toISOString();
  const timeDiff = normalResult.executionTime - streamResult.executionTime;
  const timeImprovement = (
    (timeDiff / normalResult.executionTime) *
    100
  ).toFixed(1);
  const memoryDiff = normalResult.memoryUsed - streamResult.memoryUsed;
  const memoryImprovement = (
    (Math.abs(memoryDiff) /
      Math.max(normalResult.memoryUsed, streamResult.memoryUsed)) *
    100
  ).toFixed(1);

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
- **Memory Used**: ${formatBytes(generationResult.memoryUsed)}

### Processing Comparison

| Metric | Normal Processing | Stream + Concurrency | Improvement |
|--------|------------------|---------------------|-------------|
| **Execution Time** | ${formatTime(normalResult.executionTime)} | ${formatTime(streamResult.executionTime)} | ${timeImprovement}% faster |
| **Memory Usage** | ${formatBytes(normalResult.memoryUsed)} | ${formatBytes(streamResult.memoryUsed)} | ${memoryImprovement}% ${memoryDiff > 0 ? 'less' : 'more'} |
| **Records Processed** | ${normalResult.result.processed.toLocaleString()} | ${streamResult.result.processed.toLocaleString()} | - |
| **Records Skipped** | ${normalResult.result.skipped.toLocaleString()} | ${streamResult.result.skipped.toLocaleString()} | - |
| **Output File Size** | ${normalOutputSize} | ${streamOutputSize} | - |

## Processing Methods

### Normal Processing
- Reads entire file into memory using \`fs.readFile()\`
- Splits content by line breaks
- Processes each line sequentially
- Simple but memory-intensive for large files

### Stream + Concurrency Processing
- Uses Node.js streams with \`readline.createInterface()\`
- Processes lines as they are read (memory efficient)
- Utilizes \`p-map\` for controlled concurrency (1000 concurrent operations)
- Combines streaming I/O with parallel processing for optimal performance

## Key Findings

${
  streamResult.memoryUsed < normalResult.memoryUsed
    ? '✅ **Memory Efficiency**: Stream processing used significantly less memory, making it suitable for large files.'
    : '⚠️ **Unexpected Memory Usage**: Normal processing used less memory, which may indicate optimization opportunities.'
}

${
  streamResult.executionTime < normalResult.executionTime
    ? '✅ **Performance**: Stream processing with concurrency was faster due to parallel promise execution.'
    : '⚠️ **Performance Note**: Normal processing was faster, possibly due to file system caching or other factors.'
}

## Conclusion

The stream-based approach with controlled concurrency provides the best balance of:
- **Memory efficiency** for large datasets
- **Processing speed** through parallel execution
- **Scalability** for production environments

This combination makes it ideal for processing large CSV files in production environments where memory usage and processing speed are critical factors.
`;
}

/**
 * Main demo function
 */
async function runDemo() {
  const RECORD_COUNT = 5_000_000n;
  const inputFile = path.join(process.cwd(), 'demo-input.csv');
  const outputFileNormal = path.join(process.cwd(), 'demo-output-normal.csv');
  const outputFileStream = path.join(process.cwd(), 'demo-output-stream.csv');
  const reportFile = path.join(process.cwd(), 'performance-report.md');

  const cpuInfo = getCpuInfo();

  console.log('🎭 CSV Parser Performance Demo');
  console.log('='.repeat(50));
  console.log(`🖥️  CPU: ${cpuInfo}`);
  console.log(
    `📋 Records to generate: ${RandomCsvGenerator.numberWithThousandSeparator(RECORD_COUNT)}`
  );
  console.log(`📁 Input file: ${inputFile}`);
  console.log(`📤 Output files: ${outputFileNormal}, ${outputFileStream}`);

  try {
    // Generate test data
    const generationResult = await measurePerformance('CSV Generation', () =>
      RandomCsvGenerator.generate(RECORD_COUNT, inputFile)
    );

    // Get file size
    const stats = await fs.stat(inputFile);
    const inputFileSize = formatBytes(stats.size);
    console.log(`📏 Input file size: ${inputFileSize}`);

    // Test normal processing
    const normalResult = await measurePerformance(
      'Normal Processing (readFile + split)',
      async () => {
        const parser = new CsvParser(inputFile, outputFileNormal);
        return await parser.processUsers();
      }
    );

    // Test stream processing with concurrency
    const streamResult = await measurePerformance(
      'Stream + Concurrency Processing (readline + p-map)',
      async () => {
        const parser = new CsvParser(inputFile, outputFileStream);
        return await parser.processUsersAsStream();
      }
    );

    // Results comparison
    console.log('\n📊 RESULTS COMPARISON');
    console.log('='.repeat(50));

    console.log('\n⏱️  Execution Time:');
    console.log(
      `   Normal:           ${formatTime(normalResult.executionTime)}`
    );
    console.log(
      `   Stream + Concurrency: ${formatTime(streamResult.executionTime)}`
    );
    const timeDiff = normalResult.executionTime - streamResult.executionTime;
    const timeImprovement = (
      (timeDiff / normalResult.executionTime) *
      100
    ).toFixed(1);
    console.log(
      `   Difference:       ${formatTime(Math.abs(timeDiff))} (${timeImprovement}% ${timeDiff > 0 ? 'faster' : 'slower'} with streams + concurrency)`
    );

    console.log('\n🧠 Memory Usage:');
    console.log(`   Normal:           ${formatBytes(normalResult.memoryUsed)}`);
    console.log(
      `   Stream + Concurrency: ${formatBytes(streamResult.memoryUsed)}`
    );
    const memoryDiff = normalResult.memoryUsed - streamResult.memoryUsed;
    const memoryImprovement = (
      (Math.abs(memoryDiff) /
        Math.max(normalResult.memoryUsed, streamResult.memoryUsed)) *
      100
    ).toFixed(1);
    console.log(
      `   Difference:       ${formatBytes(Math.abs(memoryDiff))} (${memoryImprovement}% ${memoryDiff > 0 ? 'less' : 'more'} with streams + concurrency)`
    );

    console.log('\n📈 Processing Stats:');
    console.log(
      `   Normal - Processed: ${normalResult.result.processed.toLocaleString()}, Skipped: ${normalResult.result.skipped.toLocaleString()}, Total: ${normalResult.result.total.toLocaleString()}`
    );
    console.log(
      `   Stream - Processed: ${streamResult.result.processed.toLocaleString()}, Skipped: ${streamResult.result.skipped.toLocaleString()}, Total: ${streamResult.result.total.toLocaleString()}`
    );

    // Verify output files
    const normalOutputStats = await fs.stat(outputFileNormal);
    const streamOutputStats = await fs.stat(outputFileStream);
    const normalOutputSize = formatBytes(normalOutputStats.size);
    const streamOutputSize = formatBytes(streamOutputStats.size);
    console.log('\n📄 Output Files:');
    console.log(`   Normal output size:   ${normalOutputSize}`);
    console.log(`   Stream output size:   ${streamOutputSize}`);

    console.log('\n🎯 CONCLUSION:');
    console.log('='.repeat(50));
    if (streamResult.memoryUsed < normalResult.memoryUsed) {
      console.log(
        '✅ Streams + concurrency are more memory efficient for large files'
      );
    } else {
      console.log(
        '⚠️  Normal processing used less memory (unexpected for large files)'
      );
    }

    if (streamResult.executionTime < normalResult.executionTime) {
      console.log(
        '✅ Streams + concurrency are faster due to parallel processing'
      );
    } else {
      console.log(
        '⚠️  Normal processing was faster (could be due to file system cache)'
      );
    }

    console.log('📝 The stream approach combines:');
    console.log('   • Memory-efficient streaming I/O');
    console.log('   • Controlled concurrency (1000 parallel operations)');
    console.log('   • Better resource utilization');

    // Generate and save markdown report
    const markdownReport = generateMarkdownReport({
      cpuInfo,
      recordCount: RECORD_COUNT,
      inputFileSize,
      generationResult,
      normalResult,
      streamResult,
      normalOutputSize,
      streamOutputSize,
    });

    await fs.writeFile(reportFile, markdownReport);
    console.log(`\n📋 Performance report saved to: ${reportFile}`);
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error(error.stack);
  } finally {
    // Cleanup (but keep the report)
    await cleanup([inputFile, outputFileNormal, outputFileStream]);
  }
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(console.error);
}

export { runDemo };
