import Token from "./token";
import TokenizerError from "./tokenizeError";
import { get_char_data } from "./dictionary";



describe('Tokenizer Test', () => {
  it('Parsing variable declaration', () => {
      const result = tokenize("Int x;");
      const expected = [
          new Token('type', 'Int'),
          new Token('var', 'x'),
          new Token('semicolon', ';')
      ];
      expect(result).toStrictEqual(expected);
  });

  it('Parsing method definition', () => {
      const result = tokenize("method add(Int a, Int b) Int { return a + b; }");
      const expected = [
          new Token('keyword', 'method'),
          new Token('methodname', 'add'),
          new Token('lParen', '('),
          new Token('type', 'Int'),
          new Token('var', 'a'),
          new Token('comma', ','),
          new Token('type', 'Int'),
          new Token('var', 'b'),
          new Token('rParen', ')'),
          new Token('type', 'Int'),
          new Token('lBracket', '{'),
          new Token('keyword', 'return'),
          new Token('var', 'a'),
          new Token('op', '+'),
          new Token('var', 'b'),
          new Token('semicolon', ';'),
          new Token('rBracket', '}')
      ];
      expect(result).toStrictEqual(expected);
  });

  it('Parsing class definition', () => {
      const result = tokenize("class MathUtils { method square(Int x) Int { return x * x; } }");
      const expected = [
          new Token('keyword', 'class'),
          new Token('classname', 'MathUtils'),
          new Token('lBracket', '{'),
          new Token('keyword', 'method'),
          new Token('methodname', 'square'),
          new Token('lParen', '('),
          new Token('type', 'Int'),
          new Token('var', 'x'),
          new Token('rParen', ')'),
          new Token('type', 'Int'),
          new Token('lBracket', '{'),
          new Token('keyword', 'return'),
          new Token('var', 'x'),
          new Token('op', '*'),
          new Token('var', 'x'),
          new Token('semicolon', ';'),
          new Token('rBracket', '}'),
          new Token('rBracket', '}')
      ];
      expect(result).toStrictEqual(expected);
  });

  it('Parsing object instantiation', () => {
      const result = tokenize("new MathUtils()");
      const expected = [
          new Token('keyword', 'new'),
          new Token('classname', 'MathUtils'),
          new Token('lParen', '('),
          new Token('rParen', ')')
      ];
      expect(result).toStrictEqual(expected);
  });

  it('Parsing control statements', () => {
      const result = tokenize("if (x < 10) { x = x + 1; } else { println(x); }");
      const expected = [
          new Token('keyword', 'if'),
          new Token('lParen', '('),
          new Token('var', 'x'),
          new Token('op', '<'),
          new Token('number', '10'),
          new Token('rParen', ')'),
          new Token('lBracket', '{'),
          new Token('var', 'x'),
          new Token('equals', '='),
          new Token('var', 'x'),
          new Token('op', '+'),
          new Token('number', '1'),
          new Token('semicolon', ';'),
          new Token('rBracket', '}'),
          new Token('keyword', 'else'),
          new Token('lBracket', '{'),
          new Token('methodname', 'println'),
          new Token('lParen', '('),
          new Token('var', 'x'),
          new Token('rParen', ')'),
          new Token('semicolon', ';'),
          new Token('rBracket', '}')
      ];
      expect(result).toStrictEqual(expected);
  });

  it('Parsing while loop', () => {
      const result = tokenize("while (x > 0) { x = x - 1; }");
      const expected = [
          new Token('keyword', 'while'),
          new Token('lParen', '('),
          new Token('var', 'x'),
          new Token('op', '>'),
          new Token('number', '0'),
          new Token('rParen', ')'),
          new Token('lBracket', '{'),
          new Token('var', 'x'),
          new Token('equals', '='),
          new Token('var', 'x'),
          new Token('op', '-'),
          new Token('number', '1'),
          new Token('semicolon', ';'),
          new Token('rBracket', '}')
      ];
      expect(result).toStrictEqual(expected);
  });

  it('Parsing return statement', () => {
      const result = tokenize("return 42;");
      const expected = [
          new Token('keyword', 'return'),
          new Token('number', '42'),
          new Token('semicolon', ';')
      ];
      expect(result).toStrictEqual(expected);
  });
});
