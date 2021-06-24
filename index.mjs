import fs from 'fs';
import path from 'path';
import git from 'nodegit';
import http from 'http';
import open from 'open';

const reposPath = '/home/klaus/ws/CG Lab 2021/CG Lab 2021 Project-06-23-2021-10-55-44';
const outputFile = 'commits.json'


const getDirectories = (parentPath) => {
  return fs.readdirSync(parentPath).filter((entry) => {
    return fs.statSync(path.join(parentPath, entry)).isDirectory();
  });
}

const getCommits = async (parentPath, repoName) => {
  const repo = await git.Repository.open(path.join(parentPath, repoName));
  const walker = git.Revwalk.create(repo);
  walker.pushHead();
  const commits = await walker.getCommitsUntil(c => true);
  return commits.map(x => ({
    sha: x.sha(),
    msg: x.message().split('\n')[0],
    date: x.date(),
    author: x.author(),
    repo: repoName
  }));
};

const repos = await getDirectories(reposPath);
const commits = await Promise.all(
  repos.map(async (repo) => await getCommits(reposPath, repo))
);

try {
  fs.writeFileSync(outputFile, JSON.stringify(commits.flat(), null, 2));
  console.log('Saved commits to ', outputFile)
} catch (err) {
  console.error('Could not save commits!', err);
}

const server = http.createServer((req, res) => {
  if (req.url.includes('commits.json')) {
    res.writeHead(200, { 'content-type': 'text/json' })
    fs.createReadStream('commits.json').pipe(res)
  } else {
    res.writeHead(200, { 'content-type': 'text/html' })
    fs.createReadStream('index.html').pipe(res)
  }
})

server.listen(3000)
console.log('Serving visualization from http://localhost:3000')
open('http://localhost:3000')