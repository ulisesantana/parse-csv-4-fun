# CSV Parser Performance Demo Results

Generated on: 2025-08-15T10:20:23.086Z

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
- **Time**: 13m 34.15s
- **Peak Memory Used**: 33.03 MB
- **CPU Usage**: 818986.88ms (User: 803790.79ms, System: 15196.09ms)

### Processing Comparison

| Metric              | Stream | Stream + Concurrency |
|---------------------|-----------------|-----------------|
| **Execution Time**  | 43m 55.30s | 14m 34.95s |
| **Peak Memory**     | 37.67 MB | 42.39 MB |
| **CPU Usage**       | 2974076.94ms (User: 966183.38ms, System: 2007893.56ms) | 2784250.32ms (User: 838637.65ms, System: 1945612.66ms) |
| **Records Processed** | 67,494,195 | 67,494,195 |
| **Records Skipped**   | 32,505,805 | 32,505,805 |
| **Output File Size**  | 2.69 GB | 2.69 GB |

## Processing Methods

### 1. Stream
- **How it works**: Reads the file line by line using streams.

### 2. Stream + Concurrency
- **How it works**: Uses streams and processes file operations concurrently with p-map.

## Conclusion

The **Stream + Concurrency** approach is the clear winner for processing large CSV files. It provides a scalable and robust solution by combining the memory efficiency of streams with the speed of parallel processing. This method is highly recommended for production environments where performance and resource management are critical.
