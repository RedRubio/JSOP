// The general idea is that the dispatchGenerate receives the kind of node and node.
// It finds the matching case and performs the corrresponding actions sometimes just returning a string sometimes it recursively calls itself for child nodes in the tree.
// so it builds the js code kind of like if its traversing a tree in a dfs so that the correct structure and nesting is maintained.
//
// I named it dispatch becasue originally it was going to find the case and then "dispatch" to dedicated functions for each case.
// But as i started working on it most of the cases ended up being one or two lines so i didn't make functions for them.
// and then as I continued working I just decided to keep eveything together.
// I apologize in advance for the result of these poor decisions. -Eric
export class CodegenDispatch {
	dispatchGenerate(kind, node) {
		switch (kind) {
			case 'expr':
				switch (node.type) {
					case 'VariableExpr':
						return node.name;

					case 'LiteralExpr':
						return JSON.stringify(node.value);

					case 'NewExpr':
						const argList = this.generateArgList(node.args);
						return 'new ' + node.className + '(' + argList + ')';

					case 'CallExpr':
						const callArgs = this.generateArgList(node.args);
						return this.dispatchGenerate('expr', node.object) + '.' + node.method + '(' + callArgs + ')';

					case 'PrintlnExpr':
						const argPL = this.dispatchGenerate('expr', node.argument);
						return 'console.log(' + argPL + ')';

					case 'BinaryExpr':
						const bLeft = this.dispatchGenerate('expr', node.left);
						const bRight = this.dispatchGenerate('expr', node.right);
						return bLeft + ' ' + node.operator + ' ' + bRight;

					case 'ThisExpr':
						return 'this';
				}

			case 'stmt':
				switch (node.type) {
					case 'ExprStmt':
						return this.dispatchGenerate('expr', node.expression) + ';';

					case 'ReturnStmt':
						return 'return ' + this.dispatchGenerate('expr', node.expression) + ';';

					case 'VarDecStmt':
						return 'let ' + node.declaration.name + '; // ' + node.declaration.varType;

					case 'AssignStmt':
						return node.variable + ' = ' + this.dispatchGenerate('expr', node.expression) + ';';

					case 'IfStmt': {
						const cond = this.dispatchGenerate('expr', node.condition);
						const thenPart = this.dispatchGenerate('stmt', node.thenBranch);
						if (node.elseBranch) {
							const elsePart = this.dispatchGenerate('stmt', node.elseBranch);
							return 'if (' + cond + ') ' + thenPart + ' else ' + elsePart;
						}
						return 'if (' + cond + ') ' + thenPart;
					}

					case 'WhileStmt': {
						const whileCond = this.dispatchGenerate('expr', node.condition);
						const whileBody = this.dispatchGenerate('stmt', node.body);
						return 'while (' + whileCond + ') ' + whileBody;
					}

					case 'BreakStmt':
						return 'break;';

					case 'BlockStmt': {
						const blockLines = [];
						for (const stmt of node.statements) {
							blockLines.push(this.dispatchGenerate('stmt', stmt));
						}
						return '{\n' + blockLines.join('\n') + '\n}';
					}
				}
			
			//In the interest of full discolusre I wanted to mention that I ended up having to use Chatgpt to implement the section below, I hope you'll hear me out before you judge me too harshly.
			//I already knew what I wanted to do here, build the js code lines checking to see what format the class should take then calling the dispatch recursively to build the lines.
			//I even had a semi-working version I made myself but then I remembered there was certain restrictions on the output.
			//I checked the proposal and that's when I saw that it required us to set it up for prototype based inheritance instead of using extends and super.
			//I had trouble figuring it out, and in hindsight I should have asked my team but I panicked and ended up making a bad call. -Eric
			case 'class':
				switch (node.type) {
					case 'ClassDef': {
						let JSlines = [];

						// Constructor function
						// ex function Dog(name) {
						let paramList = [];
						for (let i = 0; i < node.constructor.parameters.length; i++) {
							paramList.push(node.constructor.parameters[i].name);
						}
						JSlines.push('function ' + node.name + '(' + paramList.join(', ') + ') {');

						// Super call
						//ex Animal.call(this, name);
						// or Animal.call(this);
						if (node.constructor.superCall) {
							let superArgs = [];
							for (let i = 0; i < node.constructor.superCall.arguments.length; i++) {
								let argExpr = this.dispatchGenerate('expr', node.constructor.superCall.arguments[i]);
								superArgs.push(argExpr);
							}
							if (superArgs.length > 0) {
								JSlines.push('\t' + node.parent + '.call(this, ' + superArgs.join(', ') + ');');
							} 
							else {
								JSlines.push('\t' + node.parent + '.call(this);');
							}
						}	

						// Constructor body statements
						for (let i = 0; i < node.constructor.statements.length; i++) {
							let stmtCode = this.dispatchGenerate('stmt', node.constructor.statements[i]);
							JSlines.push('\t' + stmtCode);
						}

						JSlines.push('}');

					// Inheritance setup
					if (node.parent) {
						JSlines.push(node.name + '.prototype = Object.create(' + node.parent + '.prototype);');
						JSlines.push(node.name + '.prototype.constructor = ' + node.name + ';');
					}

					// Method definitions
					for (let i = 0; i < node.methods.length; i++) {
						let method = node.methods[i];

						let methodParams = [];
						for (let j = 0; j < method.parameters.length; j++) {
							methodParams.push(method.parameters[j].name);
						}

						let bodyLines = [];
						for (let j = 0; j < method.statements.length; j++) {
							let stmt = this.dispatchGenerate('stmt', method.statements[j]);
							bodyLines.push('\t' + stmt);
						}

						JSlines.push(node.name + '.prototype.' +method.name +' = function(' +methodParams.join(', ') +') {\n' +bodyLines.join('\n') +'\n};');
					}

						return JSlines.join('\n');
					}

				default: throw new Error('No generator for class node type ' + node.type);
				}

				default: throw new Error(`Unknown kind`);
		}
	}

	generateArgList(args) {
		let argStrings = [];
		for (let i = 0; i < args.length; i++) {
			argStrings.push(this.dispatchGenerate('expr', args[i]));
		}
		return argStrings.join(', ');
	}
}