import { runLexer } from '../tokenizer/lexer.js';
import { runParser } from '../parser/parser.js';
import { runCodegen } from './codegen.js';

const testProgram = `
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

// Run lexer
const tokens = runLexer(testProgram);

// Run parser
const ast = runParser(tokens);
console.log(ast);
// Run codegen
//const code = runCodegen(ast);

// Output final JavaScript code
//console.log("\nGenerated JavaScript Code:\n");
//console.log(code);