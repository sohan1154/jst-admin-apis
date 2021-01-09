
exports.isAuthenticate = (req, res, next) => {

    try {

        let authorization = req.header('authorization');
        
        if(typeof authorization === 'undefined') {
            helper.sendErrorResponse(req, res, 'Authentication error.');
                return next(false);
        }

        let token = authorization.replace('Bearer ', '');

        let query = `SELECT UserToken.user_id, User.* FROM user_tokens UserToken JOIN users User ON UserToken.user_id=User.id WHERE UserToken.token='${token}' AND User.deleted_at IS NULL`;
        req.connection.query(query, function (err, results) {
            // console.log('results::::', results)
            if (err) {

                helper.sendErrorResponse(req, res, err);                
                return next(false);
            }
            else if (!results.length) {

                helper.sendErrorResponse(req, res, 'Authentication error.');
                return next(false);
            }
            else if (!results[0].status) {

                helper.sendErrorResponse(req, res, 'Your account in-active, please contact to administrator.');
                return next(false);
            }
            else if (results[0].role !== 'Admin') {

                helper.sendErrorResponse(req, res, 'You are not authorized to access this location.');
                return next(false);
            }
            else {

                global.currentUser = results[0];
                return next();
            }
        });
    }
    catch (err) {

        helper.sendErrorResponse(req, res, err);
        return next(false);
    }
}
