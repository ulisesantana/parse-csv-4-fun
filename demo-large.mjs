#!/usr/bin/env node

import { runDemo } from './demo.mjs';
import path from 'node:path';

const LARGE_DEMO_CONFIG = {
  RECORD_COUNT: 100_000_000n,
  inputFile: path.join(process.cwd(), 'demo-input-large.csv'),
  reportFile: path.join(process.cwd(), 'performance-report-large.md'),
  processingMethods: [
    {
      id: 'stream',
      name: 'Stream',
      method: 'processUsersAsStream',
      description: 'Reads the file line by line using streams.',
      outputFile: path.join(process.cwd(), 'demo-output-stream-large.csv'),
    },
    {
      id: 'streamConcurrency',
      name: 'Stream + Concurrency',
      method: 'processUsersAsStreamAndConcurrency',
      description:
        'Uses streams and processes file operations concurrently with p-map.',
      outputFile: path.join(
        process.cwd(),
        'demo-output-stream-concurrency-large.csv'
      ),
    },
  ],
};

runDemo(LARGE_DEMO_CONFIG).catch(console.error);
