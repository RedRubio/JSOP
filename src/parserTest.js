import { runLexer } from './lexer.js';
import { runParser } from './parser.js';


const testProgram = `
class Animal {
    Int age;
    
    init(Int initialAge) {
        age = initialAge;
    }
    
    method getAge() Int {
        return age;
    }
    
    method makeSound() String {
        return "Generic animal sound";
    }
}

class Dog extends Animal {
    String breed;
    
    init(Int age, String dogBreed) {
        super(age);
        breed = dogBreed;
    }
    
    method makeSound() String {
        return "Woof!";
    }
    
    method getBreed() String {
        return breed;
    }
}

// Main program
Int age = 5;
String breed = "Golden Retriever";
Dog myDog = new Dog(age, breed);
println(myDog.getAge());
println(myDog.makeSound());
println(myDog.getBreed());

if (myDog.getAge() > 3) {
    println("Older dog");
} else {
    println("Younger dog");
}

Int i = 0;
while (i < 3) {
    println(i);
    i = i + 1;
}
`;

// Run the lexer
const tokens = runLexer(testProgram);
console.log("Tokens:", tokens);

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
