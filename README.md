# BOOK☆WALKER Light Novel Dataset
This command-line tool curates a dataset consisting of the light novel titles found on BOOK☆WALKER.

## Getting Started
To use this tool, you will need [Node.js](https://nodejs.org/en), which you should install on your machine beforehand. <br>

Clone this repository to your machine:
```shell
> git clone https://github.com/luethan2025/book_walker_light_novel_data.git
```
Now install the project's dependencies and configure Puppeteer by 'cd'-ing into the root of this project and running the command:
```shell
> sh bin/scripts/setup.sh
```

# Usage
Once all dependencies have been installed and Puppeteer has been properly configured, you can now use create your dataset.
```
Usage: scraper [options]

BOOK☆WALKER light novel dataset

Options:
  -V, --version         output the version number
  --directory <string>  destination directory (default: "./data/")
  --filename <string>   destination file (default: "titles.txt")
  -h, --help            display help for command
```
At minimum you must at least set the url argument to successfully run the program. The dataset will be found in `./data/titles.txt` by default, however, if you set the directory or the filename argument the dataset will be found there instead.
