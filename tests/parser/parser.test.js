console.log("Starting parser.test.js");

import { runLexer } from '../../src/tokenizer/lexer.js';
import { runParser } from '../../src/parser/parser.js';
import assert from 'assert';

test('dummy test', () => {
  expect(true).toBe(true);
});

describe('Parser Tests', () => {
  it('should parse a basic class definition with a method', () => {
    const code = `
      class Test {
        init() {}
        method foo() int { return 42; }
      }
    `;
    const tokens = runLexer(code);
    const ast = runParser(tokens);

    assert.ok(ast, 'AST should be defined');
    assert.strictEqual(ast.type, 'Program');
    assert.strictEqual(ast.classes.length, 1);
    assert.strictEqual(ast.statements.length, 0);

    const classNode = ast.classes[0];
    assert.strictEqual(classNode.type, 'ClassDef');
    assert.strictEqual(classNode.name, 'Test');
    assert.strictEqual(classNode.parent, null);
    assert.ok(classNode.constructor);
    assert.strictEqual(classNode.methods.length, 1);

    const method = classNode.methods[0];
    assert.strictEqual(method.name, 'foo');
    assert.strictEqual(method.returnType, 'int');
  });

  it('should correctly parse a class with inheritance', () => {
    const code = `
      class Parent {
        init() {}
        method m() int { return 10; }
      }
      class Child extends Parent {
        init() { super(); }
        method m() int { return 20; }
      }
    `;
    const tokens = runLexer(code);
    const ast = runParser(tokens);

    assert.ok(ast);
    assert.strictEqual(ast.classes.length, 2);
    assert.strictEqual(ast.classes[0].name, 'Parent');
    assert.strictEqual(ast.classes[1].name, 'Child');
    assert.strictEqual(ast.classes[1].parent, 'Parent');
  });

  it('should parse variable declarations, assignments, and expression statements', () => {
    const code = `
      class Animal {
        init() {}
        method speak() Void { return println(0); }
      }
      class Cat extends Animal {
        init() { super(); }
        method speak() Void { return println(1); }
      }
      class Dog extends Animal {
        init() { super(); }
        method speak() Void { return println(2); }
      }

      Animal cat;
      Animal dog;
      cat = new Cat();
      dog = new Dog();
      cat.speak();
      dog.speak();
    `;
    const tokens = runLexer(code);
    const ast = runParser(tokens);

    assert.ok(ast);
    assert.strictEqual(ast.classes.length, 3);
    assert.strictEqual(ast.statements.length, 6);
    assert.strictEqual(ast.statements[0].type, 'VarDecStmt');
    assert.strictEqual(ast.statements[2].type, 'AssignStmt');
    assert.strictEqual(ast.statements[4].type, 'ExprStmt');
  });

  it('should return null for invalid syntax (missing semicolon)', () => {
    const code = `
      class Invalid {
        init() {}
        method bad() int { return 1 }
      }
    `;
    let ast;
    try {
      const tokens = runLexer(code);
      ast = runParser(tokens);
    } catch (e) {
      ast = null;
    }
    expect(ast).toBeNull();
  });

  it('should return empty Program node for empty input', () => {
    const tokens = runLexer('');
    const ast = runParser(tokens);
    expect(ast).toEqual({ type: 'Program', classes: [], statements: [] });
  });

  it('should return empty Program node for only whitespace', () => {
    const tokens = runLexer('   \n\t  ');
    const ast = runParser(tokens);
    expect(ast).toEqual({ type: 'Program', classes: [], statements: [] });
  });

  it('should parse class with only constructor', () => {
    const code = `
      class OnlyInit {
        init() {}
      }
    `;
    const tokens = runLexer(code);
    const ast = runParser(tokens);
    assert.ok(ast);
    assert.strictEqual(ast.classes.length, 1);
    const cls = ast.classes[0];
    assert.ok(cls.constructor);
    assert.strictEqual(cls.methods.length, 0);
  });

  it('should allow class without constructor if optional', () => {
    const code = `
      class Broken {
        method test() int { return 5; }
      }
    `;
    const tokens = runLexer(code);
    const ast = runParser(tokens);

    assert.ok(ast);
    const brokenClass = ast.classes.find(cls => cls.name === 'Broken');
    assert.ok(brokenClass);
    expect(brokenClass.constructor).toBeNull();
  });

  it('should return null for unsupported nested class definitions', () => {
    const code = `
      class Outer {
        init() {}
        method outer() int { return 1; }
        class Inner {
          init() {}
          method inner() int { return 2; }
        }
      }
    `;
    let ast;
    try {
      const tokens = runLexer(code);
      ast = runParser(tokens);
    } catch (e) {
      ast = null;
    }
    expect(ast).toBeNull();
  });
});


it('should parse if-else statement inside a method', () => {
    const code = `
      class Logic {
        init() {}
        method decide() Void {
          if (1) { return println(1); } else { return println(0); }
        }
      }
    `;
    const tokens = runLexer(code);
    const ast = runParser(tokens);
    const logicClass = ast.classes.find(cls => cls.name === 'Logic');
    expect(logicClass).toBeDefined();
    const method = logicClass.methods.find(m => m.name === 'decide');
    expect(method.statements.length).toBe(1);
  });

  it('should parse while statement with block body', () => {
    const code = `
      class Loop {
        init() {}
        method count() Void {
          while (1) {
            return println(5);
          }
        }
      }
    `;
    const tokens = runLexer(code);
    const ast = runParser(tokens);
    const loopClass = ast.classes.find(cls => cls.name === 'Loop');
    expect(loopClass).toBeDefined();
  });

  it('should parse break statement', () => {
    const code = `
      class Breaker {
        init() {}
        method run() Void {
          break;
        }
      }
    `;
    const tokens = runLexer(code);
    const ast = runParser(tokens);
    const cls = ast.classes.find(cls => cls.name === 'Breaker');
    expect(cls).toBeDefined();
  });

  it('should parse binary and multiplicative expressions in one line', () => {
    const code = `
      class Math {
        init() {}
        method calc() int {
          return 1 + 2 * 3;
        }
      }
    `;
    const tokens = runLexer(code);
    const ast = runParser(tokens);
    const cls = ast.classes.find(cls => cls.name === 'Math');
    expect(cls).toBeDefined();
  });

  it('should parse constructor with multiple typed parameters', () => {
    const code = `
      class Params {
        init(int a, int b) {
          return println(a);
        }
      }
    `;
    const tokens = runLexer(code);
    const ast = runParser(tokens);
    const cls = ast.classes.find(cls => cls.name === 'Params');
    expect(cls).toBeDefined();
  });

  it('should parse constructor with super call and args', () => {
    const code = `
      class Parent {
        init(int a) {}
      }
      class Child extends Parent {
        init() {
          super(42);
        }
      }
    `;
    const tokens = runLexer(code);
    const ast = runParser(tokens);
    const cls = ast.classes.find(cls => cls.name === 'Child');
    expect(cls).toBeDefined();
  });


  it('should parse constructor with multiple comma-separated params', () => {
    const code = `
      class Params {
        init(int x, int y) {}
      }
    `;
    const tokens = runLexer(code);
    const ast = runParser(tokens);
    const cls = ast.classes.find(c => c.name === 'Params');
    expect(cls.constructor.parameters.length).toBe(2);
  });



  it('should parse literal expressions: string, this, true, false', () => {
    const code = `
      class Test {
        init() {}
        method a() String { return "hello"; }
        method b() Bool { return true; }
        method c() Bool { return false; }
        method d() Test { return this; }
      }
    `;
    const tokens = runLexer(code);
    const ast = runParser(tokens);
    const cls = ast.classes.find(c => c.name === 'Test');
    expect(cls.methods.length).toBe(4);
  });


  it('should parse new expression with multiple arguments', () => {
    const code = `
      class Point {
        init(int x, int y) {}
      }
      Point p;
      p = new Point(5, 10);
    `;
    const tokens = runLexer(code);
    const ast = runParser(tokens);
    const assign = ast.statements.find(stmt => stmt.type === 'AssignStmt');
    expect(assign.expression.args.length).toBe(2);
  });



  it('should throw error for unexpected token at EOF', () => {
    const code = `
      class A {
        init() {}
        method m() int { return }
      }
    `;
    expect(() => {
      const tokens = runLexer(code);
      runParser(tokens);
    }).toThrow(/Unexpected token/);
  });

  
  it('should handle method call with three arguments', () => {
    const code = `
      class Util {
        init() {}
        method combine(int a, int b, int c) int {
          return a + b + c;
        }
      }
      Util u;
      u = new Util();
      u.combine(1, 2, 3);
    `;
    const tokens = runLexer(code);
    const ast = runParser(tokens);
    expect(ast).toBeDefined();
  });

  


  it('should return this from a method', () => {
    const code = `
      class Self {
        init() {}
        method me() Self { return this; }
      }
    `;
    const tokens = runLexer(code);
    const ast = runParser(tokens);
    const selfClass = ast.classes.find(c => c.name === 'Self');
    const method = selfClass.methods.find(m => m.name === 'me');
    expect(method).toBeDefined();
  });


  
  
  
  
  
  
  
