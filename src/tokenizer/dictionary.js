import Token from "./token.js"; // Import the Token class

// In dictionary.js or a similar file
export function generate_token_data(input) {
    const keywords = new Set([
        'let', 'if', 'while', 'else', 'break', 'println',
        'return', 'new', 'for', 'true', 'false', 'self',
        'func', 'impl', 'trait', 'method', 'struct'
    ]);

    const types = new Set([
        'Int', 'Void', 'Boolean', 'Self'
    ]);

    // Check if the input matches a keyword
    if (keywords.has(input.toLowerCase())) {
        return 'keyword';
    }

    // Check if the input matches a type
    if (types.has(input)) {
        return 'type';
    }

    // Check if the input is a valid identifier (alphabet or underscore)
    if (/^[a-zA-Z_]\w*$/.test(input)) {
        return 'identifier';
    }

    // Check if the input is a valid integer (digit only)
    if (/^\d+$/.test(input)) {
        return 'integer';
    }

    // Check if the input is a symbol (operators, parentheses, etc.)
    if (/[\+\-\*\/=\(\)\{\};,.\!\<\>\:]/.test(input)) {
        return 'symbol';
    }

    // Check if it's a blank space
    if (/\s/.test(input)) {
        return 'space';
    }

    return null;  // If no match, return null
}