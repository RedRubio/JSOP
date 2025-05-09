import { CodegenDispatch } from './codegenDispatch.js';

export class CodeGenerator extends CodegenDispatch {
	constructor(ast) {
		super();
		this.classDefs = ast.classes;
		this.stmts = ast.statements;
		this.code = '';
	}

	generate() {
		this.code = '';

		for (const classDef of this.classDefs) {
      //console.log(classDef)
      this.code += this.dispatchGenerate('class', classDef) + '\n';
      }

    for (const stmt of this.stmts) {
      //console.log(stmt)
			this.code += this.dispatchGenerate('stmt', stmt) + '\n';
		}
		return this.code;
	}
}

export function runCodegen(ast) {
	const codeToGen = new CodeGenerator(ast);
	return codeToGen.generate();
}
