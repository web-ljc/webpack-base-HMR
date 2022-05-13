
## webpack执行流程
  1. 初始化 Compiler： new Webpack(config) 得到 Compiler对象
  2. 开始编译：调用 Complier 对象 run 方法开始执行编译
  3. 确定入口：根据配置中的 entry 找出所有的文件入口
  4. 编译模块：从入口文件出发，调用所哟配置的 Loader 对模块进行编译，再找出该模块依赖的模块，递归直到所有模块被加载进来
  5. 完成模块编译：经过第4步使用loader编译完所有模块后，得到了每个模块被编译后的最终内容以及它们之间的依赖关系
  6. 输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的chunk，再把每个chunk转换成一个单独的文件加入到输出列表。
  7. 输出完成：再确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统


## webpack-HMR

- 手撕热加载原理
  - HMR的核心就是客户端从服务端拉去更新后的文件，准确的说是 chunk diff (chunk 需要更新的部分)
  - 实际上 WDS 与浏览器之间维护了一个Websocket，当本地资源发生变化时，WDS 会向浏览器推送更新，并带上构建时的 hash，让客户端与上一次资源进行对比。
  - 客户端对比出差异后会向 WDS 发起Ajax请求来获取更改内容(文件列表、hash)，
  - 这样客户端就可以再借助这些信息继续向 WDS 发起jsonp请求获取该chunk的增量更新。

- hotModuleReplacementPlugin
  + 它会生成2个布丁文件
    - 上一次编译生成的has.hot-update.json 说明上次编译到现在哪些代码块发生改变
    - chunk名字.上一次编译生成的has.hot-update.js 存放着此代码块最新的模块定义，里面会调用webpackHotUpdate 方法

  + 向代码块中注入`HMR runtime`代码，热更新的主要逻辑，拉取代码、执行代码、执行accpet回调都是它注入到chunk中的
  
  + hotCreateRequire 会帮我们给模块module 的parents children赋值
