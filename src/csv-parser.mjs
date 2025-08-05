import path from 'node:path';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import * as readline from 'node:readline';
import { EOL } from 'node:os';

/**
 * @typedef {Object} User
 * @property {string} name - User's full name
 * @property {string} email - User's email address
 * @property {number} age - User's age
 */

export class CsvParser {
  static #USER_HEADERS = ['name', 'email', 'age'];

  /**
   * Processes a CSV file of users line by line
   * @param {string} inputFilePath - Path to the input CSV file
   * @param {string} [outputFilePath] - Path to the output file (default: output.csv)
   * @returns {Promise<{processed: number, skipped: number}>} - Processing statistics
   */
  static async processUsers(inputFilePath, outputFilePath) {
    if (!outputFilePath) {
      const inputDir = path.dirname(inputFilePath);
      outputFilePath = path.join(inputDir, 'output.csv');
    }
    const stats = {
      processed: 0,
      skipped: 0,
    };

    try {
      await fs.writeFile(outputFilePath, CsvParser.#USER_HEADERS.join(','));
      let isFirstLine = true;
      let nameIndex = -1;
      let emailIndex = -1;
      let ageIndex = -1;
      for await (const line of readline.createInterface(
        createReadStream(inputFilePath, { encoding: 'utf-8' })
      )) {
        if (isFirstLine) {
          isFirstLine = false;
          const headers = line.split(',');
          nameIndex = headers.indexOf('name');
          emailIndex = headers.indexOf('email');
          ageIndex = headers.indexOf('age');
          if (nameIndex === -1 || emailIndex === -1 || ageIndex === -1) {
            throw new Error(
              'CSV file must contain "name", "email", and "age" headers'
            );
          }
          continue;
        }
        if (!line.trim()) continue; // Skip empty lines

        const values = line.split(',');
        const name = values[nameIndex];
        const email = values[emailIndex];
        const age = values[ageIndex];
        if (!name || !email || !age) {
          stats.skipped++;
          continue; // Skip invalid lines
        }

        const user = {
          name: name.trim(),
          email: email.trim(),
          age: parseInt(age.trim(), 10),
        };
        const processedLine = CsvParser.#processUser(user);
        if (processedLine) {
          await fs.appendFile(outputFilePath, `${EOL}${processedLine}`);
          stats.processed++;
        } else {
          stats.skipped++;
        }
      }
    } catch (error) {
      await CsvParser.#safeDelete(outputFilePath);
      throw error;
    }

    if (stats.processed === 0) {
      await CsvParser.#safeDelete(outputFilePath);
    }

    return stats;
  }

  /**
   * Process user
   * @param {User} user - User object containing name, email, and age
   * @returns {string|null} - Processed line or null if invalid
   */
  static #processUser({ name, email, age }) {
    if (!email.includes('@')) {
      return null;
    }

    if (Number.isNaN(age) || age < 0) {
      return null;
    }

    return [name.toUpperCase(), email, age].join(',');
  }

  static #safeDelete(filePath) {
    return fs.unlink(filePath).catch((error) => {
      if (error.code !== 'ENOENT') {
        console.error(`Error deleting file ${filePath}:`, error);
      }
    });
  }
}
