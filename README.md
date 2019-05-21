# share-info

This module will scrape metadata from the URL shared

Module in pure javascript for node.js

Crawling supports:
- Configurable pool size and retries
- Control rate limit
- Priority queue of requests
- Parser with Cheerio

Scraping meta information supports:
- the `<title>` tag in the document head
- `meta[name="description"]` tag
- `meta[property="og"]` tag
- `meta[name="twitter"]` tag

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 8.0 or higher is required.

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install share-info
```

## Demo

```js
var shareCrawler = new ShareInfo({
    gzip: true,
    maxConnections: 2,
    method: 'GET',
    timeout: 5000,
    retries: 3,
    retryTimeout: 3000,
    callback: function (error, results, done) {
        if (error) {
            console.error(error);
        } else {
            console.log(results.parser.share);
            //console.log(results.parser.meta);
            //console.log(results.parser.og);
            //console.log(results.parser.twitter);
            //console.log(results.req);
            //console.log(results.res);
        }
        done();
    }
});
shareCrawler.queue(["https://github.com", "https://stackoverflow.com"]);
shareCrawler.queue("https://www.npmjs.com", {rejectUnauthorized: false});
```

### Results

```json
{
    "title": "npm | build amazing things",
    "image": "https://static.npmjs.com/338e4905a2684ca96e08c7780fc68412.png",
    "url": "https://www.npmjs.com",
    "site_name": "npmjs.com"
}
```

```json
{
    "title": "Stack Overflow - Where Developers Learn, Share, & Build Careers",
    "description": "Stack Overflow | The World’s Largest Online Community for Developers",
    "image": "https://cdn.sstatic.net/Sites/stackoverflow/img/apple-touch-icon@2.png?v=73d79a89bded",
    "url": "https://stackoverflow.com/",
    "site_name": "Stack Overflow"
}
```

```json
{
    "title": "Build software better, together",
    "description": "GitHub is where people build software. More than 36 million people use GitHub to discover, fork, and contribute to over 100 million projects.",
    "image": "https://github.githubassets.com/images/modules/open_graph/github-logo.png",
    "url": "https://github.com",
    "site_name": "GitHub"
}
```

## Tests

Tests are written with [mocha](https://mochajs.org)

```bash
npm test
```