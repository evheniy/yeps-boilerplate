const app = require('..');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const config = require('config');
const Redis = require('ioredis');
const redis = new Redis(config.redis);
const yeps = require('yeps-server');
const logger = require('yeps-logger/logger');

chai.use(chaiHttp);
let server;

// disable logger error messages
logger.info = text => text;
logger.error = text => text;

describe('YEPS app boilerplate test', () => {

    beforeEach(() => {
        server = yeps.createHttpServer(app);
    });

    afterEach(() => {
        server.close();
    });

    it('should test users', async () => {
        let isTestFinished = false;

        await chai.request(server)
            .get('/users')
            .set('Content-Type', 'application/json')
            .send()
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body).is.an('array');
                expect(res.body.length).to.be.equal(5);
                expect(res.body[0]).is.an('object');
                expect(res.body[0]).to.have.property('id');
                expect(res.body[0]).to.have.property('name');
                expect(res.body[0].id).is.not.empty;
                expect(res.body[0].name).is.not.empty;
                expect(res.body[0].id).to.be.equal(1);
                expect(res.body[0].name).to.be.equal('Tom');
                isTestFinished = true;
            });

        expect(isTestFinished).is.true;
    });

    it('should test categories', async () => {
        let isTestFinished = false;

        await chai.request(server)
            .get('/categories')
            .set('Content-Type', 'application/json')
            .send()
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body).is.an('array');
                expect(res.body.length).to.be.equal(3);
                expect(res.body[0]).is.an('object');
                expect(res.body[0]).to.have.property('id');
                expect(res.body[0]).to.have.property('name');
                expect(res.body[0].id).is.not.empty;
                expect(res.body[0].name).is.not.empty;
                expect(res.body[0].id).to.be.equal(1);
                expect(res.body[0].name).to.be.equal('Friends');
                isTestFinished = true;
            });

        expect(isTestFinished).is.true;
    });

    it('should test aggregator from redis', async () => {
        let isTestFinished = false;

        const users = [
            { id: 1, name: 'Tom' },
            { id: 2, name: 'Nick' },
            { id: 3, name: 'Phil' },
            { id: 4, name: 'Vlad' },
            { id: 5, name: 'Ev' },
        ];
        const categories = [
            { id: 1, name: 'Friends' },
            { id: 2, name: 'Office' },
            { id: 3, name: 'Family' },
        ];

        await redis.set('/?users=users&categories=categories', JSON.stringify({ users, categories}));

        await chai.request(server)
            .get('/')
            .set('Content-Type', 'application/json')
            .query({
                users: 'users',
                categories: 'categories'
            })
            .send()
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body).is.an('object');
                expect(res.body.users).is.not.empty;
                expect(res.body.users).is.an('array');
                expect(res.body.categories).is.not.empty;
                expect(res.body.categories).is.an('array');

                expect(res.body.users.length).to.be.equal(5);
                expect(res.body.users[0]).is.an('object');
                expect(res.body.users[0]).to.have.property('id');
                expect(res.body.users[0]).to.have.property('name');
                expect(res.body.users[0].id).is.not.empty;
                expect(res.body.users[0].name).is.not.empty;
                expect(res.body.users[0].id).to.be.equal(1);
                expect(res.body.users[0].name).to.be.equal('Tom');

                expect(res.body.categories).is.an('array');
                expect(res.body.categories.length).to.be.equal(3);
                expect(res.body.categories[0]).is.an('object');
                expect(res.body.categories[0]).to.have.property('id');
                expect(res.body.categories[0]).to.have.property('name');
                expect(res.body.categories[0].id).is.not.empty;
                expect(res.body.categories[0].name).is.not.empty;
                expect(res.body.categories[0].id).to.be.equal(1);
                expect(res.body.categories[0].name).to.be.equal('Friends');

                isTestFinished = true;
            });

        await redis.del('/?users=users&categories=categories');

        expect(isTestFinished).is.true;
    });

    it('should test aggregator from api', async () => {
        let isTestFinished = false;

        await redis.del('/?users=users&categories=categories');

        await chai.request(server)
            .get('/')
            .set('Content-Type', 'application/json')
            .query({
                users: 'users',
                categories: 'categories'
            })
            .send()
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body).is.an('object');
                expect(res.body.users).is.not.empty;
                expect(res.body.users).is.an('array');
                expect(res.body.categories).is.not.empty;
                expect(res.body.categories).is.an('array');

                expect(res.body.users.length).to.be.equal(5);
                expect(res.body.users[0]).is.an('object');
                expect(res.body.users[0]).to.have.property('id');
                expect(res.body.users[0]).to.have.property('name');
                expect(res.body.users[0].id).is.not.empty;
                expect(res.body.users[0].name).is.not.empty;
                expect(res.body.users[0].id).to.be.equal(1);
                expect(res.body.users[0].name).to.be.equal('Tom');

                expect(res.body.categories).is.an('array');
                expect(res.body.categories.length).to.be.equal(3);
                expect(res.body.categories[0]).is.an('object');
                expect(res.body.categories[0]).to.have.property('id');
                expect(res.body.categories[0]).to.have.property('name');
                expect(res.body.categories[0].id).is.not.empty;
                expect(res.body.categories[0].name).is.not.empty;
                expect(res.body.categories[0].id).to.be.equal(1);
                expect(res.body.categories[0].name).to.be.equal('Friends');

                isTestFinished = true;
            });

        expect(isTestFinished).is.true;

        let data = await redis.get('/?users=users&categories=categories');

        expect(data).is.not.empty;
        data = JSON.parse(data);

        expect(data).is.an('object');
        expect(data.users).is.not.empty;
        expect(data.users).is.an('array');
        expect(data.categories).is.not.empty;
        expect(data.categories).is.an('array');

        expect(data.users.length).to.be.equal(5);
        expect(data.users[0]).is.an('object');
        expect(data.users[0]).to.have.property('id');
        expect(data.users[0]).to.have.property('name');
        expect(data.users[0].id).is.not.empty;
        expect(data.users[0].name).is.not.empty;
        expect(data.users[0].id).to.be.equal(1);
        expect(data.users[0].name).to.be.equal('Tom');

        expect(data.categories).is.an('array');
        expect(data.categories.length).to.be.equal(3);
        expect(data.categories[0]).is.an('object');
        expect(data.categories[0]).to.have.property('id');
        expect(data.categories[0]).to.have.property('name');
        expect(data.categories[0].id).is.not.empty;
        expect(data.categories[0].name).is.not.empty;
        expect(data.categories[0].id).to.be.equal(1);
        expect(data.categories[0].name).to.be.equal('Friends');

        await redis.del('/?users=users&categories=categories');
    });

    it('should test aggregator with error', async () => {
        let isTestFinished = false;

        await chai.request(server)
            .get('/')
            .set('Content-Type', 'application/json')
            .query({
                users: 'users',
                category: 'category'
            })
            .send()
            .catch(err => {
                expect(err).to.have.status(500);
                isTestFinished = true;
            });

        expect(isTestFinished).is.true;
    });
});
