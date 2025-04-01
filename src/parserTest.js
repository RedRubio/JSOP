import { runParser } from "./parser.js";

// Sample source code
const sourceCode = `class Animal { method speak() { return 0; } }`;

const tokens = runParser(sourceCode);
console.log(tokens);  // Output tokens to the console for debugging
