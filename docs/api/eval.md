# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [eval](#eval)

## eval

**File**: `/home/runner/work/Omniscript/Omniscript/src/functional/eval.ts`

### Interfaces

#### TailCall

**Properties**:

- `__tag: 'tailcall'` - 
- `fn: LambdaValue` - 
- `args: any[]` - 

### Functions

#### isTailCall

**Signature**: `function isTailCall(value: any): value is TailCall`

#### isSelfRecursiveCall

**Signature**: `function isSelfRecursiveCall(call: Call, fn: LambdaValue, env: Env): boolean`

#### trampoline

**Signature**: `function trampoline(value: any): any`

#### evaluate

**Signature**: `export function evaluate(program: Program): any`

#### evalExpr

**Signature**: `function evalExpr(expr: Expression, env: Env): any`

#### installBuiltins

**Signature**: `function installBuiltins(env: Env)`

#### invoke1

**Signature**: `function invoke1(fn: LambdaValue, a: any)`

#### invoke2

**Signature**: `function invoke2(fn: LambdaValue, a: any, b: any)`

#### createCurriedFunction

**Signature**: `function createCurriedFunction(lambda: Lambda, appliedArgs: any[] = []): any`

#### createPartialFunction

**Signature**: `function createPartialFunction(fn: LambdaValue, partialArgs: (any | undefined)[]): any`

#### createLazyValue

**Signature**: `function createLazyValue(expr: Expression, env: Env): any`

#### createMemoizedFunction

**Signature**: `function createMemoizedFunction(lambda: Lambda): any`


