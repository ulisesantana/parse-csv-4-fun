import { afterEach, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { CsvParser } from '../src/csv-parser.mjs';

describe('CsvParser', () => {
  const testInputFile = 'test-input.csv';
  const testOutputFile = 'test-output.csv';

  // Clean up test files before and after each test
  beforeEach(() => {
    cleanupTestFiles();
  });

  afterEach(() => {
    cleanupTestFiles();
  });

  function cleanupTestFiles() {
    [testInputFile, testOutputFile].forEach((file) => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  }

  describe('processUsers', () => {
    test('should process a valid line correctly', async () => {
      const csvContent = `name,email,age
john doe,john@example.com,25`;

      fs.writeFileSync(testInputFile, csvContent);

      const stats = await CsvParser.processUsers(testInputFile, testOutputFile);

      assert.strictEqual(stats.processed, 1);
      assert.strictEqual(stats.skipped, 0);

      const outputContent = fs.readFileSync(testOutputFile, 'utf-8');
      const lines = outputContent.trim().split('\n');

      assert.strictEqual(lines.length, 2); // header + 1 data line
      assert.strictEqual(lines[0], 'name,email,age'); // header
      assert.strictEqual(lines[1], 'JOHN DOE,john@example.com,25'); // processed data
    });

    test('should reject lines with invalid email (without @)', async () => {
      const csvContent = `name,email,age
jane doe,invalid-email,30`;

      fs.writeFileSync(testInputFile, csvContent);

      const stats = await CsvParser.processUsers(testInputFile, testOutputFile);

      assert.strictEqual(stats.processed, 0);
      assert.strictEqual(stats.skipped, 1);

      // Verify that output file does not exist when no valid lines are processed
      assert.strictEqual(fs.existsSync(testOutputFile), false);
    });

    test('should reject lines with invalid age (non-numeric)', async () => {
      const csvContent = `name,email,age
bob smith,bob@example.com,not-a-number`;

      fs.writeFileSync(testInputFile, csvContent);

      const stats = await CsvParser.processUsers(testInputFile, testOutputFile);

      assert.strictEqual(stats.processed, 0);
      assert.strictEqual(stats.skipped, 1);

      // Verify that output file does not exist when no valid lines are processed
      assert.strictEqual(fs.existsSync(testOutputFile), false);
    });

    test('should reject lines with negative age', async () => {
      const csvContent = `name,email,age
alice brown,alice@example.com,-5`;

      fs.writeFileSync(testInputFile, csvContent);

      const stats = await CsvParser.processUsers(testInputFile, testOutputFile);

      assert.strictEqual(stats.processed, 0);
      assert.strictEqual(stats.skipped, 1);

      // Verify that output file does not exist when no valid lines are processed
      assert.strictEqual(fs.existsSync(testOutputFile), false);
    });

    test('should reject lines with missing fields', async () => {
      const csvContent = `name,email,age
incomplete,missing@fields.com`;

      fs.writeFileSync(testInputFile, csvContent);

      const stats = await CsvParser.processUsers(testInputFile, testOutputFile);

      assert.strictEqual(stats.processed, 0);
      assert.strictEqual(stats.skipped, 1);

      // Verify that output file does not exist when no valid lines are processed
      assert.strictEqual(fs.existsSync(testOutputFile), false);
    });

    test('should reject lines with too many fields', async () => {
      const csvContent = `name,email,age
too,many,fields@example.com,25,extra`;

      fs.writeFileSync(testInputFile, csvContent);

      const stats = await CsvParser.processUsers(testInputFile, testOutputFile);

      assert.strictEqual(stats.processed, 0);
      assert.strictEqual(stats.skipped, 1);

      // Verify that output file does not exist when no valid lines are processed
      assert.strictEqual(fs.existsSync(testOutputFile), false);
    });

    test('should handle whitespace correctly', async () => {
      const csvContent = `name,email,age
 mary johnson , mary@example.com , 28 `;

      fs.writeFileSync(testInputFile, csvContent);

      const stats = await CsvParser.processUsers(testInputFile, testOutputFile);

      assert.strictEqual(stats.processed, 1);
      assert.strictEqual(stats.skipped, 0);

      const outputContent = fs.readFileSync(testOutputFile, 'utf-8');
      const lines = outputContent.trim().split('\n');

      assert.strictEqual(lines.length, 2); // header + 1 data line
      assert.strictEqual(lines[0], 'name,email,age'); // header
      assert.strictEqual(lines[1], 'MARY JOHNSON,mary@example.com,28'); // processed data
    });

    test('should reject lines with empty fields', async () => {
      const csvContent = `name,email,age
,email@example.com,25`;

      fs.writeFileSync(testInputFile, csvContent);

      const stats = await CsvParser.processUsers(testInputFile, testOutputFile);

      assert.strictEqual(stats.processed, 0);
      assert.strictEqual(stats.skipped, 1);

      // Verify that output file does not exist when no valid lines are processed
      assert.strictEqual(fs.existsSync(testOutputFile), false);
    });

    test('should process a valid CSV file with multiple lines correctly', async () => {
      // Create test input file
      const csvContent = `name,email,age
john doe,john@example.com,25
jane smith,jane@example.com,30
bob johnson,bob@example.com,35`;

      fs.writeFileSync(testInputFile, csvContent);

      // Process the file
      const stats = await CsvParser.processUsers(testInputFile, testOutputFile);

      // Verify statistics
      assert.strictEqual(stats.processed, 3);
      assert.strictEqual(stats.skipped, 0);

      // Verify output file content
      const outputContent = fs.readFileSync(testOutputFile, 'utf-8');
      const lines = outputContent.trim().split('\n');

      assert.strictEqual(lines.length, 4); // header + 3 data lines
      assert.strictEqual(lines[0], 'name,email,age'); // header
      assert.strictEqual(lines[1], 'JOHN DOE,john@example.com,25'); // processed data
      assert.strictEqual(lines[2], 'JANE SMITH,jane@example.com,30'); // processed data
      assert.strictEqual(lines[3], 'BOB JOHNSON,bob@example.com,35'); // processed data
    });

    test('should skip invalid lines and process only valid ones', async () => {
      // Create file with mixed data (valid and invalid)
      const csvContent = `name,email,age
john doe,john@example.com,25
invalid line with missing fields
jane smith,invalid-email,30
bob johnson,bob@example.com,not-a-number
alice brown,alice@example.com,28`;

      fs.writeFileSync(testInputFile, csvContent);

      // Process the file
      const stats = await CsvParser.processUsers(testInputFile, testOutputFile);

      // Verify statistics
      assert.strictEqual(stats.processed, 2); // john doe and alice brown
      assert.strictEqual(stats.skipped, 3); // invalid line, jane smith, bob johnson

      // Verify output file content
      const outputContent = fs.readFileSync(testOutputFile, 'utf-8');
      const lines = outputContent.trim().split('\n');

      assert.strictEqual(lines.length, 3); // header + 2 valid data lines
      assert.strictEqual(lines[0], 'name,email,age'); // header
      assert.strictEqual(lines[1], 'JOHN DOE,john@example.com,25'); // processed data
      assert.strictEqual(lines[2], 'ALICE BROWN,alice@example.com,28'); // processed data
    });

    test('should handle empty file correctly', async () => {
      // Create empty file
      fs.writeFileSync(testInputFile, '');

      // Process the file
      const stats = await CsvParser.processUsers(testInputFile, testOutputFile);

      // Verify statistics
      assert.strictEqual(stats.processed, 0);
      assert.strictEqual(stats.skipped, 0);

      // Verify that output file does not exist when input is empty
      assert.strictEqual(fs.existsSync(testOutputFile), false);
    });

    test('should reject non-existent file', async () => {
      await assert.rejects(
        async () => {
          await CsvParser.processUsers('non-existent-file.csv', testOutputFile);
        },
        {
          code: 'ENOENT',
        }
      );
    });

    test('should use output.csv as default output file', async () => {
      // Create simple input file
      const csvContent = `name,email,age
john doe,john@example.com,25`;
      fs.writeFileSync(testInputFile, csvContent);

      // Process without specifying output file
      await CsvParser.processUsers(testInputFile);

      // Verify that output.csv was created
      assert.ok(fs.existsSync('output.csv'));

      // Verify content includes header
      const outputContent = fs.readFileSync('output.csv', 'utf-8');
      const lines = outputContent.trim().split('\n');
      assert.strictEqual(lines.length, 2); // header + 1 data line
      assert.strictEqual(lines[0], 'name,email,age'); // header

      // Clean up created file
      if (fs.existsSync('output.csv')) {
        fs.unlinkSync('output.csv');
      }
    });

    test('should handle CSV file with only header', async () => {
      const csvContent = `name,email,age`;

      fs.writeFileSync(testInputFile, csvContent);

      const stats = await CsvParser.processUsers(testInputFile, testOutputFile);

      assert.strictEqual(stats.processed, 0);
      assert.strictEqual(stats.skipped, 0);

      // Verify that output file does not exist when only header is present
      assert.strictEqual(fs.existsSync(testOutputFile), false);
    });
  });
});
