import { RandomCsvGenerator } from './generate-input.mjs';
import { CsvParser } from '../src/csv-parser.mjs';
import assert from 'node:assert';
import { afterEach, describe, test } from 'node:test';
import fs from 'node:fs/promises';

describe('CSV Parser Performance tests', () => {
  const largeInputFile = 'large-input.csv';
  const largeOutputFile = 'large-output.csv';
  afterEach(async () => {
    await fs.unlink(largeInputFile).catch(() => {});
    await fs.unlink(largeOutputFile).catch(() => {});
  });

  describe('Memory Usage', () => {
    test('should process a large file without loading it all into memory', async (t) => {
      t.timeout = 60000;

      const largeInputFile = 'large-input.csv';
      const largeOutputFile = 'large-output.csv';
      const lineCount = 1_000_000n;

      await RandomCsvGenerator.generate(lineCount, largeInputFile);

      const initialMemory = process.memoryUsage().heapUsed;
      const start = Date.now();

      const stats = await new CsvParser(
        largeInputFile,
        largeOutputFile
      ).processUsers();
      console.log(
        `CSV Parsed with ${RandomCsvGenerator.numberWithThousandSeparator(lineCount)} records in ${(Date.now() - start) / 1000} seconds.`
      );

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryUsed = (finalMemory - initialMemory) / 1024 / 1024; // MB

      assert.strictEqual(BigInt(stats.total), lineCount);

      assert.ok(
        memoryUsed < 50,
        `Memory usage (${memoryUsed.toFixed(2)} MB) should be less than 50 MB`
      );
    });
  });
});
