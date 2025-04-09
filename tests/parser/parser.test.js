console.log("Starting parser.test.js");

// Import your lexer and parser functions using the correct relative paths.
import { runLexer } from '../../src/tokenizer/lexer.js';
import { runParser } from '../../src/parser/parser.js';
import assert from 'assert';

// A simple dummy test to verify that the file is loaded.
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
    
    // Run the lexer and parser.
    const tokens = runLexer(code);
    const ast = runParser(tokens);
    
    // Verify we have a Program node with one class and no top-level statements.
    assert.ok(ast, 'AST should be defined');
    assert.strictEqual(ast.type, 'Program', 'AST node should be of type Program');
    assert.strictEqual(ast.classes.length, 1, 'There should be one class definition');
    assert.strictEqual(ast.statements.length, 0, 'There should be no top-level statements');
    
    // Check the class node.
    const classNode = ast.classes[0];
    assert.strictEqual(classNode.type, 'ClassDef', 'Node type should be ClassDef');
    assert.strictEqual(classNode.name, 'Test', 'Class name should be Test');
    assert.strictEqual(classNode.parent, null, 'Test should not extend any class');
    // Verify that the constructor exists (even if empty) and there is one method.
    assert.ok(classNode.constructor, 'Class should have a constructor (init)');
    assert.strictEqual(classNode.methods.length, 1, 'Class should have one method');
    
    // Check method details.
    const method = classNode.methods[0];
    assert.strictEqual(method.type, 'MethodDef', 'Method node should be of type MethodDef');
    assert.strictEqual(method.name, 'foo', 'Method name should be foo');
    // The method's return type is expected to be "int".
    assert.strictEqual(method.returnType, 'int', 'Method return type should be int');
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
    assert.ok(ast, 'AST should be defined');
    // Verify that there are two class definitions.
    assert.strictEqual(ast.classes.length, 2, 'There should be two class definitions');
    
    // Check the Parent class.
    const parentClass = ast.classes[0];
    assert.strictEqual(parentClass.name, 'Parent', 'First class name should be Parent');
    assert.strictEqual(parentClass.parent, null, 'Parent class should not extend any class');
    
    // Check the Child class.
    const childClass = ast.classes[1];
    assert.strictEqual(childClass.name, 'Child', 'Second class name should be Child');
    assert.strictEqual(childClass.parent, 'Parent', 'Child should extend Parent');
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
    assert.ok(ast, 'AST should be defined');
    // There should be three class definitions and six top-level statements.
    assert.strictEqual(ast.classes.length, 3, 'There should be three class definitions');
    assert.strictEqual(ast.statements.length, 6, 'There should be six top-level statements');

    // Check that the first two statements are variable declarations.
    const firstStmt = ast.statements[0];
    assert.strictEqual(firstStmt.type, 'VarDecStmt', 'First statement should be a variable declaration');
    const secondStmt = ast.statements[1];
    assert.strictEqual(secondStmt.type, 'VarDecStmt', 'Second statement should be a variable declaration');

    // Validate that an assignment and an expression statement are parsed correctly.
    const assignStmt = ast.statements[2];
    assert.strictEqual(assignStmt.type, 'AssignStmt', 'Third statement should be an assignment');
    const exprStmt = ast.statements[4];
    assert.strictEqual(exprStmt.type, 'ExprStmt', 'Fifth statement should be an expression statement');
  });

  it('should throw an error (or return null) for an invalid program', () => {
    // This code is missing a semicolon after the return statement, so it is invalid.
    const code = `
      class Invalid {
        init() {}
        method faulty() int { return 1 }
      }
    `;
    
    let ast;
    try {
      const tokens = runLexer(code);
      ast = runParser(tokens);
    } catch (e) {
      // If an error is thrown, that's acceptable behavior.
      ast = null;
    }
    
    assert.strictEqual(ast, null, 'Parser should return null or fail for invalid syntax');
  });

});
