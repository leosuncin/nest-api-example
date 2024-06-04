#!/usr/bin/env node
import { HttpStatus } from '@nestjs/common';
import { request, type RequestOptions } from 'node:http';
import { format } from 'node:util';

const options: RequestOptions = {
  hostname: 'localhost',
  method: 'GET',
  path: '/health',
  port: process.env['PORT'] ?? '3000',
  timeout: 2_000,
};

request(options, (response) => {
  process.stdout.write(`CODE: ${response.statusCode ?? ''}\n`);
  process.stdout.write(`STATUS: ${response.statusMessage ?? ''}\n`);

  process.exit(response.statusCode === HttpStatus.OK ? 0 : 1);
})
  .on('error', (error) => {
    process.stderr.write(`ERROR: ${format(error)}\n`);

    process.exit(1);
  })
  .on('timeout', () => {
    process.stderr.write('ERROR: Request timeout\n');

    process.exit(2);
  })
  .end();
