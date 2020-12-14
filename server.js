var restify = require('restify');
global.mysql = require('mysql');
var users = require('./controllers/users');
global.database = require('./config/database');
global.helper = require('./functions/helper');
global.permission = require('./functions/permission');
global.async = require("async");
global.c = console;

/**
 * create server
 */
var server = restify.createServer();

server.name = 'JST Server for Admin';

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

// auth
server.post('/login', users.login);
server.get('/logout', users.logout);

// admins 
server.post('/admins/create-account', permission.isAuthenticate, users.create_account);
server.get('/admins/list/:type', permission.isAuthenticate, users.list_users);
server.get('/admins/detail-account/:user_id', permission.isAuthenticate, users.detail_account);
server.post('/admins/update-account', permission.isAuthenticate, users.update_account);
server.post('/admins/change-password', permission.isAuthenticate, users.change_password);
server.put('/admins/change-status/:user_id/:status', permission.isAuthenticate, users.change_status);
server.put('/admins/delete-account/:user_id', permission.isAuthenticate, users.delete_account);

// settings
server.post('/settings/update-account-settings', permission.isAuthenticate, users.update_account_settings);
server.post('/settings/change-password', permission.isAuthenticate, users.change_password);
server.get('/settings/detail-account/:user_id', permission.isAuthenticate, users.detail_account);
server.post('/settings/update-account', permission.isAuthenticate, users.update_account);

/**
 * mound a server on specific port 
 */
server.listen(3001, function () {
  console.log('%s listening at %s', server.name, server.url);
});
