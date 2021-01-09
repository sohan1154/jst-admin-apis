var restify = require('restify');
global.mysql = require('mysql');
var users = require('./controllers/users');
var pages = require('./controllers/pages');
var contact_us = require('./controllers/contact_us');
var plans = require('./controllers/plans');
global.database = require('./config/database');
global.helper = require('./functions/helper');
global.permission = require('./functions/permission');
global.async = require("async");
global.c = console;

/**
 * create server
 */
var server = restify.createServer();

server.port = 3001;
server.name = 'JST Server for Admin APIs';

/**
 * handle cors middleware 
 */
const corsMiddleware = require('restify-cors-middleware')
 
const cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ['http://localhost:3000', 'http://localhost', 'localhost:3000', '*'],
  allowHeaders: ['Authorization'],
  exposeHeaders: ['Authorization']
})
 
server.pre(cors.preflight)
server.use(cors.actual)

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.authorizationParser());
server.use(restify.plugins.dateParser());
server.use(restify.plugins.queryParser());
server.use(restify.plugins.jsonp());
server.use(restify.plugins.gzipResponse());
server.use(restify.plugins.bodyParser());

// check body/params 
server.use(helper.vewRequest);

// add database connection in req object
server.use(database.createDatabaseConnection);

// home page 
server.get('/', (req, res, next) => { res.json('Welcome at ' + server.name); });

// auth
server.post('/login', users.login);
server.get('/logout', users.logout);

// users 
server.get('/users/list/:type', permission.isAuthenticate, users.list_users);
server.post('/users/create-account', permission.isAuthenticate, users.create_account);
server.get('/users/detail-account/:user_id', permission.isAuthenticate, users.detail_account);
server.post('/users/update-account', permission.isAuthenticate, users.update_account);
server.post('/users/change-password', permission.isAuthenticate, users.change_password);
server.put('/users/change-status/:user_id/:status', permission.isAuthenticate, users.change_status);
server.put('/users/delete-account/:user_id', permission.isAuthenticate, users.delete_account);
server.get('/users/archive/:type', permission.isAuthenticate, users.archive_users);
server.put('/users/restore-account/:user_id', permission.isAuthenticate, users.restore_account);

// plans 
server.get('/plans/list', permission.isAuthenticate, plans.list_plans);
server.post('/plans/create-plan', permission.isAuthenticate, plans.create_plan);
server.get('/plans/detail-plan/:id', permission.isAuthenticate, plans.detail_plan);
server.post('/plans/update-plan', permission.isAuthenticate, plans.update_plan);
server.put('/plans/change-status/:id/:status', permission.isAuthenticate, plans.change_status);
server.put('/plans/delete-plan/:id', permission.isAuthenticate, plans.delete_plan);
server.get('/plans/archive', permission.isAuthenticate, plans.archive_plans);
server.put('/plans/restore-plan/:id', permission.isAuthenticate, plans.restore_plan);

// pages 
server.get('/pages/list', permission.isAuthenticate, pages.list);
server.post('/pages/create', permission.isAuthenticate, pages.create);
server.get('/pages/detail/:id', permission.isAuthenticate, pages.detail);
server.post('/pages/update', permission.isAuthenticate, pages.update);
server.put('/pages/change-status/:id/:status', permission.isAuthenticate, pages.change_status);
server.put('/pages/delete/:id', permission.isAuthenticate, pages.delete);
server.get('/pages/archive', permission.isAuthenticate, pages.archive);
server.put('/pages/restore/:id', permission.isAuthenticate, pages.restore);

// contact us 
server.get('/contact-us/list', permission.isAuthenticate, contact_us.list);
server.get('/contact-us/detail/:id', permission.isAuthenticate, contact_us.detail);

// settings
server.post('/settings/update-account-settings', permission.isAuthenticate, users.update_account_settings);
server.post('/settings/change-password', permission.isAuthenticate, users.change_password);
server.get('/settings/detail-account/:user_id', permission.isAuthenticate, users.detail_account);
server.post('/settings/update-account', permission.isAuthenticate, users.update_account);

/**
 * mound a server on specific port 
 */
server.listen(server.port, function () {
  console.log('%s listening at %s', server.name, server.url);
});
