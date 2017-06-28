let hello = require('../../../../src/hello.js');
let errorResponse = require('../../../lib/errorResponse.js');


	describe('hello.logout', function() {

		before(function() {
			hello.init({
				test: {
					name: 'test',
					id: 'id'
				}
			});
		});

		after(function() {
			delete hello.services.test;
		});

		it('should trigger an error when network is unknown', function(done) {
			// Make request
			hello('unknown')
			.logout()
			.then(null, errorResponse('invalid_network', done))
			.catch(done);
		});

		describe('remove session from store', function() {

			var store = hello.utils.store;

			beforeEach(function() {
				hello.utils.store = store;
			});

			afterEach(function() {
				hello.utils.store = store;
			});

			it('should remove the session from the localStorage', function(done) {

				var spy = sinon.spy(() => ({}));

				hello.utils.store = spy;

				hello('test')
				.logout()
				.then(() => {
					expect(spy.calledWith('test', null)).to.be.ok();
					done();
				})
				.catch(done);

			});
		});

		describe('force=true', function() {

			describe('module.logout handler', function() {

				var module = {
					logout: function() {}
				};

				var store = hello.utils.store;
				var session = {};

				beforeEach(function() {

					// Clear all services
					delete hello.services.testable;

					hello.init({
						testable: module
					});

					hello.utils.store = function() {
						return session;
					};

				});

				afterEach(function() {
					// Restore... bah dum!
					hello.utils.store = store;
				});

				it('should call module.logout', function(done) {

					module.logout = () => done();

					hello('testable')
					.logout({force:true})
					.catch(done);
				});

				it('should attach authResponse object to the options.authResponse', function(done) {

					module.logout = function(callback, options) {
						expect(options).to.have.property('authResponse', session);
						done();
					};

					hello('testable')
					.logout({force:true})
					.catch(done);
				});
			});
		});
	});
