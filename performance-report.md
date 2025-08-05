# CSV Parser Performance Demo Results

Generated on: 2025-08-05T14:41:15.758Z

## System Information
- **CPU**: Apple M1
- **Node.js Version**: v22.17.0
- **Platform**: darwin arm64
- **Total Memory**: 16 GB

## Test Parameters
- **Records Processed**: 5.000.000
- **Input File Size**: 384.22 MB

## Performance Results

### CSV Generation
- **Time**: 37.36s
- **Memory Used**: 5.47 MB

### Processing Comparison

| Metric | Normal Processing | Stream + Concurrency | Improvement |
|--------|------------------|---------------------|-------------|
| **Execution Time** | 2m 15.34s | 49.56s | 63.4% faster |
| **Memory Usage** | 575.08 MB | 84.72 MB | 85.3% less |
| **Records Processed** | 3,373,882 | 3,373,882 | - |
| **Records Skipped** | 1,626,118 | 1,626,118 | - |
| **Output File Size** | 137.67 MB | 137.67 MB | - |

## Processing Methods

### Normal Processing
- Reads entire file into memory using `fs.readFile()`
- Splits content by line breaks
- Processes each line sequentially
- Simple but memory-intensive for large files

### Stream + Concurrency Processing
- Uses Node.js streams with `readline.createInterface()`
- Processes lines as they are read (memory efficient)
- Utilizes `p-map` for controlled concurrency (1000 concurrent operations)
- Combines streaming I/O with parallel processing for optimal performance

## Key Findings

✅ **Memory Efficiency**: Stream processing used significantly less memory, making it suitable for large files.

✅ **Performance**: Stream processing with concurrency was faster due to parallel promise execution.

## Conclusion

The stream-based approach with controlled concurrency provides the best balance of:
- **Memory efficiency** for large datasets
- **Processing speed** through parallel execution
- **Scalability** for production environments

This combination makes it ideal for processing large CSV files in production environments where memory usage and processing speed are critical factors.
