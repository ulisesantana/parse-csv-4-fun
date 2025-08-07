import path from 'node:path';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import * as readline from 'node:readline';
import { EOL } from 'node:os';
import { Stats } from './stats.mjs';

/**
 * @typedef {Object} User
 * @property {string} name - User's full name
 * @property {string} email - User's email address
 * @property {number} age - User's age
 */

export class CsvParser {
  #USER_HEADERS = ['name', 'email', 'age'];
  #nameIndex = -1;
  #emailIndex = -1;
  #ageIndex = -1;

  /**
   * Creates a new CsvParser instance
   * @param {string} inputFilePath - Path to the input CSV file
   * @param {string} [outputFilePath] - Path to the output file (default: output.csv in same directory as input)
   */
  constructor(inputFilePath, outputFilePath) {
    this.inputFilePath = inputFilePath;
    this.outputFilePath =
      outputFilePath || path.join(path.dirname(inputFilePath), 'output.csv');
  }

  /**
   * Processes a CSV file of users line by line
   * @returns {Promise<Stats>} - Processing statistics
   */
  async processUsers() {
    const stats = new Stats();

    try {
      const csv = await fs.readFile(this.inputFilePath, 'utf8');
      if (!csv.trim()) {
        return stats;
      }

      await fs.writeFile(this.outputFilePath, this.#USER_HEADERS.join(','));
      const [headers, ...lines] = csv.split(EOL);
      this.#processHeaders(headers);

      for (const line of lines) {
        await this.#processUsersLine(line, stats);
      }
    } catch (error) {
      await this.#safeDelete(this.outputFilePath);
      throw error;
    }

    if (stats.processed === 0) {
      await this.#safeDelete(this.outputFilePath);
    }

    return stats;
  }

  /**
   * Processes a CSV file of users line by line (performant version using streams)
   * @returns {Promise<Stats>} - Processing statistics
   */
  async processUsersAsStream() {
    const stats = new Stats();
    const lines = this.#getLines();

    try {
      await fs.writeFile(this.outputFilePath, this.#USER_HEADERS.join(','));
      const { value } = await lines.next();
      this.#processHeaders(value);

      for await (const line of lines) {
        await this.#processUsersLine(line, stats);
      }
    } catch (error) {
      await this.#safeDelete(this.outputFilePath);
      throw error;
    }

    if (stats.processed === 0) {
      await this.#safeDelete(this.outputFilePath);
    }

    return stats;
  }

  /**
   * Processes a CSV file of users line by line (performant version using streams and concurrency)
   * This method reads the input file line by line, processes each user, and writes valid users to the output file.
   * It uses a concurrency limit to avoid overwhelming the system with too many simultaneous file operations.
   * @returns {Promise<Stats>} - Processing statistics
   */
  async processUsersAsStreamAndConcurrency() {
    const batchSize = 1000; // Number of lines to process concurrently
    const stats = new Stats();
    const lines = this.#getLines();

    try {
      await fs.writeFile(this.outputFilePath, this.#USER_HEADERS.join(','));
      const { value } = await lines.next();
      this.#processHeaders(value);
      let promises = [];

      for await (const line of lines) {
        promises.push(this.#processUsersLine(line, stats));

        if (promises.length >= batchSize) {
          await Promise.allSettled(promises);
          promises = [];
        }
      }

      if (promises.length > 0) {
        await Promise.allSettled(promises);
      }
    } catch (error) {
      await this.#safeDelete(this.outputFilePath);
      throw error;
    }

    if (stats.processed === 0) {
      await this.#safeDelete(this.outputFilePath);
    }

    return stats;
  }

  /**
   * Creates an async iterator to read lines from the input file
   * @private
   * @returns {NodeJS.AsyncIterator<string>}
   */
  #getLines() {
    const rl = readline.createInterface({
      input: createReadStream(this.inputFilePath, { encoding: 'utf-8' }),
      crlfDelay: Infinity,
    });
    return rl[Symbol.asyncIterator]();
  }

  /**
   * Process user
   * @param {User} user - User object containing name, email, and age
   * @returns {string|null} - Processed line or null if invalid
   */
  #processUser({ name, email, age }) {
    if (!email.includes('@')) {
      return null;
    }

    if (Number.isNaN(age) || age < 0) {
      return null;
    }

    return [name.toUpperCase(), email, age].join(',');
  }

  #safeDelete(filePath) {
    return fs.unlink(filePath).catch((error) => {
      if (error.code !== 'ENOENT') {
        console.error(`Error deleting file ${filePath}:`, error);
      }
    });
  }

  /**
   * Processes the headers of the CSV file to find the indices of name, email, and age
   * @private
   * @param line - The header line of the CSV file
   * @throws {Error} If the required headers are not found
   * @returns {void}
   */
  #processHeaders(line) {
    const headers = line.split(',');
    this.#nameIndex = headers.indexOf('name');
    this.#emailIndex = headers.indexOf('email');
    this.#ageIndex = headers.indexOf('age');
    if (
      this.#nameIndex === -1 ||
      this.#emailIndex === -1 ||
      this.#ageIndex === -1
    ) {
      console.error('Error in header line', line);
      throw new Error(
        'CSV file must contain "name", "email", and "age" headers'
      );
    }
  }

  async #processUsersLine(line, stats) {
    if (!line.trim()) return; // Skip empty lines

    const values = line.split(',');
    const name = values[this.#nameIndex];
    const email = values[this.#emailIndex];
    const age = values[this.#ageIndex];
    if (!name || !email || !age) {
      stats.skipped++;
      return; // Skip invalid lines
    }

    const processedLine = this.#processUser({
      name: name.trim(),
      email: email.trim(),
      age: parseInt(age.trim(), 10),
    });
    if (processedLine) {
      await fs.appendFile(this.outputFilePath, `${EOL}${processedLine}`);
      stats.processed++;
    } else {
      stats.skipped++;
    }
  }
}
