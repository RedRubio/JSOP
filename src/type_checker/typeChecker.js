import {
  CompilerError,
  TypeError,
  RedeclarationError,
  UndeclaredError,
  IncompatibleAssignmentError,
  ReturnTypeError,
  NotAFunctionError
} from "./typeCheckerError.js";

class TypeChecker {
  constructor() {
    // Initialize built-in types
    this.builtInTypes = new Set(["Int", "Boolean", "Void", "Object", "String"]);
    
    // Map of class names to their definitions
    this.classes = new Map();
    
    // Current context for symbol resolution
    this.currentClass = null;
    this.currentMethod = null;
    
    // Symbol tables
    this.globalVariables = new Map();
    this.localVariables = new Map();
    
    // Method call context for type checking return statements
    this.expectedReturnType = null;
    
    // Track if we're inside a loop (for break statements)
    this.inLoop = false;
  }

  // Main entry point for type checking
  checkProgram(program) {
    this.collectClasses(program.classes);
    
    this.checkClassHierarchy();

    this.checkClassMembers();

    this.checkStatements(program.statements);
    
    return true; // If we get here without exceptions, program is well-typed
  }

  // First pass: collect class definitions
  collectClasses(classes) {
    // Add built-in Object class (base class for all classes)
    this.classes.set("Object", {
      name: "Object",
      parent: null,
      variables: new Map(),
      constructor: { parameters: [] },
      methods: new Map()
    });
    
    // Add built-in String class
    this.classes.set("String", {
      name: "String",
      parent: "Object",
      variables: new Map(),
      constructor: { parameters: [] },
      methods: new Map()
    });
    
    // Collect all user-defined classes
    for (const classDef of classes) {
      if (this.classes.has(classDef.name)) {
        throw new RedeclarationError(`Class '${classDef.name}' is already defined`);
      }
      
      // Add class to the map with minimal information
      this.classes.set(classDef.name, {
        name: classDef.name,
        parent: classDef.parent || "Object", // Default parent is Object
        variables: new Map(),
        constructor: null,
        methods: new Map()
      });
    }
    
    // Now populate methods and variables for each class
    for (const classDef of classes) {
      const classInfo = this.classes.get(classDef.name);
      
      // Add variables
      for (const variable of classDef.variables) {
        if (!this.isValidType(variable.varType)) {
          throw new TypeError(`Unknown type '${variable.varType}' for variable '${variable.name}' in class '${classDef.name}'`);
        }
        
        if (classInfo.variables.has(variable.name)) {
          throw new RedeclarationError(`Variable '${variable.name}' is already defined in class '${classDef.name}'`);
        }
        
        classInfo.variables.set(variable.name, variable.varType);
      }
      
      // Add constructor
      if (classDef.constructor) {
        classInfo.constructor = {
          parameters: this.processParameters(classDef.constructor.parameters),
          superCall: classDef.constructor.superCall,
          statements: classDef.constructor.statements
        };
      } else {
        // Create default constructor
        classInfo.constructor = { parameters: [] };
      }
      
      // Add methods
      for (const method of classDef.methods) {
        if (!this.isValidType(method.returnType)) {
          throw new TypeError(`Unknown return type '${method.returnType}' for method '${method.name}' in class '${classDef.name}'`);
        }
        
        if (classInfo.methods.has(method.name)) {
          throw new RedeclarationError(`Method '${method.name}' is already defined in class '${classDef.name}'`);
        }
        
        classInfo.methods.set(method.name, {
          name: method.name,
          parameters: this.processParameters(method.parameters),
          returnType: method.returnType,
          statements: method.statements
        });
      }
    }
  }
  
  // Process parameters and check their types
  processParameters(parameters) {
    const result = [];
    const paramNames = new Set();
    
    for (const param of parameters) {
      if (!this.isValidType(param.varType)) {
        throw new TypeError(`Unknown parameter type '${param.varType}' for parameter '${param.name}'`);
      }
      
      if (paramNames.has(param.name)) {
        throw new RedeclarationError(`Parameter '${param.name}' is declared more than once`);
      }
      
      paramNames.add(param.name);
      result.push({
        name: param.name,
        type: param.varType
      });
    }
    
    return result;
  }
  
  // Check if a class hierarchy contains cycles
  checkClassHierarchy() {
    for (const [className, classInfo] of this.classes.entries()) {
      // Check if parent class exists
      if (classInfo.parent && !this.classes.has(classInfo.parent)) {
        throw new TypeError(`Class '${className}' extends unknown class '${classInfo.parent}'`);
      }
      
      // Check for inheritance cycles
      const visited = new Set();
      let current = className;
      
      while (current) {
        if (visited.has(current)) {
          throw new TypeError(`Circular inheritance detected involving class '${className}'`);
        }
        
        visited.add(current);
        const currentClass = this.classes.get(current);
        current = currentClass.parent;
      }
    }
  }
  
  // Check class members and methods
  checkClassMembers() {
    for (const [className, classInfo] of this.classes.entries()) {
      // Skip built-in classes
      if (className === "Object" || className === "String") {
        continue;
      }
      
      this.currentClass = classInfo;
      this.localVariables.clear();
      
      // Check constructor
      if (classInfo.constructor) {
        this.checkConstructor(classInfo, classInfo.constructor);
      }
      
      // Check methods
      for (const [methodName, methodInfo] of classInfo.methods.entries()) {
        this.checkMethod(classInfo, methodInfo);
      }
    }
    
    this.currentClass = null;
  }
  
  // Check a constructor for type correctness
  checkConstructor(classInfo, constructor) {
    this.localVariables.clear();
    
    // Add parameters to local variables
    for (const param of constructor.parameters) {
      this.localVariables.set(param.name, param.type);
    }
    
    // Check super call if present
    if (constructor.superCall) {
      this.checkSuperCall(classInfo, constructor.superCall);
    } else if (classInfo.parent !== "Object") {
      // If no super call and parent is not Object, that's an error
      const parentClass = this.classes.get(classInfo.parent);
      if (parentClass.constructor && parentClass.constructor.parameters.length > 0) {
        throw new TypeError(`Constructor in class '${classInfo.name}' must call super() with appropriate arguments`);
      }
    }
    
    // Check constructor statements
    for (const stmt of constructor.statements) {
      this.checkStatement(stmt);
    }
  }
  
  // Check a super call
  checkSuperCall(classInfo, superCall) {
    const parentClass = this.classes.get(classInfo.parent);
    if (!parentClass) {
      throw new TypeError(`Class '${classInfo.parent}' not found for super call`);
    }
    
    const parentConstructor = parentClass.constructor;
    
    // Check argument count
    if (superCall.arguments.length !== parentConstructor.parameters.length) {
      throw new TypeError(`Super call in '${classInfo.name}' has ${superCall.arguments.length} arguments, but parent constructor requires ${parentConstructor.parameters.length}`);
    }
    
    // Check argument types
    for (let i = 0; i < superCall.arguments.length; i++) {
      const argType = this.getExpressionType(superCall.arguments[i]);
      const paramType = parentConstructor.parameters[i].type;
      
      if (!this.isAssignable(argType, paramType)) {
        throw new TypeError(`Type mismatch in super call: argument ${i+1} is of type '${argType}', but parameter requires '${paramType}'`);
      }
    }
  }
  
  // Check a method for type correctness
  checkMethod(classInfo, methodInfo) {
    this.currentMethod = methodInfo;
    this.expectedReturnType = methodInfo.returnType;
    this.localVariables.clear();
    
    // Add parameters to local variables
    for (const param of methodInfo.parameters) {
      this.localVariables.set(param.name, param.type);
    }
    
    // Check method statements
    for (const stmt of methodInfo.statements) {
      this.checkStatement(stmt);
    }
    
    // If method is not void, ensure there's a return statement
    if (methodInfo.returnType !== "Void" && !this.hasReturnStatement(methodInfo.statements)) {
      throw new ReturnTypeError(`Method '${methodInfo.name}' has return type '${methodInfo.returnType}' but might not return a value`);
    }
    
    this.currentMethod = null;
    this.expectedReturnType = null;
  }
  
  // Check if a block of statements contains a return statement
  hasReturnStatement(statements) {
    for (const stmt of statements) {
      if (stmt.type === "ReturnStmt") {
        return true;
      }
      
      if (stmt.type === "BlockStmt" && this.hasReturnStatement(stmt.statements)) {
        return true;
      }
      
      if (stmt.type === "IfStmt") {
        // Both branches must have return statements
        if (this.hasReturnStatement([stmt.thenBranch]) && 
            stmt.elseBranch && this.hasReturnStatement([stmt.elseBranch])) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  // Check the main program statements
  checkStatements(statements) {
    this.currentClass = null;
    this.currentMethod = null;
    this.localVariables.clear();
    
    for (const stmt of statements) {
      this.checkStatement(stmt);
    }
  }
  
  // Check a single statement
  checkStatement(stmt) {
    switch (stmt.type) {
      case "BlockStmt":
        // Create a new scope for the block
        const savedVariables = new Map(this.localVariables);
        
        // Check all statements in the block
        for (const s of stmt.statements) {
          this.checkStatement(s);
        }
        
        // Restore previous scope (removing block-local variables)
        this.localVariables = savedVariables;
        break;
        
      case "ExprStmt":
        // Just check the expression
        this.getExpressionType(stmt.expression);
        break;
        
      case "VarDecStmt":
        this.checkVarDeclaration(stmt.declaration);
        break;
        
      case "AssignStmt":
        this.checkAssignment(stmt.variable, stmt.expression);
        break;
        
      case "WhileStmt":
        // Condition must be boolean
        const condType = this.getExpressionType(stmt.condition);
        if (condType !== "Boolean") {
          throw new TypeError(`While condition must be Boolean, but got '${condType}'`);
        }
        
        // Check body in loop context
        const wasInLoop = this.inLoop;
        this.inLoop = true;
        this.checkStatement(stmt.body);
        this.inLoop = wasInLoop;
        break;
        
      case "BreakStmt":
        if (!this.inLoop) {
          throw new TypeError("Break statement can only be used inside a loop");
        }
        break;
        
      case "ReturnStmt":
        this.checkReturnStatement(stmt);
        break;
        
      case "IfStmt":
        // Condition must be boolean
        const ifCondType = this.getExpressionType(stmt.condition);
        if (ifCondType !== "Boolean") {
          throw new TypeError(`If condition must be Boolean, but got '${ifCondType}'`);
        }
        
        // Check both branches
        this.checkStatement(stmt.thenBranch);
        if (stmt.elseBranch) {
          this.checkStatement(stmt.elseBranch);
        }
        break;
        
      default:
        throw new Error(`Unknown statement type: ${stmt.type}`);
    }
  }
  
  // Check a variable declaration
  checkVarDeclaration(varDec) {
    // Check if type is valid
    if (!this.isValidType(varDec.varType)) {
      throw new TypeError(`Unknown type '${varDec.varType}'`);
    }
    
    // Check for redeclaration
    if (this.localVariables.has(varDec.name) || 
        (this.currentClass && this.currentClass.variables.has(varDec.name)) ||
        this.globalVariables.has(varDec.name)) {
      throw new RedeclarationError(`Variable '${varDec.name}' is already defined`);
    }
    
    // Add to appropriate symbol table
    if (this.currentClass && this.currentMethod) {
      this.localVariables.set(varDec.name, varDec.varType);
    } else {
      this.globalVariables.set(varDec.name, varDec.varType);
    }
  }
  
  // Check an assignment statement
  checkAssignment(varName, expr) {
    // Get the variable type
    let varType = null;
    
    // Check local variables first
    if (this.localVariables.has(varName)) {
      varType = this.localVariables.get(varName);
    }
    // Then instance variables if in a class
    else if (this.currentClass && this.currentClass.variables.has(varName)) {
      varType = this.currentClass.variables.get(varName);
    }
    // Finally global variables
    else if (this.globalVariables.has(varName)) {
      varType = this.globalVariables.get(varName);
    }
    else {
      throw new UndeclaredError(`Variable '${varName}' is not defined`);
    }
    
    // Check expression type
    const exprType = this.getExpressionType(expr);
    
    // Check if assignment is type-compatible
    if (!this.isAssignable(exprType, varType)) {
      throw new IncompatibleAssignmentError(`Cannot assign value of type '${exprType}' to variable of type '${varType}'`);
    }
  }
  
  // Check a return statement
  checkReturnStatement(stmt) {
    // If not in a method, we can't return
    if (!this.expectedReturnType) {
      throw new ReturnTypeError("Return statement outside of method");
    }
    
    // If void return type, shouldn't have an expression
    if (this.expectedReturnType === "Void") {
      if (stmt.expression) {
        throw new ReturnTypeError("Void methods cannot return a value");
      }
      return;
    }
    
    // Non-void return type must have an expression
    if (!stmt.expression) {
      throw new ReturnTypeError(`Method with return type '${this.expectedReturnType}' must return a value`);
    }
    
    // Check if the expression type is compatible with return type
    const exprType = this.getExpressionType(stmt.expression);
    if (!this.isAssignable(exprType, this.expectedReturnType)) {
      throw new ReturnTypeError(`Cannot return value of type '${exprType}' from method with return type '${this.expectedReturnType}'`);
    }
  }
  
  // Get the type of an expression
  getExpressionType(expr) {
    switch (expr.type) {
      case "BinaryExpr":
        return this.getBinaryExprType(expr);
        
      case "CallExpr":
        return this.getCallExprType(expr);
        
      case "NewExpr":
        return this.getNewExprType(expr);
        
      case "PrintlnExpr":
        // Check the argument type (can be anything)
        this.getExpressionType(expr.argument);
        return "Void"; // println returns Void
        
      case "VariableExpr":
        return this.getVariableType(expr.name);
        
      case "ThisExpr":
        if (!this.currentClass) {
          throw new TypeError("'this' can only be used inside a class");
        }
        return this.currentClass.name;
        
      case "LiteralExpr":
        return expr.valueType; // "string", "int", or "boolean"
        
      default:
        throw new Error(`Unknown expression type: ${expr.type}`);
    }
  }
  
  // Get the type of a binary expression
  getBinaryExprType(expr) {
    const leftType = this.getExpressionType(expr.left);
    const rightType = this.getExpressionType(expr.right);
    
    const operator = expr.operator;
    
    // Different rules based on operator
    switch (operator) {
      case "+":
        // String concatenation
        if (leftType === "String" || rightType === "String") {
          return "String";
        }
        // Numeric addition
        if (leftType === "Int" && rightType === "Int") {
          return "Int";
        }
        throw new TypeError(`Cannot use '+' operator with types '${leftType}' and '${rightType}'`);
        
      case "-":
      case "*":
      case "/":
        // These are only for Int types
        if (leftType === "Int" && rightType === "Int") {
          return "Int";
        }
        throw new TypeError(`Cannot use '${operator}' operator with types '${leftType}' and '${rightType}'`);
        
      // Add more operators like ==, !=, <, etc. if needed
        
      default:
        throw new TypeError(`Unsupported binary operator: ${operator}`);
    }
  }
  
  // Get the type of a method call expression
  getCallExprType(expr) {
    // Get the object's type
    const objectType = this.getExpressionType(expr.object);
    
    // Find the class for this type
    if (!this.classes.has(objectType)) {
      throw new TypeError(`Cannot call method on type '${objectType}'`);
    }
    
    const classInfo = this.classes.get(objectType);
    
    // Find the method
    if (!this.methodExists(classInfo, expr.method)) {
      throw new NotAFunctionError(`Method '${expr.method}' not found in class '${objectType}'`);
    }
    
    const methodInfo = this.getMethodInfo(classInfo, expr.method);
    
    // Check argument count
    if (expr.args.length !== methodInfo.parameters.length) {
      throw new TypeError(`Method '${expr.method}' called with ${expr.args.length} arguments but requires ${methodInfo.parameters.length}`);
    }
    
    // Check argument types
    for (let i = 0; i < expr.args.length; i++) {
      const argType = this.getExpressionType(expr.args[i]);
      const paramType = methodInfo.parameters[i].type;
      
      if (!this.isAssignable(argType, paramType)) {
        throw new TypeError(`Type mismatch in call to '${expr.method}': argument ${i+1} is of type '${argType}', but parameter requires '${paramType}'`);
      }
    }
    
    // Return the method's return type
    return methodInfo.returnType;
  }
  
  // Get the type of a new expression
  getNewExprType(expr) {
    const className = expr.className;
    
    // Check if the class exists
    if (!this.classes.has(className)) {
      throw new TypeError(`Class '${className}' not found`);
    }
    
    const classInfo = this.classes.get(className);
    
    // Check constructor arguments
    const constructor = classInfo.constructor;
    
    // Check argument count
    if (expr.args.length !== constructor.parameters.length) {
      throw new TypeError(`Constructor for class '${className}' called with ${expr.args.length} arguments but requires ${constructor.parameters.length}`);
    }
    
    // Check argument types
    for (let i = 0; i < expr.args.length; i++) {
      const argType = this.getExpressionType(expr.args[i]);
      const paramType = constructor.parameters[i].type;
      
      if (!this.isAssignable(argType, paramType)) {
        throw new TypeError(`Type mismatch in constructor call: argument ${i+1} is of type '${argType}', but parameter requires '${paramType}'`);
      }
    }
    
    // Return the class name as the type
    return className;
  }
  
  // Get the type of a variable
  getVariableType(name) {
    // Check local variables first
    if (this.localVariables.has(name)) {
      return this.localVariables.get(name);
    }
    // Then instance variables if in a class
    else if (this.currentClass && this.currentClass.variables.has(name)) {
      return this.currentClass.variables.get(name);
    }
    // Finally global variables
    else if (this.globalVariables.has(name)) {
      return this.globalVariables.get(name);
    }
    
    throw new UndeclaredError(`Variable '${name}' is not defined`);
  }
  
  // Check if a method exists in a class or its ancestors
  methodExists(classInfo, methodName) {
    // Check the class itself
    if (classInfo.methods.has(methodName)) {
      return true;
    }
    
    // Check parent classes
    if (classInfo.parent) {
      const parentClass = this.classes.get(classInfo.parent);
      return this.methodExists(parentClass, methodName);
    }
    
    return false;
  }
  
  // Get method info from a class or its ancestors
  getMethodInfo(classInfo, methodName) {
    // Check the class itself
    if (classInfo.methods.has(methodName)) {
      return classInfo.methods.get(methodName);
    }
    
    // Check parent classes
    if (classInfo.parent) {
      const parentClass = this.classes.get(classInfo.parent);
      return this.getMethodInfo(parentClass, methodName);
    }
    
    throw new NotAFunctionError(`Method '${methodName}' not found`);
  }
  
  // Check if a type is valid
  isValidType(type) {
    return this.builtInTypes.has(type) || this.classes.has(type);
  }
  
  // Check if source type can be assigned to target type
  isAssignable(sourceType, targetType) {
    // Identical types are always assignable
    if (sourceType === targetType) {
      return true;
    }
    
    // Check for subtype relationship (class inheritance)
    if (this.isSubtypeOf(sourceType, targetType)) {
      return true;
    }
    
    return false;
  }
  
  // Check if source type is a subtype of target type
  isSubtypeOf(sourceType, targetType) {
    // If either is not a class, can't be a subtype
    if (!this.classes.has(sourceType) || !this.classes.has(targetType)) {
      return false;
    }
    
    // Check class hierarchy
    let current = sourceType;
    while (current) {
      if (current === targetType) {
        return true;
      }
      
      const currentClass = this.classes.get(current);
      current = currentClass.parent;
    }
    
    return false;
  }
}

// Export the main function for running the type checker
export const runTypeChecker = (ast) => {
  const typeChecker = new TypeChecker();
  return typeChecker.checkProgram(ast);
};

export default TypeChecker;
