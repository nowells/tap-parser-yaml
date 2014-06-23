var test = require('tape');
var parser = require('../');

var lines = [
    'TAP version 13',
    '# beep',
    'ok 1 should be equal',
    '',
    'ok 2 should be equivalent',
    '# boop',
    'ok 3 should be equal',
    ' ---',
    ' foo: "bar"',
    ' ...',
    'ok 4 (unnamed assert)',
    '1..4',
    '# tests 4',
    '# pass  4',
    '',
    '# ok'
];

var expected = { asserts: [], comments: [], diags: [] };

expected.comments = [ 'beep', 'boop', 'tests 4', 'pass  4', 'ok' ];

expected.asserts.push({
    ok: true,
    number: 1,
    name: 'should be equal'
});
expected.asserts.push({
    ok: true,
    number: 2,
    name: 'should be equivalent'
});
expected.asserts.push({
    ok: true,
    number: 3,
    name: 'should be equal'
});
expected.asserts.push({ 
    ok: true,
    number: 4,
    name: '(unnamed assert)'
});

expected.diags.push({
    foo: 'bar'
});

test('simple ok', function (t) {
    t.plan(4 * 2 + 1 + 4 + 5 + 1);
    
    var p = parser(onresults);
    p.on('results', onresults);
    
    var asserts = [];
    p.on('assert', function (assert) {
        asserts.push(assert);
        t.same(assert, expected.asserts.shift());
    });
    
    var diags = [];
    p.on('diag', function (diag) {
        diags.push(diag);
        t.same(diag, expected.diags.shift());
    });

    p.on('plan', function (plan) {
        t.same(plan, { start: 1, end: 4 });
    });
    
    p.on('comment', function (c) {
        t.equal(c, expected.comments.shift());
    });
    
    for (var i = 0; i < lines.length; i++) {
        p.write(lines[i] + '\n');
    }
    p.end();
    
    function onresults (results) {
        t.ok(results.ok);
        t.same(results.errors, []);
        t.same(asserts.length, 4);
        t.same(results.asserts, asserts);
    }
});
