# CSV Parser Performance Demo Results

Generated on: 2025-08-10T09:35:42.394Z

## System Information

- **CPU**: Apple M4
- **Node.js Version**: v22.17.0
- **Platform**: darwin arm64
- **Total Memory**: 24 GB

## Test Parameters

- **Records Processed**: 5.000.000
- **Input File Size**: 374.66 MB

## Performance Results

### CSV Generation

- **Time**: 27.07s
- **Peak Memory Used**: 33.02 MB
- **CPU Usage**: 27402.34ms (User: 26722.78ms, System: 679.55ms)

### Processing Comparison

| Metric                | Normal                                             | Stream                                             | Stream + Concurrency                              |
|-----------------------|----------------------------------------------------|----------------------------------------------------|---------------------------------------------------|
| **Execution Time**    | 1m 38.09s                                          | 1m 46.57s                                          | 23.60s                                            |
| **Peak Memory**       | 766.16 MB                                          | 32.08 MB                                           | 41.18 MB                                          |
| **CPU Usage**         | 107227.37ms (User: 30356.68ms, System: 76870.69ms) | 115881.45ms (User: 33659.53ms, System: 82221.92ms) | 89798.29ms (User: 26324.77ms, System: 63473.52ms) |
| **Records Processed** | 3,376,194                                          | 3,376,194                                          | 3,376,194                                         |
| **Records Skipped**   | 1,623,806                                          | 1,623,806                                          | 1,623,806                                         |
| **Output File Size**  | 137.74 MB                                          | 137.74 MB                                          | 137.74 MB                                         |

## Processing Methods

### 1. Normal

- **How it works**: Reads the entire file into memory and processes line by
  line.

### 2. Stream

- **How it works**: Reads the file line by line using streams.

### 3. Stream + Concurrency

- **How it works**: Uses streams and processes file operations concurrently.

## Conclusion

The **Stream + Concurrency** approach is the clear winner for processing large
CSV files. It provides a scalable and robust solution by combining the memory
efficiency of streams with the speed of parallel processing. This method is
highly recommended for production environments where performance and resource
management are critical.
