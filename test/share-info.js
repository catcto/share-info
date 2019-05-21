const assert = require('assert');
const ShareInfo = require('..');

describe('ShareInfo', () => {
    it('crawelr', (itDone) => {
        var shareCrawler = new ShareInfo({
            gzip: true,
            maxConnections: 3,
            method: 'GET',
            timeout: 5000,
            retries: 3,
            retryTimeout: 3000,
            callback: function (error, results, done) {
                if (error) {
                    itDone(error);
                } else {
                    console.log(JSON.stringify(results.parser.share, null, 4));
                    //console.log(results.req);
                    //console.log(results.res);
                    itDone();
                }
                done();
            }
        });
        shareCrawler.queue(["https://github.com", "https://stackoverflow.com"]);
        shareCrawler.queue("https://www.npmjs.com", { rejectUnauthorized: false });
    });


});