import Token from "./token.js"; // Import the Token class

//
export function get_char_data(char) {
    if (/[a-zA-Z_]/.test(char)) {
        return 'alphabet';
    }
    if (/\d/.test(char)) {
        return 'number';
    }
    if (/\s/.test(char)) {
        return 'space';
    }
    if (/[\+\-\*\/=\(\)\{\};,.\!\<\>\:\|\[\]]/.test(char)) { 
        return 'symbol'; 
    }
    return null;  // Unknown character
}

const keywords = new Set([
    'if', 'while', 'else', 'break', 'return',
    'true', 'false', 'println', 'new', 'for',
    'method', 'struct', 'class', 'init', 'extends', 'super'
]);

const types = new Set([
    'Int', 'Void', 'Boolean'
]);

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
                    finalType = "equals";  // Equals (for single equal sign)
                    break;
                case "==":
                    finalType = "equalsEquals";  // Double equals (equality comparison)
                    break;
                case "!=":
                    finalType = "notEquals";  // Not equals
                    break;
                case "|":
                    finalType = "pipe";  // Single pipe (for logical OR)
                    break;
                case "||":
                    finalType = "logicalOr";  // Double pipe (logical OR operator)
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
                case "+":
                case "-":
                case "*":
                case "/":
                    finalType = "op";  // For operators (+, -, *, /)
                    break;
                // Add more symbols as necessary
                default:
                    finalType = "symbol"; // If no match, just use "symbol"
                    break;
            }
            break;

        case "identifier":
            // Handle keywords by checking if the value exists in the keywords set
            if (keywords.has(value)) {
                finalType = "keyword";  // This is a keyword
            } else if (types.has(value)) {
                finalType = "type";  // This is a valid type
            } else {
                finalType = "identifier";  // If it's not a recognized type
            }
            break;

        // Add more case blocks here as other types (like 'identifier', 'integer', etc.)
        
        default:
            finalType = "unknown";  // If the type is not recognized, return "unknown"
            break;
    }

    return { type: finalType, value: value };  // Return the final token type and value
}