export class CompilerError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class TypeError extends CompilerError {}
export class RedeclarationError extends TypeError {}
export class UndeclaredError extends TypeError {}
export class IncompatibleAssignmentError extends TypeError {}
export class ReturnTypeError extends TypeError {}
export class NotAFunctionError extends TypeError {}