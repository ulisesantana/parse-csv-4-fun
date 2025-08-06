# CSV Parser Performance Demo Results

Generated on: 2025-08-06T11:53:12.734Z

## System Information
- **CPU**: Apple M1
- **Node.js Version**: v22.17.0
- **Platform**: darwin arm64
- **Total Memory**: 16 GB

## Test Parameters
- **Records Processed**: 100.000.000
- **Input File Size**: 7.5 GB

## Performance Results

### CSV Generation
- **Time**: 12m 24.08s
- **Memory Used**: 4.79 MB

### Processing Comparison

| Metric              | Stream | Stream + Concurrency |
|---------------------|-----------------|-----------------|
| **Execution Time**  | 43m 21.03s | 13m 25.36s |
| **Memory Usage**    | 5.71 MB | 0 Bytes |
| **Records Processed** | 67,502,249 | 67,502,249 |
| **Records Skipped**   | 32,497,751 | 32,497,751 |
| **Output File Size**  | 2.69 GB | 2.69 GB |

## Processing Methods

### 1. Stream
- **How it works**: Reads the file line by line using streams.

### 2. Stream + Concurrency
- **How it works**: Uses streams and processes file operations concurrently with p-map.

## Conclusion

The **Stream + Concurrency** approach is the clear winner for processing large CSV files. It provides a scalable and robust solution by combining the memory efficiency of streams with the speed of parallel processing. This method is highly recommended for production environments where performance and resource management are critical.
