var assert = require('assert');
var ShareInfo = require('..');

describe('ShareInfo', () => {
    it('crawelr', (itDone) => {
        var taskCount = 0;
        var shareCrawler = new ShareInfo({
            gzip: true,
            maxConnections: 3,
            method: 'GET',
            timeout: 5000,
            retries: 3,
            retryTimeout: 3000,
            callback: function (error, results, done) {
                if (error) {
                    console.error(error);
                } else {
                    console.log(JSON.stringify(results.parser.share, null, 4));
                    console.log(results.req.context);
                    //console.log(results.res);
                }
                done();
                taskCount++;
                if (taskCount == 1) {
                    itDone();
                }
            }
        });
        shareCrawler.queue(['https://github.com', 'https://stackoverflow.com', 'https://toutiao.io']);
        shareCrawler.queue({ url: 'https://www.npmjs.com', rejectUnauthorized: false, context: { a: 1, b: 2 } });
    });

    it('parser', (itDone) => {
        var request = require('request');
        var url = 'https://github.com/';
        request(url, function (error, response, body) {
            var shareInfo = new ShareInfo();
            var results = shareInfo.parse(url, body)
            console.log(JSON.stringify(results, null, 4));
            itDone();
        });
    });
});