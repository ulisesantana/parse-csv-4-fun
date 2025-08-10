# CSV Parser Performance Demo Results

Generated on: 2025-08-07T21:59:07.907Z

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

- **Time**: 42.04s
- **Peak Memory Used**: 31.46 MB
- **CPU Usage**: 42133.40ms (User: 41310.13ms, System: 823.27ms)

### Processing Comparison

| Metric                | Normal                                              | Stream                                              | Stream + Concurrency                               |
|-----------------------|-----------------------------------------------------|-----------------------------------------------------|----------------------------------------------------|
| **Execution Time**    | 2m 35.86s                                           | 2m 34.78s                                           | 39.80s                                             |
| **Peak Memory**       | 766.83 MB                                           | 31.96 MB                                            | 40.74 MB                                           |
| **CPU Usage**         | 167820.96ms (User: 53274.41ms, System: 114546.55ms) | 162593.92ms (User: 54939.32ms, System: 107654.60ms) | 123858.36ms (User: 38393.38ms, System: 85464.99ms) |
| **Records Processed** | 3,374,477                                           | 3,374,477                                           | 3,374,477                                          |
| **Records Skipped**   | 1,625,523                                           | 1,625,523                                           | 1,625,523                                          |
| **Output File Size**  | 137.68 MB                                           | 137.68 MB                                           | 137.68 MB                                          |

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
