const path = require('path');
const App = require('yeps');
const Router = require('yeps-router');
const redis = require('yeps-redis');
const error = require('yeps-error');
const logger = require('yeps-logger');
const parser = require('url');
const config = require('config');
require('isomorphic-fetch');
const wrapper = require('yeps-express-wrapper');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const serveStatic = require('serve-static');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

const app = module.exports = new App();
const router = new Router();

app.all([
    wrapper(favicon(path.join(__dirname, 'public', 'favicon.ico'))),
    wrapper(serveStatic(path.join(__dirname, 'public', 'files'))),
]).all([
    redis(),
    error(),
    logger(),
    wrapper(bodyParser.json()),
    wrapper(compression()),
    wrapper(helmet()),
    wrapper(cors()),
]);

router.get('/users').then(async ctx => {
    ctx.res.setHeader('Content-Type', 'application/json');
    ctx.res.end(JSON.stringify([
        { id: 1, name: 'Tom' },
        { id: 2, name: 'Nick' },
        { id: 3, name: 'Phil' },
        { id: 4, name: 'Vlad' },
        { id: 5, name: 'Ev' },
    ]));
}).get('/categories').then(async ctx => {
    ctx.res.setHeader('Content-Type', 'application/json');
    ctx.res.end(JSON.stringify([
        { id: 1, name: 'Friends' },
        { id: 2, name: 'Office' },
        { id: 3, name: 'Family' },
    ]));
}).get('/').then(async ctx => {

    let response = await ctx.redis.get(ctx.req.url);

    if (!response) {
        const res = {};

        const query = parser.parse(ctx.req.url, true).query;

        const data = await Promise.all(
            Object.keys(query).map(
                key => fetch(`http://${ctx.req.headers.host}/${query[key]}`).then(r => r.json())
            )
        );

        Object.keys(query).forEach((key, index) => {
            res[key] = data[index];
        });

        response = JSON.stringify(res);

        await ctx.redis.set(ctx.req.url, response, 'ex', config.ttl);
    }

    ctx.res.setHeader('Content-Type', 'application/json');
    ctx.res.end(response);

});

app.then(router.resolve());
