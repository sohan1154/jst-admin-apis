
exports.list = function (req, res, next) {

    try {
        let params = req.params;

        let query = `SELECT ContactUs.id, ContactUs.subject, ContactUs.created_at, User.name user_name FROM contact_us ContactUs LEFT JOIN users User ON ContactUs.user_id = User.id ORDER BY ContactUs.id DESC`;
        req.connection.query(query, function (err, results, fields) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            } else {

                let rows = [];
                async.forEach(results, (rowInfo) => {
                    rows.push({
                        id: rowInfo.id,
                        user_name: rowInfo.user_name,
                        subject: rowInfo.subject,
                        created_at: helper.getFormatedDate(rowInfo.created_at),
                    });
                });

                let result = {
                    status: true,
                    message: 'List pages.',
                    data: rows
                }
                helper.sendResponse(req, res, result);
            }
        });
    }
    catch (err) {
        helper.sendErrorResponse(req, res, err);
    }
}

exports.detail = function (req, res, next) {

    try {
        let params = req.params;
        let id = (currentUser.id == params.id) ? currentUser.id : params.id;

        let query = `SELECT ContactUs.*, User.name user_name FROM contact_us ContactUs LEFT JOIN users User ON ContactUs.user_id = User.id WHERE ContactUs.id = ${id}`;
        req.connection.query(query, function (err, results, fields) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            }
            else if (!results.length) {
                helper.sendErrorResponse(req, res, 'Record not found.');
            }
            else {

                let rowInfo = results[0];
                let data = {
                    id: rowInfo.id,
                    user_name: rowInfo.user_name,
                    subject: rowInfo.subject,
                    message: rowInfo.message,
                    created_at: helper.getFormatedDate(rowInfo.created_at),
                    updated_at: helper.getFormatedDate(rowInfo.updated_at),
                }

                let result = {
                    status: true,
                    message: 'Detail.',
                    data: data
                }
                helper.sendResponse(req, res, result);
            }
        });
    }
    catch (err) {
        helper.sendErrorResponse(req, res, err);
    }
}
