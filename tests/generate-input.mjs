import { faker } from '@faker-js/faker';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import fs from 'node:fs';
import path from 'node:path';
import { EOL } from 'node:os';

/**
 * Class for generating fake user data and writing it to a CSV file.
 */
export class RandomCsvGenerator {
  /**
   * Generates a fake user object.
   * @returns {Object}
   */
  static generateFakeUser() {
    const email = faker.internet.email();
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: Math.random() > 0.1 ? email : email.replace(/@/, '=_='),
      age:
        Math.random() > 0.25
          ? faker.number.int({ min: 18, max: 99 })
          : faker.number.romanNumeral({ min: 18, max: 99 }),
    };
  }

  /**
   * Generates a CSV file with fake records.
   * @param {bigint} limit
   * @param {string} outputPath
   * @param {Function} [generateRecord=RandomCsvGenerator.generateFakeUser]
   * @returns {Promise<void>}
   */
  static async generate(
    limit,
    outputPath,
    generateRecord = RandomCsvGenerator.generateFakeUser
  ) {
    if (typeof limit !== 'bigint' || limit <= 0n) {
      throw new Error(`Invalid amount of records given (${limit})`);
    }

    try {
      await fs.promises.access(outputPath);
      await fs.promises.unlink(outputPath);
    } catch {
      // File doesn't exist, which is fine
    }

    const startTime = Date.now();

    try {
      await pipeline(
        Readable.from(RandomCsvGenerator.#iterateTo(limit)),
        RandomCsvGenerator.#generateRecords(limit, generateRecord),
        fs.createWriteStream(outputPath)
      );

      // Log completion
      console.log(
        `Generated ${RandomCsvGenerator.numberWithThousandSeparator(limit)} records for huge CSV in ${(Date.now() - startTime) / 1000} seconds.`
      );
      const { size: fileSizeInBytes } = await fs.promises.stat(outputPath);
      const fileSizeInGB = (fileSizeInBytes / 1024 ** 3).toFixed(2);
      console.log(`CSV file generated at ${outputPath} (${fileSizeInGB} GB)`);
    } catch (error) {
      console.error(`Error generating CSV file: ${error.toString()}`);
      throw error;
    }
  }

  static async run() {
    // node generate-input.mjs 10000000 ./huge.csv
    if (process.argv.length !== 4) {
      throw new Error('Usage: node generate-input.mjs <limit> <filePath>');
    }
    /*eslint-disable-next-line no-unused-vars */
    const [_node, _module, rawLimit, filePath] = process.argv;
    const limit = BigInt(rawLimit.replaceAll('_', ''));
    const outputPath = path.resolve(filePath);
    await RandomCsvGenerator.generate(limit, outputPath);
  }

  /**
   * Generator for numbers from 1 to the specified limit.
   * @param {bigint} limit
   * @private
   */
  static *#iterateTo(limit) {
    for (let index = 1; index <= limit; index++) {
      yield index;
    }
  }

  /**
   * Formats a number with thousand separators.
   * @param {number} x
   * @returns {string}
   * @private
   */
  static numberWithThousandSeparator(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  /**
   * Logs progress to the console.
   * @param {number} index
   * @param {number} logBatch
   * @param {number} startLoop
   * @private
   */
  static #logProgress(index, logBatch, startLoop) {
    console.log(
      `Created ${RandomCsvGenerator.numberWithThousandSeparator(
        index
      )} records for huge CSV. (${RandomCsvGenerator.numberWithThousandSeparator(
        logBatch
      )} in ${(Date.now() - startLoop) / 1000} seconds.)`
    );
  }

  /**
   * Generates records as a CSV stream.
   * @param {bigint} limit
   * @param {() => object} generateRecord
   * @returns {AsyncGenerator<Buffer>}
   * @private
   */
  static #generateRecords(limit, generateRecord) {
    const self = this;
    /**
     * Generates a stream of CSV records.
     * @param {AsyncIterable<bigint>} source
     * @returns {AsyncGenerator<Buffer>}
     */
    return async function* (source) {
      const logBatch = 1_000_000;
      let startTime = Date.now();
      for await (const index of source) {
        if (index === 1) {
          yield Buffer.from(Object.keys(generateRecord()).join(',') + EOL);
        }
        if (index % logBatch === 0) {
          self.#logProgress(index, logBatch, startTime);
          startTime = Date.now();
        }
        yield Buffer.from(Object.values(generateRecord()).join(',') + EOL);
      }
    };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await RandomCsvGenerator.run();
  } catch (e) {
    console.error(`Error: ${e.toString()}`);
    console.error('Error generating csv file.');
    console.error(`Usage: node generate-input.mjs <limit> <filePath>`);
    process.exit(1);
  }
}
