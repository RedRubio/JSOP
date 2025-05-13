// codegen.test.js

import { runLexer } from "../../src/tokenizer/lexer.js";
import { runParser } from '../../src/parser/parser.js';
import { runCodegen } from '../../src/code_generator/codegen.js';

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

describe('Tokenizer Test', () => {
  it('Parsing variable declaration', () => {
      const data =  `
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
      const tokens = runLexer(data);
      const ast = runParser(tokens);
      const result = runCodegen(ast);

const expected = 
`function Animal() {
}
Animal.prototype.speak = function() {
  return console.log(0);
};
function Cat() {
  Animal.call(this);
}
Cat.prototype = Object.create(Animal.prototype);
Cat.prototype.constructor = Cat;
Cat.prototype.speak = function() {
  return console.log(1);
};
function Dog() {
  Animal.call(this);
}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.speak = function() {
  return console.log(2);
};
let cat; // Animal
let dog; // Animal
cat = new Cat();
dog = new Dog();
cat.speak();
dog.speak();
`

      //expect(result).toStrictEqual(expected);
      //const normalize = str => str.trim().replace(/\r\n/g, '\n');
      const normalize = str =>
        str
        .trim()
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(line => line.trimStart())
        .join('\n');
      expect(normalize(result)).toStrictEqual(normalize(expected));
      console.log("Success: Parsing Variable declaration");
  });
});

it('Parsing binary expression', () => {
    const data = "5 + 3;";
    
    const expected = `5 + 3;`;

    const tokens = runLexer(data);
    const ast = runParser(tokens);
    const result = runCodegen(ast);

    const normalize = str =>
      str
        .trim()
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(line => line.trimStart())
        .join('\n');

    expect(normalize(result)).toStrictEqual(normalize(expected));
    console.log("Success: Parsing binary expression");
});

/*it('Parsing this expression', () => {
    const data = "this;";

    const expected = `this;`;

    const tokens = runLexer(data);
    const ast = runParser(tokens);
    const result = runCodegen(ast);

    const normalize = str =>
        str
            .trim()
            .replace(/\r\n/g, '\n')
            .split('\n')
            .map(line => line.trimStart())
            .join('\n');

    expect(normalize(result)).toStrictEqual(normalize(expected));
    console.log("Success: Parsing this expression");
});

it('Generates code for this expression', () => {
    const fakeAst = {
        classDefs: [],
        stmts: [
            {
                kind: 'expr',
                expr: {
                    type: 'ThisExpr'
                }
            }
        ]
    };

    const result = runCodegen(fakeAst);
    expect(result.trim()).toBe('this;');
    console.log("Success: Parsing 'this' expression through codegen");
});





it('Throws error on unknown expression type', () => {
    
    const fakeAst = {
       classDefs: [],
        stmts: [
            {
                kind: 'expr',
                expr: {
                    type: 'UnknownExpr'  
                }
            }
        ]
    };

    expect(() => runCodegen(fakeAst)).toThrowError(
        ("undefined is not iterable (cannot read property Symbol(Symbol.iterator))")
    );

    console.log("Success: Error thrown for unknown expression type");
}); */


it('Generates code for if statement with else', () => {
    const data = `
        let x;
        x = 10;
        if ((x < 20)) x = 1; else x = 2;
        
    `;

    const expected = `if (1 < 2) println(1); else println(2);`;

    const tokens = runLexer(data);
    const ast = runParser(tokens);
    const result = runCodegen(ast);

    const normalize = str =>
        str
            .trim()
            .replace(/\r\n/g, '\n')
            .split('\n')
            .map(line => line.trimStart())
            .join('\n');

    expect(normalize(result)).toStrictEqual(normalize(expected));
    console.log("Success: If statement with else");
});

it('Generates code for if statement without else', () => {
    const data = `
       let x;
       x = 10;
       if ((x < 20)) x = 1;
        
    `;

    const expected = `if (1 < 2) println(1);`;

    const tokens = runLexer(data);
    const ast = runParser(tokens);
    const result = runCodegen(ast);

    const normalize = str =>
        str
            .trim()
            .replace(/\r\n/g, '\n')
            .split('\n')
            .map(line => line.trimStart())
            .join('\n');

    expect(normalize(result)).toStrictEqual(normalize(expected));
    console.log("Success: If statement without else");
});





// eval(generatedCode); 
// Expected output: 3 (because `break` occurs when `i == 3`)
