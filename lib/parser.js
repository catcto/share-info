var cheerio = require('cheerio');
var Url = require('url');
var _ = require('lodash');

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
                title: self.$$.title($),
                description: self.$$.description($),
                image: self.$$.image($, _url),
                url: self.$$.url($, req.url),
                site_name: self.$$.site_name($, _url)
            };
            results.meta = self.$$.meta($);
            results.og = self.$$.og($);
            results.twitter = self.$$.twitter($);
            res.$ = $;
            return results;
        }
    }
    return {};
};

Parser.prototype.$$ = {
    title: function ($) {
        return $ ?
            $('head meta[property="og:title"]').attr('content') ||
            $('head meta[name="twitter:title"]').attr('content') ||
            $('head title').text()
            : '';
    },
    site_name: function ($, _url) {
        if ($) {
            return $('head meta[property="og:site_name"]').attr('content') || (_.isString(_url.hostname) ? _url.hostname.replace(/www./i, '') : '');
        }
        return '';
    },
    description: function ($) {
        return $ ?
            $('head meta[property="og:description"]').attr('content') ||
            $('head meta[name="twitter:description"]').attr('content') ||
            $('head meta[name="description"]').attr('content') ||
            $('head meta[itemprop="description"]').attr('content')
            : '';
    },
    image: function ($, _url) {
        if ($) {
            var imageUrl = $('head meta[property="og:image:secure_url"]').attr('content') ||
                $('head meta[property="og:image:url"]').attr('content') ||
                $('head meta[property="og:image"]').attr('content') ||
                $('head meta[name="twitter:image:src"]').attr('content') ||
                $('head meta[name="twitter:image"]').attr('content') ||
                $('head meta[itemprop="image"]').attr('content');
            if (imageUrl) {
                var _imageUrl = Url.parse(imageUrl);
                if (_imageUrl.protocol) {
                    return imageUrl;
                } else {
                    _imageUrl.protocol = _url.protocol;
                    return Url.format(_imageUrl);
                }
            }
        }
        return '';
    },
    url: function ($, url) {
        return $ ?
            $('head meta[property="og:url"]').attr('content') ||
            $('head meta[name="twitter:url"]').attr('content') ||
            $('head link[rel="canonical"]').attr('href') ||
            $('head link[rel="alternate"][hreflang="x-default"]').attr('href') ||
            url
            : '';
    },
    meta: function ($) {
        return {
            title: $('head title').text(),
            description: $('head meta[name="description"]').attr('content'),
            keywords: $('head meta[name="keywords"]').attr('content')
        }
    },
    og: function ($) {
        var obj = {};
        $('head meta[property*="og:"]').each(function () {
            obj[$(this).attr('property')] = $(this).attr('content');
        });
        return obj;
    },
    twitter: function ($) {
        var obj = {};
        $('head meta[name*="twitter:"]').each(function () {
            obj[$(this).attr('name')] = $(this).attr('content');
        });
        return obj;
    }
}


module.exports = Parser;