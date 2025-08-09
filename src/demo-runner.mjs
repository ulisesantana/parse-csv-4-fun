import fs from 'node:fs/promises';
import os from 'node:os';
import { RandomCsvGenerator } from '../tests/generate-input.mjs';
import { CsvParser } from './csv-parser.mjs';

/**
 * Demo runner class that encapsulates all the logic for running CSV processing performance demos.
 */
export class DemoRunner {
  #config;

  /**
   * Creates a new DemoRunner instance.
   * @param {object} config - The configuration for the demo.
   */
  constructor(config) {
    this.#config = config;
  }

  /**
   * Gets CPU information for the demo report.
   * @returns {string} CPU model information.
   */
  #getCpuInfo() {
    const cpus = os.cpus();
    return cpus[0]?.model || 'Unknown CPU';
  }

  /**
   * Formats bytes into a human-readable format.
   * @param {number} bytes
   * @returns {string}
   */
  #formatBytes(bytes) {
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
  #formatTime(ms) {
    if (ms < 1000) return `${ms}ms`;
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(2)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(2);
    return `${minutes}m ${remainingSeconds}s`;
  }

  /**
   * Formats CPU usage to a human-readable format.
   * @param {number} userCpu - User CPU time in microseconds
   * @param {number} systemCpu - System CPU time in microseconds
   * @returns {string}
   */
  #formatCpuUsage(userCpu, systemCpu) {
    const totalCpuMs = (userCpu + systemCpu) / 1000; // Convert to milliseconds
    const userCpuMs = userCpu / 1000;
    const systemCpuMs = systemCpu / 1000;

    return `${totalCpuMs.toFixed(2)}ms (User: ${userCpuMs.toFixed(2)}ms, System: ${systemCpuMs.toFixed(2)}ms)`;
  }

  /**
   * Measures memory usage, CPU usage and execution time for a function.
   * @param {string} name - Name of the operation.
   * @param {Function} fn - Function to execute.
   * @returns {Promise<{result: any, peakMemory: number, executionTime: number, cpuUsage: {user: number, system: number}}>}
   */
  async #measurePerformance(name, fn) {
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

    const startCpuUsage = process.cpuUsage();
    const startTime = Date.now();
    const result = await fn();
    const endTime = Date.now();
    const endCpuUsage = process.cpuUsage(startCpuUsage);
    clearInterval(interval);

    const executionTime = endTime - startTime;
    // Final check in case the last memory usage was the peak
    const finalMemory = process.memoryUsage().heapUsed;
    if (finalMemory > peakMemory) {
      peakMemory = finalMemory;
    }

    console.log(`✅ ${name} completed in ${this.#formatTime(executionTime)}`);
    console.log(`📈 Peak memory usage: ${this.#formatBytes(peakMemory)}`);
    console.log(
      `⚡ CPU usage: ${this.#formatCpuUsage(endCpuUsage.user, endCpuUsage.system)}`
    );

    return { result, peakMemory, executionTime, cpuUsage: endCpuUsage };
  }

  /**
   * Runs a specific processing test.
   * @param {object} methodConfig - The configuration for the processing method.
   * @param {string} inputFile - The path to the input file.
   * @returns {Promise<object>} The performance results.
   */
  async #runProcessingTest(methodConfig, inputFile) {
    const parser = new CsvParser(inputFile, methodConfig.outputFile);
    const performanceData = await this.#measurePerformance(
      `${methodConfig.name} Processing`,
      () => parser[methodConfig.method]()
    );
    const outputStats = await fs.stat(methodConfig.outputFile);
    return {
      ...performanceData,
      outputSize: this.#formatBytes(outputStats.size),
    };
  }

  /**
   * Cleans up generated files.
   * @param {string[]} filesToDelete - An array of file paths to delete.
   */
  async #cleanup(filesToDelete) {
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
  #generateMarkdownReport(context) {
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
    const executionTimeRow = `| **Execution Time**  | ${processingMethods.map((m) => this.#formatTime(results[m.id].executionTime)).join(' | ')} |`;
    const memoryUsageRow = `| **Peak Memory**     | ${processingMethods.map((m) => this.#formatBytes(results[m.id].peakMemory)).join(' | ')} |`;
    const cpuUsageRow = `| **CPU Usage**       | ${processingMethods.map((m) => this.#formatCpuUsage(results[m.id].cpuUsage.user, results[m.id].cpuUsage.system)).join(' | ')} |`;
    const processedRow = `| **Records Processed** | ${processingMethods.map((m) => results[m.id].result.processed.toLocaleString()).join(' | ')} |`;
    const skippedRow = `| **Records Skipped**   | ${processingMethods.map((m) => results[m.id].result.skipped.toLocaleString()).join(' | ')} |`;
    const outputSizeRow = `| **Output File Size**  | ${processingMethods.map((m) => results[m.id].outputSize).join(' | ')} |`;

    const methodsExplanation = processingMethods
      .map(
        (m, i) =>
          `### ${i + 1}. ${m.name}\n- **How it works**: ${m.description}`
      )
      .join('\n\n');

    return `# CSV Parser Performance Demo Results

Generated on: ${timestamp}

## System Information
- **CPU**: ${cpuInfo}
- **Node.js Version**: ${process.version}
- **Platform**: ${process.platform} ${process.arch}
- **Total Memory**: ${this.#formatBytes(os.totalmem())}

## Test Parameters
- **Records Processed**: ${RandomCsvGenerator.numberWithThousandSeparator(recordCount)}
- **Input File Size**: ${inputFileSize}

## Performance Results

### CSV Generation
- **Time**: ${this.#formatTime(generationResult.executionTime)}
- **Peak Memory Used**: ${this.#formatBytes(generationResult.peakMemory)}
- **CPU Usage**: ${this.#formatCpuUsage(generationResult.cpuUsage.user, generationResult.cpuUsage.system)}

### Processing Comparison

${tableHeader}
${tableSeparator}
${executionTimeRow}
${memoryUsageRow}
${cpuUsageRow}
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
   * Runs the demo with the configured parameters.
   */
  async run() {
    const { RECORD_COUNT, inputFile, reportFile, processingMethods } =
      this.#config;
    const cpuInfo = this.#getCpuInfo();
    console.log('🎭 CSV Parser Performance Demo');
    console.log('='.repeat(50));
    console.log(`🖥️  CPU: ${cpuInfo}`);
    console.log(
      `📋 Records to generate: ${RandomCsvGenerator.numberWithThousandSeparator(RECORD_COUNT)}`
    );

    try {
      const generationResult = await this.#measurePerformance(
        'CSV Generation',
        () => RandomCsvGenerator.generate(RECORD_COUNT, inputFile)
      );

      const stats = await fs.stat(inputFile);
      const inputFileSize = this.#formatBytes(stats.size);
      console.log(`📏 Input file size: ${inputFileSize}`);

      const results = {};
      for (const method of processingMethods) {
        results[method.id] = await this.#runProcessingTest(method, inputFile);
      }

      console.log('\n📊 FINAL RESULTS');
      console.log('='.repeat(50));
      processingMethods.forEach((m) => {
        console.log(
          `   - ${m.name}: ${this.#formatTime(results[m.id].executionTime)} | ${this.#formatBytes(results[m.id].peakMemory)} | ${this.#formatCpuUsage(results[m.id].cpuUsage.user, results[m.id].cpuUsage.system)}`
        );
      });

      const markdownReport = this.#generateMarkdownReport({
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
      await this.#cleanup(filesToDelete);
      process.exit(0);
    }
  }
}
