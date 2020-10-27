# 从零开始实现一个微前端框架[2]——代码实现

![](http://www.iseeit.cn/wp-content/uploads/2020/10/WechatIMG474.jpeg)

> 上一篇文章：[从零开始实现一个微前端框架[1]——理论基础](http://www.iseeit.cn/index.php/2020/10/23/create-a-micro-frontend-framework-1/)介绍了微前端框架的核心原理，本篇是上一篇的续集，根据准备好的理论知识，coding 实现一个可用的微前端框架。如果对于实现微前端的核心理论知识不够清晰，建议先阅读[上一篇文章](http://www.iseeit.cn/index.php/2020/10/23/create-a-micro-frontend-framework-1/)后再回来继续阅读。

根据已知理论知识，一个微前端框架有以下几个核心任务要处理：

1. 全局路由管理，判断子项目的加载和卸载时机；
2. 加载 & 渲染子项目；
3. 卸载子项目 & 环境隔离。

针对这3个关键节点，一步一步实现它。

## 第一步：全局路由管理，判断子项目的加载和卸载时机

针对使用哈希路由的项目，全局路由监听很简单，只要监听 `window` 的 `hashchange` 事件即可做到对路由变化的响应，代码如下：

```
window.addEventListener('hashchange', () => {
  // TODO 根据路由变化，来判断子项目的加载和卸载
  if (A项目的路由) {
    // 加载A项目
  }
  if (B项目的路由) {
    // 加载B项目
  }
});
```

此时，第一步的核心工作就完成了。接下来要处理的逻辑就是如上伪代码的部分，根据路由来判断当前应该加载哪个项目，并渲染它，继续往下走。

## 第二步：加载 & 渲染子项目

### 2.1 子项目改造

加载子项目之前，需要先对子项目进行一定的改造，目的是让子项目打包后，对外默认暴露的是一个标准的可直接渲染的 React 组件。这就有点像是，所有的子项目其实就是一个个 React 组件，跟平常在一个大项目里，通过路由来渲染不同的 React 组件本质上没有区别。要完成这一步改造有2个关键事项：

1. 修改 `webpack` 的配置文件，调整输出文件格式为 `UMD` 格式；
  
```
output: {
  filename: `template-react16.js`,
  chunkFilename: '[id].[name].bundle.[chunkhash:8].js',
  library: 'template-react16', // 关键配置
  libraryTarget: 'umd', // 关键配置
},
```

2. 拿掉默认的 `ReactDOM.render()` 代码以及 HTML 模板文件。

一般情况下，React 项目会有一个 HTML 文件，预留一个 DOM 节点，打包后的代码会以 `script` 标签的形式引入 HTML。当这些 `script` 加载完成后，对应代码会立即执行（Webpack 打包后的 React 项目代码入口文件内容就是一个可执行函数）。入口文件执行完成后，会返回一个标准的 React 组件类，而该组件类就可以使用 `ReactDOM` 来渲染。此时，修改后的子项目入口文件结构大致类似于：

```
const App = () => {
  return (<div>我是子项目的入口文件</div>);
}

export default App;
```

### 2.2 子项目的加载

加载子项目的入口文件很简单，就是 `script` 脚本的动态加载，核心代码如下：

```
const script = document.createElement('script');
script.src = '子项目入口文件的地址';
script.onload = () => {
  // TODO 子项目的渲染
};
document.body.appendChild(script);
```

### 2.3 子项目的渲染

既然已知子项目对外暴露的是一个标准的 React 组件，那就简单了，依赖 `ReactDOM.render()` 方法对其渲染即可。

```
ReactDOM.render(React.createElement(
  window[项目名称].default, {},
), document.getElementById('app'));
```

这里有个关键信息，`window[项目名称].default`。`window[项目名称].default` 这个标准的 React 组件类在子项目的入口文件加载完成后就自动生成了（上一步做的事情）。既然标准的 React 组件类准备好了，渲染就是水到渠成的事情。

## 第三步：卸载子项目 & 环境隔离

按照前述步骤，子项目的渲染就是 React 组件的渲染，那卸载就是 React 组件的卸载了，核心代码如下：

```
ReactDOM.unmountComponentAtNode(document.getElementById('app'));
```

这里需要补充的是，虽然子项目卸载了，但是其加载过程中，引入全局环境的 `script` 标签和 `style` 标签默认是没有移除的，需要单独处理一下。

## 总结

至此，一个微前端框架的核心代码都实现了，剩下的部分则是对整个流程的串联以及对边界问题的处理，最后，输出一套完整的 `api` 之后，就可以开箱即用了。

基于以上思路，目前已经实现了一个叫 `micro-frontend-mini` 的微前端框架库，github 链接是 [https://github.com/micro-frontend-mini/micro-frontend-mini](https://github.com/micro-frontend-mini/micro-frontend-mini)，欢迎 star & 拍砖。关于 `micro-frontend-mini` 的具体使用，会在下一篇文章中进行详细介绍，敬请期待。

（以上）
