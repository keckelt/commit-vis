# commit-vis  [![npm (scoped)](https://img.shields.io/npm/v/commit-vis?style=flat)](https://www.npmjs.com/package/commit-vis)

Create a heatmap to display the number of commits for all repositories in a directory.

![visualization(3)](https://user-images.githubusercontent.com/10337788/126155796-d60fe325-77f0-4ca8-8278-8c3b3867576d.png)


## Usage

If you have [Node](nodejs.org/) (v14+), create a heatmap for the repos in your current folder by running: 

```sh
npx commit-vis
```

It will start a web server (https://localhost:3000) to display the visualization.  
You can export the plot using the `...` menu at the top right.

## Command-Line Options:

* `-d`, `--directory <path>` directory with repos to generate the heatmap for (default: current directory `./`)
* `-h`, `--hide` hide repo names in output
* `-o`, `--output <filename>` name of the JSON output with all commits (default: `commits.json`)
* `-p`, `--port <filename>` port to run the server on (default: `3000`)
