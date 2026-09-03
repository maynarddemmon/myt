module('ExpressionParser');

// Parses expr and compares the resulting AST to expected.
var parses = function(expr, expected) {
    var actual;
    try {
        actual = myt.ExpressionParser.parse(expr);
    } catch (e) {
        ok(false, 'Parsing ' + JSON.stringify(expr) + ' threw: ' + e.message);
        return;
    }
    deepEqual(actual, expected, JSON.stringify(expr));
};

// Verifies that expr is rejected as a syntax error.
var doesNotParse = function(expr) {
    try {
        myt.ExpressionParser.parse(expr);
        ok(false, JSON.stringify(expr) + ' should not parse but did.');
    } catch (e) {
        ok(e instanceof myt.ExpressionParser.SyntaxError, JSON.stringify(expr) + ' is a syntax error.');
    }
};

// Shorthands for the AST node types the parser emits.
var bool = function(v) {return {type:'BooleanLiteral', value:v};},
    num = function(v) {return {type:'NumericLiteral', value:v};},
    str = function(v) {return {type:'StringLiteral', value:v};},
    nul = function() {return {type:'NullLiteral'};},
    variable = function(name) {return {type:'Variable', name:name};},
    unary = function(op, exp) {return {type:'UnaryExp', op:op, exp:exp};},
    binary = function(op, left, right) {return {type:'BinaryExp', op:op, left:left, right:right};},
    prop = function(base, name) {return {type:'PropertyAccess', base:base, name:name};},
    call = function(name, args) {return {type:'FunctionCall', name:name, arguments:args};},
    ternary = function(condition, trueExp, falseExp) {
        return {type:'ConditionalExp', condition:condition, trueExp:trueExp, falseExp:falseExp};
    },
    THIS = {type:'This'};

test('The parser exists and exposes the expected API.', function() {
    ok(myt.ExpressionParser != null, 'myt.ExpressionParser should exist.');
    ok(typeof myt.ExpressionParser.parse === 'function', 'It should have a parse function.');
    ok(typeof myt.ExpressionParser.SyntaxError === 'function', 'It should have a SyntaxError class.');
});

test('Boolean literals and logical negation.', function() {
    parses('true', bool(true));
    parses('false', bool(false));
    parses('!false', unary('!', bool(false)));
    parses('!!true', unary('!', unary('!', bool(true))));
});

test('Null literal.', function() {
    parses('null', nul());
});

test('String literals, including quoting and escapes.', function() {
    parses("''", str(''));
    parses('""', str(''));
    parses('"    "', str('    '));
    parses("'this is escaped:\\'\"'", str('this is escaped:\'"'));
    parses('"this is escaped:\\"\'"', str('this is escaped:"\''));
    parses("'asdf'", str('asdf'));
    parses('"foo bar baz"', str('foo bar baz'));
});

test('Numeric literals, including signs and leading decimal points.', function() {
    parses('2', num(2));
    parses('10', num(10));
    parses('123.7', num(123.7));
    parses('0.5678', num(0.5678));
    parses('.5', num(0.5));
    
    // Signs are unary operators applied to a positive literal, not part of the number.
    parses('-2', unary('-', num(2)));
    parses('-0.5', unary('-', num(0.5)));
    parses('-.5', unary('-', num(0.5)));
    parses('+1', unary('+', num(1)));
});

test('Binary expressions and surrounding whitespace.', function() {
    parses('  foo.bar + 5', binary('+', prop(variable('foo'), 'bar'), num(5)));
    
    // Multiplication binds tighter than subtraction, and parens override that.
    parses(
        'foo.bar + 5 - 2* (1 + 1)   ',
        binary('-',
            binary('+', prop(variable('foo'), 'bar'), num(5)),
            binary('*', num(2), binary('+', num(1), num(1)))
        )
    );
});

test('Operator precedence across a conditional expression.', function() {
    parses(
        '!(foo === true && bar == false || biz < -2) ? 5 : 10 % 3',
        ternary(
            unary('!',
                binary('||',
                    binary('&&',
                        binary('===', variable('foo'), bool(true)),
                        binary('==', variable('bar'), bool(false))
                    ),
                    binary('<', variable('biz'), unary('-', num(2)))
                )
            ),
            num(5),
            binary('%', num(10), num(3))
        )
    );
});

test('Property access on this, by name and by computed index.', function() {
    parses(' this.bar ', prop(THIS, 'bar'));
    parses('this.parent.innerHeight * 0.75',
        binary('*', prop(prop(THIS, 'parent'), 'innerHeight'), num(0.75))
    );
    
    // A computed index yields a PropertyAccess whose name is an expression.
    parses('foo[baz + 2].bar',
        prop(
            prop(variable('foo'), binary('+', variable('baz'), num(2))),
            'bar'
        )
    );
});

test('Function calls with and without arguments.', function() {
    // No arguments yields null rather than an empty array.
    parses('Math.min( )', call(prop(variable('Math'), 'min'), null));
    
    parses('Math.min( foo * 0.75, 100)',
        call(prop(variable('Math'), 'min'), [
            binary('*', variable('foo'), num(0.75)),
            num(100)
        ])
    );
});

test('Array and object literals.', function() {
    parses(
        'true ? [0,1,2+4] : {foo:"b","bar":"d"+"ent"}',
        ternary(
            bool(true),
            {type:'ArrayLiteral', value:{
                type:'ArrayExpression',
                elements:[num(0), num(1), binary('+', num(2), num(4))]
            }},
            {type:'ObjectLiteral', value:{
                type:'ObjectExpression',
                properties:[
                    {type:'Property', key:'foo', value:str('b')},
                    {type:'Property', key:'bar', value:binary('+', str('d'), str('ent'))}
                ]
            }}
        )
    );
});

test('A representative constraint expression.', function() {
    parses(
        'this.parent.height - (this.parent.children[1].top + this.parent.children[1].height + 5)',
        binary('-',
            prop(prop(THIS, 'parent'), 'height'),
            binary('+',
                binary('+',
                    prop(prop(prop(prop(THIS, 'parent'), 'children'), num(1)), 'top'),
                    prop(prop(prop(prop(THIS, 'parent'), 'children'), num(1)), 'height')
                ),
                num(5)
            )
        )
    );
});

test('Malformed expressions raise a SyntaxError.', function() {
    doesNotParse('');
    doesNotParse('foo +');
    doesNotParse('(1 + 2');
    doesNotParse('1 ? 2');
    doesNotParse("'unterminated");
    doesNotParse('foo..bar');
    doesNotParse('@#$');
});
