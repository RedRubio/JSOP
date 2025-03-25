import Token from "../../src/tokenizer/token";
import TokenizerError from "./tokenizeError";
import { get_char_data } from "../../src/tokenizer/dictionary";
import { runLexer } from "../../src/tokenizer/lexer.js";


describe('Tokenizer Test', () => {
  it('Parsing variable declaration', () => {
      const data = "Int x;";
      const result = runLexer(data);
      const expected = [
          new Token('type', 'Int'),
          new Token('identifier', 'x'),
          new Token('semicolon', ';')
      ];
      expect(result).toStrictEqual(expected);
      console.log("Success: Parsing Variable declaration");
  });

  it('Parsing method definition', () => {
    const data = "method myMethod(Int x, Int y) Int { return x + y; }";
    const result = runLexer(data);

    const expected = [
        new Token('keyword', 'method'),
        new Token('identifier', 'myMethod'),
        new Token('lParen', '('),
        new Token('type', 'Int'),
        new Token('identifier', 'x'),
        new Token('comma', ','),
        new Token('type', 'Int'),
        new Token('identifier', 'y'),
        new Token('rParen', ')'),
        new Token('type', 'Int'),
        new Token('lCurlyBracket', '{'),
        new Token('keyword', 'return'),
        new Token('identifier', 'x'),
        new Token('op', '+'),
        new Token('identifier', 'y'),
        new Token('semicolon', ';'),
        new Token('rCurlyBracket', '}')
    ];
    expect(result).toStrictEqual(expected);
    
});
  

  it('Parsing if-else statement', () => {
    const data = "if (x < 10) { println(Small number); } else { println(Large number); }";
    const result = runLexer(data);
    
    const expected = [
        new Token('keyword', 'if'),
        new Token('lParen', '('),
        new Token('identifier', 'x'),
        new Token('lessThan', '<'),
        new Token('integerLiteral', '10'),
        new Token('rParen', ')'),
        new Token('lCurlyBracket', '{'),
        new Token('keyword', 'println'),
        new Token('lParen', '('),
        //new Token('stringLiteral', '"Small number"'),
        new Token('identifier', 'Small'),
        new Token('identifier', 'number'),
        new Token('rParen', ')'),
        new Token('semicolon', ';'),
        new Token('rCurlyBracket', '}'),
        new Token('keyword', 'else'),
        new Token('lCurlyBracket', '{'),
        new Token('keyword', 'println'),
        new Token('lParen', '('),
        //new Token('stringLiteral', '"Large number"'),
        new Token('identifier', 'Large'),
        new Token('identifier', 'number'),
        new Token('rParen', ')'),
        new Token('semicolon', ';'),
        new Token('rCurlyBracket', '}')
    ];
    expect(result).toStrictEqual(expected);
    
});

it('Parsing object instantiation', () => {
    const data = "new MyClass(10, Hello);";
    const result = runLexer(data);
    
    const expected = [
        new Token('keyword', 'new'),
        new Token('identifier', 'MyClass'),
        new Token('lParen', '('),
        new Token('integerLiteral', '10'),
        new Token('comma', ','),
        new Token('identifier', 'Hello'),
        new Token('rParen', ')'),
        new Token('semicolon', ';')
    ];
    expect(result).toStrictEqual(expected);
    console.log("Successs: Parsing object instantiation");
});

it('Parsing while loop', () => { 
    const data = "while (i > 0) { i = i - 1; }";
    const result = runLexer(data);
    
    const expected = [
        new Token('keyword', 'while'),
        new Token('lParen', '('),
        new Token('identifier', 'i'),
        new Token('symbol', '>'),
        new Token('integerLiteral', '0'),
        new Token('rParen', ')'),
        new Token('lCurlyBracket', '{'),
        new Token('identifier', 'i'),
        new Token('equals', '='),
        new Token('identifier', 'i'),
        new Token('op', '-'),
        new Token('integerLiteral', '1'),
        new Token('semicolon', ';'),
        new Token('rCurlyBracket', '}')
    ];
    expect(result).toStrictEqual(expected);
    console.log("Success: Parsing while loop");
});

it('Parsing empty string', () => {
    const data = "";
    const result = runLexer(data);

    const expected = [];
    expect(result).toStrictEqual(expected);
    console.log("Success: Parsing empty string");
});

it('Parsing Invalid data', () =>{
    const data = "**"; 

    try{
        const result = runLexer(data);
        console.log("Failure: Expected an error but got:", result);
    }catch(err){
        expect(err).toStrictEqual(new TokenizerError('Unacceptable Token: *'));
        console.log("Parsing unnacceptable data");
    }

});

it('Parsing Invalid method', () =>{
    const data = "method invalidMethod(**)";
    try{
        const result = runLexer(data);
        console.log("Failure: Expected an error but got:", result);
    }catch(err){
        expect(err).toStrictEqual(new TokenizerError('Unacceptable Token: *'));
        console.log("Parsing unnacceptable method");
    }

});

it('Parsing missing spaces between tokens', () =>{
    const data = "exampleClass{exampleMethod():Int{return20;}}";
    try{
        const result = runLexer(data);
        console.log("Failure: Expect an error got", result);
    }catch(err){
        expect(err).toStrictEqual(new TokenizerError('Missing spaces between tokens'));
        console.log("Parsing missing spaces");
    }
});

});