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
    console.log(`Token Value: "${token_value}", Type: "${token_type}"`); // Debugging
    return null;  // If no match, return null
}

export function set_token(type, value) {
    let finalType = null;

    // Check the type before deciding on the value handling
    switch (type) {
        case "symbol":
            // For symbol types, map them to the corresponding token type
            switch (value) {
                case "(":
                    finalType = "lParen";  // Left Parenthesis
                    break;
                case ")":
                    finalType = "rParen";  // Right Parenthesis
                    break;
                case "<":
                    finalType = "lessThan";  // Less Than
                    break;
                case "=":
                    finalType = "equals";  // Equals
                    break;
                case ",":
                    finalType = "comma";  // Comma
                    break;
                case ".":
                    finalType = "dot";  // Dot
                    break;
                case ":":
                    finalType = "colon";  // Colon
                    break;
                case ";":
                    finalType = "semicolon";  // Semicolon
                    break;
                case "[":
                    finalType = "lBracket";  // Left Bracket
                    break;
                case "]":
                    finalType = "rBracket";  // Right Bracket
                    break;
                case "{":
                    finalType = "lCurlyBracket";  // Left Curly Bracket
                    break;
                case "}":
                    finalType = "rCurlyBracket";  // Right Curly Bracket
                    break;
                // Add more symbols as necessary
                default:
                    finalType = "symbol"; // If no match, just use "symbol"
                    break;
            }
            break;

        // Add more case blocks here as other types (like 'identifier', 'integer', etc.)
        
        default:
            finalType = "unknown";  // If the type is not recognized, return "unknown"
            break;
    }

    return { type: finalType, value: value };  // Return the final token type and value
}