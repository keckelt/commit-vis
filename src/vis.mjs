import fs from 'fs';
import path from 'path';
import git from 'nodegit';
import http from 'http';
import open from 'open';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

const uniqueNamesconfig = {dictionaries: [adjectives, animals]};
export class CommitVis {
  constructor(reposPath, outputFile, port, hideRepoNames) {
    this.reposPath = reposPath;
    this.outputFile = outputFile;
    this.port = port;
    this.hideRepoNames = hideRepoNames;
  }

  show() {
    this.gatherData();
    this.serve();
  }

  async gatherData() {
    console.debug('Fetching all directories in ', this.reposPath);
    const repos = await this.getDirectories(this.reposPath);

    console.debug('Fetching commits...');
    const commits = await Promise.all(
      repos.map(async (repo) => await this.getCommits(this.reposPath, repo))
    );

    try {
      fs.writeFileSync(this.outputFile, JSON.stringify(commits.flat(), null, 2));
      console.info('Saved commits to ', this.outputFile);
    } catch (err) {
      console.error('Could not save commits!', err);
    }
  }

  serve() {
    const server = http.createServer(requestHandler);
    server.listen(parseInt(this.port));
    console.info('Serving visualization from http://localhost:'+this.port);
    open('http://localhost:'+this.port);
  }

  getDirectories(parentPath) {
    return fs.readdirSync(parentPath).filter((entry) => {
      return fs.statSync(path.join(parentPath, entry)).isDirectory();
    });
  }

  async getCommits(parentPath, repoName) {
    try {
      const visibleRepoName = this.hideRepoNames ? uniqueNamesGenerator(uniqueNamesconfig) : repoName
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
  }
}

function requestHandler(req, res) {
  if (req.url.includes('commits.json')) {
    res.writeHead(200, { 'content-type': 'text/json' });
    fs.createReadStream('commits.json').pipe(res);
  } else {
    res.writeHead(200, { 'content-type': 'text/html' });
    fs.createReadStream(new URL('./index.html', import.meta.url)).pipe(res);
  }
}