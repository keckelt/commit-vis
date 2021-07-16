# commit-vis  ![npm (scoped)](https://img.shields.io/npm/v/commit-vis?style=flat)

Create a heatmap to display the number of commits for all repositories in a directory.

## Usage

```sh
npx commit-vis
```

## Command-Line Options:
* `-d`, `--directory <path>` directory with repos to generate the heatmap for (default: current directory `./`)
* `-h`, `--hide` hide repo names in output
* `-o`, `--output <filename>` name of the JSON output with all commits (default: `commits.json`)
* `-p`, `--port <filename>` port to run the server on (default: `3000`)
