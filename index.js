const App = require('yeps');
const Router = require('yeps-router');
const redis = require('yeps-redis');
const error = require('yeps-error');
const logger = require('yeps-logger');

const app = module.exports = new App();
const router = new Router();

app.all([
    redis(),
    error(),
    logger(),
]);

router.get('/').then(async ctx => {
    ctx.res.writeHead(200, {'Content-Type': 'application/json'});
    ctx.res.end(JSON.stringify({ test: 1 }));
});

app.then(router.resolve());
