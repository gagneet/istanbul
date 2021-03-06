/*
 Copyright (c) 2012, Yahoo! Inc.  All rights reserved.
 Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

var path = require('path'),
    Writer = require('../util/file-writer'),
    util = require('util'),
    Report = require('./index');
/**
 * a `Report` implementation that produces an LCOV coverage file from coverage objects.
 *
 * Usage
 * -----
 *
 *      var report = require('istanbul').Report.create('lcovonly');
 *
 *
 * @class LcovOnlyReport
 * @extends Report
 * @constructor
 * @param {Object} opts optional
 * @param {String} [opts.dir] the directory in which to the `lcov.info` file. Defaults to `process.cwd()`
 */
function LcovOnlyReport(opts) {
    this.opts = opts || {};
    this.opts.dir = this.opts.dir || process.cwd();
    this.opts.writer = this.opts.writer || null;
}
LcovOnlyReport.TYPE = 'lcovonly';
util.inherits(LcovOnlyReport, Report);

Report.mix(LcovOnlyReport, {
    writeFileCoverage: function (writer, fc) {
        var functions = fc.f,
            functionMap = fc.fnMap,
            lines = fc.l,
            branches = fc.b,
            branchMap = fc.branchMap;

        writer.println('TN:'); //no test name
        writer.println('SF:' + fc.path);

        Object.keys(functions).forEach(function (key) {
            var meta = functionMap[key];
            writer.println('FN:' + [ meta.line, meta.name ].join(','));
        });

        Object.keys(functions).forEach(function (key) {
            var stats = functions[key],
                meta = functionMap[key];
            writer.println('FNDA:' + [ stats, meta.name ].join(','));
        });

        Object.keys(lines).forEach(function (key) {
            var stat = lines[key];
            writer.println('DA:' + [ key, stat ].join(','));
        });

        Object.keys(branches).forEach(function (key) {
            var branchArray = branches[key],
                meta = branchMap[key],
                line = meta.line,
                i = 0;
            branchArray.forEach(function (b) {
                writer.println('BRDA:' + [line, key, i, b].join(','));
                i += 1;
            });
        });
        writer.println('end_of_record');
    },

    writeReport: function (collector, sync) {
        var outputFile = path.resolve(this.opts.dir, 'lcov.info'),
            writer = this.opts.writer || new Writer(sync),
            that = this;
        writer.writeFile(outputFile, function () {
            collector.files().forEach(function (key) {
                that.writeFileCoverage(writer, collector.fileCoverageFor(key));
            });
        });
    }
});

module.exports = LcovOnlyReport;