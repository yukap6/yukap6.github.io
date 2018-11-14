# html overflow:hidden 引发页面返回顶部 bug 记录

## 问题描述

开发模态框组件时，当滚动到页面底部，点击按钮使模态框弹出时，页面”回到了顶部“，[点击查看示例](https://codepen.io/yukap6/pen/wQgwbM)。示例中，点击`点我显示模态框` 按钮即可复现该问题。而正常情况应该是，模态框显示在当前屏幕内容的正上方即可，背景内容不出现滚动，也不”回到顶部“，比如 [正常的 Demo](https://codepen.io/yukap6/pen/VVPYqr) 所示（点击 `点我显示模态框` 按钮即可）。那为什么会出现”回到顶部“的情况呢？

## 解决方案

仔细分析发现，当点击按钮让模态框显示的时候，为了让背景内容不出现滚动，`html` `body` 元素同时被添加了如下所示样式，而当不添加这些样式给 `html` `body` 元素时，页面就表现正常（但是背景内容会滚动）。那么问题就定位到了，给 `html` `body` 元素添加的 CSS 样式有问题，如下

```
  // html body 同时加入如下样式时有，页面会回到顶部
  width: 100%;
  height: 100%;
  overflow: hidden;
```

那怎么能做到既让模态框正常显示，又让背景内容不滚动，且页面不会”回到顶部“呢？经过一系列测试，下面列出一些解决方案（具体原理会在稍后详细讨论）。

### 方案1，给 `html` 元素添加 `overflow:hidden`

如 [方案1](https://codepen.io/yukap6/pen/MzJwrJ) 所示，模态框正常显示。所做调整是将样式内容修改如下，并且只将该样式添加到 `html` 元素上。

```
overflow: hidden;
```

### 方案2，给 `body` 元素添加 `overflow:hidden`

如 [方案2](https://codepen.io/yukap6/pen/eQgpJM) 所示，模态框正常显示。所做调整是将样式内容修改如下，并且只将该样式添加到 `body` 元素上。

```
overflow: hidden;
```

### 方案3，`html` `body` 元素添加不同的样式，采用”加法“将问题样式进行组合

思路就是以最简代码 `overflow:hidden` 为基础，一步一步将样式增加，直至全部代码加入导致”回到顶部“问题复现。

[**组合1**（正常）](https://codepen.io/yukap6/pen/wQgGjv)

```
html {
}
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
```

[**组合2**（正常）](https://codepen.io/yukap6/pen/zMNBGa)

```
html {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
body {
}
```

[**组合3**（正常）](https://codepen.io/yukap6/pen/NEdNQr)

```
html {
  width: 100%;
  height: 100%;
}
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
```

[**组合4**（有 bug）](https://codepen.io/yukap6/pen/wQgwbM)

```
html {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
```

这里大家会发现，组合1、2、3 都能正常运行，唯独组合4会出现”回到顶部“的 bug，这到底是为什么呢？接下来，就从原理层面来逐层剖析，并进行一一验证。

## 原理剖析

这里就不卖关子了，其实，所有的问题都是因为 [`overflow:hidden`](https://www.w3.org/TR/CSS21/visufx.html#propdef-overflow) 这个属性值 和 `height: 100%` 组合不当造成的，且往下看。

[overflow 的定义](https://www.w3.org/TR/CSS21/visufx.html#propdef-overflow)

> Value:  visible | hidden | scroll | auto | inherit
Initial:  visible

翻译成中文就是：overflow 的取值有 visible、hidden、scroll、auto 四种，默认值为 visible。

每个取值对应的含义如下：

>  **visible**
This value indicates that content is not clipped, i.e., it may be rendered outside the block box.
> **hidden**
This value indicates that the content is clipped and that no scrolling user interface should be provided to view the content outside the clipping region.
> **scroll**
This value indicates that the content is clipped and that if the user agent uses a scrolling mechanism that is visible on the screen (such as a scroll bar or a panner), that mechanism should be displayed for a box whether or not any of its content is clipped. This avoids any problem with scrollbars appearing and disappearing in a dynamic environment. When this value is specified and the target medium is 'print', overflowing content may be printed.
> **auto**
The behavior of the 'auto' value is user agent-dependent, but should cause a scrolling mechanism to be provided for overflowing boxes.

翻译成中文就是

* visible 默认值。内容不会被修剪，可以呈现在元素框之外。
* hidden 如果需要，内容将被剪裁以适合填充框。 不提供滚动条。
* scroll 如果需要，内容将被剪裁以适合填充框。 浏览器显示滚动条，无论是否实际剪切了任何内容。 （这可以防止滚动条在内容更改时出现或消失。）打印机仍可能打印溢出的内容。
* auto 取决于用户代理。 如果内容适合填充框内部，则它看起来与可见内容相同，但仍会建立新的块格式化上下文。 如果内容溢出，桌面浏览器会提供滚动条。

这里重点关注取值 hidden 的定义：
> *如果需要，内容将被剪裁以适合填充框* **不提供滚动条**。请记住这一句，**不提供滚动条**，划重点，要考哟。

接下来逐一分析下之前的解决方案为啥正常，为啥不正常。

### 方案1剖析

[方案1](https://codepen.io/yukap6/pen/MzJwrJ) 为什么能达到目标效果呢？在[方案1](https://codepen.io/yukap6/pen/MzJwrJ) 里，显示模态框的时候，`html` 元素只是被添加了 `overflow: hidden` 属性。讨论该方案为什么可行之前，我们先看另一个简单的例子：一般情况下，如何给块级元素应用 `overflow: hidden` 属性。

大家应该都想到了，需要给块级元素设定固定的宽高之后，添加 `overflow: hidden` 才能真正生效，如下代码示例（[点我查看普通块级元素应用 overflow:hidden Demo](https://codepen.io/yukap6/pen/wQJBJp)）

```
{
	width: 100px;
	height: 100px;
	overflow: hidden;
}
```

而当不设置固定宽高之后（[点我查看不固定宽高 overflow:hidden](https://codepen.io/yukap6/pen/MzpYGd)），内容会全部显示，`overflow: hidden` 达不到预期效果。这也容易理解，因为块级元素的 `width` 和 `height` 默认值为 `auto`，也就是根据内容自动调节。但是，我们却可以滚动页面来查看所有内容，这就是同 [方案1](https://codepen.io/yukap6/pen/MzJwrJ) 不同的地方。[方案1](https://codepen.io/yukap6/pen/MzJwrJ) 里也没有设置 html 元素的宽高，但是滚动条却被隐藏了，是浏览器对 html 元素特殊优待了么？

是，也不是。线索就在 [overflow 的定义]()里的如下一段描述中

> UAs must apply the 'overflow' property set on the root element to the viewport. When the root element is an HTML "HTML" element or an XHTML "html" element, and that element has an HTML "BODY" element or an XHTML "body" element as a child, user agents must instead apply the 'overflow' property from the first such child element to the viewport, if the value on the root element is 'visible'. The 'visible' value when used for the viewport must be interpreted as 'auto'. The element from which the value is propagated must have a used value for 'overflow' of 'visible'.

译成中文就是：用户终端（一般就是指浏览器）默认给文档根元素 Html/Body 设置 `overflow: visible`，所有的子元素也都是默认继承 `overflow: visible`。但是当子节点内容超过屏幕大小的时候，文档要表现的像 `overflow: auto` 的效果一样，也就是必要的时候还得出现滚动条。

问题迎刃而解。

如 [点我查看不固定宽高 overflow:hidden](https://codepen.io/yukap6/pen/MzpYGd) 所示，普通块级元素不固定宽高，只添加 `overflow: hidden` 的时候，并不能达到 `hidden` 的效果，而且有滚动条来滚动以查看全部内容。这里的滚动条并不是块级元素本身产生的滚动条，而是浏览器给页面的根元素 Html/Body 提供的滚动条。

而 [方案1](https://codepen.io/yukap6/pen/MzJwrJ) 里，之所以没有了滚动条，是因为给 Html 元素添加 `overflow: hidden` 属性修改了浏览器根元素默认 `overflow: visible` 的设置以及表现的像 `overflow: auto` 的效果，从而使根元素 `overflow: hidden` 生效，而我们还记得，`overflow: hidden` 的一个要点就是 **不提供滚动条**，所以整个页面背景不再滚动。

### 方案2剖析

同 [方案1](https://codepen.io/yukap6/pen/MzJwrJ)大致相同，对于 Body 元素的处理实际上和 Html 的处理几乎一致，所以当给 Body 元素添加 `overflow: hidden` 的属性时，也能达到预期效果，如 [方案2](https://codepen.io/yukap6/pen/eQgpJM) 所示。

### 方案3剖析

方案3里的 [**组合1**（正常）](https://codepen.io/yukap6/pen/wQgGjv) 、[**组合2**（正常）](https://codepen.io/yukap6/pen/zMNBGa)以及[**组合3**（正常）](https://codepen.io/yukap6/pen/NEdNQr)其实都是使用了如下的原理

> 用户终端（一般就是指浏览器）默认给文档根元素 Html/Body 设置 `overflow: visible` 属性，根元素所有的子元素也都是默认继承 `overflow: visible` 属性。但是当根元素的子节点内容超过屏幕限制的时候，根元素要表现的像 `overflow: auto` 的效果一样，也就是必要的时候还得出现滚动条。

以 [**组合3**（正常）](https://codepen.io/yukap6/pen/NEdNQr) 为例：

```
html {
  width: 100%;
  height: 100%;
}
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
```
虽然 html 和 body 元素都设置了宽高值，而且该值就是浏览器的文档可视区域宽高，但并没有出现”回到顶部“的问题。换句话说，就是浏览器仍然可以停留在已滚动到的区域而不重新根据固定宽高来从顶部重新渲染文档，这是因为 html 元素的 `overflow` 属性并没有被重置，也就是说 html 依然是 `overflow: visible` 但是表现的像 `overflow: auto` 的效果，所以文档依然可以表现的是自己已经”滚动“到当前位置，而无需进行裁切隐藏（也就是 `overflow: hidden`），所要做的只是隐藏掉滚动条而已，因为 body 设置了 `overflow: hidden`，而 html 元素和 body 元素其实是默认共享了文档顶层滚动条的。

以 [方案1](https://codepen.io/yukap6/pen/MzJwrJ) 、[方案2](https://codepen.io/yukap6/pen/eQgpJM) 、[**组合1**（正常）](https://codepen.io/yukap6/pen/wQgGjv)、[**组合2**（正常）](https://codepen.io/yukap6/pen/zMNBGa)、[**组合3**（正常）](https://codepen.io/yukap6/pen/NEdNQr)以及如下代码的正常运行都可以证明这一点：html 元素和 body 元素默认共享了文档顶层滚动条，这也就解释了为什么单独给 html 或者 body 添加 `overflow: hidden` 都会隐藏浏览器级滚动条。

```
html {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
body {
  width: 100%;
  height: 100%;
}
```

所以，当代码被稍微调整一下，如下所示，模态框弹出的时，html 和 body 同时添加了如下的样式，页面”回到了顶部“（[点击查看效果](https://codepen.io/yukap6/pen/wQgwbM)）。

```
html {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
```

这是因为，文档的宽高被完全重置为了浏览器可视区域的宽高，而且，文档所有根元素 html/body 的 `overflow: hidden` 同时生效，所以浏览器对于 html/body 的渲染同普通块级元素设置了固定宽高并且 `overflow: hidden` 的效果一样，只显示最顶部可显示内容，也就是我们看到的”回到顶部“效果。其实是浏览器对文档进行了重绘，采用了 `overflow: hidden` 的效果，裁切掉了溢出的部分，并且不提供滚动条。

换句话说就是，html 文档根元素 html、body 只要其中任意一个的 `overflow` 属性不被重置，那么整个文档就会符合 `overflow: visible` 的特性，当文档内容溢出时，整个文档又会表现的 像是 `overflow: auto` 的效果，无论是否设置了 html、body 的宽高。

就酱。

（完）

参考文档

* https://www.w3.org/TR/CSS21/visufx.html#propdef-overflow


