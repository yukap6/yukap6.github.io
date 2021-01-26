# 使用 taro 开发微信小程序之拾遗

运行环境：

* taro：`3.0.18`；
* taro-ui：`^3.0.0-alpha.3`；
* 微信：`7.0.22`；
* 微信开发者工具：`稳定版 Stable Build (1.03.2101150)`；
* OS：`macOS Catalina version 10.15.7`。


5. 750 尺寸配置问题
6. 大小限制 & 分包（图片都走服务器，icon 建议雪碧图）
7. 保存图片（canvas）
8. 开发、测试 & 发布流程
9.  openID 和 unionID
10. 全面屏适配
11. web-view 嵌入 web 页面（https，全屏，多次跳转导致的回退问题）
12. 自定义顶部导航和胶囊按钮布局（返回事件拦截）
13. 图片显示 Image(not CoverImage)，CoverView 覆盖在原生组件上
14. taro-ui input setState 键盘隐藏问题(改为引用原生 input)
15. https 的问题
16. 测试环境 & 生产环境打包的问题
17. 强关注公众号审批不通过问题
