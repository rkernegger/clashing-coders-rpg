/*
    Clashing Coders RPG Platform - The platform used for Creamfinance's first coding contest.
    Copyright (C) 2016 Thomas Rosenstein

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var querystring = require('querystring');
var url = require('url');

module.exports = Class('Request', Object, {
    constructor: function (req, res) {
        this.limit = 1024 * 1024 * 10; // 10MB
        this.req = req;
        this.res = res;
        this.session = null;

        res.on('error', function (err) {
            console.log('Response Error', err);
        });

        if (req.headers) {
            this.handleHeaders();
        }
    },
    handleHeaders: function () {
        var xforward = 'x-forwarded-for';
        var referer = 'referer';

        var headers = this.req.headers;

        if (xforward in headers) {
            this.ipaddress = headers[xforward];
        } else {
            this.ipaddress = this.req.connection.remoteAddress;
        }

        if (referer in headers) {
            this.referer = headers[referer];
        } else {
            this.referer = '';
        }

        this.query = url.parse(this.req.url, true);

        this.query_string = this.query.search;
        this.query_params = this.query.query;
    },
    handleData: function (data) {
        if ('data' in this) {
            this.data = Buffer.concat([ this.data, data ]);
        } else {
            this.data = data;
        }

        if (this.data.length > this.limit) {
            this.res.writeHead(404,
                {
                    'Content-Type': 'text/html; charset=utf-8'
                }
            );

            this.res.end();
        }
    },
    write: function (data) {
        if (data instanceof Buffer) {
            this.res.write(data);
        } else if (data instanceof Object) {
            this.res.write(JSON.stringify(data));
        } else {
            this.res.write(data);
        }
    },
    parseDataPost: function () {
        if (this.req.method == 'POST' &&
            this.data &&
            'content-type' in this.req.headers &&
            this.req.headers['content-type'].toLowerCase().indexOf('application/x-www-form-urlencoded') == 0) {

            this.post = querystring.parse(this.data.toString());
        }
    },
    parseDataJson: function () {
        log(this.data);
        var json = JSON.parse(this.data);

        log(json);
    }
});
