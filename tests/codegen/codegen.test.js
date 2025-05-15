// codegen.test.js
//used Richmonds parser.test cases, and Chris' lexer.test layout, for the codegen testing setup - Eric
import { runLexer } from "../../src/tokenizer/lexer.js";
import { runParser } from '../../src/parser/parser.js';
import { runCodegen } from '../../src/code_generator/codegen.js';

describe('Codegen Test', () => {
  it('Animal Class', () => {
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

      const normalize = str =>
        str
        .trim()
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(line => line.trimStart())
        .join('\n');
      expect(normalize(result)).toStrictEqual(normalize(expected));
      console.log("Success: Generated Animal Class to js");
  });


   it('Test Class', () => {
      const data = `class Test {
  init() {}
  method foo() int { return 42; }
}`;

      const tokens = runLexer(data);
      const ast = runParser(tokens);
      const result = runCodegen(ast);

const expected = 
` function Test() {
    }
    Test.prototype.foo = function() {
    return 42;
    };
`

      const normalize = str =>
        str
        .trim()
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(line => line.trimStart())
        .join('\n');
      expect(normalize(result)).toStrictEqual(normalize(expected));
      console.log("Success: Test class to js");
  });

   it('Inheritance Test', () => {
      const data = `class Parent {
  init() {}
  method m() int { return 10; }
}
class Child extends Parent {
  init() { super(); }
  method m() int { return 20; }
}`;

      const tokens = runLexer(data);
      const ast = runParser(tokens);
      const result = runCodegen(ast);

const expected = 
`   
     function Parent() {
      }
     Parent.prototype.m = function() {
     return 10;
     };
     function Child() {
     Parent.call(this);
     }
     Child.prototype = Object.create(Parent.prototype);
     Child.prototype.constructor = Child;
     Child.prototype.m = function() {
     return 20;
     };
`

      const normalize = str =>
        str
        .trim()
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(line => line.trimStart())
        .join('\n');
      expect(normalize(result)).toStrictEqual(normalize(expected));
      console.log("Success: Inheritance to js");
  });


     it('While Test', () => {
      const data = `class Loop {
  init() {}
  method count() Void {
    while (1) {
      return println(5);
    }
  }
}`;

      const tokens = runLexer(data);
      const ast = runParser(tokens);
      const result = runCodegen(ast);

const expected = 
`   function Loop() {
      }
     Loop.prototype.count = function() {
     while (1) {
     return console.log(5);
     }
     };
`

     
      const normalize = str =>
        str
        .trim()
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(line => line.trimStart())
        .join('\n');
      expect(normalize(result)).toStrictEqual(normalize(expected));
      console.log("Success: While to js");
  });


     it('Break Test', () => {
      const data = `class Breaker {
  init() {}
  method run() Void {
    break;
  }
}`;

      const tokens = runLexer(data);
      const ast = runParser(tokens);
      const result = runCodegen(ast);

const expected = 
`  
     function Breaker() {
     }
     Breaker.prototype.run = function() {
     break;
      };
`

      
      const normalize = str =>
        str
        .trim()
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(line => line.trimStart())
        .join('\n');
      expect(normalize(result)).toStrictEqual(normalize(expected));
      console.log("Success: break to js");
  });

it('if-else Test', () => {
      const data = `class Logic {
  init() {}
  method decide() Void {
    if (1) { return println(1); } else { return println(0); }
  }
}`;

      const tokens = runLexer(data);
      const ast = runParser(tokens);
      const result = runCodegen(ast);

const expected = 
` 
function Logic() {
}
    Logic.prototype.decide = function() {
    if (1) {
    return console.log(1);
    } else {
    return console.log(0);
    }
    }; 
`

      const normalize = str =>
        str
        .trim()
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(line => line.trimStart())
        .join('\n');
      expect(normalize(result)).toStrictEqual(normalize(expected));
      console.log("Success: if-else to js");
  });

  it('Three Argument Test', () => {
      const data = `class Util {
  init() {}
  method combine(int a, int b, int c) int {
    return a + b + c;
  }
}
Util u;
u = new Util();
u.combine(1, 2, 3);`;

      const tokens = runLexer(data);
      const ast = runParser(tokens);
      const result = runCodegen(ast);

const expected = 
`function Util() {
  }
    Util.prototype.combine = function(a, b, c) {
    return a + b + c;
    };
    let u; // Util
    u = new Util();
    u.combine(1, 2, 3); `

      const normalize = str =>
        str
        .trim()
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(line => line.trimStart())
        .join('\n');
      expect(normalize(result)).toStrictEqual(normalize(expected));
      console.log("Success: Three Argument to js");
  });

});