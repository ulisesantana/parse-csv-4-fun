#!/usr/bin/env node

import path from 'node:path';
import { DemoRunner } from './src/demo-runner.mjs';

const DEMO_CONFIG = {
  RECORD_COUNT: 5_000_000n,
  get inputFile() {
    return path.join(process.cwd(), 'demo-input.csv');
  },
  reportFile: path.join(process.cwd(), 'performance-report.md'),
  processingMethods: [
    {
      id: 'normal',
      name: 'Normal',
      method: 'processUsers',
      description:
        'Reads the entire file into memory and processes line by line.',
      outputFile: path.join(process.cwd(), 'demo-output-normal.csv'),
    },
    {
      id: 'stream',
      name: 'Stream',
      method: 'processUsersAsStream',
      description: 'Reads the file line by line using streams.',
      outputFile: path.join(process.cwd(), 'demo-output-stream.csv'),
    },
    {
      id: 'streamConcurrency',
      name: 'Stream + Concurrency',
      method: 'processUsersAsStreamAndConcurrency',
      description: 'Uses streams and processes file operations concurrently.',
      outputFile: path.join(
        process.cwd(),
        'demo-output-stream-concurrency.csv'
      ),
    },
  ],
};

const demo = new DemoRunner(DEMO_CONFIG);
demo.run().catch(console.error);
