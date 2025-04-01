//main problem is in parsePrimary method

import { runLexer } from "./lexer.js";

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }

    peek() {
        return this.tokens[this.current];
    }

    advance() {
        return this.tokens[this.current++];
    }

    match(type) {
        if (this.peek() && this.peek().type === type) {
            return this.advance();
        }
        return null;
    }

    parseProgram() {
        let classes = [];
        let statements = [];

        while (this.current < this.tokens.length) {
            if (this.peek().value === "class") {
                classes.push(this.parseClass());
            } else {
                statements.push(this.parseStatement());
            }
        }

        return { type: "Program", classes, statements };
    }

    parseClass() {
        this.match("keyword"); // 'class'
        let name = this.match("identifier").value;
        let superclass = null;

        if (this.match("keyword")?.value === "extends") {
            superclass = this.match("identifier").value;
        }

        this.match("lCurlyBracket"); // '{'
        let fields = [];
        let methods = [];
        let constructor = null;

        while (!this.match("rCurlyBracket")) {
            let next = this.peek();
            if (next.value === "init") {
                constructor = this.parseConstructor();
            } else if (next.value === "method") {
                methods.push(this.parseMethod());
            } else {
                fields.push(this.parseVarDeclaration());
            }
        }

        return { type: "ClassDeclaration", name, superclass, fields, constructor, methods };
    }

    parseConstructor() {
        this.match("keyword"); // 'init'
        let params = this.parseParameters();
        this.match("lCurlyBracket"); // '{'
        let body = this.parseBlock();
        return { type: "Constructor", params, body };
    }

    parseMethod() {
        this.match("keyword"); // 'method'
        let name = this.match("identifier").value;
        let params = this.parseParameters();
        let returnType = this.match("type").value;
        let body = this.parseBlock();
        return { type: "Method", name, params, returnType, body };
    }

    parseParameters() {
        this.match("lParen"); // '('
        let params = [];
        while (!this.match("rParen")) {
            let type = this.match("type").value;
            let name = this.match("identifier").value;
            params.push({ type, name });
            this.match("comma"); // ','
        }
        return params;
    }

    parseVarDeclaration() {
        let type = this.match("type").value;
        let name = this.match("identifier").value;
        this.match("semicolon"); // ';'
        return { type: "VariableDeclaration", varType: type, name };
    }

    parseStatement() {
        if (this.match("lCurlyBracket")) {
            return this.parseBlock();
        }
        if (this.peek().value === "if") {
            return this.parseIfStatement();
        }
        if (this.peek().value === "while") {
            return this.parseWhileStatement();
        }
        return this.parseExpressionStatement();
    }

    parseBlock() {
        let statements = [];
        while (!this.match("rCurlyBracket")) {
            statements.push(this.parseStatement());
        }
        return { type: "Block", statements };
    }

    parseExpressionStatement() {
        let expression = this.parseExpression();
        this.match("semicolon"); // ';'
        return { type: "ExpressionStatement", expression };
    }

    parseExpression() {
        return this.parseAddition();
    }

    parseAddition() {
        let left = this.parseMultiplication();
        while (this.match("op")?.value === "+") {
            let right = this.parseMultiplication();
            left = { type: "BinaryExpression", operator: "+", left, right };
        }
        return left;
    }

    parseMultiplication() {
        let left = this.parsePrimary();
        while (this.match("op")?.value === "*") {
            let right = this.parsePrimary();
            left = { type: "BinaryExpression", operator: "*", left, right };
        }
        return left;
    }

    parsePrimary() {
        let token = this.advance();
        if (token.type === "integerLiteral" || token.type === "stringLiteral" || token.type === "identifier") {
            return { type: "Literal", value: token.value };
        }
        throw new Error("Unexpected token: " + token.value);
    }
}

export function runParser(sourceCode) {
    const tokens = runLexer(sourceCode);
    const parser = new Parser(tokens);
    return parser.parseProgram();
}
