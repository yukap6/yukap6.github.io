# `react-router` 源码阅读，答疑解惑核心问题

![](http://www.iseeit.cn/wp-content/uploads/2020/12/1-2.jpeg)

环境说明：

> 1. `react-router` 版本：3.x（及以前版本）；
> 2. `history` 版本：3.x（及以前版本）（`react-router` 依赖的一个核心库）；
> 3. 面向群体：有一定 `react-router` 使用经验，但对底层实现有疑惑的同学；

本文主要涉及4部分内容，依次是：

1. hashHistory 核心原理；
2. browserHistory 核心原理；
3. 路由渲染方式：2种不同的路由渲染方式如何工作；
4. 异步加载：配合 `webpack` 异步加载模块；

## 1. hashHistory

> 哈希路由的核心是监听浏览器 `hashchange` 事件，获取当前 `hash` 值作为路由匹配对应模块并渲染，其伪代码描述如下：

```
addEventListenner('hashchange', () => {
  const { hash } = window.location;
  if (hash === '路由1') {
    // 渲染路由1对应的模块1
  }
  if (hash === '路由2') {
    // 渲染路由2对应的模块2
  }
});
```

其中，有以下关键 api
1. 路由跳转：`history.push(path)` 实现原理是： `(path) => { window.location.hash = path; }`；
2. 路由替换：`history.replace(path)` 实现原理是：

```
(path) => {
  const hashIndex = window.location.href.indexOf('#');
  window.location.replace(
    window.location.href.slice(0, hashIndex >= 0 ? hashIndex : 0) + '#' + path;
  )
}
```

这部分代码来自于 `react-router` 依赖的三方库 `history`，具体位置是 `history` 仓库的 `modules/HashProtocol.js` 文件的第23至第32行。


## 2. browserHistory

> browserHistory 路由的核心是监听 `popstate` 事件，获取当前浏览器的路径作为路由，并渲染该路由匹配的模块，其伪代码描述如下：

```
addEventListenner('popstate', () => {
  const { pathname } = window.location;
  if (pathname === '路由1') {
    // 渲染路由1对应的模块1
  }
  if (pathname === '路由2') {
    // 渲染路由2对应的模块2
  }
});
```

其中，有以下关键API：

1. 路由跳转：`history.push(path)` 实现原理是：`(path) => { window.history.pushState({}, null, path); }`；
2. 路由替换：`history.replace(path)` 实现原理是：`(path) => { window.history.replaceState({}, null, path); }`

这部分代码来自于 `react-router` 依赖的三方库 `history`，具体位置是 `history` 仓库的 `modules/BrowserProtocol.js` 文件的第79至第87行。


## 3. 路由渲染方式：2种不同的路由渲染方式

方式1：路由数据通过名为 `routes`（数组） 的 `props` 传递给 `Router` 组件，`Router` 组件再根据对应的路由来匹配不同的模块，其大致示意如下：

```
<Router history={hashHistory} routes={routes} />
```

方式2：路由数据以 `Route` 组件为承载，作为 `children` 传递给 `Router` 组件，此时，`Router` 组件可以通过 `props.children`（数组） 遍历并生成对应的原生数组对象，然后再进入方式1并完成路由渲染，其大致示意如下：

```
<Router history={hashHistory}>
  <Route path="/" component={App}/>
</Router>
```

这里容易令人疑惑的点可能是 `Router` 组件如何根据自己的 `props.children` 生成真正的路由数组对象并进行渲染，为了解决这个疑惑，可以查看 `react-router` 源文件 `modules/RouteUtils.js` 第48至66行代码如下：

```
export function createRoutesFromReactChildren(children, parentRoute) {
  const routes = []

  React.Children.forEach(children, function (element) {
    if (React.isValidElement(element)) {
      // Component classes may have a static create* method.
      if (element.type.createRouteFromReactElement) {
        // 生成路由的分支1
        const route = element.type.createRouteFromReactElement(element, parentRoute)

        if (route)
          routes.push(route)
      } else {
        // 生成路由的分支2
        routes.push(createRouteFromReactElement(element))
      }
    }
  })

  return routes
}
```

> 这里重点关注，首先，`props.children` 实际是一个数组对象，可以进行遍历；其次，`props.children` 的每一个 `element` 在 `react` 原生底层支持 `element.type.createRouteFromReactElement(element, parentRoute)` 这样的方法来生成路由对象，亦或者执行 `createRouteFromReactElement(element)` 方法，而其底层逻辑很简单，就是获取到 `element` 的所有 `defaultProps` 和 `props` 并组合成一个新的路由对象，其源码如下：

```
function createRoute(defaultProps, props) {
  return { ...defaultProps, ...props }
}

export function createRouteFromReactElement(element) {
  const type = element.type
  const route = createRoute(type.defaultProps, element.props)
  ... // 省略
}
```

## 4. 支持异步加载

异步加载其实是 `webpack` 的能力，和 `react-router` 结合的时候，只需要通过 `webpack` 暴露的 `require.ensure()`（`webpack 3.x 及以前`） 或者 `import()`(`webpack 4.x及以后`)方法来加载该路由对应的模块即可，具体不再多做介绍，可查看 `webpack` 官方文档示例。

## 小结一下

看图不说话
![](http://www.iseeit.cn/wp-content/uploads/2020/12/React-Router.png)
