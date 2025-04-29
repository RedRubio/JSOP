import { runLexer } from '../tokenizer/lexer.js';
import { runParser } from '../parser/parser.js';
import { runTypeChecker } from './typeChecker.js';
import {
  CompilerError, 
  TypeError,
  RedeclarationError, 
  UndeclaredError,
  IncompatibleAssignmentError,
  ReturnTypeError,
  NotAFunctionError
} from './typeCheckerError.js';

// Helper function to run all compiler stages
function compile(sourceCode) {
  try {
    const tokens = runLexer(sourceCode);
    const ast = runParser(tokens);
    runTypeChecker(ast); // Throws if there's a type error
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error 
    };
  }
}

// Test cases
const tests = [
  // Valid program - the animal example
  {
    name: "Valid animal program",
    code: `
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
    `,
    expectSuccess: true
  },
  
  // Invalid type assignment
  {
    name: "Invalid type assignment",
    code: `
      class Test {
        init() {}
      }
      Int x;
      x = "string"; // Error: Cannot assign String to Int
    `,
    expectSuccess: false,
    expectedErrorType: IncompatibleAssignmentError
  },
  
  // Undefined variable
  {
    name: "Undefined variable",
    code: `
      undefinedVar = 10; // Error: undefinedVar is not defined
    `,
    expectSuccess: false,
    expectedErrorType: UndeclaredError
  },
  
  // Method with wrong return type
  {
    name: "Wrong return type",
    code: `
      class Test {
        init() {}
        method returnInt() Int {
          return "string"; // Error: Cannot return String from Int method
        }
      }
      Test t;
      t = new Test();
    `,
    expectSuccess: false,
    expectedErrorType: ReturnTypeError
  },
  
  // Missing return statement
  {
    name: "Missing return",
    code: `
      class Test {
        init() {}
        method noReturn() Int {
          // Error: No return statement
        }
      }
      Test t;
      t = new Test();
    `,
    expectSuccess: false,
    expectedErrorType: ReturnTypeError
  },
  
  // Break outside loop
  {
    name: "Break outside loop",
    code: `
      class Test {
        init() {}
        method test() Void {
          break; // Error: Break outside loop
        }
      }
    `,
    expectSuccess: false,
    expectedErrorType: TypeError
  },
  
  // Invalid method call
  {
    name: "Invalid method call",
    code: `
      class Test {
        init() {}
        method greet() Void {
          return println("Hello");
        }
      }
      Test t;
      t = new Test();
      t.nonExistentMethod(); // Error: Method doesn't exist
    `,
    expectSuccess: false,
    expectedErrorType: NotAFunctionError
  },
  
  // Redeclaration
  {
    name: "Variable redeclaration",
    code: `
      Int x;
      Int x; // Error: x is already defined
    `,
    expectSuccess: false,
    expectedErrorType: RedeclarationError
  },
  
  // Invalid binary operation
  {
    name: "Invalid binary operation",
    code: `
      Int x;
      x = 5 + true; // Error: Cannot add Int and Boolean
    `,
    expectSuccess: false,
    expectedErrorType: TypeError
  },
  
  // Class extends unknown class
  {
    name: "Extends unknown class",
    code: `
      class Child extends Unknown { // Error: Unknown class does not exist
        init() {}
      }
    `,
    expectSuccess: false,
    expectedErrorType: TypeError
  },
  
  // Circular inheritance
  {
    name: "Circular inheritance",
    code: `
      class A extends B {
        init() {}
      }
      class B extends A { // Error: Circular inheritance
        init() {}
      }
    `,
    expectSuccess: false,
    expectedErrorType: TypeError
  },
  
  // Complex valid program
  {
    name: "Valid complex program",
    code: `
      class Shape {
        Int x;
        Int y;
        init(Int posX, Int posY) {
          x = posX;
          y = posY;
        }
        method getX() Int { return x; }
        method getY() Int { return y; }
        method area() Int { return 0; }
      }
      
      class Circle extends Shape {
        Int radius;
        init(Int posX, Int posY, Int r) {
          super(posX, posY);
          radius = r;
        }
        method getRadius() Int { return radius; }
        method area() Int { return radius * radius; } // Not actual pi*r^2, just for testing
      }
      
      Shape s;
      Circle c;
      s = new Shape(0, 0);
      c = new Circle(5, 10, 15);
      Int a1;
      Int a2;
      a1 = s.area();
      a2 = c.area();
      println(a1);
      println(a2);
    `,
    expectSuccess: true
  },
  
  // Method overriding with incorrect return type
  {
    name: "Method override wrong return type",
    code: `
      class Parent {
        init() {}
        method test() Int { return 0; }
      }
      class Child extends Parent {
        init() { super(); }
        method test() String { return "wrong"; } // Error: Wrong return type for overridden method
      }
    `,
    expectSuccess: false,
    expectedErrorType: TypeError
  },
  
  // If statement with non-boolean condition
  {
    name: "If with non-boolean condition",
    code: `
      Int x;
      x = 5;
      if (x) { // Error: If condition must be Boolean
        println(1);
      }
    `,
    expectSuccess: false,
    expectedErrorType: TypeError
  },
  
  // While statement with non-boolean condition
  {
    name: "While with non-boolean condition",
    code: `
      Int x;
      x = 5;
      while (x) { // Error: While condition must be Boolean
        println(1);
      }
    `,
    expectSuccess: false,
    expectedErrorType: TypeError
  },
  
  // Valid use of break
  {
    name: "Valid break usage",
    code: `
      Int i;
      i = 0;
      while (true) {
        println(i);
        i = i + 1;
        if (i > 10) {
          break;
        }
      }
    `,
    expectSuccess: true
  },
  
  // Valid nested classes and inheritance
  {
    name: "Valid nested classes and inheritance",
    code: `
      class A {
        init() {}
        method methodA() String { return "A"; }
      }
      
      class B extends A {
        init() { super(); }
        method methodB() String { return "B"; }
      }
      
      class C extends B {
        init() { super(); }
        method methodC() String { return "C"; }
      }
      
      C c;
      c = new C();
      println(c.methodA());
      println(c.methodB());
      println(c.methodC());
    `,
    expectSuccess: true
  },
  
  // String concatenation 
  {
    name: "Valid string concatenation",
    code: `
      String s1;
      String s2;
      String result;
      s1 = "Hello, ";
      s2 = "World!";
      result = s1 + s2;
      println(result);
    `,
    expectSuccess: true
  }
];

// Run the tests and display results
function runTests() {
  console.log("Running Type Checker Tests...\n");
  
  let passed = 0;
  let failed = 0;
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const result = compile(test.code);
    
    let testPassed = false;
    
    if (test.expectSuccess && result.success) {
      testPassed = true;
    } else if (!test.expectSuccess && !result.success) {
      // For error cases, check if the error type matches the expected type
      if (test.expectedErrorType && result.error instanceof test.expectedErrorType) {
        testPassed = true;
      } else {
        console.log(`  ✗ Test #${i + 1}: "${test.name}" - FAILED`);
        console.log(`    Expected error of type ${test.expectedErrorType?.name}, but got ${result.error?.constructor?.name || "unknown"}`);
        console.log(`    Error message: ${result.error?.message || "No error message"}`);
        failed++;
        continue;
      }
    }
    
    if (testPassed) {
      console.log(`  ✓ Test #${i + 1}: "${test.name}" - PASSED`);
      passed++;
    } else {
      console.log(`  ✗ Test #${i + 1}: "${test.name}" - FAILED`);
      if (test.expectSuccess) {
        console.log(`    Expected success, but got error: ${result.error?.message || "No error message"}`);
      } else {
        console.log(`    Expected error, but compilation succeeded`);
      }
      failed++;
    }
  }
  
  console.log(`\nResults: ${passed}/${tests.length} tests passed`);
  if (failed === 0) {
    console.log("All tests passed! 🎉");
  } else {
    console.log(`${failed} tests failed.`);
  }
}

// Run the tests
runTests();
