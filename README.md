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

## Example

`shareInfo.parse(url, html)`

```js
var request = require('request');
var url = 'https://github.com/';

request(url, function (error, response, body) {
    var shareInfo = new ShareInfo();
    var results = shareInfo.parse(url, body);
    console.log(results);
});
```
```json
//results
{
    "share": {
        "title": "Build software better, together",
        "description": "GitHub is where people build software. More than 36 million people use GitHub to discover, fork, and contribute to over 100 million projects.",
        "image": "https://github.githubassets.com/images/modules/open_graph/github-logo.png",
        "icon": "https://github.githubassets.com/favicon.ico",
        "url": "https://github.com/",
        "site_name": "GitHub"
    },
    "meta": {
        "title": "The world’s leading software development platform · GitHub",
        "description": "GitHub brings together the world’s largest community of developers to discover, share, and build better software. From open source projects to private team repositories, we’re your all-in-one platform for collaborative development.",
        "keywords": ""
    },
    "og": {
        "og:url": "https://github.com",
        "og:site_name": "GitHub",
        "og:title": "Build software better, together",
        "og:description": "GitHub is where people build software. More than 36 million people use GitHub to discover, fork, and contribute to over 100 million projects.",
        "og:image": "https://github.githubassets.com/images/modules/open_graph/github-octocat.png",
        "og:image:type": "image/png",
        "og:image:width": "1200",
        "og:image:height": "620"
    },
    "twitter": {
        "twitter:site": "github",
        "twitter:site:id": "13334762",
        "twitter:creator": "github",
        "twitter:creator:id": "13334762",
        "twitter:card": "summary_large_image",
        "twitter:title": "GitHub",
        "twitter:description": "GitHub is where people build software. More than 36 million people use GitHub to discover, fork, and contribute to over 100 million projects.",
        "twitter:image:src": "https://github.githubassets.com/images/modules/open_graph/github-logo.png",
        "twitter:image:width": "1200",
        "twitter:image:height": "1200"
    }
}
```

## Use Crawler

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
            //console.log(results.req.context);
            //console.log(results.res);
        }
        done();
    }
});
shareCrawler.queue(["https://github.com", "https://stackoverflow.com"]);
shareCrawler.queue({ url: 'https://www.npmjs.com', rejectUnauthorized: false, context: { a: 1, b: 2 } });
```

```json
{
    "title": "Stack Overflow - Where Developers Learn, Share, & Build Careers",
    "description": "Stack Overflow | The World’s Largest Online Community for Developers",
    "image": "https://cdn.sstatic.net/Sites/stackoverflow/img/apple-touch-icon@2.png?v=73d79a89bded",
    "icon": "https://cdn.sstatic.net/Sites/stackoverflow/img/apple-touch-icon.png?v=c78bd457575a",
    "url": "https://stackoverflow.com/",
    "site_name": "Stack Overflow"
}
```
```json
{
    "title": "Build software better, together",
    "description": "GitHub is where people build software. More than 36 million people use GitHub to discover, fork, and contribute to over 100 million projects.",
    "image": "https://github.githubassets.com/images/modules/open_graph/github-logo.png",
    "icon": "https://github.githubassets.com/favicon.ico",
    "url": "https://github.com/",
    "site_name": "GitHub"
}
```
```json
{ a: 1, b: 2 }
{
    "title": "npm | build amazing things",
    "description": "",
    "image": "https://static.npmjs.com/338e4905a2684ca96e08c7780fc68412.png",
    "icon": "https://static.npmjs.com/1996fcfdf7ca81ea795f67f093d7f449.png",
    "url": "https://www.npmjs.com/",
    "site_name": "npmjs.com"
}
```

## Tests

Tests are written with [mocha](https://mochajs.org)

```bash
npm test
```