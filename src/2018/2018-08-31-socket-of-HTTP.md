# HTTP 系列之 socket

## Part 1: 基础概念

### 1.1 HTTP 协议

定义：[超文本传输协议（英文：HyperText Transfer Protocol，缩写：HTTP）](https://zh.wikipedia.org/wiki/%E8%B6%85%E6%96%87%E6%9C%AC%E4%BC%A0%E8%BE%93%E5%8D%8F%E8%AE%AE)是一种用于分布式、协作式和超媒体信息系统的应用层协议[1]。

[HTTP/0.9](https://www.w3.org/Protocols/HTTP/AsImplemented.html)（1991），仅支持 GET 协议
[HTTP/1.0](https://tools.ietf.org/html/rfc1945)（1996），第一个在通讯中指定协议版本号的 HTTP 协议版本
[HTTP/1.1](https://tools.ietf.org/html/rfc7230)（1997），发布后至今（2018）用了二十多年
[HTTP/2](https://tools.ietf.org/html/rfc7540)（2015），性能优化，向后兼容 1.1
[HTTPS](https://tools.ietf.org/html/rfc2818)（1994/2000），始发与网景浏览器（1994），2000 年正式入驻 RFC 官方文档

> [W3C](https://www.w3.org/)、[IETF](http://www.ietf.org/)、[WHATWG](https://www.whatwg.org/) 以及 [ECMA](http://www.ecma-international.org/) 的关系：
> 
> * W3C: 负责 HTML 及 CSS 规范，以及和 javascript 交互的规范
* IETF: 负责互联网通信协议，规则
* ECMA: JavaScript 实现规范
* WHATWG: HTML 规范的推动机构(有说是各大浏览器博弈的产物)

### 1.2 TCP/IP 通信传输流

![](http://images2015.cnblogs.com/blog/938876/201612/938876-20161226105703836-1640778610.png)

### 1.3 socket

定义：Socket的英文原义是“孔”或“插座”。作为BSD UNIX的进程通信机制，取后一种意思。通常也称作"套接字"，用于描述IP地址和端口，是一个通信链的句柄，可以用来实现不同虚拟机或不同计算机之间的通信。在Internet上的主机一般运行了多个服务软件，同时提供几种服务。每种服务都打开一个Socket，并绑定到一个端口上，不同的端口对应于不同的服务。

> Socket正如其英文原义那样，像一个多孔插座。一台主机犹如布满各种插座的房间，每个插座有一个编号，有的插座提供220伏交流电， 有的提供110伏交流电，有的则提供有线电视节目。 客户软件将插头插到不同编号的插座，就可以得到不同的服务。

> socket 连接的客户端端/服务端任意一端断开链接即可终止当前连接。

## Part 2: node.js 的 HTTP 报文数据解析

### 2.1 报文的格式

* 原始数据为二进制流，node.js 依赖 [`Buffer`](https://nodejs.org/dist/latest-v10.x/docs/api/buffer.html) 类来解析
* 原始数据假设为 `data`, 调用 `toString()` 方法后，`headers` 表现为 `\r\n` 分割的字符串，其中键值对以 `: `(冒号空格)分割
* `headers` 和 `body` 的分割符是 `\r\n\r\n`

#### demo

> 1. 保存为 `demo.js`，在当前目录执行 `shell` 脚本 `node demo.js` ，若未安装 `node.js`，请先安装 [node.js](https://nodejs.org/en/download/)
> 2. 访问 `127.0.0.1:2288`

```
const net = require('net');

const { log } = console;

const server = net.createServer((socket) => {
  
}).on('error', (err) => {
  throw err;
});

server.on('connection', (socket) => {
  socket.on('data', (data) => {
    // 原始数据
    log(data);
    log();
    // 原始数据类型为 Buffer
    log(data instanceof Buffer);
    log();
    const rawStr = String(data).toString();
    // 头部信息以 \r\n 分割
    log(rawStr.split());
    log();
    // 获取头部数据
    const reg = /\r\n/g;
    const tmpArr = rawStr.split(reg);
    log(tmpArr);
    log();
    socket.write('HTTP/1.1 200 OK\r\n'
      + 'Content-type: text/plain;chartset=utf-8\r\n\r\n'
    );
    socket.end('hello world');
  });
});

server.listen(2288, '127.0.0.1', () => {
  console.log('opened server on 127.0.0.1:2288');
});

```

> * [回车和换行的关系](http://www.ruanyifeng.com/blog/2006/04/post_213.html)：简单来说就是，Unix系统里，每行结尾只有"<换行>"，即"\n"；Windows系统里面，每行结尾是"<回车><换行>"，即"\r\n"；Mac系统里，每行结尾是"<回车>"。
> * [favicon.ico](https://zh.wikipedia.org/wiki/Favicon)，最早由 IE 引入，多数情况下置于 web 服务器根目录下即可，也可以由 link 标签指定，如： `<link rel="shortcut icon" href="http://common.ewt360.com/favicon.ico" type="image/x-icon">`



### 2.2 headers & body 解析

#### demo

> 1. 保存为 `demo.js`，在当前目录执行 `shell` 脚本 `node demo.js` ，若未安装 `node.js`，请先安装 [node.js](https://nodejs.org/en/download/)
> 2. 访问 `127.0.0.1:2288`

```
const net = require('net');
const fs = require('fs');

const { log } = console;

const server = net.createServer((socket) => {
  
}).on('error', (err) => {
  throw err;
});

server.on('connection', (socket) => {
  socket.on('data', (data) => {
    const rawStr = String(data).toString();
    const headersAndBodySplitReg = /\r\n\r\n/g;
    const rowDataArr = rawStr.split(headersAndBodySplitReg);
    const headersStr = rowDataArr[0];
    const bodyStr = typeof rowDataArr[1] !== 'undefined' ? rowDataArr[1] : '';
    const headersSplitReg = /\r\n/g;
    const headersArr = headersStr.split(headersSplitReg);
    const headersFirstLineArr = headersArr[0].split(' ');
    const [method, urlPath, protocol] = headersFirstLineArr;
    const headers = `\
      Method: ${method}<br />\
      Path: ${urlPath}<br />\
      Protocol: ${protocol}<br />\
      ${headersArr.slice(1).join('<br />')}
    `;
    const headerKeyValueReg = /: /g;
    const hostStr = headersArr[1];
    log(`request host is ${hostStr.split(headerKeyValueReg)[1]}`);
    switch (urlPath) {
      case '/favicon.ico':
        socket.write('HTTP/1.1 200 OK\r\n'
          + 'Content-type: image/ico\r\n\r\n'
        );
        socket.end(fs.readFileSync('./favicon.ico'));
      break;
      default:
        socket.write('HTTP/1.1 200 OK\r\n'
          + 'Content-type: text/html;chartset=utf-8\r\n\r\n'
        );
        socket.end(`\
          <!doctype html>\
            <html>\
              <head>\
                <title>DEMO</title>\
              </head>\
              <body>\
                <h1>request headers</h1>\
                <hr />
                ${headers}
                <h1>request body</h1>\
                <hr />
                ${bodyStr}
              </body>\
            </html>\
        `);
    }
  });
});

server.listen(2288, '127.0.0.1', () => {
  log('opened server on 127.0.0.1:2288');
});

```

需要注意的是第一行的解析：

```
GET / HTTP/1.1
Host: 127.0.0.1:2288
```
（第一行指定方法、资源路径、协议版本，以空格分割；第二行是在1.1版里必带的一个 header 作用指定主机）

## part 3: 特殊案例

### 3.1 如何支持跨域？

#### demo

> 1. 保存示例代码为 `demo.js`，在当前目录执行 `shell` 脚本 `node demo.js` ，若未安装 `node.js`，请先安装 [node.js](https://nodejs.org/en/download/)
> 2. 访问 `127.0.0.1:2288`
> 3. 通过其他本地 web 服务器访问任意 `http://127.0.0.1:2288` 地址即可查看跨域支持情况

```
const net = require('net');

const { log } = console;

const server = net.createServer((socket) => {
  
}).on('error', (err) => {
  throw err;
});

server.on('connection', (socket) => {
  socket.on('data', (data) => {
    socket.write('HTTP/1.1 200 OK\r\n'
      + 'Access-Control-Allow-Origin: *\r\n'
      + 'Access-Control-Allow-Methods: *\r\n'
      + 'Access-Control-Allow-Headers: *\r\n'
      + 'Content-type: text/plain;chartset=utf-8\r\n\r\n'
    );
    socket.end(`hello, i am server`);
  });
});

server.listen(2288, '127.0.0.1', () => {
  log('opened server on 127.0.0.1:2288');
});
```

跨域最主要的是设置三个头部字段，分别是 `'Access-Control-Allow-Origin`，`Access-Control-Allow-Methods` 以及 `Access-Control-Allow-Headers`，这里设置为 `*` 表示没有任何限制。

### 3.2 content-type & content-length

#### demo

> 1. 保存为 `demo.js`，在当前目录执行 `shell` 脚本 `node demo.js` ，若未安装 `node.js`，请先安装 [node.js](https://nodejs.org/en/download/)
> 2. 访问 `127.0.0.1:2288`

```
const net = require('net');
const fs = require('fs');

const { log } = console;
const getUrlPath = (data) => {
  const rawStr = String(data).toString();
  const headersAndBodySplitReg = /\r\n\r\n/g;
  const rowDataArr = rawStr.split(headersAndBodySplitReg);
  const headersStr = rowDataArr[0];
  const headersSplitReg = /\r\n/g;
  const headersArr = headersStr.split(headersSplitReg);
  const headersFirstLineArr = headersArr[0].split(' ');
  return headersFirstLineArr[1];
}

const server = net.createServer((socket) => {
  
}).on('error', (err) => {
  throw err;
});

server.on('connection', (socket) => {
  socket.on('data', (data) => {
    const urlPath = getUrlPath(data);
    socket.write(`HTTP/1.1 200 OK\r\n`);
    switch(urlPath) {
      case '/keep.jpg':
        const img = fs.readFileSync('./keep.jpg');
        socket.write(`Content-type: image/jpg\r\n`);
        // socket.write(`Content-length: ${img.length}\r\n`); // 图片正常加载
        // socket.write(`Content-length: ${img.length - 100}\r\n`); // 图片正常加载
        // socket.write(`Content-length: ${img.length + 100}\r\n`); // 图片加载异常
        socket.write(`\r\n`);
        socket.end(img);
      break;
      default:
        socket.write(`Content-type: text/html;chartset=utf-8\r\n\r\n`);
        socket.end(`\
          <!doctype html>\
            <html>\
              <head>\
                <title>DEMO</title>\
              </head>\
              <body>\
                <img src="/keep.jpg" />
              </body>\
            </html>\
        `);
    }
  });
});

server.listen(2288, '127.0.0.1', () => {
  log('opened server on 127.0.0.1:2288');
});
```

* `Content-type` 绝大多数情况下必须设置，而且必须正确匹配才能保证内容的正常解析
* `Content-length` 默认可以不设置，客户代理会默认按照真实数值处理。以图片显示为例，若设置的值小于真实数据长度，chrome 下图片正常显示；若设置的值大于真实数据长度，则图片无法正常显示（某些情况下资源文件的加载会一直处于 `pending ` 状态，直到请求超时）

### 3.3 POST 请求需要两次 TCP 链接？GET 只需要一次？

#### demo

> 1. 保存为 `demo.js`，在当前目录执行 `shell` 脚本 `node demo.js` ，若未安装 `node.js`，请先安装 [node.js](https://nodejs.org/en/download/)
> 2. 服务启动之后，会默认发起一次 `POST` 请求，查看控制台输出结果
> 3. 访问 `127.0.0.1:2288`，查看 `GET` 请求控制台输出结果
> 4. 本地任启一个 web 项目，使用 `POST` 请求跨域访问地址 `http://127.0.0.1:2288/upload`，查看控制台输出结果


```
const net = require('net');
const fs = require('fs');
const http = require('http');
const querystring = require('querystring');

const { log } = console;

const server = net.createServer((socket) => {
  
}).on('error', (err) => {
  throw err;
});

server.on('connection', (socket) => {
  socket.on('data', (data) => {
    const rawStr = String(data).toString();
    const headersAndBodySplitReg = /\r\n\r\n/g;
    const rowDataArr = rawStr.split(headersAndBodySplitReg);
    const headersStr = rowDataArr[0];
    const bodyStr = rowDataArr[1];
    const headersSplitReg = /\r\n/g;
    const headersArr = headersStr.split(headersSplitReg);
    const headersFirstLineArr = headersArr[0].split(' ');
    const [method, urlPath, protocol] = headersFirstLineArr;
    log(`reqest headers is\r\nMethod: ${method}\r\nPath: ${urlPath}\r\nProtocol: ${protocol}\r\n`);
    log(`request body is\r\n${decodeURIComponent(bodyStr)}\r\n`);
    switch (urlPath) {
      case '/favicon.ico':
        socket.write('HTTP/1.1 200 OK\r\n'
          + 'Content-type: image/ico\r\n\r\n'
        );
        socket.end(fs.readFileSync('./favicon.ico'));
      break;
      default:
        socket.write('HTTP/1.1 200 OK\r\n'
          + 'Access-Control-Allow-Origin: *\r\n'
          + 'Access-Control-Allow-Methods: *\r\n'
          + 'Access-Control-Allow-Headers: *\r\n'
          + 'Content-type: text/html;chartset=utf-8\r\n\r\n'
        );
        socket.end(`\
          <!doctype html>\
            <html>\
              <head>\
                <title>DEMO</title>\
                <script src="https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js"></script>\
                <script>$.post('/test', { name: 'hello', id: '1' });</script>\
              </head>\
              <body>\
                <h1>hello world</h1>\
              </body>\
            </html>\
        `);
    }
  });
  server.getConnections((err, count) => {
    log(`server is connected ${count} times`);
    log(`connected time is ${new Date().getTime()}\r\n`);
  })
});

server.listen(2288, '127.0.0.1', () => {
  log('opened server on 127.0.0.1:2288\r\n');
});
```

通过查看服务器控制台输出可得出如下结论

* `GET` 请求只需要一次 `TCP` 连接即可完成（无论是否跨域）
* 同一个域名下的 `POST` 请求默认只需要一次 `TCP` 连接即可完成
* 跨域时的 `POST` 请求需要两次 `TCP` 连接：

	* 第一次连接，浏览器发现域名不同，则会预发起一次 `method` 为 `OPTIONS` 的请求，询问服务器是否支持该资源的访问，服务器返回 `200 OK` 表示支持，则浏览器会再次发起请求，请求真实资源，否则表示拒绝访问，浏览器自动放弃该请求
	* 第二次连接（若可以访问的情况下），浏览器发起正常的 `method` 为 `POST` 的请求，获取真实资源


（完）

参考资料

* https://nodejs.org/api/net.html

