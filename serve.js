const koa = require('koa');
const opn = require('better-opn');
const staticServe = require('koa-static');
const nunjucks = require('nunjucks');
const fs = require('graceful-fs');
const path = require('path');
const Router = require('koa-router');
const util = require('util');
const mount = require('koa-mount');
const url = require('url');
const router = new Router();
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);

nunjucks.configure(path.resolve(__dirname, 'template'), { autoescape: false, noCache: false });

async function defaultPage(ctx) {
    const location = url.parse(ctx.url);
    const pathname = path.join(process.cwd(), location.pathname);

    if (fs.existsSync(pathname)) {
        const fileList = await readdir(pathname);

        const entities = await Promise.all(fileList.map(async fileName => {
            const fullpath = path.join(pathname, fileName)
            const entity = await stat(fullpath);

            return {
                name: fileName,
                location: path.relative(process.cwd(), fullpath),
                isfolder: entity.isDirectory()
            }
        }));


        const relatives = path.relative(process.cwd(), pathname);
        const parents = ['/'].concat(relatives.split('/')).reduce((his, cur) => {
            return [...his, {
                name: cur,
                location: his.length ? path.resolve(his[his.length - 1].location, cur) : cur
            }];
        }, []);

        ctx.body = nunjucks.render('index.html', {
            entities,
            paths: parents
        });
    }
}

module.exports = function (fullPath, port) {
    const app = new koa();

    app.use(staticServe(fullPath, { gzip: false, hidden: true }))
    app.use(mount('/_internal', staticServe(path.resolve(__dirname, './template'), { gzip: true })));
    app.use(defaultPage);


    const server = app.listen(port || 0, () => {
        const address = server.address();
        console.info(`listen on ${address.address}:${address.port}`);
        opn(`http://localhost:${address.port}`)
    });
}
