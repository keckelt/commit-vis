import fs from 'fs';
import path from 'path';
import git from 'nodegit';
import http from 'http';
import open from 'open';
import { Command } from 'commander/esm.mjs';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';


const program = new Command();

program
.requiredOption('-d, --directory <path>', 'directory with repos to generate the heatmap for')
.option('-o, --output <filename>', 'name of the JSON output with all commits', 'commits.json')
.option('-p, --port <number>', 'port to run the server on', '3000')
.option('-h, --hide', 'hide repo names in output')
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

const repos = await getDirectories(reposPath);
const commits = await Promise.all(
  repos.map(async (repo) => await getCommits(reposPath, repo))
);

try {
  fs.writeFileSync(outputFile, JSON.stringify(commits.flat(), null, 2));
  console.log('Saved commits to ', outputFile);
} catch (err) {
  console.error('Could not save commits!', err);
}

const server = http.createServer((req, res) => {
  if (req.url.includes('commits.json')) {
    res.writeHead(200, { 'content-type': 'text/json' });
    fs.createReadStream('commits.json').pipe(res);
  } else {
    res.writeHead(200, { 'content-type': 'text/html' });
    fs.createReadStream('index.html').pipe(res);
  }
})

server.listen(parseInt(options.port));
console.log('Serving visualization from http://localhost:'+options.port);
open('http://localhost:'+options.port);