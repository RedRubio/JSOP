import Token from "../tokenizer/token.js";

class ASTNode {
  constructor(type) {
    this.type = type;
  }
}

class Program extends ASTNode {
  constructor(classes, statements) {
    super("Program");
    this.classes = classes || [];
    this.statements = statements || [];
  }
}

class ClassDef extends ASTNode {
  constructor(name, parent, variables, constructorNode, methods) {
    super("ClassDef");
    this.name = name;
    this.parent = parent || null;
    this.variables = variables || [];
    this.constructor = constructorNode;
    this.methods = methods || [];
  }
}

class VarDec extends ASTNode {
  constructor(type, name) {
    super("VarDec");
    this.varType = type;
    this.name = name;
  }
}

class Constructor extends ASTNode {
  constructor(parameters, superCall, statements) {
    super("Constructor");
    this.parameters = parameters || [];
    this.superCall = superCall;
    this.statements = statements || [];
  }
}

class MethodDef extends ASTNode {
  constructor(name, parameters, returnType, statements) {
    super("MethodDef");
    this.name = name;
    this.parameters = parameters || [];
    this.returnType = returnType;
    this.statements = statements || [];
  }
}

class SuperCall extends ASTNode {
  constructor(args) {
    super("SuperCall");
    this.arguments = args || [];
  }
}

class BlockStmt extends ASTNode {
  constructor(statements) {
    super("BlockStmt");
    this.statements = statements || [];
  }
}

class ExprStmt extends ASTNode {
  constructor(expression) {
    super("ExprStmt");
    this.expression = expression;
  }
}

class VarDecStmt extends ASTNode {
  constructor(declaration) {
    super("VarDecStmt");
    this.declaration = declaration;
  }
}

class AssignStmt extends ASTNode {
  constructor(variable, expression) {
    super("AssignStmt");
    this.variable = variable;
    this.expression = expression;
  }
}

class WhileStmt extends ASTNode {
  constructor(condition, body) {
    super("WhileStmt");
    this.condition = condition;
    this.body = body;
  }
}

class BreakStmt extends ASTNode {
  constructor() {
    super("BreakStmt");
  }
}

class ReturnStmt extends ASTNode {
  constructor(expression) {
    super("ReturnStmt");
    this.expression = expression;
  }
}

class IfStmt extends ASTNode {
  constructor(condition, thenBranch, elseBranch) {
    super("IfStmt");
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }
}

class BinaryExpr extends ASTNode {
  constructor(left, operator, right) {
    super("BinaryExpr");
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}

class CallExpr extends ASTNode {
  constructor(object, method, args) {
    super("CallExpr");
    this.object = object;
    this.method = method;
    this.args = args || [];
  }
}

class NewExpr extends ASTNode {
  constructor(className, args) {
    super("NewExpr");
    this.className = className;
    this.args = args || [];
  }
}

class PrintlnExpr extends ASTNode {
  constructor(argument) {
    super("PrintlnExpr");
    this.argument = argument;
  }
}

class VariableExpr extends ASTNode {
  constructor(name) {
    super("VariableExpr");
    this.name = name;
  }
}

class ThisExpr extends ASTNode {
  constructor() {
    super("ThisExpr");
  }
}

class LiteralExpr extends ASTNode {
  constructor(value, valueType) {
    super("LiteralExpr");
    this.value = value;
    this.valueType = valueType;
  }
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  parse() {
    try {
      const classes = [];
      // Guard against running past the token list.
      while (!this.isAtEnd() &&
             this.peek().type === "keyword" &&
             this.peek().data === "class") {
        classes.push(this.classDefinition());
      }

      const statements = [];
      while (!this.isAtEnd()) {
        statements.push(this.statement());
      }

      return new Program(classes, statements);
    } catch (error) {
      console.error("Parse error:", error);
      return null;
    }
  }

  // Helper methods
  peek() {
    return this.tokens[this.current];
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  isAtEnd() {
    return this.current >= this.tokens.length;
  }

  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  match(...types) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  consume(type, message) {
    if (this.check(type)) return this.advance();
    throw new Error(`${message} at token ${this.peek() ? this.peek().type + ", " + this.peek().data : "EOF"}`);
  }

  // Grammar parsing methods

  // classdef ::= `class` classname [`extends` classname] `{` (vardec `;`)* constructor methoddef* `}`
  classDefinition() {
    this.consume("keyword", "Expected 'class' keyword");
    const className = this.consume("identifier", "Expected class name").data;

    let parentClass = null;
    if (!this.isAtEnd() && this.match("keyword") && this.previous().data === "extends") {
      parentClass = this.consume("identifier", "Expected parent class name").data;
    }

    this.consume("lCurlyBracket", "Expected '{' after class declaration");

    const variables = [];
    // Added guard for isAtEnd() before using peek()
    while (!this.isAtEnd() && (this.peek().type === "type" ||
           (this.peek().type === "identifier" &&
            this.checkNext("lParen") === false &&
            this.checkNext("keyword", "init") === false))) {
      variables.push(this.varDeclaration());
      this.consume("semicolon", "Expected ';' after variable declaration");
    }

    let constructorNode = null;
    if (!this.isAtEnd() && this.peek().type === "keyword" && this.peek().data === "init") {
      constructorNode = this.constructorDefinition();
    }

    const methods = [];
    while (!this.isAtEnd() && this.peek().type === "keyword" && this.peek().data === "method") {
      methods.push(this.methodDefinition());
    }

    this.consume("rCurlyBracket", "Expected '}' after class body");

    return new ClassDef(className, parentClass, variables, constructorNode, methods);
  }

  checkNext(type, data = null) {
    if (this.current + 1 >= this.tokens.length) return false;
    if (this.tokens[this.current + 1].type !== type) return false;
    if (data !== null && this.tokens[this.current + 1].data !== data) return false;
    return true;
  }

  // vardec ::= type var
  varDeclaration() {
    let type;
    if (this.peek().type === "type") {
      type = this.advance().data;
    } else {
      type = this.consume("identifier", "Expected type").data;
    }
    const name = this.consume("identifier", "Expected variable name").data;
    return new VarDec(type, name);
  }

  // constructor ::= `init` `(` comma_vardec `)` `{` [`super` `(` comma_exp `)` `;` ] stmt* `}`
  constructorDefinition() {
    this.consume("keyword", "Expected 'init' keyword");
    this.consume("lParen", "Expected '(' after 'init'");

    const parameters = [];
    if (!this.check("rParen")) {
      do {
        parameters.push(this.varDeclaration());
      } while (this.match("comma"));
    }

    this.consume("rParen", "Expected ')' after parameters");
    this.consume("lCurlyBracket", "Expected '{' after constructor parameters");

    let superCall = null;
    if (!this.isAtEnd() && this.match("keyword") && this.previous().data === "super") {
      this.consume("lParen", "Expected '(' after 'super'");

      const args = [];
      if (!this.check("rParen")) {
        do {
          args.push(this.expression());
        } while (this.match("comma"));
      }

      this.consume("rParen", "Expected ')' after super arguments");
      this.consume("semicolon", "Expected ';' after super call");

      superCall = new SuperCall(args);
    }

    const statements = [];
    while (!this.isAtEnd() && !this.check("rCurlyBracket")) {
      statements.push(this.statement());
    }

    this.consume("rCurlyBracket", "Expected '}' after constructor body");

    return new Constructor(parameters, superCall, statements);
  }

  // methoddef ::= `method` methodname `(` comma_vardec `)` type `{` stmt* `}`
  methodDefinition() {
    this.consume("keyword", "Expected 'method' keyword");
    const name = this.consume("identifier", "Expected method name").data;

    this.consume("lParen", "Expected '(' after method name");

    const parameters = [];
    if (!this.check("rParen")) {
      do {
        parameters.push(this.varDeclaration());
      } while (this.match("comma"));
    }

    this.consume("rParen", "Expected ')' after parameters");

    let returnType;
    if (this.peek().type === "type") {
      returnType = this.advance().data;
    } else {
      returnType = this.consume("identifier", "Expected return type").data;
    }

    this.consume("lCurlyBracket", "Expected '{' after method declaration");

    const statements = [];
    while (!this.isAtEnd() && !this.check("rCurlyBracket")) {
      statements.push(this.statement());
    }

    this.consume("rCurlyBracket", "Expected '}' after method body");

    return new MethodDef(name, parameters, returnType, statements);
  }

  // stmt ::= exp `;` | vardec `;` | var `=` exp `;` | `while` `(` exp `)` stmt
  //      | `break` `;` | `return` [exp] `;` | `if` `(` exp `)` stmt [`else` stmt] | `{` stmt* `}`
  statement() {
    if (this.match("lCurlyBracket")) {
      const statements = [];
      while (!this.isAtEnd() && !this.check("rCurlyBracket")) {
        statements.push(this.statement());
      }
      this.consume("rCurlyBracket", "Expected '}' after block");
      return new BlockStmt(statements);
    }

    if (this.match("keyword")) {
      const keyword = this.previous().data;

      if (keyword === "while") {
        this.consume("lParen", "Expected '(' after 'while'");
        const condition = this.expression();
        this.consume("rParen", "Expected ')' after condition");
        const body = this.statement();
        return new WhileStmt(condition, body);
      }

      if (keyword === "break") {
        this.consume("semicolon", "Expected ';' after 'break'");
        return new BreakStmt();
      }

      if (keyword === "return") {
        let value = null;
        if (!this.check("semicolon")) {
          value = this.expression();
        }
        this.consume("semicolon", "Expected ';' after return value");
        return new ReturnStmt(value);
      }

      if (keyword === "if") {
        this.consume("lParen", "Expected '(' after 'if'");
        const condition = this.expression();
        this.consume("rParen", "Expected ')' after condition");

        const thenBranch = this.statement();

        let elseBranch = null;
        if (!this.isAtEnd() && this.match("keyword") && this.previous().data === "else") {
          elseBranch = this.statement();
        }

        return new IfStmt(condition, thenBranch, elseBranch);
      }
    }

    // Check for variable declaration
    if (!this.isAtEnd() &&
        (this.peek().type === "type" ||
         (this.peek().type === "identifier" &&
          this.checkNext("identifier") &&
          !this.checkAhead(2, "equals")))) {
      const varDec = this.varDeclaration();
      this.consume("semicolon", "Expected ';' after variable declaration");
      return new VarDecStmt(varDec);
    }

    // Check for assignment
    if (!this.isAtEnd() && this.peek().type === "identifier" && this.checkNext("equals")) {
      const name = this.advance().data;
      this.consume("equals", "Expected '=' after variable name");
      const value = this.expression();
      this.consume("semicolon", "Expected ';' after assignment");
      return new AssignStmt(name, value);
    }

    // Expression statement
    const expr = this.expression();
    this.consume("semicolon", "Expected ';' after expression");
    return new ExprStmt(expr);
  }

  checkAhead(offset, type) {
    if (this.current + offset >= this.tokens.length) return false;
    return this.tokens[this.current + offset].type === type;
  }

  // exp ::= add_exp
  expression() {
    return this.additiveExpression();
  }

  // add_exp ::= mult_exp ((`+` | `-`) mult_exp)*
  additiveExpression() {
    let expr = this.multiplicativeExpression();

    while (!this.isAtEnd() && this.match("op")) {
      const operator = this.previous().data;
      if (operator === "+" || operator === "-") {
        const right = this.multiplicativeExpression();
        expr = new BinaryExpr(expr, operator, right);
      } else {
        this.current--; // Rewind if not a + or - operator
        break;
      }
    }

    return expr;
  }

  // mult_exp ::= call_exp ((`*` | `/`) call_exp)*
  multiplicativeExpression() {
    let expr = this.callExpression();

    while (!this.isAtEnd() && this.match("op")) {
      const operator = this.previous().data;
      if (operator === "*" || operator === "/") {
        const right = this.callExpression();
        expr = new BinaryExpr(expr, operator, right);
      } else {
        this.current--;
        break;
      }
    }

    return expr;
  }

  // call_exp ::= primary_exp (`.` methodname `(` comma_exp `)`)* 
  callExpression() {
    let expr = this.primaryExpression();

    while (!this.isAtEnd()) {
      if (this.match("dot")) {
        const method = this.consume("identifier", "Expected method name after '.'").data;
        this.consume("lParen", "Expected '(' after method name");

        const args = [];
        if (!this.check("rParen")) {
          do {
            args.push(this.expression());
          } while (this.match("comma"));
        }

        this.consume("rParen", "Expected ')' after arguments");
        expr = new CallExpr(expr, method, args);
      } else {
        break;
      }
    }

    return expr;
  }

  // primary_exp ::= var | str | i | `(` exp `)` | `this` | `true` | `false` 
  //               | `println` `(` exp `)` | `new` classname `(` comma_exp `)`
  primaryExpression() {
    if (this.match("identifier")) {
      return new VariableExpr(this.previous().data);
    }

    if (this.match("stringLiteral")) {
      return new LiteralExpr(this.previous().data, "string");
    }

    if (this.match("integerLiteral")) {
      return new LiteralExpr(parseInt(this.previous().data), "int");
    }

    if (this.match("keyword")) {
      const keyword = this.previous().data;

      if (keyword === "this") {
        return new ThisExpr();
      }

      if (keyword === "true") {
        return new LiteralExpr(true, "boolean");
      }

      if (keyword === "false") {
        return new LiteralExpr(false, "boolean");
      }

      if (keyword === "println") {
        this.consume("lParen", "Expected '(' after 'println'");
        const argument = this.expression();
        this.consume("rParen", "Expected ')' after argument");
        return new PrintlnExpr(argument);
      }

      if (keyword === "new") {
        const className = this.consume("identifier", "Expected class name after 'new'").data;
        this.consume("lParen", "Expected '(' after class name");

        const args = [];
        if (!this.check("rParen")) {
          do {
            args.push(this.expression());
          } while (this.match("comma"));
        }

        this.consume("rParen", "Expected ')' after arguments");
        return new NewExpr(className, args);
      }
    }

    if (this.match("lParen")) {
      const expr = this.expression();
      this.consume("rParen", "Expected ')' after expression");
      return expr;
    }

    throw new Error(`Unexpected token ${this.peek() ? this.peek().type : "EOF"}: ${this.peek() ? this.peek().data : ""}`);
  }
}

export default Parser;

export const runParser = (tokens) => {
  const parser = new Parser(tokens);
  return parser.parse();
};

