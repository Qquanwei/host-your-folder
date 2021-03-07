const koa = require('koa');
const opn = require('better-opn');
const staticServe = require('koa-static');
const nunjucks = require('nunjucks');
const fs = require('graceful-fs');
const path = require('path');
const Router = require('koa-router');
const util = require('util');

const router = new Router();
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);

nunjucks.configure({ autoescape: false });

async function defaultPage(ctx) {
    const fileList = await readdir('./');

    const entities = await Promise.all(fileList.map(async fileName => {
        const entity = await stat(fileName);
        return {
            name: fileName,
            isfolder: entity.isDirectory()
        }
    }));
    const styles = await readFile(path.resolve(__dirname, './template/materialize.min.css'));
    const scripts = await readFile(path.resolve(__dirname, './template/materialize.min.js'));
    const parents = ['a', 'b', 'c'].reduce((his, cur) => {
        return [...his, {
            name: cur,
            location: his.length ? path.resolve(his[his.length - 1].location, cur) : cur
        }];
    }, []);

    ctx.body = nunjucks.render(path.resolve(__dirname, './template/index.html'), { 
        entities, 
        styles, 
        scripts,
        paths: parents
     });
}

module.exports = function (fullPath, port) {
    const app = new koa();
    router.get('/', defaultPage);

    app.use(staticServe(fullPath, { gzip: false }))
    app.use(router.routes());
    app.use(router.allowedMethods());


    const server = app.listen(port || 0, () => {
        const address = server.address();
        console.info(`listen on ${address.address}:${address.port}`);
        opn(`http://localhost:${address.port}`)
    });
}
