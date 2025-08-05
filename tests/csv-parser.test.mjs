import {afterEach, beforeEach, describe, test} from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import {CsvParser} from '../src/csv-parser.mjs';

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
    [testInputFile, testOutputFile].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  }

  describe('processUser', () => {
    test('should process a valid line correctly', () => {
      const input = 'john doe,john@example.com,25';
      const expected = 'JOHN DOE,john@example.com,25';

      assert.strictEqual(CsvParser.processUser(input), expected);
    });

    test('should reject lines with invalid email (without @)', () => {
      const input = 'jane doe,invalid-email,30';

      assert.strictEqual(CsvParser.processUser(input), null);
    });

    test('should reject lines with invalid age (non-numeric)', () => {
      const input = 'bob smith,bob@example.com,not-a-number';

      assert.strictEqual(CsvParser.processUser(input), null);
    });

    test('should reject lines with negative age', () => {
      const input = 'alice brown,alice@example.com,-5';

      assert.strictEqual(CsvParser.processUser(input), null);
    });

    test('should reject lines with missing fields', () => {
      const input = 'incomplete,missing@fields.com';

      assert.strictEqual(CsvParser.processUser(input), null);
    });

    test('should reject lines with too many fields', () => {
      const input = 'too,many,fields@example.com,25,extra';

      assert.strictEqual(CsvParser.processUser(input), null);
    });

    test('should handle whitespace correctly', () => {
      const input = ' mary johnson , mary@example.com , 28 ';
      const expected = 'MARY JOHNSON,mary@example.com,28';

      assert.strictEqual(CsvParser.processUser(input), expected);
    });

    test('should reject lines with empty fields', () => {
      const input = ',email@example.com,25';

      assert.strictEqual(CsvParser.processUser(input), null);
    });
  });

  describe('processUsers', () => {
    test('should process a valid CSV file correctly', async () => {
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

      assert.strictEqual(lines.length, 3);
      assert.strictEqual(lines[0], 'JOHN DOE,john@example.com,25');
      assert.strictEqual(lines[1], 'JANE SMITH,jane@example.com,30');
      assert.strictEqual(lines[2], 'BOB JOHNSON,bob@example.com,35');
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

      assert.strictEqual(lines.length, 2);
      assert.strictEqual(lines[0], 'JOHN DOE,john@example.com,25');
      assert.strictEqual(lines[1], 'ALICE BROWN,alice@example.com,28');
    });

    test('should handle empty file correctly', async () => {
      // Create empty file
      fs.writeFileSync(testInputFile, '');

      // Process the file
      const stats = await CsvParser.processUsers(testInputFile, testOutputFile);

      // Verify statistics
      assert.strictEqual(stats.processed, 0);
      assert.strictEqual(stats.skipped, 0);

      // Verify that output file exists but is empty
      assert.ok(fs.existsSync(testOutputFile));
      const outputContent = fs.readFileSync(testOutputFile, 'utf-8');
      assert.strictEqual(outputContent.trim(), '');
    });

    test('should reject non-existent file', async () => {
      await assert.rejects(
        async () => {
          await CsvParser.processUsers('non-existent-file.csv', testOutputFile);
        },
        {
          code: 'ENOENT'
        }
      );
    });

    test('should use output.csv as default output file', async () => {
      // Create simple input file
      const csvContent = 'john doe,john@example.com,25';
      fs.writeFileSync(testInputFile, csvContent);

      // Process without specifying output file
      const stats = await CsvParser.processUsers(testInputFile);

      // Verify that output.csv was created
      assert.ok(fs.existsSync('output.csv'));

      // Clean up created file
      if (fs.existsSync('output.csv')) {
        fs.unlinkSync('output.csv');
      }
    });
  });
});
