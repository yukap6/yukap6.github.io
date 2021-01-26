# 作用域和作用域链

作用域为可访问变量，对象，函数的集合。JavaScript 采用词法作用域（又称静态作用域），目前支持三种作用域（都是词法作用域的子概念）：

* 全局作用域
* 函数作用域
* 块级作用域（ES6 新增）

深入解释每种作用域之前，先解释一下什么叫词法作用域。举个栗子🌰：

```
var name = 'global';
function go() {
  var name = 'local';
  function inner() {
    return name;
  }
  return inner;
}
var run = go();
run(); // 'local'
```
执行结果输出 'local'。原因就在于，`go()` 函数返回的是函数 `inner`，函数 `inner` 在定义的时候（也就是静态阶段，或词法分析阶段），其作用域就已经确定了（稍后会在作用域链详细解释变量访问原理）。

了解了词法作用域的概念之后，对应的子类别就很好理解了。

## 全局作用域

```
var outer = 'global';
function test() {
  console.log(outer);
}
test(); // global
```

`outer` 即为全局变量，拥有 *全局作用域*，网页中的所有脚本和函数均可使用。如上 `test` 函数内虽然没有变量 `outer` 的定义，仍然可以引用全局变量 `outer`。

## 函数作用域

```
var name = 'global';
function go() {
  var name = 'local';
  console.log(name);
}
go(); // local
```

在 `go` 函数中，形成函数作用域（有的地方也称为局部作用域，和全局对应），其中函数作用域内的变量 `name` 优先级高于全局作用域，所以输出值为 `local`。

## 块级作用域

```
let age = 1;
{
  let userName = 'jack';
  console.log(userName); // jack
}
console.log(age); // 1
console.log(userName); // Uncaught ReferenceError: userName is not defined
```

`{}` 之间的代码形成了块级作用域，其中声明的变量 `userName` 只能在该块内访问。当在外部尝试访问变量 `userName` 时就会报错。

ES6 中规定，`let` `const` 声明的变量支持块级作用域（`var` 一直都没有块级作用域）。


## 作用域链

```
let code = 1;
function gradefather() {
  let width = 2;
  function parent() {
    let height = 3;
    function child() {
      if(true) {
        console.log(height); // 3
        console.log(width); // 2
        console.log(code); // 1
      }
    }
    child();
  }
  parent();
}
gradefather();
```



以 `console.log(code)` 执行为例，变量 `code` 查找逻辑如下：

* 首先在 `if` 块作用域内查找是否存在变量 `code`，答案是不存在；
* 继续向外查找，`child` 函数作用域也不存在变量 `code`；
* 继续向外查找，`parent` 函数作用域也不存在变量 `code`;
* 继续向外查找，`gradefather` 函数作用域也不存在变量 `code`;
* 到达最外层，全局作用域存在变量 `code`，查找结束（如果某次查找直到最外层也没找到，则会报错）。

在这里，依次从里到外查找变量 `code` 的时候，一层层作用域形成的链条简称作用域链。前面的代码示例也是遵从作用域链的查找原则以及词法作用域原则（函数在定义的时候就已经确定了函数作用域）。

需要强调的是，作用域以及作用域链都是在代码定义的时候已经确定了（不会随着函数的调用位置变化而变化）。

用图片来描述作用域链会看的更清晰一些：

![](http://www.iseeit.cn/wp-content/uploads/2019/06/scope-scopechain.png)

## 总结

JavaScript 采用词法作用域（静态作用域），函数在定义的时候就确定了其作用域。执行代码时，查找变量（函数）从最里层作用域一直向外查找，直到找到该变量，所形成的链条称为作用域链。

夯实一下，小测验走一波：

```
function fun1(){var a=1;fun2();}
function fun2(){return a;}
fun1(); // Uncaught ReferenceError: a is not defined
```

做错了？👻? 因为在代码定义的时候，函数 `fun2` 的作用域已经确定了，且此时对变量 `a` 的访问即不存在于 `fun2` 的函数作用域内，也不存在于全局作用域，所以不论在哪里调用 `fun2` 都会报错变量 `a` 未定义。

所以，一定要记住的是：作用域和作用域链在函数定义阶段就已经确定了，不会随着函数调用位置的不同而不同。

最后再留个课后作业😀，请问输出结果是？

```
var x = 10;
function fn() {
  console.log(x);
}
function show(f) {
  var x = 20;
  (function() {
    f();
  })();
}
show(fn);
```

（end）
