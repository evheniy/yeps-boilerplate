const App = require('yeps');
const Router = require('yeps-router');
const redis = require('yeps-redis');
const error = require('yeps-error');
const logger = require('yeps-logger');
const parser = require('url');
const config = require('config');
require('isomorphic-fetch');

const app = module.exports = new App();
const router = new Router();

app.all([
    redis(),
    error(),
    logger(),
]);

router.get('/users').then(async ctx => {
    ctx.res.writeHead(200, {'Content-Type': 'application/json'});
    ctx.res.end(JSON.stringify([
        { id: 1, name: 'Tom' },
        { id: 2, name: 'Nick' },
        { id: 3, name: 'Phil' },
        { id: 4, name: 'Vlad' },
        { id: 5, name: 'Ev' },
    ]));
}).get('/categories').then(async ctx => {
    ctx.res.writeHead(200, {'Content-Type': 'application/json'});
    ctx.res.end(JSON.stringify([
        { id: 1, name: 'Friends' },
        { id: 2, name: 'Office' },
        { id: 3, name: 'Family' },
    ]));
}).get('/').then(async ctx => {
    let response = {};

    let data = await ctx.redis.get(ctx.req.url);

    if (data) {
        response = JSON.parse(data);
    } else {
        const query = parser.parse(ctx.req.url, true).query;

        data = await Promise.all(
            Object.keys(query).map(key => fetch(`http://${ctx.req.headers.host}/${query[key]}`).then(res => res.json()))
        );

        Object.keys(query).forEach((key, index) => {
            response[key] = data[index];
        });

        await ctx.redis.set(ctx.req.url, JSON.stringify(response), 'ex', config.ttl);
    }

    ctx.res.writeHead(200, {'Content-Type': 'application/json'});
    ctx.res.end(JSON.stringify(response));

});

app.then(router.resolve());
