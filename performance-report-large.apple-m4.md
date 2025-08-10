# CSV Parser Performance Demo Results

Generated on: 2025-08-10T10:27:13.356Z

## System Information

- **CPU**: Apple M4
- **Node.js Version**: v22.17.0
- **Platform**: darwin arm64
- **Total Memory**: 24 GB

## Test Parameters

- **Records Processed**: 100.000.000
- **Input File Size**: 7.32 GB

## Performance Results

### CSV Generation

- **Time**: 8m 54.87s
- **Peak Memory Used**: 32.78 MB
- **CPU Usage**: 539049.94ms (User: 529281.70ms, System: 9768.24ms)

### Processing Comparison

| Metric                | Stream                                                 | Stream + Concurrency                                   |
|-----------------------|--------------------------------------------------------|--------------------------------------------------------|
| **Execution Time**    | 34m 7.12s                                              | 7m 49.19s                                              |
| **Peak Memory**       | 37.74 MB                                               | 41.64 MB                                               |
| **CPU Usage**         | 2161817.55ms (User: 600924.13ms, System: 1560893.42ms) | 1802819.91ms (User: 519498.71ms, System: 1283321.20ms) |
| **Records Processed** | 67,506,491                                             | 67,506,491                                             |
| **Records Skipped**   | 32,493,509                                             | 32,493,509                                             |
| **Output File Size**  | 2.69 GB                                                | 2.69 GB                                                |

## Processing Methods

### 1. Stream

- **How it works**: Reads the file line by line using streams.

### 2. Stream + Concurrency

- **How it works**: Uses streams and processes file operations concurrently.

## Conclusion

The **Stream + Concurrency** approach is the clear winner for processing large
CSV files. It provides a scalable and robust solution by combining the memory
efficiency of streams with the speed of parallel processing. This method is
highly recommended for production environments where performance and resource
management are critical.
