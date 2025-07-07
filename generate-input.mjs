

import { faker } from '@faker-js/faker';
import { Readable, pipeline } from 'stream'
import fs from 'fs'
import path from 'path'
import { EOL } from 'os'

/**
 * Class for generating fake user data and writing it to a CSV file.
 */
class RandomCsvGenerator {
  /**
   * Generates a fake user object.
   * @returns {Object}
   */
  static generateFakeUser() {
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      country: faker.location.country(),
      birthdate: faker.date.birthdate(),
      avatar: faker.image.avatar()
    }
  }

  /**
   * Generator for numbers from 1 to the specified limit.
   * @param {number} limit
   * @private
   */
  static *#iterateTo(limit) {
    for (let index = 1; index <= limit; index++) {
      yield index
    }
  }

  /**
   * Formats a number with thousand separators.
   * @param {number} x
   * @returns {string}
   * @private
   */
  static #numberWithThousandSeparator(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  /**
   * Logs progress to the console.
   * @param {number} index
   * @param {number} logLimit
   * @param {number} startLoop
   * @private
   */
  static #logProgress(index, logLimit, startLoop) {
    console.log(`Created ${
      RandomCsvGenerator.#numberWithThousandSeparator(index)
    } records for huge CSV. (${
      RandomCsvGenerator.#numberWithThousandSeparator(logLimit)
    } in ${(Date.now() - startLoop) / 1000} seconds.)`
    )
  }

  /**
   * Generates records as a CSV stream.
   * @param {number} limit
   * @param {() => object} generateRecord
   * @returns {AsyncGenerator<Buffer>}
   * @private
   */
  static #generateRecords(limit, generateRecord) {
    const self = this;
    return async function* (source) {
      const logLimit = 1_000_000
      let startTime = Date.now()
      for await (const index of source) {
        if (index === 1) {
          yield Buffer.from(Object.keys(generateRecord()).join(',') + EOL)
        }
        if (index % logLimit === 0) {
          self.#logProgress(index, logLimit, startTime)
          startTime = Date.now()
        }
        yield Buffer.from(Object.values(generateRecord()).join(',') + EOL)
      }
    }
  }

  /**
   * Callback for finishing the generation process.
   * @param {number} limit
   * @param {number} startTime
   * @param {string} outputPath
   * @returns {(error: Error) => void}
   * @private
   */
  static #onFinish(limit, startTime, outputPath) {
    return (error) => {
      if (error) {
        console.error(`Error generating CSV file: ${error.toString()}`)
      } else {
        console.log(`Generated ${RandomCsvGenerator.#numberWithThousandSeparator(limit)} records for huge CSV in ${(Date.now() - startTime) / 1000} seconds.`)
        const {size: fileSizeInBytes} = fs.statSync(outputPath)
        const fileSizeInGB = (fileSizeInBytes / (1024 ** 3)).toFixed(2)
        console.log(`CSV file generated at ${outputPath} (${fileSizeInGB} GB)`)
      }
    }
  }

  /**
   * Generates a CSV file with fake records.
   * @param {bigint} limit
   * @param {string} outputPath
   * @param {Function} [generateRecord=RandomCsvGenerator.generateFakeUser]
   * @returns {Promise<void>}
   */
  static async generate(limit, outputPath, generateRecord = RandomCsvGenerator.generateFakeUser) {
    if (typeof limit !== 'bigint' || limit <= 0n) {
      throw new Error(`Invalid amount of records given (${limit})`)
    }
    if (fs.existsSync(outputPath)) {
      await fs.promises.unlink(outputPath)
    }
    const startTime = Date.now()
    // @ts-ignore
    await pipeline(
      Readable.from(RandomCsvGenerator.#iterateTo(limit)),
      RandomCsvGenerator.#generateRecords(limit, generateRecord),
      fs.createWriteStream(outputPath),
      RandomCsvGenerator.#onFinish(limit, startTime, outputPath)
    )
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    // node generate-input.mjs 10000000 ./huge.csv
    const [_node, _module, rawLimit, filePath] = process.argv
    const limit = BigInt(rawLimit.replaceAll('_', ''))
    const outputPath = path.resolve(filePath)
    await RandomCsvGenerator.generate(limit, outputPath)
  } catch (e) {
    console.error(`Error: ${e.toString()}`)
    console.error('Error generating csv file.')
    console.error(`Usage: node generate-input.mjs <limit> <filePath>`)
    process.exit(1)
  }
}
