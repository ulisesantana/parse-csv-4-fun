# CSV Parser Performance Demo Results

Generated on: 2025-08-13T17:43:32.112Z

## System Information
- **CPU**: Apple M1
- **Node.js Version**: v22.17.0
- **Platform**: darwin arm64
- **Total Memory**: 16 GB

## Test Parameters
- **Records Processed**: 5.000.000
- **Input File Size**: 374.68 MB

## Performance Results

### CSV Generation
- **Time**: 41.26s
- **Peak Memory Used**: 33.04 MB
- **CPU Usage**: 41463.54ms (User: 40633.61ms, System: 829.93ms)

### Processing Comparison

| Metric              | Normal | Stream | Stream + Concurrency |
|---------------------|-----------------|-----------------|-----------------|
| **Execution Time**  | 2m 13.83s | 2m 13.81s | 40.15s |
| **Peak Memory**     | 766.87 MB | 31.79 MB | 42.06 MB |
| **CPU Usage**       | 151681.06ms (User: 50344.98ms, System: 101336.08ms) | 151541.45ms (User: 50250.90ms, System: 101290.54ms) | 126038.08ms (User: 38876.69ms, System: 87161.39ms) |
| **Records Processed** | 3,372,763 | 3,372,763 | 3,372,763 |
| **Records Skipped**   | 1,627,237 | 1,627,237 | 1,627,237 |
| **Output File Size**  | 137.6 MB | 137.6 MB | 137.6 MB |

## Processing Methods

### 1. Normal
- **How it works**: Reads the entire file into memory and processes line by line.

### 2. Stream
- **How it works**: Reads the file line by line using streams.

### 3. Stream + Concurrency
- **How it works**: Uses streams and processes file operations concurrently with p-map.

## Conclusion

The **Stream + Concurrency** approach is the clear winner for processing large CSV files. It provides a scalable and robust solution by combining the memory efficiency of streams with the speed of parallel processing. This method is highly recommended for production environments where performance and resource management are critical.
