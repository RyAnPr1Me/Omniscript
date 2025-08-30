import {
  Program,
  Expression,
  NumberLiteral,
  StringLiteral,
  BooleanLiteral,
  Identifier,
  Lambda,
  Call,
  Let,
  Const,
  IfExpr,
  Pipe,
  Binary,
  Unary,
  Match,
  ClassDecl,
  MethodDecl,
  NewInstance,
  PropAccess,
  AwaitExpr,
  ImportDecl,
  CurriedFunction,
  PartialApplication,
  LazyExpr,
  MemoizedFunction,
  MaybeType,
  EitherType,
  createEnv,
  Env,
  envDefine,
  envLookup,
  LambdaValue,
  isLambdaValue
} from './ast';

// Tail call optimization support
interface TailCall {
	__tag: 'tailcall';
	fn: LambdaValue;
	args: any[];
}

function isTailCall(value: any): value is TailCall {
	return value && value.__tag === 'tailcall';
}

function isSelfRecursiveCall(call: Call, fn: LambdaValue, env: Env): boolean {
	// Simple heuristic: if the call is to an identifier that matches a function name in scope
	if (call.callee.type === 'Identifier') {
		try {
			const nameInScope = envLookup(env, (call.callee as any).name);
			return nameInScope === fn;
		} catch {
			return false;
		}
	}
	return false;
}

function trampoline(value: any): any {
	while (isTailCall(value)) {
		const callEnv = createEnv(value.fn.closure);
		for (let i = 0; i < value.fn.params.length; i++) {
			envDefine(callEnv, value.fn.params[i], value.args[i]);
		}
		value = evalExpr(value.fn.body, callEnv);
	}
	return value;
}

export function evaluate(program: Program): any {
	// Put builtins in a parent environment so user code can shadow them with 'let'
	const builtinsEnv = createEnv();
	installBuiltins(builtinsEnv);
	const globalEnv = createEnv(builtinsEnv);
	let last: any;
	for (const expr of program.body) {
		last = evalExpr(expr, globalEnv);
		last = trampoline(last); // Apply tail call optimization
	}
	return last;
}

function evalExpr(expr: Expression, env: Env): any {
	switch (expr.type) {
		case 'NumberLiteral': return (expr as NumberLiteral).value;
		case 'StringLiteral': return (expr as StringLiteral).value;
		case 'BooleanLiteral': return (expr as BooleanLiteral).value;
		case 'Identifier': return envLookup(env, (expr as Identifier).name);
		case 'Prop': {
			const p = expr as PropAccess;
			const obj = evalExpr(p.object, env);
			if (obj == null) throw new Error('Property access on null/undefined');
			return obj[p.name];
		}
			case 'Lambda': {
			const l = expr as Lambda;
			const value: LambdaValue = { __tag: 'lambda', params: l.params, body: l.body, closure: env };
			return value;
		}
			case 'Binary': {
				const b = expr as Binary;
				const left = evalExpr(b.left, env);
				const right = evalExpr(b.right, env);
				// Operator overloading dispatch
				if (left && left.__class && left.__class.__ops && left.__class.__ops[b.op]) {
					return left.__class.__ops[b.op](left, right);
				}
				if (right && right.__class && right.__class.__ops && right.__class.__ops[b.op]) {
					// Allow right-dispatch if left not provided
					return right.__class.__ops[b.op](right, left);
				}
				switch (b.op) {
					case '+': return left + right;
					case '-': return left - right;
					case '*': return left * right;
					case '/': return left / right;
					case '%': return left % right;
					case '>': return left > right;
					case '<': return left < right;
					case '>=': return left >= right;
					case '<=': return left <= right;
					case '==': return left == right;
					case '!=': return left != right;
					case '===': return left === right;
					case '!==': return left !== right;
				}
			}
			break;
		case 'Unary': {
			const u = expr as Unary;
			const operand = evalExpr(u.operand, env);
			switch (u.operator) {
				case 'typeof': 
					// Handle lambda objects from functional parser as 'function'
					if (operand && typeof operand === 'object' && (operand as any).__tag === 'lambda') {
						return 'function';
					}
					return typeof operand;
				case '-': return -(operand as any);
				case '!': return !operand;
				case '++': 
				case '--': 
					throw new Error(`Unary operator ${u.operator} not implemented`);
				default: throw new Error(`Unknown unary operator ${u.operator}`);
			}
		}
		case 'Call': {
			const c = expr as Call;
			const calleeVal = evalExpr(c.callee, env);
			// Allow both lambda values and regular JavaScript functions
			if (!isLambdaValue(calleeVal) && typeof calleeVal !== 'function') {
				throw new Error('Attempted call on non-function');
			}
			
			// Handle regular JavaScript functions
			if (typeof calleeVal === 'function' && !isLambdaValue(calleeVal)) {
				const evaluated = c.args.map(a => evalExpr(a, env));
				return calleeVal(...evaluated);
			}
			
			// Handle lambda values with tail call optimization
			if (calleeVal.params.length !== c.args.length) throw new Error('Arity mismatch');
			// Native fast-path
			if ((calleeVal as any).__native) {
				const evaluated = c.args.map(a => evalExpr(a, env));
				return (calleeVal as any).__native(...evaluated);
			}
			
			// Check if this is a tail call (last expression in function body)
			const evaluatedArgs = c.args.map(a => evalExpr(a, env));
			
			// For now, always use tail call optimization if the function is recursive
			if (isSelfRecursiveCall(c, calleeVal, env)) {
				return { __tag: 'tailcall', fn: calleeVal, args: evaluatedArgs } as TailCall;
			}
			
			const callEnv = createEnv(calleeVal.closure);
			for (let i = 0; i < calleeVal.params.length; i++) envDefine(callEnv, calleeVal.params[i], evaluatedArgs[i]);
			return evalExpr(calleeVal.body, callEnv);
		}
		case 'Let': {
			const l = expr as Let;
			const val = evalExpr(l.value, env);
			envDefine(env, l.name, val);
			if (l.body) return evalExpr(l.body, env);
			return val;
		}
		case 'Const': {
			const c = expr as Const;
			const val = evalExpr(c.value, env);
			envDefine(env, c.name, val);
			if (c.body) return evalExpr(c.body, env);
			return val;
		}
		case 'CurriedFunction': {
			const cf = expr as CurriedFunction;
			const lambda = cf.fn;
			return createCurriedFunction(lambda, cf.appliedArgs);
		}
		case 'Partial': {
			const pa = expr as PartialApplication;
			const fn = evalExpr(pa.fn, env);
			if (!isLambdaValue(fn)) throw new Error('Partial application on non-function');
			return createPartialFunction(fn, pa.args.map(arg => arg ? evalExpr(arg, env) : undefined));
		}
		case 'Lazy': {
			const lazy = expr as LazyExpr;
			return createLazyValue(lazy.expr, env);
		}
		case 'Memo': {
			const memo = expr as MemoizedFunction;
			return createMemoizedFunction(memo.fn);
		}
		case 'Maybe': {
			const maybe = expr as MaybeType;
			return {
				__tag: 'maybe',
				value: maybe.value ? evalExpr(maybe.value, env) : null,
				map: function(f: any) { return this.value === null ? this : { __tag: 'maybe', value: f(this.value), map: this.map, flatMap: this.flatMap }; },
				flatMap: function(f: any) { return this.value === null ? this : f(this.value); }
			};
		}
		case 'Either': {
			const either = expr as EitherType;
			const value = evalExpr(either.value, env);
			return {
				__tag: 'either',
				isLeft: either.isLeft,
				value: value,
				map: function(f: any) { return this.isLeft ? this : { __tag: 'either', isLeft: false, value: f(this.value), map: this.map, flatMap: this.flatMap }; },
				flatMap: function(f: any) { return this.isLeft ? this : f(this.value); }
			};
		}
		case 'If': {
			const i = expr as IfExpr;
			const cond = evalExpr(i.cond, env);
			return cond ? evalExpr(i.then, env) : evalExpr(i.else, env);
		}
		case 'Pipe': {
			const p = expr as Pipe;
			const left = evalExpr(p.left, env);
			// Evaluate pipeline RHS; treat identifier or lambda or call expression
			if (p.right.type === 'Identifier') {
				const fn = evalExpr(p.right, env);
				if (!isLambdaValue(fn)) throw new Error('Pipeline target not a function');
				if ((fn as any).__native) {
					if (fn.params.length !== 1) throw new Error('Pipeline target arity must be 1');
					return (fn as any).__native(left);
				}
				if (fn.params.length !== 1) throw new Error('Pipeline target arity must be 1');
				const callEnv = createEnv(fn.closure); envDefine(callEnv, fn.params[0], left);
				return evalExpr(fn.body, callEnv);
			}
			if (p.right.type === 'Call') {
				const call = p.right as Call;
				const callee = evalExpr(call.callee, env);
				if (!isLambdaValue(callee)) throw new Error('Pipeline target not a function');
				const expected = callee.params.length;
				if (expected !== call.args.length + 1) throw new Error('Pipeline arity mismatch');
				if ((callee as any).__native) {
					const evaluated = [left, ...call.args.map(a => evalExpr(a, env))];
						return (callee as any).__native(...evaluated);
				}
				const callEnv = createEnv(callee.closure);
				envDefine(callEnv, callee.params[0], left);
				for (let i = 0; i < call.args.length; i++) envDefine(callEnv, callee.params[i + 1], evalExpr(call.args[i], env));
				return evalExpr(callee.body, callEnv);
			}
			// Allow lambdas directly on RHS: a |> fn(x)=> ...
			if (p.right.type === 'Lambda') {
				const fn = evalExpr(p.right, env) as LambdaValue;
				if (fn.params.length !== 1) throw new Error('Pipeline lambda arity must be 1');
				const callEnv = createEnv(fn.closure); envDefine(callEnv, fn.params[0], left);
				return evalExpr(fn.body, callEnv);
			}
			throw new Error('Invalid pipeline rhs');
		}
		case 'Match': {
			const m = expr as Match;
			const value = evalExpr(m.expr, env);
			for (const c of m.cases) {
				let ok = false;
				const pat: any = c.pattern;
				let caseEnv = env;
				if (pat.type === 'Wildcard') {
					ok = true;
				} else if (pat.type === 'NumberLiteral') {
					ok = pat.value === value;
				} else if (pat.type === 'StringLiteral') {
					ok = pat.value === value;
				} else if (pat.type === 'Identifier') {
					ok = true;
					caseEnv = createEnv(env);
					envDefine(caseEnv, pat.name, value);
				}
				
				// Check guard condition if present
				if (ok && c.guard) {
					const guardResult = evalExpr(c.guard, caseEnv);
					ok = !!guardResult; // Convert to boolean
				}
				
				if (ok) return evalExpr(c.value, caseEnv);
			}
			throw new Error('Non-exhaustive match');
		}
		case 'ClassDecl': {
			const cd = expr as ClassDecl;
			const classValue: any = { __tag: 'class', name: cd.name, methods: {}, __ops: {}, __decorators: cd.decorators };
			
			// Apply class-level decorators
			if (cd.decorators.includes('component')) {
				classValue.__component = true;
			}
			for (const m of cd.methods) {
				if (m.isOperator) {
					classValue.__ops[m.name] = (self: any, other: any) => {
						const closureEnv = createEnv(env);
						envDefine(closureEnv, 'self', self);
						if (m.params[0]) envDefine(closureEnv, m.params[0], other);
						return evalExpr(m.body, closureEnv);
					};
				} else {
					const methodFunc = (self: any, ...args: any[]) => {
						const closureEnv = createEnv(env);
						envDefine(closureEnv, 'self', self);
						m.params.forEach((p,i)=> envDefine(closureEnv, p, args[i]));
						return evalExpr(m.body, closureEnv);
					};
					
					// Apply method decorators
					if (m.decorators.includes('state')) {
						// State decorator - makes property reactive
						(methodFunc as any).__state = true;
					}
					if (m.decorators.includes('effect')) {
						// Effect decorator - runs automatically
						(methodFunc as any).__effect = true;
					}
					if (m.decorators.includes('computed')) {
						// Computed decorator - caches result
						(methodFunc as any).__computed = true;
					}
					
					classValue.methods[m.name] = methodFunc;
				}
			}
			envDefine(env, cd.name, classValue);
			return classValue;
		}
		case 'New': {
			const ni = expr as NewInstance;
			const cls: any = envLookup(env, ni.className);
			const instance: any = { __class: cls };
			// Simple constructor: first arg becomes 'value'
			if (ni.args && ni.args.length>0) instance.value = evalExpr(ni.args[0], env);
			// Bind methods as lambdas capturing self
			Object.keys(cls.methods).forEach(k => {
				const methodDef = cls.methods[k];
				if (typeof methodDef === 'function') {
				  // Wrap method to pass instance as first argument (self)
				  instance[k] = (...args: any[]) => methodDef(instance, ...args);
				} else if (methodDef && methodDef.__tag === 'lambda') {
				  // already a LambdaValue; bind self by wrapping
				  const lv: LambdaValue = { __tag: 'lambda', params: methodDef.params, body: methodDef.body, closure: createEnv(env) };
				  (lv as any).__boundSelf = instance;
				  instance[k] = lv;
				} else {
				  // assume methodDef is AST-like { params, body }
				  const lv: LambdaValue = { __tag: 'lambda', params: methodDef.params || [], body: methodDef.body, closure: createEnv(env) };
				  (lv as any).__boundSelf = instance;
				  instance[k] = lv;
				}
             });
			return instance;
		}
		case 'Await': {
			const a = expr as AwaitExpr;
			const value = evalExpr(a.expr, env);
			// For now, just return the value directly (no real async support yet)
			return value;
		}
		case 'ObjectLiteral': {
			const obj = expr as any; // ObjectLiteral type
			const result: any = {};
			for (const [key, valueExpr] of Object.entries(obj.properties)) {
				result[key] = evalExpr(valueExpr as Expression, env);
			}
			return result;
		}
		case 'ArrayLiteral': {
			const arr = expr as any; // ArrayLiteral type
			return arr.elements.map((element: Expression) => evalExpr(element, env));
		}
		case 'Import': {
			const i = expr as ImportDecl;
			// Handle imports from 'stdlib'
			if (i.from === 'stdlib') {
				// Import the requested items into the current environment
				const stdlib = {
					HTTP: envLookup(env, 'HTTP'),
					Database: envLookup(env, 'Database')
				};
				
				for (const importName of i.imports) {
					if (stdlib[importName as keyof typeof stdlib]) {
						envDefine(env, importName, stdlib[importName as keyof typeof stdlib]);
					}
				}
			}
			return undefined; // Imports don't return values
		}
	}
}

function installBuiltins(env: Env) {
	const make = (name: string, params: string[], impl: (...a: any[]) => any) => {
		const lv: LambdaValue = { __tag: 'lambda', params, body: { type: 'Identifier', name: '__native' } as any, closure: createEnv() };
		(lv as any).__native = impl;
		envDefine(env, name, lv);
	};
	
	// Database support - create a global 'db' object with mock data
	const mockDatabase = {
		users: {
			findAll: () => Promise.resolve([
				{ id: 1, name: 'John Doe', email: 'john@example.com', active: true },
				{ id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false }
			]),
			where: (predicate: any) => ({
				orderBy: (field: any) => ({
					take: (count: number) => Promise.resolve([
						{ id: 1, name: 'John Doe', posts: [1, 2] }
					])
				})
			})
		}
	};
	envDefine(env, 'db', mockDatabase);
	
	// HTTP support - mock HTTP server for functional testing
	const mockHTTPServer = {
		get: (path: string, handler: any) => {
			// Mock implementation
			console.log(`Mock HTTP: GET ${path} registered`);
		},
		post: (path: string, handler: any) => {
			console.log(`Mock HTTP: POST ${path} registered`);
		},
		listen: (port: number) => {
			console.log(`Mock HTTP: Server listening on port ${port}`);
		}
	};
	
	// Global HTTP namespace for README examples
	const HTTP = {
		Server: function() {
			return mockHTTPServer;
		}
	};
	envDefine(env, 'HTTP', HTTP);
	
	// Also add a Database class for the ORM examples
	const Database = {
		query: () => ({
			orderBy: (field: string, direction: string) => ({
				take: (count: number) => Promise.resolve([])
			})
		}),
		save: (entity: any) => Promise.resolve(entity)
	};
	envDefine(env, 'Database', Database);
	
	// Arithmetic
	make('add', ['a', 'b'], (a, b) => a + b);
	make('sub', ['a', 'b'], (a, b) => a - b);
	make('mul', ['a', 'b'], (a, b) => a * b);
	make('div', ['a', 'b'], (a, b) => a / b);
	
	// Functional programming utilities
	make('curry', ['fn'], (fn: LambdaValue) => createCurriedFunction(fn as any));
	make('partial', ['fn', 'args'], (fn: LambdaValue, args: any[]) => createPartialFunction(fn, args));
	make('memoize', ['fn'], (fn: LambdaValue) => createMemoizedFunction(fn as any));
	make('identity', ['x'], (x: any) => x);
	make('constant', ['x'], (x: any) => ({ __tag: 'lambda', params: ['_'], body: { type: 'Identifier', name: '__native' } as any, closure: createEnv(), __native: () => x }));
	make('flip', ['fn'], (fn: LambdaValue) => ({ __tag: 'lambda', params: ['a', 'b'], body: { type: 'Identifier', name: '__native' } as any, closure: createEnv(), __native: (a: any, b: any) => invoke2(fn, b, a) }));
	
	// Monadic utilities
	make('just', ['x'], (x: any) => ({ __tag: 'maybe', value: x, map: function(f: any) { return this.value === null ? this : { __tag: 'maybe', value: f(this.value), map: this.map, flatMap: this.flatMap }; }, flatMap: function(f: any) { return this.value === null ? this : f(this.value); } }));
	make('nothing', [], () => ({ __tag: 'maybe', value: null, map: function(f: any) { return this; }, flatMap: function(f: any) { return this; } }));
	make('left', ['x'], (x: any) => ({ __tag: 'either', isLeft: true, value: x, map: function(f: any) { return this; }, flatMap: function(f: any) { return this; } }));
	make('right', ['x'], (x: any) => ({ __tag: 'either', isLeft: false, value: x, map: function(f: any) { return this.isLeft ? this : { __tag: 'either', isLeft: false, value: f(this.value), map: this.map, flatMap: this.flatMap }; }, flatMap: function(f: any) { return this.isLeft ? this : f(this.value); } }));
	
	// List operations
	make('head', ['arr'], (arr: any[]) => arr.length > 0 ? arr[0] : null);
	make('tail', ['arr'], (arr: any[]) => arr.slice(1));
	make('cons', ['x', 'arr'], (x: any, arr: any[]) => [x, ...arr]);
	make('reverse', ['arr'], (arr: any[]) => [...arr].reverse());
	make('sort', ['arr'], (arr: any[]) => [...arr].sort());
	make('sortBy', ['fn', 'arr'], (fn: LambdaValue, arr: any[]) => [...arr].sort((a, b) => invoke1(fn, a) - invoke1(fn, b)));
	// For pipeline use, we need curried versions of take/drop, but also provide the normal ones
	make('take', ['n', 'arr'], (n: number, arr: any[]) => arr.slice(0, n));
	make('drop', ['n', 'arr'], (n: number, arr: any[]) => arr.slice(n));
	make('takeC', ['n'], (n: number) => ({ __tag: 'lambda', params: ['arr'], body: { type: 'Identifier', name: '__native' } as any, closure: createEnv(), __native: (arr: any[]) => arr.slice(0, n) }));
	make('dropC', ['n'], (n: number) => ({ __tag: 'lambda', params: ['arr'], body: { type: 'Identifier', name: '__native' } as any, closure: createEnv(), __native: (arr: any[]) => arr.slice(n) }));
	make('zip', ['arr1', 'arr2'], (arr1: any[], arr2: any[]) => arr1.map((x, i) => [x, arr2[i]]).filter(([_, y]) => y !== undefined));
	
	// Lists / higher-order
	make('range', ['n'], (n: number) => Array.from({ length: n }, (_, i) => i));
	make('map', ['arr', 'fn'], (arr: any[], fn: LambdaValue) => arr.map(v => invoke1(fn, v)));
	make('filter', ['arr', 'fn'], (arr: any[], fn: LambdaValue) => arr.filter(v => invoke1(fn, v)));
	make('reduce', ['arr', 'init', 'fn'], (arr: any[], init: any, fn: LambdaValue) => arr.reduce((acc, v) => invoke2(fn, acc, v), init));
	make('compose', ['f', 'g'], (f: LambdaValue, g: LambdaValue) => ({ __tag: 'lambda', params: ['x'], body: { type: 'Identifier', name: '__native' } as any, closure: createEnv(), __native: (x: any) => invoke1(f, invoke1(g, x)) }));
	make('pipe', ['g', 'f'], (g: LambdaValue, f: LambdaValue) => ({ __tag: 'lambda', params: ['x'], body: { type: 'Identifier', name: '__native' } as any, closure: createEnv(), __native: (x: any) => invoke1(f, invoke1(g, x)) }));
}

function invoke1(fn: LambdaValue, a: any) {
	if ((fn as any).__native) return (fn as any).__native(a);
	if ((fn as any).__boundSelf) {
      const boundSelf = (fn as any).__boundSelf;
      const env = createEnv(fn.closure);
      envDefine(env, 'self', boundSelf);
      if (fn.params.length !== 1) throw new Error('Arity mismatch');
      envDefine(env, fn.params[0], a);
      return evalExpr(fn.body, env);
    }
	if (fn.params.length !== 1) throw new Error('Arity mismatch');
	const env = createEnv(fn.closure); envDefine(env, fn.params[0], a); return evalExpr(fn.body, env);
}
function invoke2(fn: LambdaValue, a: any, b: any) {
	if ((fn as any).__native) return (fn as any).__native(a, b);
	if ((fn as any).__boundSelf) {
      const boundSelf = (fn as any).__boundSelf;
      const env = createEnv(fn.closure);
      envDefine(env, 'self', boundSelf);
      if (fn.params.length !== 2) throw new Error('Arity mismatch');
      envDefine(env, fn.params[0], a); envDefine(env, fn.params[1], b); return evalExpr(fn.body, env);
    }
	if (fn.params.length !== 2) throw new Error('Arity mismatch');
	const env = createEnv(fn.closure); envDefine(env, fn.params[0], a); envDefine(env, fn.params[1], b); return evalExpr(fn.body, env);
}

// Functional programming helper functions
function createCurriedFunction(lambda: Lambda, appliedArgs: any[] = []): any {
	return {
		__tag: 'lambda',
		params: lambda.params.slice(appliedArgs.length),
		body: lambda.body,
		closure: lambda.closure || createEnv(),
		__curried: true,
		__appliedArgs: appliedArgs,
		__originalLambda: lambda,
		__native: function(...args: any[]) {
			const allArgs = [...appliedArgs, ...args];
			if (allArgs.length >= lambda.params.length) {
				// All arguments provided, execute function
				const env = createEnv(lambda.closure || createEnv());
				for (let i = 0; i < lambda.params.length; i++) {
					envDefine(env, lambda.params[i], allArgs[i]);
				}
				return evalExpr(lambda.body, env);
			} else {
				// Return partially applied function
				return createCurriedFunction(lambda, allArgs);
			}
		}
	};
}

function createPartialFunction(fn: LambdaValue, partialArgs: (any | undefined)[]): any {
	return {
		__tag: 'lambda',
		params: ['...args'],
		body: fn.body,
		closure: fn.closure,
		__partial: true,
		__native: function(...args: any[]) {
			const fullArgs = [];
			let argIndex = 0;
			for (const partialArg of partialArgs) {
				if (partialArg === undefined) {
					fullArgs.push(args[argIndex++]);
				} else {
					fullArgs.push(partialArg);
				}
			}
			// Add any remaining args
			while (argIndex < args.length) {
				fullArgs.push(args[argIndex++]);
			}
			
			if (fn.__native) {
				return fn.__native(...fullArgs);
			} else {
				const env = createEnv(fn.closure);
				for (let i = 0; i < Math.min(fn.params.length, fullArgs.length); i++) {
					envDefine(env, fn.params[i], fullArgs[i]);
				}
				return evalExpr(fn.body, env);
			}
		}
	};
}

function createLazyValue(expr: Expression, env: Env): any {
	let evaluated = false;
	let value: any;
	
	return {
		__tag: 'lazy',
		force: function() {
			if (!evaluated) {
				value = evalExpr(expr, env);
				evaluated = true;
			}
			return value;
		},
		map: function(f: any) {
			return createLazyValue({
				type: 'Call',
				callee: { type: 'Identifier', name: 'f' },
				args: [{ type: 'Call', callee: { type: 'Identifier', name: 'force' }, args: [] }]
			} as any, createEnv(env));
		}
	};
}

function createMemoizedFunction(lambda: Lambda): any {
	const cache = new Map();
	
	return {
		__tag: 'lambda',
		params: lambda.params,
		body: lambda.body,
		closure: lambda.closure,
		__memoized: true,
		__native: function(...args: any[]) {
			const key = JSON.stringify(args);
			if (cache.has(key)) {
				return cache.get(key);
			}
			
			const env = createEnv(lambda.closure || createEnv());
			for (let i = 0; i < lambda.params.length; i++) {
				envDefine(env, lambda.params[i], args[i]);
			}
			const result = evalExpr(lambda.body, env);
			cache.set(key, result);
			return result;
		}
	};
}
