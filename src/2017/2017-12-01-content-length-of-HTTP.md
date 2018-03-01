# HTTP 系列之 Content-Type

## Content-Type 是什么，怎么用

### 定义
`Content-Type` 实体头部用于指示资源的 [MIME](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) 类型 `media type`。在一次 HTTP 通信中，`Content-Type` 可以出现在请求头中，客户端告诉服务器实际发送的数据类型；在响应中，`Content-Type` 标头告诉客户端实际返回的内容的内容类型。

> 在响应头中，浏览器会在某些情况下进行 [MIME](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) 嗅探，并不一定遵循 Content-Type 的值; 为了防止这种行为，可以将标题 X-Content-Type-Options 设置为 nosniff

### 使用示例

```
Content-Type: text/html; charset=utf-8
Content-Type: multipart/form-data; boundary=something
```

### 指令说明：(Content-Type 可以配置的值)

* `media-type` 资源或数据的 [MIME type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)
* `charset` 字符编码标准
* `boundary` 对于多部分实体，`boundary` 是必需的，其包括来自一组字符的1到70个字符，它用于封装消息的多个部分的边界。


## 实战示例

### Content-Type 在 HTML 表单中

在通过 HTML 提交生成的 POST 请求中，请求头的 `Content-Type` 由`<form>` 元素上的 `enctype` 属性指定。

```
<form action="/" method="post" enctype="multipart/form-data">
```

### Content-Type 在 AJAX 请求中

AJAX 请求中通过 `XMLHttpRequest` 对象的 `setRequestHeader` 方法设置本次请求的 `Content-Type` 值。

```
xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
```

### Content-Type 和 AJAX/FormData 配合异步上传文件

原生 AJAX 方式（仅贴核心 JavaScript 代码，为代码简洁，使用了 jQuery 的语法，后同）

```
var formData = new FormData($("#form")[0]); 
var xhr = new XMLHttpRequest();
xhr.open("POST", "/", true);
xhr.send(formData);
```

如上使用 `FormData` 配合原生 AJAX 上传文件的时候，HTML 中 `<form>` 元素的 `enctype` 无论配置任何值都是被忽略的，原因是这次请求是重新通过 `XMLHttpRequest` 对象构造的，与 `<form>` 元素无关。当 `send` 的数据是 `FormData` 对象的时候，如果不显式的设置 `Content-Type` 的话，浏览器会自动调整本次请求的 `Content-Type` 为 `multipart/form-data`。

那么，考虑如下的代码呢？

```
var formData = new FormData($("#form")[0]); 
var xhr = new XMLHttpRequest();
xhr.open("POST", "/", true);
xhr.send({
    fileData: formData,
});
```

答案是 No。这种构造方法无法达到文件上传的目的。原因在于数据传输的时候，`{ fileData: formData }` 当做对象会调用 `.toString()` 方法，被转换为 `[object Object]` 字符串（普通数据都会被解析为字符串进行发送）。

那么如果显式设置了 `Content-Type` 的时候呢？（添加代码 `xhr.setRequestHeader('Content-Type', 'multipart/form-data');`）答案也是不可以的。因为即使显式设置了 `Content-Type` 类型，并不能改变 `{ fileData: formData }` 对象会被转换为字符串传递的规则，深层原因就是 `{ fileData: formData }` 并不是 `FormData` 数据格式。

### Content-Type 配合 jQuery 上传文件

```
var formData = new FormData($("#form")[0]); 
$.ajax({
    url: '/',
    type: 'POST',
    data: formData,
    processData: false,
    contentType: false,
    // contentType: 'multipart/form-data',
});
```

这里要注意的是：`processData` 要配置为 `false`, `FormData` 数据格式不需要进行额处理； `contentType` 配置为 `false`（相当于原生缺省设置，浏览器自动处理） 或者 `'multipart/form-data'` 都是 OK 的。

## 相关扩展

### Content-Type 和 Request Payload、Form Data 以及 Query String Parameters 的关系

以 Chrome 开发者工具为例，通常一次 AJAX 请求的数据展示格式有如下几种：

* Request Payload
    * ![Request-payload.png](https://private-alipayobjects.alipay.com/alipay-rmsdeploy-image/skylark/png/0bf9b9db-bfde-4a42-b022-dff1e96d6d68.png) 
    * 如上图中 `Content-Disposition` 则告诉服务器如何处理这部分的数据，这就是 `FormData` 数据支持二进制文件流传输的部分原因。
* Form Data
    * ![Form-Data.png](https://private-alipayobjects.alipay.com/alipay-rmsdeploy-image/skylark/png/cf79caa1-8bba-4f09-8d08-cc568d1d2e27.png)  
* Query String Parameters
    * ![query-string-parameters.png](https://private-alipayobjects.alipay.com/alipay-rmsdeploy-image/skylark/png/3ce3c03c-8e68-4bf1-8cc6-5508126e0261.png)  

为什么有这些区别了？原因就在于 `Content-Type` 取值不同。

使用 POST 方式发送请求，`Content-Type` 设置为 `application/x-www-form-urlencoded` 的时候，显示为 Form Data 的格式（注意和 FormData 数据格式是2个概念）；`text/plain`、`text/html`、以及 `multipart/form-data` 等都对应的是 Request Payload。

使用 GET 方式发送请求的时候，则对应 Query String Parameters。

### Content-Type 和 Content-Disposition 的关系

在一次常规的 HTTP 响应中，`Content-Disposition` 表明希望浏览器以何种方式来处理数据。

浏览器客户端发送数据的时候，在 `multipart/form-data` 数据体中，HTTP `Content-Disposition` 是一个头部，可以在多部分主体的子部分上使用，以提供有关应用的字段的信息。子部分由 `Content-Type` 头部中定义的边界分隔。对于数据主体本身，`Content-Disposition` 没有任何作用。

### Content-Length

`Content-Length` 表明发送内容的长度（实际发送长度，如果有压缩，则是压缩后的长度）。

客户端发送数据时，如果 `Content-Length` 和实际内容长度不匹配，则会造成服务器持续等待，最终造成传输超时（AJAX 发送数据时 `Content-Length` 无法修改）。服务器返回数据时，如果设置了 `Content-Length` 且启用了 HTTP 传输内容压缩，那么有可能造成实际发送的内容和设置的 `Content-Length` 取值不一致，导致浏览器一直处于等待数据状态（具体表现为浏览器一直在转啊转...）。

### Content-Encoding

`Content-Encoding` 用来表明发送内容的编码方式，主要是为了压缩传输内容以便于快速传输，比如 `Content-Encoding: gzip`。

### Content-Range

`Content-Range` 响应 HTTP 标头指示部分消息所属的完整消息的位置。通俗来讲就是一段消息很长，分批发送，那么某一次的传输内容只属于完整消息的一部分，这时候就要通过 `Content-Range` 指定本次传输内容在完整消息中的位置。

### Content-Type 常见取值

* `text/xml` xml/文本
* `image/*` 图片资源, * 可以为 gif/jpeg/png 等
* `text/html` html/文本
* `text/plain` 原始文本
* `multipart/form-data` 复杂表单数据（支持二进制文件流）
* `application/x-www-form-urlencoded` 普通表单数据（仅支持普通文本数据）

（完）

参考资料

* https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Type
* http://www.runoob.com/http/http-content-type.html
* https://tools.ietf.org/html/rfc7231#section-3.1.1.5
* https://tools.ietf.org/html/rfc7233#section-4.1

