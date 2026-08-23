{
    function filledArray(count, value) {
        return Array.apply(null, new Array(count)).map(function() {return value;});
    }
    
    function extractOptional(optional, index) {
        return optional ? optional[index] : null;
    }
    
    function buildList(head, tail, index) {
        return [head].concat(extractList(tail, index));
    }
    
    function extractList(list, index) {
        return list.map(function(element) {return element[index];});
    }
    
    function optionalList(value) {
        return value !== null ? value : [];
    }
}

start = _ exp:ConditionalExp _ {return exp;}

_ = [\t ]*

Identifier "identifier" = !ReservedWord name:IdentifierName {return name;}
IdentifierName "identifier" = start:IdentifierStart parts:IdentifierPart* {return start + parts.join("");}
IdentifierStart = [_a-zA-Z]
IdentifierPart = IdentifierStart / [0-9]

/* Tokens */
FalseToken = "false" !IdentifierPart
TrueToken  = "true"  !IdentifierPart
NullToken  = "null"  !IdentifierPart
ThisToken  = "this"  !IdentifierPart

ReservedWord = ThisToken / NullToken / TrueToken / FalseToken

NumericLiteral "number" = literal:DecimalLiteral !IdentifierStart {return literal;}
DecimalLiteral
    = parts:(DecimalIntegerLiteral "." DecimalDigits?) {return parseFloat(parts.join(""));}
    / parts:("." DecimalDigits)                        {return parseFloat(parts.join(""));}
    / parts:(DecimalIntegerLiteral)                    {return parseFloat(parts);}
DecimalIntegerLiteral = "0" {return "0";} / first:[1-9] rest:DecimalDigits? {return first + (rest !== null ? rest : "");}
DecimalDigits = parts:[0-9]+ {return parts.join("");}

StringLiteral "string" = parts:('"' DoubleStringCharacter* '"' / "'" SingleStringCharacter* "'") {return parts[1].join("");}
DoubleStringCharacter = !('"' / "\\") char_:. {return char_;} / "\\" sequence:EscapeSequence {return sequence;}
SingleStringCharacter = !("'" / "\\") char_:. {return char_;} / "\\" sequence:EscapeSequence {return sequence;}

EscapeSequence = SingleEscapeCharacter / NonEscapeCharacter
SingleEscapeCharacter = char_:['"\\rn] {
    switch (char_) {
        case "r": return "\r";
        case "n": return "\n";
        default: return char_;
    }
}
NonEscapeCharacter = (!SingleEscapeCharacter) char_:. {return char_;}

/* Expressions */
PrimaryExp
    = ArrowFunctionExp
    / ThisToken            {return {type:"This"};}
    / name:Identifier      {return {type:"Variable", name:name};}
    / NullToken            {return {type:"NullLiteral"};}
    / TrueToken            {return {type:"BooleanLiteral", value:true};}
    / FalseToken           {return {type:"BooleanLiteral", value:false};}
    / value:NumericLiteral {return {type:"NumericLiteral", value:value};}
    / value:StringLiteral  {return {type:"StringLiteral", value:value};}
    / value:ArrayLiteral   {return {type:"ArrayLiteral", value:value};}
    / value:ObjectLiteral  {return {type:"ObjectLiteral", value:value};}
    / "(" _ exp:ConditionalExp _ ")" {return exp;}

ArrayLiteral = "[" _ elision:(Elision _)? "]"                     {return {type:"ArrayExpression", elements:optionalList(extractOptional(elision, 0))};}
    / "[" _ elements:ElementList _ "]"                            {return {type:"ArrayExpression", elements:elements};}
    / "[" _ elements:ElementList _ "," _ elision:(Elision _)? "]" {return {type:"ArrayExpression", elements:elements.concat(optionalList(extractOptional(elision, 0)))};}
ElementList = head:(elision:(Elision _)? element:ConditionalExp {return optionalList(extractOptional(elision, 0)).concat(element);})
    tail:(_ "," _ elision:(Elision _)? element:ConditionalExp {return optionalList(extractOptional(elision, 0)).concat(element);})*
    {return Array.prototype.concat.apply(head, tail);}
Elision = "," commas:(_ ",")* {return filledArray(commas.length + 1, null);}

ObjectLiteral = "{" _ "}"                                   {return {type:"ObjectExpression", properties:[]};}
    / "{" _ properties:PropertyNameAndValueList _ "}"       {return {type:"ObjectExpression", properties:properties};}
    / "{" _ properties:PropertyNameAndValueList _ "," _ "}" {return {type:"ObjectExpression", properties:properties};}
PropertyNameAndValueList = head:PropertyAssignment tail:(_ "," _ PropertyAssignment)* {return buildList(head, tail, 3);}
PropertyAssignment = key:PropertyName _ ":" _ value:ConditionalExp {return {type:"Property", key:key, value:value};}
PropertyName = IdentifierName / StringLiteral / NumericLiteral

ArrowFunctionExp = params:ArrowParameters _ "=>" _ body:ConditionalExp {return {type:"ArrowFunction", params:params, body:body};}
ArrowParameters = param:Identifier  {return [param];}
    / "(" _ ")"                       {return [];}
    / "(" _ list:IdentifierList _ ")" {return list;}
IdentifierList = head:Identifier tail:(_ "," _ Identifier)* {return [head].concat(tail.map(t => t[3]));}

MemberExp = base:PrimaryExp accessors:(
      _ "?." _ "[" _ name:ConditionalExp _ "]" {return name;}
    / _ "." _ "[" _ name:ConditionalExp _ "]"  {return name;}
    / _ "?." _ name:IdentifierName             {return name;}
    / _ "." _ name:IdentifierName              {return name;}
)* {
    let result = base;
    for (let i = 0; accessors.length > i; i++) {
        result = {
            type:"PropertyAccess",
            base:result,
            name:accessors[i]
        };
    }
    return result;
}

Arguments = "(" _ args:ArgumentList? _ ")" {
    return args !== "" ? args : [];
}
ArgumentList = head:ConditionalExp tail:(_ "," _ ConditionalExp)* {
    const result = [head];
    for (let i = 0; tail.length > i; i++) result.push(tail[i][3]);
    return result;
}

CallExp = base:MemberExp argumentsOrAccessors:(
    // Optional call: a?.()
    _ "?." _ args:Arguments                    {return {type:"FunctionCall", arguments:args};}
    
    // Normal call: a()
    / _ args:Arguments                         {return {type:"FunctionCall", arguments:args};}
    
    // Optional property access: a?.b
    / _ "?." _ name:IdentifierName             {return {type:"PropertyAccessProperty", name:name};}
    
    // Normal property access: a.b
    / _ "." _ name:IdentifierName              {return {type:"PropertyAccessProperty", name:name};}
    
    // Optional computed access: a?.[b]
    / _ "?." _ "[" _ name:ConditionalExp _ "]" {return {type:"PropertyAccessProperty", name:name};}
    
    // Normal computed access: a[b]
    / _ "[" _ name:ConditionalExp _ "]"        {return {type:"PropertyAccessProperty", name:name};}
)* {
    let result = base;
    for (let part of argumentsOrAccessors) {
        if (part.type === "FunctionCall") {
            result = {
                type:"FunctionCall",
                name:result,
                arguments:part.arguments
            };
        } else if (part.type === "PropertyAccessProperty") {
            result = {
                type:"PropertyAccess",
                base:result,
                name:part.name
            };
        }
    }
    return result;
}

UnaryExp = CallExp / MemberExp / op:("+" !("+") / "-" !("-") / "!") _ exp:UnaryExp {
    return {
        type: "UnaryExp",
        op:   op.join ? op[0] : op,
        exp:  exp
    };
}

MultiplicativeExp = head:UnaryExp tail:(_ ("*" / "/" / "%") _ UnaryExp)* {
    let result = head;
    for (let i = 0; tail.length > i; i++) {
        result = {
            type:  "BinaryExp",
            op:    tail[i][1],
            left:  result,
            right: tail[i][3]
        };
    }
    return result;
}

AdditiveExp = head:MultiplicativeExp tail:(_ ("+" / "-") _ MultiplicativeExp)* {
    let result = head;
    for (let i = 0; tail.length > i; i++) {
        result = {
            type:  "BinaryExp",
            op:    tail[i][1],
            left:  result,
            right: tail[i][3]
        };
    }
    return result;
}

RelationalExp = head:AdditiveExp tail:(_ ("<=" / ">=" / "<" / ">") _ AdditiveExp)* {
    let result = head;
    for (let i = 0; tail.length > i; i++) {
        result = {
            type:  "BinaryExp",
            op:    tail[i][1],
            left:  result,
            right: tail[i][3]
        };
    }
    return result;
}

EqualityExp = head:RelationalExp tail:(_ ("===" / "!==" / "==" / "!=") _ RelationalExp)* {
    let result = head;
    for (let i = 0; tail.length > i; i++) {
        result = {
            type:  "BinaryExp",
            op:    tail[i][1],
            left:  result,
            right: tail[i][3]
        };
    }
    return result;
}

LogicalANDExp = head:EqualityExp tail:(_ "&&" _ EqualityExp)* {
    let result = head;
    for (let i = 0; tail.length > i; i++) {
        result = {
            type:  "BinaryExp",
            op:    "&&",
            left:  result,
            right: tail[i][3]
        };
    }
    return result;
}

LogicalORExp = head:LogicalANDExp tail:(_ "||" _ LogicalANDExp)* {
    let result = head;
    for (let i = 0; tail.length > i; i++) {
        result = {
            type:  "BinaryExp",
            op:    "||",
            left:  result,
            right: tail[i][3]
        };
    }
    return result;
}

ConditionalExp = condition:LogicalORExp _ "?" _ trueExp:ConditionalExp _ ":" _ falseExp:ConditionalExp {
    return {
          type:      "ConditionalExp",
          condition: condition,
          trueExp:   trueExp,
          falseExp:  falseExp
    };
}
  / LogicalORExp
