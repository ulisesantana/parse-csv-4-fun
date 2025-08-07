# CSV Parser Performance Demo Results

Generated on: 2025-08-07T00:05:29.604Z

## System Information
- **CPU**: Apple M1
- **Node.js Version**: v22.17.0
- **Platform**: darwin arm64
- **Total Memory**: 16 GB

## Test Parameters
- **Records Processed**: 5.000.000
- **Input File Size**: 374.66 MB

## Performance Results

### CSV Generation
- **Time**: 43.52s
- **Peak Memory Used**: 31.46 MB

### Processing Comparison

| Metric              | Normal | Stream | Stream + Concurrency |
|---------------------|-----------------|-----------------|-----------------|
| **Execution Time**  | 2m 21.66s | 2m 22.51s | 39.65s |
| **Peak Memory**     | 1.09 GB | 31.35 MB | 41.05 MB |
| **Records Processed** | 3,375,223 | 3,375,223 | 3,375,223 |
| **Records Skipped**   | 1,624,777 | 1,624,777 | 1,624,777 |
| **Output File Size**  | 137.71 MB | 137.71 MB | 137.71 MB |

## Processing Methods

### 1. Normal
- **How it works**: Reads the entire file into memory and processes line by line.

### 2. Stream
- **How it works**: Reads the file line by line using streams.

### 3. Stream + Concurrency
- **How it works**: Uses streams and processes file operations concurrently with p-map.

## Conclusion

The **Stream + Concurrency** approach is the clear winner for processing large CSV files. It provides a scalable and robust solution by combining the memory efficiency of streams with the speed of parallel processing. This method is highly recommended for production environments where performance and resource management are critical.
