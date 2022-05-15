
/* 
  存2个hash，一个是上一个hash，一个是当前hash
*/
let lastHash
hotEmitter.on('webpackHotUpdate', () => {
  console.info('hotCheck')
})