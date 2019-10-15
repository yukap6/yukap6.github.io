# `var` `let` 和 `const` 是否存在变量提升？

> 为了目标明确起见，本文只讨论 `var` `let` 以及 `const` 是否存在变量提升，其他概念暂不过多展开

什么是变量提升？

变量提升是指在早期 JavaScript 规范中，允许变量在未真正 ”声明“ 之前也可以调用，且不会报错的执行机制。

> *变量提升（Hoisting）* 被认为是， Javascript中执行上下文 （特别是创建和执行阶段）工作方式的一种认识。它是一个行业术语而非技术规格。在 ECMAScript 的早期规格文档中并没有出现过 *变量提升（Hoisting）* 这个词。

当定义一个变量的时候，一般会有以下3个过程

1. 创建（create）；
2. 初始化（initialize）；
3. 赋值（assign）。

> 2019-06-25 修改
> 变量定义的三个过程可以从 [ECMA 的官方文档](https://www.ecma-international.org)进行查阅，
> [`var` 规格说明](https://www.ecma-international.org/ecma-262/5.1/#sec-12.2)
> [`let` 和 `const` 规格说明](https://www.ecma-international.org/ecma-262/6.0/#sec-declarations-and-the-variable-statement)

接下来分别研究 `var` `let` 以及 `const` 定义变量的过程是否存在 **提升**。

先上结论（下图）

![](http://www.iseb.cc/wp-content/uploads/2019/06/var-let-and-const.png)


有疑惑？且看代码推理。

## var

```
console.log(a); // undefined
var a = 1;
```

这里代码未定义就可以引用且不报错，说明 `var` 定义的变量存在*变量提升*，具体提升过程如下

* 执行代码之前，统一创建 `var` 声明的变量；
* 对创建的变量进行初始化，初始化的值为 `undefined`。

上面的代码其实是在代码执行之前，变量 `a` 定义的前2步就已经完成了，因此变量 `a` 未定义却可以引用，而在代码执行时，变量 `a` 还未执行赋值的过程，输出初始化的值 `undefined`。

*变量提升*有很多副作用，就不一一列举了，为了解决这个问题，ES6 才推出了另外两种定义变量的方式，`let` 和 `const`。

## let

```
let x = 'global'
{
  console.log(x) // Uncaught ReferenceError: x is not defined
  let x = 1
}
```

这里的输出可能会令人迷惑，原因在于 ES6 的新规则，块级作用域及暂时性死区。

如上大括号 `{}` 中的代码形成了块级作用域，所以在块级作用域里可以定义和外层作用域名称相同的变量且不会覆盖外层变量。 JavaScript 引擎在执行的时候，发现了块级作用域，会首先将该作用域中的变量创建 *”提升“* 到作用域顶部，但是并未初始化。所以上面的代码会报错 `x` 未定义。

这种现象，在 ES6 里称为**暂时性死区**，主要的目的就是为了防止变量未定义之前就引用。

所以，`let` 存在变量提升吗？严格来讲，变量的创建是被提前了，但因为 ES6 规定变量在未声明之前不能使用，所以提出了暂时性死区的概念（而不是变量提升）。

所以 `let` 不存在变量提升，但有 **暂时性死区**。

## const

先执行

```
const a; // Uncaught SyntaxError: Missing initializer in const declaration
```

再执行

```
const a = 1; // Uncaught SyntaxError: Identifier 'a' has already been declared
```

如上代码第一次定义变量 `a` 的时候，没有完成初始化的操作；当后续再次定义变量 `a` 的时候，会提示变量 `a` 已定义。

* 表明执行 `const a;` 的时候已经完成了变量 `a` 的创建（create） 过程；
* 但是这里初始化的操作失败了（且只能执行一次）；
* 再次初始化的时候，提示变量 `a` 已定义，进入了 *暂时性死区*。

## 总结

* `var` 存在变量提升
* `let` 不存在变量提升，但有 *暂时性死区*
* `const` 不存在变量提升，但有 *暂时性死区*


（end）

参考链接
* <a href="http://es6.ruanyifeng.com/#docs/let" target="_blank">http://es6.ruanyifeng.com/#docs/let</a>
* <a href="https://www.jianshu.com/p/0f49c88cf169" target="_blank">https://www.jianshu.com/p/0f49c88cf169</a>
