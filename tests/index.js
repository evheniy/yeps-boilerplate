const app = require('..');
const http = require('http');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);
let server;

/* app.then(async ctx => {
    sinon.stub(ctx.logger, 'info', text => text);
    sinon.stub(ctx.logger, 'error', text => text);
});

app.then(async ctx => {
    ctx.logger.restore();
}); */

describe('YEPS app boilerplate test', () => {

    beforeEach(() => {
        server = http.createServer(app.resolve());
    });

    it('should test', async () => {
        let isTestFinished = false;

        await chai.request(server)
            .get('/')
            .send()
            .then(res => {
                expect(res).to.have.status(200);
                isTestFinished = true;
            });

        expect(isTestFinished).is.true;
    });
});
