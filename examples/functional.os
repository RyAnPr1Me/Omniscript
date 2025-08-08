// Functional subset example
// Demonstrates immutable let bindings, lambdas, higher-order functions and reduce.
// Expected final result: 20

let ten = add(4,6)
let nums = range(5)          // [0,1,2,3,4]
let doubled = map(nums, fn(n)=> add(n,n)) // [0,2,4,6,8]
reduce(doubled, 0, fn(acc,v)=> add(acc,v))
