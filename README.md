# Parse CSV 4 Fun 🚀

A tool for processing massive CSV files using Node.js Streams, designed to
handle files over 2GB without loading everything into memory.

## 📋 Description

This project implements an efficient solution for processing large CSV files
line by line, validating and transforming data in real-time. Perfect for
scenarios where you need to process millions of records without compromising
performance.

## 🎯 Challenge

For complete technical challenge details, see: [CHALLENGE.md](./CHALLENGE.md)

## ⚡ Features

- **Stream Processing**: Processes CSV files line by line without loading
  everything into memory
- **Real-time validation**: Validates emails and ages during processing
- **Data transformation**: Automatically converts names to uppercase
- **Fake data generation**: Includes generator to create massive test CSVs
- **Built-in modules only**: Uses only Node.js built-in modules (fs, stream,
  readline)
- **Robust error handling**: Skips invalid lines and continues processing

## 🛠️ Installation

```bash
npm install
```

## 📋 Available Scripts

Check all scripts in [package.json](./package.json):

```bash
# Run tests
npm test

# Linting
npm run lint
npm run lint:fix

# Generate massive CSV for testing (100 million records)
npm run generate:huge-csv
```

## 🚀 Usage

### Generate test CSV file

```bash
# Generate file with 100 million records
node generate-input.mjs 100_000_000 ./huge.csv

# Generate smaller file for testing
node generate-input.mjs 1_000 ./input.csv
```

### Process CSV file

```bash
node main.mjs
```

The script will process `input.csv` and generate `output.csv` with:

- Names converted to uppercase
- Only lines with valid emails (contain @)
- Only lines with valid numeric ages
- Invalid lines automatically skipped

## 📊 Data Format

**Input (input.csv):**

```csv
name,email,age
john doe,john@example.com,25
jane smith,invalid-email,XXX
bob johnson,bob@test.com,35
```

**Output (output.csv):**

```csv
name,email,age
JOHN DOE,john@example.com,25
BOB JOHNSON,bob@test.com,35
```

## 🏗️ Architecture

- **Streams**: Uses `fs.createReadStream` and `fs.createWriteStream` for
  efficient I/O
- **Readline Interface**: Processes line by line with `readline.createInterface`
- **Promise Pipeline**: Uses `stream/promises.pipeline` for asynchronous flow
- **Validation**: Regex for emails and `Number()` to validate ages
- **Transformation**: Real-time processing during streaming

## 🎭 Fake Data Generator

Includes a `RandomCsvGenerator` class that uses `@faker-js/faker` to create
massive CSV files with realistic data:

- Unique IDs
- Full names
- Valid and invalid emails (for testing)
- Numeric and non-numeric ages (for testing)
- Real-time progress
- Performance information

## 📈 Performance

- **Memory**: Constant memory usage regardless of file size
- **Speed**: Processes FILL_WITH_REAL_NUMBER_WITH_M4 records per second (
  hardware dependent)
- **Scalability**: Capable of handling multi-GB files without issues

## 🧪 Testing

```bash
npm test
```

## 🔧 Linting

The project uses ESLint with modern configuration:

```bash
npm run lint        # Check code
npm run lint:fix    # Auto-fix issues
```

## 📝 License

ISC - See [package.json](./package.json) for more details.

---

**Author**: Ulises Santana  
**Version**: 1.0.0
