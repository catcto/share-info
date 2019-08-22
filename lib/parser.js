var cheerio = require('cheerio');
var Url = require('url');
var _ = require('lodash');
var Util = require('util');

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
    if (req && req.url && res && res.body && self.options.jquery) {
        res.$ = cheerio.load(res.body);
        return self.parse(req.url, res.body, res.$);
    }
    return {};
};

Parser.prototype.parse = function (url, body, $) {
    $ = $ || cheerio.load(body);
    var urlObj = Url.parse(url);
    var results = {};
    results.share = {
        title: trim(title($)),
        description: trim(description($)),
        image: image($, url),
        icon: icon($, url),
        url: surl($, url),
        site_name: trim(siteName($, urlObj))
    };
    results.meta = meta($);
    results.og = og($);
    results.twitter = twitter($);
    return results;
}

function trim(str) {
    if (Util.isString(str)) {
        return str.trim();
    }
    return '';
}

function buildUrl(from, to) {
    if (Util.isString(to)) {
        return Url.resolve(from, to);
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

function siteName($, urlObj) {
    if ($) {
        return $('head meta[property="og:site_name"]').attr('content') || (_.isString(urlObj.hostname) ? urlObj.hostname.replace(/www./i, '') : '');
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

function image($, url) {
    if ($) {
        var imageUrl = $('head meta[property="og:image:secure_url"]').attr('content') ||
            $('head meta[property="og:image:url"]').attr('content') ||
            $('head meta[property="og:image"]').attr('content') ||
            $('head meta[name="twitter:image:src"]').attr('content') ||
            $('head meta[name="twitter:image"]').attr('content') ||
            $('head meta[itemprop="image"]').attr('content');
        return buildUrl(url, imageUrl);
    }
    return '';
}

function icon($, url) {
    if ($) {
        var icons = [];
        $('head link[rel="icon"],head link[rel*="apple-touch-icon"],head link[rel="shortcut icon"]').each(function () {
            var obj = {};
            obj.url = buildUrl(url, trim($(this).attr('href')));
            obj.size = $(this).attr('rel') == 'shortcut icon' ? -1 : 0;
            var size = Number(trim($(this).attr('sizes')).split('x')[0]);
            if (size) {
                obj.size = size;
            }
            icons.push(obj);
        });
        if (icons.length > 0) {
            icons = _.sortBy(icons, 'size');
            return icons[icons.length - 1].url;
        }
    }
    return '';
}

function surl($, url) {
    if ($) {
        // $('head link[rel="alternate"][hreflang="x-default"]').attr('href') ||
        var shareUrl = $('head meta[property="og:url"]').attr('content') ||
            $('head meta[name="twitter:url"]').attr('content') ||
            $('head link[rel="canonical"]').attr('href') ||
            url;
        return buildUrl(url, shareUrl);
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
    $('head meta[property*="twitter:"]').each(function () {
        obj[$(this).attr('property')] = trim($(this).attr('content'));
    });
    return obj;
}

module.exports = Parser;