var cheerio = require('cheerio');
var Url = require('url');
var _ = require('lodash');
const Util = require('util');

function Parser(options) {
    var self = this;
    options = options || {};
    self.init(options);
}

Parser.prototype.init = function init(options) {
    var self = this;
    var defaultOptions = {
        jquery: true,
        body: '<h1>test</h1>'
    };
    self.options = _.extend(defaultOptions, options);
};

Parser.prototype.build = function (res) {
    var self = this;
    var req = self.options.req;
    var res = self.options.res;
    if (res && res.body && self.options.jquery) {
        var $ = cheerio.load(res.body);
        if (req && req.url) {
            //TODO Base URL Test
            //var _url = _.defaults({pathname: null, path: null}, Url.parse(req.url));
            //console.log(Url.format(_url));
            var _url = Url.parse(req.url);
            var results = {};
            results.share = {
                title: trim(title($)),
                description: trim(description($)),
                image: image($, _url),
                url: url($, req.url, _url),
                site_name: trim(siteName($, _url))
            };
            results.meta = meta($);
            results.og = og($);
            results.twitter = twitter($);
            res.$ = $;
            return results;
        }
    }
    return {};
};

function trim(str) {
    if (Util.isString(str)) {
        return str.trim();
    }
    return '';
}

function buildUrl(url, _url) {
    if (Util.isString(url)) {
        var obj = Url.parse(url);
        if (!obj.protocol) {
            obj.protocol = _url.protocol;
        }
        if (!obj.host) {
            obj.host = _url.host;
        }
        return Url.format(obj);
    }
    return '';
}

function title($) {
    return $ ?
        $('head meta[property="og:title"]').attr('content') ||
        $('head meta[name="twitter:title"]').attr('content') ||
        $('head title').text()
        : '';
}

function siteName($, _url) {
    if ($) {
        return $('head meta[property="og:site_name"]').attr('content') || (_.isString(_url.hostname) ? _url.hostname.replace(/www./i, '') : '');
    }
    return '';
}

function description($) {
    return $ ?
        $('head meta[property="og:description"]').attr('content') ||
        $('head meta[name="twitter:description"]').attr('content') ||
        $('head meta[name="description"]').attr('content') ||
        $('head meta[itemprop="description"]').attr('content')
        : '';
}

function image($, _url) {
    if ($) {
        var imageUrl = $('head meta[property="og:image:secure_url"]').attr('content') ||
            $('head meta[property="og:image:url"]').attr('content') ||
            $('head meta[property="og:image"]').attr('content') ||
            $('head meta[name="twitter:image:src"]').attr('content') ||
            $('head meta[name="twitter:image"]').attr('content') ||
            $('head meta[itemprop="image"]').attr('content');
        return buildUrl(imageUrl, _url);
    }
    return '';
}

function url($, url, _url) {
    if ($) {
        // $('head link[rel="alternate"][hreflang="x-default"]').attr('href') ||
        var shareUrl = $('head meta[property="og:url"]').attr('content') ||
            $('head meta[name="twitter:url"]').attr('content') ||
            $('head link[rel="canonical"]').attr('href') ||
            url;
        return buildUrl(shareUrl, _url);
    }
    return '';
}

function meta($) {
    return {
        title: trim($('head title').text()),
        description: trim($('head meta[name="description"]').attr('content')),
        keywords: trim($('head meta[name="keywords"]').attr('content'))
    }
}

function og($) {
    var obj = {};
    $('head meta[property*="og:"]').each(function () {
        obj[$(this).attr('property')] = trim($(this).attr('content'));
    });
    return obj;
}

function twitter($) {
    var obj = {};
    $('head meta[name*="twitter:"]').each(function () {
        obj[$(this).attr('name')] = trim($(this).attr('content'));
    });
    return obj;
}

module.exports = Parser;