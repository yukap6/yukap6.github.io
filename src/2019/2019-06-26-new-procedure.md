# `new` 操作符执行了哪些操作？

![](http://www.iseb.cc/wp-content/uploads/2019/06/new.jpg)

> [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/new)：`new` 运算符创建一个用户定义的对象类型的实例或具有构造函数的内置对象的实例。`new` 关键字会进行如下的操作：
> 1. 创建一个空的简单 JavaScript 对象（即`{}`）；
> 2. 链接该对象（即设置该对象的构造函数）到另一个对象 ；
> 3. 将步骤1新创建的对象作为 `this` 的上下文 ；
> 4. 如果该函数没有返回对象，则返回 `this`。

千言万语不如举个栗子🌰：

```
function Person(name) {
  this.name = name;
}
Person.prototype.getName = function() {
  return this.name;
}

var p1 = new Person('jack');
p1.name; // jack
p1.getName(); // jack
p1.__proto__ === Person.prototype; // true
p1; // Person {name: "jack"}
```

`new` 运算与函数对象 `Perosn` 合作，创建了一个普通实例对象 `p1`。

以 `p1` 的属性来反证 `new` 所做的操作，就很显而易见了。

1. 首先，从无到有，先创建一个简单对象 `{}`（想象小孩刚出生）；
2. 其次，指定该对象的继承关系：将该简单对象的原型链指向 `Person` 的原型 `Person.prototype`（想象小孩上户口，获得继承遗产的社会关系）。

代码反证

```
p1.__proto__ === Person.prototype; // true
p1.constructor === Person; // true
```

p1 自身其实是没有 `constructor` 属性的，这个属性继承而来，是 `Person.prototype` 的属性。

3. 最后，将前面两步创建的对象作为 `this` 的上下文传递给函数 `Person`，执行函数 `Person`，返回 `this` 对象（想象小孩长大，获取自己特有的能力）。

代码反证

```
p1.name; // jack
```

`p1` 的 `name` 属性就是执行函数 `Person` 的时候，通过 `this.name = name;` 这行代码赋予的。

需要补充的是，new 操作符的执行结果取决于函数 `Person` 的返回值：

* 如果 `Person` 返回普通对象，则结果为该普通对象；// 注意这里是普通对象，原始值是会被忽略的，比如数字 1
* 如果 `Person` 没有返回值（其实是返回了 `undefined`），则返回 `this`。

## 总结

`new` 操作符，人如其名，依托函数对象，创建一个新的普通实例对象。

既然 `new` 操作符是和函数合作的，那么任何函数原则上都可以，比如

```
var a = new Object(); // 因为 Object 本身就是顶级的函数对象
a.constructor === Object; // true
```

（end）
