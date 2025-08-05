/**
 * @fileoverview Statistics tracking for CSV processing operations
 * @module Stats
 */

/**
 * Represents processing statistics for CSV file operations.
 * Tracks the number of successfully processed records and skipped records,
 * providing a total count and methods for statistical analysis.
 *
 * @class Stats
 * @example
 * // Create new stats instance
 * const stats = new Stats();
 *
 * // Create with initial values
 * const stats = new Stats(100, 5);
 * console.log(stats.total); // 105
 */
export class Stats {
  /**
   * Creates a new Stats instance for tracking CSV processing statistics
   *
   * @param {number} [processed=0] - Number of successfully processed records
   * @param {number} [skipped=0] - Number of skipped/invalid records
   * @throws {TypeError} If processed or skipped are not numbers
   * @throws {RangeError} If processed or skipped are negative values
   *
   * @example
   * // Create empty stats
   * const stats = new Stats();
   *
   * @example
   * // Create with initial values
   * const stats = new Stats(50, 3);
   */
  constructor(processed = 0, skipped = 0) {
    if (typeof processed !== 'number' || typeof skipped !== 'number') {
      throw new TypeError('processed and skipped must be numbers');
    }
    if (processed < 0 || skipped < 0) {
      throw new RangeError('processed and skipped must be non-negative');
    }

    /**
     * Number of successfully processed records
     * @type {number}
     */
    this.processed = processed;

    /**
     * Number of skipped or invalid records
     * @type {number}
     */
    this.skipped = skipped;
  }

  /**
   * Gets the total number of records (processed + skipped)
   *
   * @readonly
   * @type {number}
   * @returns {number} The sum of processed and skipped records
   */
  get total() {
    return this.processed + this.skipped;
  }
}
