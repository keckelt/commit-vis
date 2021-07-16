import fs from 'fs';
import path from 'path';
import git from 'nodegit';
import http from 'http';
import open from 'open';
import { Command } from 'commander/esm.mjs';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

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

const config = {dictionaries: [adjectives, animals]};

const getDirectories = (parentPath) => {
  return fs.readdirSync(parentPath).filter((entry) => {
    return fs.statSync(path.join(parentPath, entry)).isDirectory();
  });
}

const getCommits = async (parentPath, repoName) => {
  try {
    const visibleRepoName = options.hide ? uniqueNamesGenerator(config) : repoName
    const repo = await git.Repository.open(path.join(parentPath, repoName));
    const walker = git.Revwalk.create(repo);
    walker.pushHead();
    const commits = await walker.getCommitsUntil(c => true);
    return commits.map(x => ({
      // sha: x.sha(),
      // msg: x.message().split('\n')[0],
      // author: x.author(),
      date: x.date(),
      repo: visibleRepoName
    }));
  } catch {
    console.error('Could not read repository: ', repoName);
    return [];
  }
};


console.debug('Fetching all directories in ', reposPath);
const repos = await getDirectories(reposPath);


console.debug('Fetching commits...');
const commits = await Promise.all(
  repos.map(async (repo) => await getCommits(reposPath, repo))
);

try {
  fs.writeFileSync(outputFile, JSON.stringify(commits.flat(), null, 2));
  console.info('Saved commits to ', outputFile);
} catch (err) {
  console.error('Could not save commits!', err);
}

const server = http.createServer((req, res) => {
  if (req.url.includes('commits.json')) {
    res.writeHead(200, { 'content-type': 'text/json' });
    fs.createReadStream('commits.json').pipe(res);
  } else {
    res.writeHead(200, { 'content-type': 'text/html' });
    console.log(new URL('./index.html', import.meta.url));
    fs.createReadStream(new URL('./index.html', import.meta.url)).pipe(res);
  }
})

server.listen(parseInt(options.port));
console.info('Serving visualization from http://localhost:'+options.port);
open('http://localhost:'+options.port);