import { Program, Expression, NumberLiteral, BooleanLiteral, Identifier, Lambda, Call, Let, IfExpr, Pipe, Binary, Match, ClassDecl, MethodDecl, NewInstance, PropAccess, createEnv, Env, envDefine, envLookup, LambdaValue, isLambdaValue } from './ast';

export function evaluate(program: Program): any {
	// Put builtins in a parent environment so user code can shadow them with 'let'
	const builtinsEnv = createEnv();
	installBuiltins(builtinsEnv);
	const globalEnv = createEnv(builtinsEnv);
	let last: any;
	for (const expr of program.body) last = evalExpr(expr, globalEnv);
	return last;
}

function evalExpr(expr: Expression, env: Env): any {
	switch (expr.type) {
		case 'NumberLiteral': return (expr as NumberLiteral).value;
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
			
			// Handle lambda values
			if (calleeVal.params.length !== c.args.length) throw new Error('Arity mismatch');
			// Native fast-path
			if ((calleeVal as any).__native) {
				const evaluated = c.args.map(a => evalExpr(a, env));
				return (calleeVal as any).__native(...evaluated);
			}
			const callEnv = createEnv(calleeVal.closure);
			for (let i = 0; i < calleeVal.params.length; i++) envDefine(callEnv, calleeVal.params[i], evalExpr(c.args[i], env));
			return evalExpr(calleeVal.body, callEnv);
		}
		case 'Let': {
			const l = expr as Let;
			const val = evalExpr(l.value, env);
			envDefine(env, l.name, val);
			if (l.body) return evalExpr(l.body, env);
			return val;
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
				if (pat.type === 'Wildcard') ok = true;
				else if (pat.type === 'NumberLiteral') ok = pat.value === value;
				else if (pat.type === 'Identifier') { ok = true; caseEnv = createEnv(env); envDefine(caseEnv, pat.name, value); }
				if (ok) return evalExpr(c.value, caseEnv);
			}
			throw new Error('Non-exhaustive match');
		}
		case 'ClassDecl': {
			const cd = expr as ClassDecl;
			const classValue: any = { __tag: 'class', name: cd.name, methods: {}, __ops: {} };
			for (const m of cd.methods) {
				if (m.isOperator) {
					classValue.__ops[m.name] = (self: any, other: any) => {
						const closureEnv = createEnv(env);
						envDefine(closureEnv, 'self', self);
						if (m.params[0]) envDefine(closureEnv, m.params[0], other);
						return evalExpr(m.body, closureEnv);
					};
				} else {
					classValue.methods[m.name] = (self: any, ...args: any[]) => {
						const closureEnv = createEnv(env);
						envDefine(closureEnv, 'self', self);
						m.params.forEach((p,i)=> envDefine(closureEnv, p, args[i]));
						return evalExpr(m.body, closureEnv);
					};
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
	}
}

function installBuiltins(env: Env) {
	const make = (name: string, params: string[], impl: (...a: any[]) => any) => {
		const lv: LambdaValue = { __tag: 'lambda', params, body: { type: 'Identifier', name: '__native' } as any, closure: createEnv() };
		(lv as any).__native = impl;
		envDefine(env, name, lv);
	};
	// Arithmetic
	make('add', ['a', 'b'], (a, b) => a + b);
	make('sub', ['a', 'b'], (a, b) => a - b);
	make('mul', ['a', 'b'], (a, b) => a * b);
	make('div', ['a', 'b'], (a, b) => a / b);
	// Lists / higher-order
	make('range', ['n'], (n: number) => Array.from({ length: n }, (_, i) => i));
	make('map', ['arr', 'fn'], (arr: any[], fn: LambdaValue) => arr.map(v => invoke1(fn, v)));
	make('filter', ['arr', 'fn'], (arr: any[], fn: LambdaValue) => arr.filter(v => invoke1(fn, v)));
	make('reduce', ['arr', 'init', 'fn'], (arr: any[], init: any, fn: LambdaValue) => arr.reduce((acc, v) => invoke2(fn, acc, v), init));
	make('compose', ['f', 'g'], (f: LambdaValue, g: LambdaValue) => ({ __tag: 'lambda', params: ['x'], body: { type: 'Identifier', name: '__native' } as any, closure: createEnv(), __native: (x: any) => invoke1(f, invoke1(g, x)) }));
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
