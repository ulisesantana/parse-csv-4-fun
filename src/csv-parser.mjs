import path from 'node:path';

/**
 * @typedef {Object} User
 * @property {string} name - User's full name
 * @property {string} email - User's email address
 * @property {number} age - User's age
 */

export class CsvParser {
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
    // TODO: Implement CSV file reading and processing logic
    // TODO: Get the header from the first line and keep the order of the columns

    return {
      processed: 0,
      skipped: 0
    }
  }

  /**
   * Process user
   * @param {User} user - User object containing name, email, and age
   * @returns {string|null} - Processed line or null if invalid
   */
  static processUser({name, email, age}) {
    return null
  }
}
