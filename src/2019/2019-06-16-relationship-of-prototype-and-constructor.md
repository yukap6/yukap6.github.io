# 函数与其原型对象 `prototype` 的关系

概括就是

* 函数具有属性 `prototype`，是一个实例对象，称作函数的原型对象
* 原型对象 `prototype` 又具有 `constroctor` 属性，指向函数本身（`prototype.constructor`）

代码证明如下

```
function F(){}; // 这里定义函数名称大写只是为了方便识别，F 也只是普通函数
F.prototype.constructor === F; // true
```

本着“好奇到底”的精神，不能只停留在表面，要透过现象看本质。借助逆向思维，搞清楚它们不是什么关系即可。

上图......(拉好长的音，像不像上朝......😀)

![](http://www.iseeit.cn/wp-content/uploads/2019/06/prototype-和-prototype.constructor-的关系.png)

## 1. 默认情况下，函数的原型对象 `prototype` 并不是函数的实例


可以用如下代码来证明

```
function F(){};
F.prototype instanceof F; // false，`F.prototype` 并不是 F 的实例
F.prototype instanceof Object; // true，`F.prototype` 是 Object 的实例
```

这里会发现，原型对象 `F.prototype` 实质上是由顶级函数对象 `Object` 直接构造的。

## 2. 默认情况下，函数的原型对象 `prototype` 和 函数本身是两种不同类型的对象

**`F` 是函数对象**

具有如下属性

* `prototype` 函数的原型
* `__proto__` 隐藏属性，指向函数对象本身的原型链
* `constructor` 指向构造该函数的函数（可以理解为函数的构造函数）

依次证明如下

```
function F(){};
F.prototype; // {constructor: ƒ}
F.__proto__; // ƒ () { [native code] }
F.constructor; // ƒ Function() { [native code] }
```

注释里是打印结果，说明3点问题

1. 函数的原型对象 `F.prototype` 是 JavaScript 基于原型（原型链）实现继承的产物
2. `F.__proto__` 指明函数本身的原型链，即函数本身的前世今生
3. `F.constructor`，函数作为对象，它也是被其他函数创造的，而它的 `constructor` 属性则指向了构造它自己的对象，这里是顶级构造函数 `Function`（`F.constructor === Function; // true，即可证明`）

**`F.prototype` 是普通实例对象**

具有如下属性

* `__proto__`，`F.prototype.__proto__` 指向自己的原型链
* `constructor`，`F.prototype.constructor`指向和自己 *“相关”* 的函数，表明自己是该函数的属性

代码证明如下

```
function F(){};
F.prototype.__proto__ === Object.prototype; // true
F.prototype.constructor === F; // true
```

正因为有着互相指向的关系，在浏览器控制台会发现如下无限展开的链条，那就是 `F.prototype.constructor.prototype.constructor...`，

示例图中的函数 `F`，顶级函数对象 `Function` 以及 顶级函数对象 `Object` 对象的三个箭头指向就表明了这个连接。


另外，这里要澄清的是，为什么总是要使用 *默认情况下* 的字眼，那是因为大多数情况下，JavaScript 里的普通对象都是可以修改的，完全可以按照自己的想法随意定义对象以及对象的属性。

**总结**一下，（默认情况下😀）

1. 函数是函数对象；
2. 函数的原型是实例对象，函数定义原型对象是由 JavaScript 继承机制决定的；
3. 函数和它的原型相互引用。原型对象的 `constructor` 属性默认指向它所从属的函数，但该函数并不是原型对象的构造函数（名不符其实👻）。

（end）

