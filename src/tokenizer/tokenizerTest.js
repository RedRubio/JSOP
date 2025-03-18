import token from "./token";
import TokenizerError from "./tokenizeError";
import { get_char_data } from "./dictionary";



describe('Tokenizer Test', () => {
  it('Parsing variable declaration', () => {
      const data = "Int x;";
      const result = token(data);
      const expected = [
          new Token('type', 'Int'),
          new Token('var', 'x'),
          new Token('semicolon', ';')
      ];
      expect(result).toStrictEqual(expected);
  });

  it('Parsing method definition', () => {
    const data = "method myMethod(Int x, Int y) Int { return x + y; }";
    const result = tokenize(data);

    const expected = [
        new Token('keyword', 'method'),
        new Token('methodname', 'myMethod'),
        new Token('lParen', '('),
        new Token('type', 'Int'),
        new Token('variable', 'x'),
        new Token('comma', ','),
        new Token('type', 'Int'),
        new Token('variable', 'y'),
        new Token('rParen', ')'),
        new Token('type', 'Int'),
        new Token('lBracket', '{'),
        new Token('keyword', 'return'),
        new Token('variable', 'x'),
        new Token('op', '+'),
        new Token('variable', 'y'),
        new Token('semicolon', ';'),
        new Token('rBracket', '}')
    ];
    expect(result).toStrictEqual(expected);
});
  

  it('Parsing if-else statement', () => {
    const data = "if (x < 10) { println(\"Small number\"); } else { println(\"Large number\"); }";
    const result = token(data);
    
    const expected = [
        new Token('keyword', 'if'),
        new Token('lParen', '('),
        new Token('variable', 'x'),
        new Token('op', '<'),
        new Token('number', '10'),
        new Token('rParen', ')'),
        new Token('lBracket', '{'),
        new Token('function', 'println'),
        new Token('lParen', '('),
        new Token('str', '"Small number"'),
        new Token('rParen', ')'),
        new Token('semicolon', ';'),
        new Token('rBracket', '}'),
        new Token('keyword', 'else'),
        new Token('lBracket', '{'),
        new Token('function', 'println'),
        new Token('lParen', '('),
        new Token('str', '"Large number"'),
        new Token('rParen', ')'),
        new Token('semicolon', ';'),
        new Token('rBracket', '}')
    ];
    expect(result).toStrictEqual(expected);
});

it('Parsing object instantiation', () => {
    const data = "new MyClass(10, \"Hello\");";
    const result = token(data);
    
    const expected = [
        new Token('keyword', 'new'),
        new Token('classname', 'MyClass'),
        new Token('lParen', '('),
        new Token('number', '10'),
        new Token('comma', ','),
        new Token('str', '"Hello"'),
        new Token('rParen', ')'),
        new Token('semicolon', ';')
    ];
    expect(result).toStrictEqual(expected);
});

it('Parsing while loop', () => {
    const data = "while (i > 0) { i = i - 1; }";
    const result = token(data);
    
    const expected = [
        new Token('keyword', 'while'),
        new Token('lParen', '('),
        new Token('variable', 'i'),
        new Token('op', '>'),
        new Token('number', '0'),
        new Token('rParen', ')'),
        new Token('lBracket', '{'),
        new Token('variable', 'i'),
        new Token('equals', '='),
        new Token('variable', 'i'),
        new Token('op', '-'),
        new Token('number', '1'),
        new Token('semicolon', ';'),
        new Token('rBracket', '}')
    ];
    expect(result).toStrictEqual(expected);
});

it('Parsing empty string', () => {
    const data = "";
    const result = token(data);


    const expected = [];
    expect(result).toStrictEqual(expected);
});

});