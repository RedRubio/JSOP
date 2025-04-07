import { runLexer } from '../tokenizer/lexer.js';
import { runParser } from './parser.js';


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

// Run the lexer
const tokens = runLexer(testProgram);

// Run the parser
const ast = runParser(tokens);
console.log("AST:", JSON.stringify(ast, null, 2));

// Helper function to visualize the AST
function visualizeAST(node, indent = 0) {
    if (!node) return;
    
    const padding = ' '.repeat(indent * 2);
    console.log(`${padding}${node.type}`);
    
    // Handle different node types
    if (node.type === 'Program') {
        console.log(`${padding}  Classes:`);
        node.classes.forEach(cls => visualizeAST(cls, indent + 2));
        console.log(`${padding}  Statements:`);
        node.statements.forEach(stmt => visualizeAST(stmt, indent + 2));
    } else {
        // Handle properties based on node type
        Object.keys(node).forEach(key => {
            if (key === 'type') return;
            
            const value = node[key];
            if (Array.isArray(value)) {
                console.log(`${padding}  ${key}:`);
                value.forEach(item => {
                    if (typeof item === 'object' && item !== null) {
                        visualizeAST(item, indent + 2);
                    } else {
                        console.log(`${padding}    ${item}`);
                    }
                });
            } else if (typeof value === 'object' && value !== null) {
                console.log(`${padding}  ${key}:`);
                visualizeAST(value, indent + 2);
            } else {
                console.log(`${padding}  ${key}: ${value}`);
            }
        });
    }
}

console.log("\nAST Visualization:");
visualizeAST(ast);
