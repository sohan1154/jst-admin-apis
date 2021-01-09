
exports.create_plan = async function (req, res, next) {

    try {
        let params = req.body;

        let data = {
            name: params.name,
            amount: params.amount,
            validity: params.validity,
            allowed_members: params.allowed_members,
            description: params.description,
            status: params.status,
        };
        req.connection.query(`INSERT INTO plans SET ? , created_at=NOW(), updated_at=NOW() WHERE id=${params.id}`, data, function(err, results){

            if (err) {
                helper.sendErrorResponse(req, res, err);
            } else {

                let result = {
                    status: true,
                    message: 'Plan created successfully.',
                }
                helper.sendResponse(req, res, result);
            }
        });
    }
    catch (err) {
        helper.sendErrorResponse(req, res, err);
    }
}

exports.list_plans = function (req, res, next) {

    try {
        let params = req.params;

        let query = `SELECT * FROM plans WHERE deleted_at IS NULL`;
        req.connection.query(query, function (err, results, fields) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            } else {

                let rows = [];
                async.forEach(results, (rowInfo) => {
                    rows.push({
                        id: rowInfo.id,
                        name: rowInfo.name,
                        amount: rowInfo.amount,
                        validity: rowInfo.validity,
                        allowed_members: rowInfo.allowed_members,
                        status: rowInfo.status,
                    });
                });

                let result = {
                    status: true,
                    message: 'List Plans.',
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

exports.detail_plan = function (req, res, next) {

    try {
        let params = req.params;

        let query = `SELECT * FROM plans WHERE id = ${params.id} AND deleted_at IS NULL`;
        req.connection.query(query, function (err, results, fields) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            }
            else if (!results.length) {
                helper.sendErrorResponse(req, res, 'Plan not found.');
            }
            else {

                let rowInfo = results[0];
                let data = {
                    id: rowInfo.id,
                    name: rowInfo.name,
                    amount: rowInfo.amount,
                    validity: rowInfo.validity,
                    allowed_members: rowInfo.allowed_members,
                    description: rowInfo.description,
                    status: rowInfo.status,
                    status_for_display: helper.getStatus(rowInfo.status),
                    created_at: helper.getFormatedDate(rowInfo.created_at),
                    updated_at: helper.getFormatedDate(rowInfo.updated_at),
                }

                let result = {
                    status: true,
                    message: 'Detail Plan.',
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

exports.update_plan = function (req, res, next) {

    try {
        let params = req.body;

        let data = {
            name: params.name,
            amount: params.amount,
            validity: params.validity,
            allowed_members: params.allowed_members,
            description: params.description,
            status: params.status,
        };
        req.connection.query(`UPDATE plans SET ? , updated_at=NOW() WHERE id=${params.id}`, data, function(err, results){
            if (err) {
                helper.sendErrorResponse(req, res, err);
            } else {

                let result = {
                    status: true,
                    message: 'Plan updated successfully.',
                }
                helper.sendResponse(req, res, result);
            }
        });

    }
    catch (err) {
        helper.sendErrorResponse(req, res, err);
    }
}

exports.change_status = function (req, res, next) {

    try {
        let params = req.params;

        let query = `UPDATE plans SET status=${params.status}, updated_at=NOW() WHERE id=${params.id}`;
        req.connection.query(query, function (err, results) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            } else {

                let result = {
                    status: true,
                    message: 'Plan status updated successfully.',
                }
                helper.sendResponse(req, res, result);
            }
        });
    }
    catch (err) {
        helper.sendErrorResponse(req, res, err);
    }
}

exports.delete_plan = function (req, res, next) {

    try {
        let params = req.params;

        let query = `SELECT * FROM plans WHERE id = ${params.id} AND deleted_at IS NULL`;
        req.connection.query(query, function (err, results, fields) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            }
            else if (!results.length) {
                helper.sendErrorResponse(req, res, 'Plan is not found, may be already deleted.');
            }
            else {

                let query = `UPDATE plans SET deleted_at=NOW(), updated_at=NOW() WHERE id=${params.id}`;
                req.connection.query(query, function (err, results) {

                    if (err) {
                        helper.sendErrorResponse(req, res, err);
                    } else {

                        let result = {
                            status: true,
                            message: 'Plan deleted successfully.',
                        }
                        helper.sendResponse(req, res, result);
                    }
                });
            }
        });
    }
    catch (err) {
        helper.sendErrorResponse(req, res, err);
    }
}

exports.archive_plans = function (req, res, next) {

    try {
        let params = req.params;

        let query = `SELECT * FROM plans WHERE deleted_at IS NOT NULL`;
        req.connection.query(query, function (err, results, fields) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            } else {

                let rows = [];
                async.forEach(results, (rowInfo) => {
                    rows.push({
                        id: rowInfo.id,
                        name: rowInfo.name,
                        amount: rowInfo.amount,
                        validity: rowInfo.validity,
                        allowed_members: rowInfo.allowed_members,
                        status: rowInfo.status,
                        deleted_at: helper.getFormatedDate(rowInfo.deleted_at),
                    });
                });

                let result = {
                    status: true,
                    message: 'List Plans.',
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

exports.restore_plan = function (req, res, next) {

    try {
        let params = req.params;

        let query = `SELECT * FROM plans WHERE id = ${params.id} AND deleted_at IS NOT NULL`;
        req.connection.query(query, function (err, results, fields) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            }
            else if (!results.length) {
                helper.sendErrorResponse(req, res, 'Plan is not found, may be already restored.');
            }
            else {

                let query = `UPDATE plans SET deleted_at=NULL, updated_at=NOW() WHERE id=${params.id}`;
                req.connection.query(query, function (err, results) {

                    if (err) {
                        helper.sendErrorResponse(req, res, err);
                    } else {

                        let result = {
                            status: true,
                            message: 'Plan restored successfully.',
                        }
                        helper.sendResponse(req, res, result);
                    }
                });
            }
        });
    }
    catch (err) {
        helper.sendErrorResponse(req, res, err);
    }
}
