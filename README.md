# SnatchBlock - a strictly typed TypeScript utility library.

This is my (WIP) personal collection of TypeScript helper functions and utilities that
I use across different projects.

Think an opionated version of lodash, but with first-class types.


- __`function`__
    - [ident](#ident)
    - [partial](#partial)
    - [forward](#forward)
    - [callAll](#callAll)
    - [bundle](#bundle)
    - [bundleSync](#bundleSync)
    - [nullishChain](#nullishChain)
    - [asyncNullishChain](#asyncNullishChain)
    - [throttle](#throttle)
    - [debounce](#debounce)
    - [memoize](#memoize)
- __`list`__
    - [atWrap](#atWrap)
    - [zip](#zip)
    - [zipWith](#zipWith)
    - [unzip](#unzip)
    - [unzipWith](#unzipWith)
    - [partition](#partition)
    - [range](#range)
    - [numberRange](#numberRange)
    - [alphaRange](#alphaRange)
- __`object`__
    - [pick](#pick)
    - [omit](#omit)
- __`equality`__
    - [oneOf](#oneOf)
    - [equal](#equal)
    - [clone](#clone)
- __`promise`__
    - [isPromise](#isPromise)
    - [isNotPromise](#isNotPromise)
- __`predicate`__
    - [truthy](#truthy)
    - [falsy](#falsy)
    - [nullish](#nullish)
    - [notNullish](#notNullish)
    - [isFulfilled](#isFulfilled)
    - [isRejected](#isRejected)
- __`string`__
    - [prefix](#prefix)
    - [suffix](#suffix)
    - [capitalize](#capitalize)
    - [uncapitalize](#uncapitalize)
    - [upper](#upper)
    - [lower](#lower)
    - [snake](#snake)
    - [camel](#camel)
    - [transformCase](#transformCase)
- __`math`__
    - [clamp](#clamp)
- __`data structures`__
    - [BiMap](#BiMap)
    - [SortedArray](#SortedArray)
    - [SortedMap](#SortedMap)
- __`path`__
    - [select](#select)



## Function

#### `ident` 
  
```hs
(value: T) => T
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/ident.ts#L2)_</sup></sup>

> Identity function.

---

#### `partial` 
  
```hs
(fun: T, ...argsLeft: PL) => (...argsRight: PR) => ReturnType<T>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/partial.ts#L17)_</sup></sup>

> Partially apply a function.

#### Example
```ts
const divide = (dividend: number, divisor: number) => dividend / divisor

// (divisor: number) => number
const oneOver = partial(divide, 1)

// prints: 0.25
console.log(oneOver(4))
```

---

#### `forward` 
  
```hs
(fun: T, ...argsRight: PR) => (...argsLeft: PL) => ReturnType<T>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/forward.ts#L28)_</sup></sup>

> Given a function and its nth..last arguments, return a function accepting
> arguments 0..n-1.

#### Examples
```ts
const divide = (dividend: number, divisor: number) => dividend / divisor

// (dividend: number) => number
const divideBy2 = partial(divide, 2)

// prints: 0.5
console.log(divideBy2(1))
```

```ts
const fetchUrl = async (protocol: string, domain: string, path: string) =>
  await fetch(`${protocol}://${domain}/${path}`)

const fetchRepo = forward(fetchUrl, 'github.com', 'MathisBullinger/snatchblock')

const viaHTTPS = await fetchRepo('https')
```

---

#### `callAll` 
  
```hs
(funs: F[], ...args: P) => ReturnTypes<F>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/callAll.ts#L16)_</sup></sup>

> Take a list of functions that accept the same parameters and call them all
> with the provided arguments.

#### Example
```ts
const mult = (a: number, b: number) => a * b
const div  = (a: number, b: number) => a / b

// prints: [8, 2]
console.log( callAll([mult, div], 4, 2) )
```

---

#### `bundle` 
  
```hs
(...funs: λ<T>[]) => (...args: T) => Promise<void>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/bundle.ts#L12)_</sup></sup>

> Given a list of functions that accept the same parameters, returns a function
> that takes these parameters and invokes all of the given functions.
> 
> The returned function returns a promise that resolves once all functions
> returned/resolved and rejects if any of the functions throws/rejects - but
> only after all returned promises have been settled.
> 

---

#### `bundleSync` 
  
```hs
(...funs: λ<T>[]) => (...args: T) => void
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/bundle.ts#L29)_</sup></sup>

> Same as [bundle](#bundle), but return synchronously.
> 
> If any of the functions throws an error synchronously, none of the functions
> after it will be invoked and the error will propagate.
> 

---

#### `nullishChain` 
  
```hs
(...funs: [] | [FF, ...FR[]]) => (...args: Parameters<FF>) => ReturnType<FF> | ReturnType<FR[number]>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/nullishChain.ts#L26)_</sup></sup>

> Given a list of functions that accept the same parameters, returns a function
> that given these arguments returns the result of the first function whose
> result is not nullish.
> 
> This is equivalent to chaining together invocations of the passed in
> functions with the given arguments with nullish coalescing _(`??`)_ operators.
> 

#### Example
```ts
const isAdult   = (age: number) => { if (n >= 18) return 'adult' }
const isToddler = (age: number) => { if (n <= 3) return 'toddler' }

const ageGroup = nullishChain(isAdult, isToddler, () => 'child')

// this is functionally equivalent to:
const ageGroup = age => isAdult(age) ?? isToddler(age) ?? 'child'

ageGroup(1)  // prints: 'toddler'
ageGroup(10) // prints: 'child'
ageGroup(50) // prints: 'adult'
```

---

#### `asyncNullishChain` 
  
```hs
(...funs: [] | [FF, ...FR[]]) => (...args: Parameters<FF>) => Promise<PromType<ReturnType<FF>> | PromType<ReturnType<FR[number]>>>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/nullishChain.ts#L46)_</sup></sup>

> Same as [nullishChain](#nullishChain) but accept asynchronous functions too.

#### Example
```ts
const readFromCache = (id: string): Resource => { if (id in cache) return cache[id] }
const readFromFile  = (id: string): Resource => { if (fileExists(id)) return readFile(id) }
const fetchFromNet  = async (id: string): Promise<Resource> => await fetch(`someURL/${id}`)

// async (id: string) => Promise<Resource>
const getResource = asyncNullishChain(readFromCache, readFromFile, fetchFromNet)
```

---

#### `throttle` 
  
```hs
(fun: T, ms: number, opts?: {leading: boolean, trailing: boolean}) => λ<Parameters<T>, void> & {[cancel]: () => void}
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/throttle.ts#L15)_</sup></sup>

> Created a throttled function that invokes `fun` at most every `ms` milliseconds.
> 
> `fun` is invoked with the last arguments passed to the throttled function.
> 
> Calling `[throttle.cancel]()` on the throttled function will cancel the currently
> scheduled invocation.
> 

---

#### `debounce` 
  
```hs
(fun: T, ms: number) => λ<Parameters<T>, void> & {[cancel]: () => void}
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/debounce.ts#L14)_</sup></sup>

> Creates a debounced function that delays invoking `fun` until `ms` milliseconds
> have passed since the last invocation of the debounced function.
> 
> `fun` is invoked with the last arguments passed to the debounced function.
> 
> Calling `[debounce.cancel]()` on the debounced function will cancel the currently
> scheduled invocation.
> 

---

#### `memoize` 
  
```hs
(fun: T, opt: {limit: number, key: (...args: Parameters<T>) => K}) => T & {cache: Map<K, ReturnType<T>>}
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/memoize.ts#L58)_</sup></sup>

> Returns a copy of `fun` that remembers its result for any given arguments and
> only invokes `fun` for unknown arguments.
> 
> The cache key is computed using the `key` function. The default `key`
> function simply stringifies the arguments.
> 
> If `limit` is specified, only the `limit`-last entries are kept in cache.
> 
> The function's cache is available at `memoized.cache`.
> 

#### Examples
```ts
const expensiveCalculation = (a: number, b: number) => {
  console.log(`calculate ${a} + ${b}`)
  return a + b
}
const calc = memoize(expensiveCalculation)

console.log(calc(1, 2))
// calculate 1 + 2
// 3
console.log(calc(20, 5))
// calculate 20 + 5
// 25
console.log(calc(20, 5))
// 25
console.log(calc(1, 2))
// 3
```

```ts
const logIfDifferent = memoize(
  (msg: string) => console.log(msg),
  {
    limit: 1,
    key: msg => msg
  }
)

logIfDifferent('a')
logIfDifferent('a')
logIfDifferent('b')
logIfDifferent('a')

// a
// b
// a
```
## List

#### `atWrap` 
  
```hs
(arr: T[], i: number) => T
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/atWrap.ts#L3)_</sup></sup>

> Access list at `i % length`. Negative indexes start indexing the last
> element as `[-1]` and wrap around to the back.

---

#### `zip` 
  
```hs
(...lists: T) => Zip<T>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/zip.ts#L16)_</sup></sup>

> Takes multiple lists and returns a list of tuples containing the value in
> each list at the current index. If the lists are of different lengths, the
> returned list of tuples has the length of the shortest passed in list.

#### Example
```ts
const pairs = zip([1,2,3], ['a','b','c'])
console.log(pairs) // prints: [[1,'a'], [2,'b'], [3,'c']]
```

---

#### `zipWith` 
  
```hs
(zipper: (...args: {[I in string | number | symbol]: U}) => U, ...lists: T) => U[]
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/zip.ts#L35)_</sup></sup>

> Same as [zip](#zip) but also takes a `zipper` function, that is called for
> each index with the element at current index in each list as arguments. The
> result of `zipper` is the element at current index in the list returned from
> `zipWith`.

#### Example
```ts
const sums = zipWith((a,b) => a+b, [1,2,3], [4,5,6])
console.log(sums) // prints: [5,7,9]
```

---

#### `unzip` 
  
```hs
(...zipped: T[][]) => Unzip<T>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/unzip.ts#L15)_</sup></sup>

> Reverse of [zip](#zip). Takes a list of tuples and deconstructs them into
> an array (of length of the tuples length) of lists each containing all the
> elements in all tuples at the lists index.

#### Example
```ts
const [nums, chars] = unzip([1,'a'], [2,'b'], [3,'c'])
console.log(nums)  // prints: [1, 2, 3]
console.log(chars) // prints: ['a','b','c']
```

---

#### `unzipWith` 
  
```hs
(zipped: T[][], ...unzippers: U) => {[I in string | number | symbol]: ReturnType<U[I]>}
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/unzip.ts#L39)_</sup></sup>

> Same as [unzip](#unzip) but accepts an `unzipper` function for each tuple
> index. The `unzipper`'s return value is used as the value in the list at
> that index returned from `unzipWith`.
> 
> The `unzipper` takes the current element as its first argument, an
> accumulator as second argument (initially `undefined`) and its return value
> is the accumulator passed into the next invocation.
> 

#### Example
```ts
const [nums, str] = unzip(
  [ [1,'a'], [2,'b'], [3,'c'] ],
  (n, acc: number[] = []) => [...acc, n],
  (c, str = '') => str + c
)

console.log(nums) // prints: [1, 2, 3]
console.log(str)  // prints: 'abc'
```

---

#### `partition` 
  
```hs
(list: T[], predicate: (el: T) => el is S) => [S[], Exclude<T, S>[]]
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/partition.ts#L30)_</sup></sup>

> Takes a `list` and returns a pair of lists containing: the elements that
> match the `predicate` and those that don't, respectively.
> 
> Think of it as `filter`, but the elements that don't pass the filter aren't
> discarded but returned in a separate list instead.
> 

#### Example
```ts
const [strings, numbers] = partition(
  ['a', 'b', 1, 'c', 2, 3],
  (el): el is string => typeof el === 'string'
)
// strings: ["a", "b", "c"]
// numbers: [1, 2, 3]
```

---

#### `range` 
  


<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/range.ts#L65)_</sup></sup>

> Creates a range between two values.
> 
> <sub>see [numberRange](#numberRange) and [alphaRange](#alphaRange)</sub>

---

#### `numberRange` 
  
```hs
(start: number, end: number, step: number) => number[]
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/range.ts#L17)_</sup></sup>

> Constructs a numeric between `start` and `end` inclusively.

#### Example
```ts
range(2, 6)      // -> [2, 3, 4, 5, 6]
range(8, 9, .3)  // -> [8, 8.3, 8.6, 8.9]
range(3, -2)     // -> [3, 2, 1, 0, -1, -2]
```

---

#### `alphaRange` 
  
```hs
(start: string, end: string) => string[]
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/range.ts#L42)_</sup></sup>

> Constructs a range between characters.

#### Example
```ts
range('a', 'd')  // -> ['a', 'b', 'c', 'd']
range('Z', 'W')  // -> ['Z', 'Y', 'X', 'W']
```
## Object

#### `pick` 
  
```hs
(obj: T, ...keys: K[]) => Pick<T, K>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/pick.ts#L9)_</sup></sup>

> From `obj`, create a new object that only includes `keys`.

#### Example
```ts
pick({ a: 1, b: 2, c: 3 }, 'a', 'c') // { a: 1, c: 3 }
```

---

#### `omit` 
  
```hs
(obj: T, ...keys: K[]) => Omit<T, K>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/omit.ts#L9)_</sup></sup>

> From `obj`, create a new object that does not include `keys`.

#### Example
```ts
omit({ a: 1, b: 2, c: 3 }, 'a', 'c') // { b: 2 }
```
## Equality

#### `oneOf` 
  
```hs
(value: T, ...cmps: TT) => value is TT[number]
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/oneOf.ts#L2)_</sup></sup>

> Checks if `v` is one of `cmps`.

---

#### `equal` 
  
```hs
(a: unknown, b: unknown) => boolean
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/equal.ts#L9)_</sup></sup>

> Checks if `a` and `b` are structurally equal using the following algorithm:
> 
> - primitives are compared by value
> - functions are compared by reference
> - objects (including arrays) are checked to have the same properties and
>   their values are compared recursively using the same algorithm
> 

---

#### `clone` 
  
```hs
(value: T) => T
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/clone.ts#L15)_</sup></sup>

> Returns a copied version of `value`.
> 
> If `value` is primitive, returns `value`.
> Otherwise, properties of `value` are copied recursively. Only `value`'s own
> enumerable properties are cloned. Arrays are cloned by mapping over their
> elements.
> 
> If a path in `value` references itself or a parent path, then in the
> resulting object that path will also reference the path it referenced in the
> original object (but now in the resuling object instead of the original).
> 
## Promise

#### `isPromise` 
  
```hs
(value: unknown) => value is Promise<T>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/isPromise.ts#L2)_</sup></sup>

> Checks if `value` looks like a promise.

---

#### `isNotPromise` 
  
```hs
(value: T) => value is Exclude<T, Promise<any>>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/isPromise.ts#L19)_</sup></sup>

> Checks if `value` is not a promise.

#### Example
```ts
(value: number | Promise<unknown>) => {
  if (isNotPromise(value)) return value / 2
}
```
## Predicate

#### `truthy` 
  
```hs
(value: T) => value is PickTruthy<T>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/truthy.ts#L2)_</sup></sup>

> Checks if `value` is truthy. Literal types are narrowed accordingly.

---

#### `falsy` 
  
```hs
(value: T) => value is PickFalsy<T>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/truthy.ts#L5)_</sup></sup>

> Checks if `value` is falsy. Literal types are narrowed accordingly.

---

#### `nullish` 
  
```hs
(value: T) => value is Nullish<T>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/nullish.ts#L2)_</sup></sup>

> Checks if `value` is nullish. Literal types are narrowed accordingly.

---

#### `notNullish` 
  
```hs
(value: null | T) => value is T
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/nullish.ts#L21)_</sup></sup>

> Checks if `value` is not nullish. Literal types are narrowed accordingly.

#### Example
```ts
const nums = (...values: (number | undefined)[]): number[] => values.filter(notNullish)
```

---

#### `isFulfilled` 
  
```hs
(result: PromiseSettledResult<T>) => result is PromiseFulfilledResult<T>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/settled.ts#L2)_</sup></sup>

> Checks if `result` (returned from `Promise.allSettled`) is fulfilled.

---

#### `isRejected` 
  
```hs
(result: PromiseSettledResult<unknown>) => result is PromiseRejectedResult
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/settled.ts#L7)_</sup></sup>

> Checks if `result` (returned from `Promise.allSettled`) is rejected.
## String

#### `prefix` 
  
```hs
(prefix: T0, str: T1, caseMod?: C) => `${string}`
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/prefix.ts#L12)_</sup></sup>

> Returns `str` prefixed with `prefix`. Optionally, allows prefxing in camel
> case, i.e. `prefix('foo', 'bar', 'camel') => 'fooBar'`, or snake case, i.e.
> `prefix('foo', 'bar', 'snake') => 'foo_bar'`.
> 
> The result is strictly typed, so `prefix('foo', 'bar')` will return the type
> `'foobar'`, not just a generic `string`.
> 

---

#### `suffix` 
  
```hs
(str: T1, suffix: T0, caseMod?: C) => `${string}`
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/suffix.ts#L8)_</sup></sup>

> Returns `str` suffixed with `suffix`. Same case and type behavior as
> [prefix](#prefix).

---

#### `capitalize` 
  
```hs
(str: T) => Capitalize
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/case.ts#L4)_</sup></sup>

> Upper-case first letter of string.

---

#### `uncapitalize` 
  
```hs
(str: T) => Uncapitalize
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/case.ts#L8)_</sup></sup>

> Lower-case first letter of string

---

#### `upper` 
  
```hs
(str: T) => Uppercase
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/case.ts#L12)_</sup></sup>

> Strictly typed `String.toUpperCase()`.

---

#### `lower` 
  
```hs
(str: T) => Lowercase
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/case.ts#L16)_</sup></sup>

> Strictly typed `String.toLowerCase()`.

---

#### `snake` 
  
```hs
(str: T) => SnakeCase<T>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/case.ts#L32)_</sup></sup>

> Transforms a variable name to snake case.
> 
> Note: The rules for transforming anything to snake case are somewhat vague.
> So use this only for very simple names where the resulting value is
> absolutely unambiguous. For more examples of how names are transformed, have
> a look at the test cases.
> 

#### Example
```ts
snake('fooBar') // 'foo_bar'
```

---

#### `camel` 
  
```hs
(str: T) => CamelCase<T>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/case.ts#L55)_</sup></sup>

> Transforms a variable name to camel case.
> 
> Note: The rules for transforming anything to camel case are somewhat vague.
> So use this only for very simple names where the resulting value is
> absolutely unambiguous. For more examples of how names are transformed, have
> a look at the test cases.
> 

#### Example
```ts
camel('foo_bar') // 'fooBar'
```

---

#### `transformCase` 
  
```hs
(str: T, targetCase: C) => SnakeCase<T>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/case.ts#L66)_</sup></sup>

> Transform a variable name to `targetCase`
> 
> <sub>see [snake](#snake) and [camel](#camel)</sub>
## Math

#### `clamp` 
  
```hs
(min: number, num: number, max: number) => number
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/clamp.ts#L2)_</sup></sup>

> Clamp `num` between `min` and `max` inclusively.
## Data Structures

#### `BiMap` 
  
```hs
class BiMap<L, R>(data?: Map<L, R> | [L, R][], aliasLeft?: AL, aliasRight?: AR)
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/bimap.ts#L263)_</sup></sup>

> Bidirectional map. Maps two sets of keys in a one-to-one relation.
> 
> Both sides are accessible (at .left & .right, or at their respective alias if
> one was provided in the constructor) with an interface similar to that of the
> built-in Map and the same iteration behavior.
> 

#### Examples
```ts
const nums = BiMap.from({ one: 1, two: 2 })

// different ways of iterating over the entries
[...nums.left]                 // [['one',1], ['two',2]]
[...nums.right]                // [[1,'one'], [2,'two']]
[...nums.left.keys()]          // ['one', 'two']
[...nums.left.values()]        // [1, 2]
[...nums.right.keys()]         // [1, 2]
[...nums.right.values()]       // ['one', 'two']
[...nums]                      // [['one',1], ['two',2]]
[...nums.right.entries()]      // [[1,'one'], [2,'two']]
Object.fromEntries(nums.right) // { '1': 'one', '2': 'two' }

// setting a value
nums.left.three = 3
// when accessing a property using bracket notation (i.e. nums.right[4]),
// JavaScript coerces the key to a string, so keys that aren't strings or
// symbols must be accessed using the same access methods known from Map.
nums.right.set(4, 'four')

// remapping values
nums.left.tres = 3          // {one: 1, two: 2, tres: 3, four: 4}
nums.right.set(4, 'cuatro') // {one: 1, two: 2, tres: 3, cuatro: 4}

// deleting
delete nums.left.tres    // {one: 1, two: 2, cuatro: 4}
nums.right.delete(4)     // {one: 1, two: 2}

// reversing the map
const num2Name = nums.reverse()
console.log([...num2Name.left])                 // [[1,'one'], [2,'two']]
console.log(Object.fromEntries(num2Name.right)) // {one: 1, two: 2}

// other methods known from built-in Map
nums.size               // 2
nums.[left|right].size  // 2
nums.clear() // equivalent to nums.[left|right].clear()
console.log(nums.size)  // 0
```

```ts
// giving aliases to both sides
const dictionary = new BiMap(
  [
    ['hello', 'hallo'],
    ['bye', 'tschüss'],
  ],
  'en',
  'de'
)

dictionary.de.get('hallo') // 'hello'
dictionary.en.get('bye')   // 'tschüss'

delete dictionary.de.hallo
console.log(Object.fromEntries(dictionary.en)) // { bye: 'tschüss' }

// you can also use the BiMap.alias method:
BiMap.alias('en', 'de')<string, string>()
BiMap.alias('en', 'de')([['hello', 'hallo']])
BiMap.alias('en', 'de')(new Map<string, string>())
BiMap.alias('en', 'de')({ hello: 'hallo' })
BiMap.alias('en', 'de')(new Set(['hello']), new Set(['hallo']))

// the same arguments can be used with BiMap.from, e.g.:
BiMap.from(new Set<number>(), new Set<number>())
```

---

#### `SortedArray` 
  
```hs
class SortedArray<T>(compare: Cmp<T>, ...value: T[])
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/sortedArray.ts#L131)_</sup></sup>

> Sorted array. Behaves much like a regular array but its elements remain
> sorted using the `compare` function supplied in the constructor.
> 
> Contains most of the methods defined on regular JavaScript arrays as long as
> they don't modify the array's content in place.
> 
> New elements are added using the `add(...values)` method.
> 
> Elements can still be accessed using bracket notation as in plain JavaScript
> arrays but can't be assigned to using bracket notation (as that could change
> the element's sort position).
> 
> Elements can be removed using the `delete(...indices)` method, which returns
> an array containing the deleted values.
> Deleting an element using `delete sorted[index]` will also work, but results
> in a TypeScript error because element access is marked readonly.
> 
> Array methods that pass a reference of the array to a callback (e.g. `map`,
> `reduce`, `find`) will pass a reference to the SortedArray instance instead.
> 
> The `filter` and `slice` methods will return SortedArray instances instead of
> plain arrays.
> 

---

#### `SortedMap` 
  
```hs
class SortedMap<K, V>(compare: Cmp<K, V>, entries?: null | [K, V][])
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/sortedMap.ts#L11)_</sup></sup>

> Behaves like a regular JavaScript `Map`, but its iteration order is dependant
> on the `compare` function supplied in the constructor.
> 
> Note: The item's sort position is only computed automatically on insertion.
> If you update one of the values that the `compare` function depends on, you
> must call the `update(key)` method afterwards to ensure the map stays sorted.
> 
## Path

#### `select` 
  
```hs
(obj: T, ...path: P) => PickPath<T, P>
```

<sup><sup>_[source](https://github.com/MathisBullinger/snatchblock/blob/main/src/select.ts#L7)_</sup></sup>

> Returns the value in `obj` at `path`. If the given path does not exist,
> the symbol `none` is returned.