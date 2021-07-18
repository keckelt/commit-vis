#!/usr/bin/env node

import { Command } from 'commander/esm.mjs';
import { CommitVis } from './src/vis.mjs';

console.debug('Startup: Going to read parameters');

const program = new Command();

program
.option('-d, --directory <path>', 'directory with repos to generate the heatmap for', './')
.option('-h, --hide', 'hide repo names in output')
.option('-o, --output <filename>', 'name of the JSON output with all commits', 'commits.json')
.option('-p, --port <number>', 'port to run the server on', '3000')
.parse();

const options = program.opts();
const reposPath = options.directory;
const outputFile = options.output;

const vis = new CommitVis(reposPath, outputFile, options.port, options.hide);
vis.show();