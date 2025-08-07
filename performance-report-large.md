# CSV Parser Performance Demo Results

Generated on: 2025-08-07T01:19:34.415Z

## System Information
- **CPU**: Apple M1
- **Node.js Version**: v22.17.0
- **Platform**: darwin arm64
- **Total Memory**: 16 GB

## Test Parameters
- **Records Processed**: 100.000.000
- **Input File Size**: 7.32 GB

## Performance Results

### CSV Generation
- **Time**: 13m 44.66s
- **Peak Memory Used**: 33.18 MB

### Processing Comparison

| Metric              | Stream | Stream + Concurrency |
|---------------------|-----------------|-----------------|
| **Execution Time**  | 43m 27.12s | 13m 44.32s |
| **Peak Memory**     | 37.65 MB | 42.23 MB |
| **Records Processed** | 67,507,675 | 67,507,675 |
| **Records Skipped**   | 32,492,325 | 32,492,325 |
| **Output File Size**  | 2.69 GB | 2.69 GB |

## Processing Methods

### 1. Stream
- **How it works**: Reads the file line by line using streams.

### 2. Stream + Concurrency
- **How it works**: Uses streams and processes file operations concurrently with p-map.

## Conclusion

The **Stream + Concurrency** approach is the clear winner for processing large CSV files. It provides a scalable and robust solution by combining the memory efficiency of streams with the speed of parallel processing. This method is highly recommended for production environments where performance and resource management are critical.
