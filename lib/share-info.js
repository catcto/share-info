var request = require('request');
var _ = require('lodash');
var async = require('async');
var Parser = require('./parser');

function ShareInfo(options) {
    var self = this;
    options = options || {};
    self.init(options);
}

ShareInfo.prototype.init = function (options) {
    var self = this;
    var defaultOptions = {
        gzip: true,
        maxConnections: 1,
        method: 'GET',
        timeout: 5000,
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36 Cat10/1.1'
        },
        retries: 3,
        retryTimeout: 3000,
        localAddressList: [],//TODO TEST
        cookieJar: false
    };
    self.options = _.extend(defaultOptions, options);
    self.task = async.queue(function (opt, callback) {
        self.req(opt, callback);
    }, self.options.maxConnections);
    self.request = request.defaults({ jar: self.options.cookieJar });
};

ShareInfo.prototype.getLocalAddress = function (interfaceName, family) {
    //IPv{6} IPv{4}
    var interfaces = os.networkInterfaces();
    if (interfaces && interfaces[interfaceName]) {
        var addressList = [];
        var interface = interfaces[interfaceName];
        for (var i = 0; i < interface.length; i++) {
            if (interface[i].family === 'IPv' + family && !interface[i].address.startsWith('f') && interface[i].address !== '127.0.0.1') {
                addressList.push({
                    localAddress: interface[i].address,
                    family: family
                });
            }
            return addressList;
        }
    }
    return [];
};

ShareInfo.prototype.queue = function (options) {
    var self = this;
    options = _.isArray(options) ? options : [options];
    for (var i = 0; i < options.length; i++) {
        if (options[i]) {
            var opt = _.isString(options[i]) ? { url: options[i] } : options[i];
            _.defaults(opt, self.options);
            self.task.push(opt, function (err) {
                if (err) {
                    console.err('crawler queue error', err);
                }
            });
        }
    }
};

ShareInfo.prototype.parse = function (url, body, $) {
    var p = new Parser();
    return p.parse(url, body, $);
}

ShareInfo.prototype.req = function (opt, callback) {
    var self = this;
    var opts = _.assign({}, opt);
    var doReq = function (err) {
        var req = self.request(opts, function (error, response) {
            if (error) {
                if (opts.retries) {
                    setTimeout(function () {
                        opts.retries--;
                        self.req(opts, callback);
                    }, opts.retryTimeout);
                } else {
                    opts.callback(error, { options: opts }, callback);
                }
            } else {
                if (response.statusCode === 200) {
                    var results = {
                        req: opts,
                        res: response
                    };
                    var p = new Parser(results);
                    results.parser = p.build(results.res);
                    opts.callback(null, results, callback);
                } else {
                    opts.callback(new Error('ESTATUSCODE:' + response.statusCode), { options: opts }, callback);
                }
            }
        }).on('response', function (response) {
            if (!/text\/html/i.test(response.headers['content-type'])) {
                req.abort();
                opts.callback(new Error('ECONTENTTYPE:' + response.headers['content-type']), { options: opts }, callback);
            }
        });
    };
    doReq();
};

module.exports = ShareInfo;