# 一张图说清楚 Javascript 原型和原型链

先简单介绍一下原型和原型链的概念：

1. JavaScript 的所有对象都有一个隐藏属性 `__proto__`（非规范，但所有浏览器都实现了该 Api），指向它所继承的对象的原型；
2. 所有函数对象都有一个属性 `prototype`，称作该函数的原型，所有继承函数的对象，通过其隐藏属性 `__proto__` 依次向上递归查找，可以追踪到其继承的所有父对象，这里通过 `__proto__` 属性连接而形成的链条称为原型链；
3. JavaScript 的原型和原型链主要是为了解决对象继承的问题。

> 如果读者想更详细的了解原型和原型链的定义，可以先行阅读[官方文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)。

JavaScript 的原型和原型链到底是怎么运作的呢？且看下图分解。图有点复杂不想看了？不用担心，注意到图中有6个带数字的绿色小圈没？是的，只需要跟着作者来了解一下这6个数字对应的箭头线条表达的概念，你将豁然开朗。

![](http://www.iseb.cc/wp-content/uploads/2019/06/原型、原型链.png)

## 1. 第一条箭头线段，顶级函数对象 `Function` 的原型链

这条线段表示顶级对象 `Function` 自己继承了自己。哈？自己继承自己？是的，你没看错！因为顺着 `Function` 的原型链 `Function.__proto__` 向上查找会发现，`Function.__proto__` 和 `Function.prototype` 是完全相等的，用代码表示即为：

```
Function.__proto__ === Function.prototype; // true
```

继续向上查找原型链即会发现 `Function` 继承自 `Object`

```
Function.__proto__.__proto__ === Object.prototype; // true
Function.__proto__.__proto__.__proto__ === null; // true，链条顶点
```

## 2. 第二条箭头线段，顶级函数对象 `Object` 的原型链


```
Object.__proto__ === Function.prototype; // true，表明 Object 继承自 Function
Object.__proto__.__proto__ === Object.prototype; // true，Object 也在 Object 的原型链上
Object.__proto__.__proto__.__proto__ === null; // true，链条顶点
```

又有新发现？是的，顶级函数对象 `Object` 继承自 `Function`，随后因为 `Function` 又继承自 `Object`，所以结果就是 函数对象 `Object` 也继承了自己，`incetanceof` 运算符表示如下

```
Object instanceof Object; // true
```

那么问题来了，自己继承自己，竟然没有造成死循环？为什么呢？且往下看

## 3. 第三条箭头线段，顶级函数对象 `Array` 的原型链

```
console.log(Array.__proto__ === Function.prototype); // true，表明 Array 继承自 Function
console.log(Array.__proto__.__proto__ === Object.prototype); // true，表明 Object 在 Array 的原型链上
console.log(Array.__proto__.__proto__.__proto__ === null); // true，链条顶点
```

因为 `Array` 也是函数对象，所以直接继承自 `Function` 对象，而 `Function` 又继承自 `Object` 对象。

松了一口气，终于不是自己继承自己了...

## 4. 第四条箭头线段，普通实例对象（直接由 `Object` 构造）的原型链

如下代码

```
var o = new Object(); // 或 var o = {}，结果是一样的
o.__proto__ === Object.prototype; // true，表明普通实例对象 o 继承自 Object
o.__proto__.__proto__ === null; // true，链条顶点
```


## 5. 第五条箭头线段，数组实例对象的原型链

如下代码

```
var a = new Array(1, 2, 3); // 用 Array 构造普通数组实例对象 a
console.log(a.__proto__ === Array.prototype); // true，说明普通数组对象 a 继承自顶级数组对象 Array
console.log(a.__proto__.__proto__ === Object.prototype); // true，说明顶级对象 Object 也在普通数组对象 a 的原型链上
console.log(a.__proto__.__proto__.__proto__ === null); // true，说明普通数组对象 a 的原型链结束了
```

所以对于普通数组对象 `a` 来说，其原型链的链条为 `a.__proto__.__proto__.__proto__`。


## 6. 第六条箭头线段，由普通函数构造的实例对象的原型链

以这条线段为起点，表明了两条原型链的走向

1. 普通函数构造的实例对象的原型链，即非函数对象的原型链
2. 普通函数的原型链，即函数对象的原型链

以如下代码为基础

```
function f(){};
var fObj = new f();
```

#### 普通实例对象的原型链（非函数对象）

> 这里以实例对象 `fObj` 为例

```
fObj.__proto__ === f.prototype; // true，表明 fObj 继承自函数 f
fObj.__proto__.__proto__ === Object.prototype; // true，表明 Object 处于 fObj 的原型链上
fObj.__proto__.__proto__.__proto__ === null; // true，表明 fObj 的原型链走到了顶端
```

#### 普通函数对象的原型链（函数对象）

> 这里以普通函数对象 `f` 为例

```
f.__proto__ === Function.prototype; // true，表明普通函数对象 f 继承自 Function
f.__proto__.__proto__ === Object.prototype; // true，表明 Object 处于普通函数 f 的原型链上
f.__proto__.__proto__.__proto__ === null; // true，表明函数 f 的原型链走到了顶端
```

## 总结

**原型** 指的是 *函数对象* 本身的名叫 `prototype` 的属性对应的对象，称为原型对象。

**原型链** 指的是所有对象以隐藏属性 `__proto__` 向上递归查找自己的继承关系形成的链条，`null` 为链条顶点。

**继承** 指的是继承原型链上所有原型对象的属性和方法。

除了起点和终点之外，原型链上的其他所有对象都是某个函数的原型对象（`prototype`）。

同理，顶级对象 `Object`，`Array` 以及 `Function` 都是函数对象，所以他们都继承自函数对象的始祖 `Function`，以 `instanceof` 操作符来说明就很形象

```
console.log(Object instanceof Function); // true
console.log(Array instanceof Function); // true
console.log(Function instanceof Function); // true
console.log(Function instanceof Object); // true
```

所以在 JavaScript 世界，原型链可以简单分为2种

* 函数对象的原型链
* 非函数对象的原型链

其中区分函数对象和非函数对象的一个很有意思的标志就是

* 函数对象同时具有属性 `__proto__` 和 `prototype`
* 非函数对象只具有属性 `__proto__`

理清楚这个思路之后，再回过头来看前面提出的问题：自己继承自己竟然不会造成死循环，原因就在于，在 JavaScript 里，说 `a` 继承自 `b`，是指 `b.prototype` 在 `a` 的原型链上，而 `b.prototype` 因为是普通实例对象，最终都会通过 `b.__proto__` 的递归指向 `Object.prototype`，并最终达到原型链的顶点。

还是举个栗子，以 `Object` 的原型链来说（函数对象的继承）

```
Object.__proto__ === Function.prototype; // true
```

Object 因为是函数对象，所以继承自顶级函数对象 Function

```
Function.prototype.__proto__ === Object.prototype; // true
```

`Function.prototype` 是普通实例对象，所以继承自 `Object`。

```
Object.prototype.__proto__ === null; // true
```

关键点来了，在这条原型链的顶端，`Object.prototype.__proto__` 指向了 `null`，一切都结束了，自然也就没有死循环了。

