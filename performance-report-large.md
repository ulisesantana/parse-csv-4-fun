# CSV Parser Performance Demo Results

Generated on: 2025-08-07T23:17:09.965Z

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

- **Time**: 13m 30.88s
- **Peak Memory Used**: 33.21 MB
- **CPU Usage**: 815374.97ms (User: 800897.27ms, System: 14477.69ms)

### Processing Comparison

| Metric                | Stream                                                  | Stream + Concurrency                                   |
|-----------------------|---------------------------------------------------------|--------------------------------------------------------|
| **Execution Time**    | 48m 12.11s                                              | 14m 56.93s                                             |
| **Peak Memory**       | 37.6 MB                                                 | 42.43 MB                                               |
| **CPU Usage**         | 3136748.80ms (User: 1035077.21ms, System: 2101671.58ms) | 2710530.31ms (User: 856084.55ms, System: 1854445.76ms) |
| **Records Processed** | 67,504,118                                              | 67,504,118                                             |
| **Records Skipped**   | 32,495,882                                              | 32,495,882                                             |
| **Output File Size**  | 2.69 GB                                                 | 2.69 GB                                                |

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
