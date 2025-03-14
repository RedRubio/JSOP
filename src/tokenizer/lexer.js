import { get_char_data } from "./dictionary.js";
import { set_token } from './dictionary.js';  // Import the set_token function
import Token from "./token.js";

class Lexer {
    constructor(sourceCode) {
        this.source = sourceCode;  // The full source code as a string
        this.position = 0;         // Current position in the string
        this.tokens = [];          // List to store extracted tokens
        this.currentString = "";   // The string being built
        this.state = 1;            // Start in state 1
    }

    tokenize() {
        while (this.position < this.source.length) {
            let currentChar = this.source[this.position]; // Current character
            let type = get_char_data(currentChar); // Get type for this single character
            let tokenData;
            switch (this.state) {
                case 1:  // State 1 (start state)
                    if (type === 'alphabet') {
                        this.state = 2;  // Move to State 2 for identifier
                    } else if (type === 'number') {
                        this.state = 3;  // Move to State 3 for integer
                    } else if (type === 'symbol') {
                        this.state = 4;  // Move to State 4 for symbol
                    } else{
                    this.position++;
                    }
                
                    break;
                    
                case 2:  // State 2 (identifier state)
                    this.currentString = currentChar;  // Start fresh with the first character
    
                    while (this.position + 1 < this.source.length) { 
                        let nextChar = this.source[this.position + 1];
                        let nextCharType = get_char_data(nextChar);
    
                        if (nextCharType === 'alphabet' || nextCharType === 'number') {
                            this.position++;
                            this.currentString += nextChar;
                        } else {
                            break; // Stop if it's no longer an identifier
                        }
                    }
                    
                    // Store the completed identifier
                    tokenData = set_token("identifier", this.currentString);
                    this.tokens.push(new Token(tokenData.type, tokenData.value));

                    // Reset
                    this.currentString = "";
                    this.position++;  
                    this.state = 1;
                    break;

                    case 3:  // State 3 (integer state) -> Works like State 2 but for numbers
                    this.currentString = currentChar; // Start fresh with the first digit
                
                    while (this.position + 1 < this.source.length) {
                        let nextChar = this.source[this.position + 1];
                        let nextCharType = get_char_data(nextChar);
                
                        if (nextCharType === 'number') {
                            this.position++;
                            this.currentString += nextChar;
                        } else {
                            break; // Stop if it's no longer an integer
                        }
                    }
                
                    // Store the completed integer token using set_token
                    tokenData = set_token("integer", this.currentString);
                    this.tokens.push(new Token(tokenData.type, tokenData.value));
                
                    // Reset
                    this.currentString = "";
                    this.position++;  
                    this.state = 1;
                    break;
                    
                    case 4:  // Symbol state
                        this.currentString = currentChar; // Store the single symbol

                        // Check if the next character creates a two-character symbol
                        if (this.position + 1 < this.source.length) {
                            let nextChar = this.source[this.position + 1];
                        // Check for specific two-character symbols (e.g., '==' or '!=')
                            if ((this.currentString === "=" && nextChar === "=") || 
                            (this.currentString === "!" && nextChar === "=") ||
                            (this.currentString === "|" && nextChar === "|")) {
                            // Append the next character to form the two-character symbol
                            this.currentString += nextChar;
                            this.position++;  // Move the position forward
                        }
                    }

                        // Use set_token to generate the token

                        tokenData = set_token("symbol", this.currentString);
                       
                        // Store the token
                        this.tokens.push(new Token(tokenData.type, tokenData.value));

                        // Reset
                        this.currentString = "";
                        this.position++;  // Move to the next character
                        this.state = 1;   // Reset to the start state
    break;
                case 6:  // State 6 (space state)
                    this.currentString = currentChar; // Start fresh
    
                    while (this.position + 1 < this.source.length && generate_token_data(this.source[this.position + 1]) === 'space') {
                        this.position++;
                        this.currentString += this.source[this.position];
                    }
    
                    // Store the space token
                    //this.tokens.push(new Token('space', this.currentString));
                    //console.log(`Token: "${this.currentString}", Type: space`);
    
                    // Reset
                    this.currentString = "";
                    this.position++;  
                    this.state = 1;
                    break;
            }
        }
    }
}

// Test the lexer with sample input
const testInput = `class Animal {
 init() {}
 method speak() Void { return println(0); }
}
class Cat ex == tend != s Animal {
 init() { sup || er(); }
 method speak() Void { return println(1); }
}
`;

const lexer = new Lexer(testInput);
lexer.tokenize();

// Inspect the generated tokens
console.log(lexer.tokens);
