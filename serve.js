const koa = require('koa');
const opn = require('better-opn');
const staticServe = require('koa-static');

module.exports = function (fullPath, port) {
    const app = new koa();
    app.use(staticServe(fullPath, { gzip: true }))
    const server = app.listen(port || 0, () => {
        const address = server.address();
        console.info(`listen on ${address.address}:${address.port}`);
        opn(`http://localhost:${address.port}`)
    });
}
