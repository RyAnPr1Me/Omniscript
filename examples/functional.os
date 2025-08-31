// Functional subset example
// Demonstrates immutable var bindings, lambdas, higher-order functions and reduce.
// Expected final result: 20

var ten = add(4,6)
var nums = range(5)          // [0,1,2,3,4]
var doubled = map(nums, fn(n)=> add(n,n)) // [0,2,4,6,8]
reduce(doubled, 0, fn(acc,v)=> add(acc,v))
