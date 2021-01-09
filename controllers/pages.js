
exports.list = function (req, res, next) {

    try {
        let params = req.params;

        let query = `SELECT * FROM pages WHERE deleted_at IS NULL`;
        req.connection.query(query, function (err, results, fields) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            } else {

                let rows = [];
                async.forEach(results, (rowInfo) => {
                    rows.push({
                        id: rowInfo.id,
                        category: rowInfo.category,
                        title: rowInfo.title,
                        page_key: rowInfo.page_key,
                        description: rowInfo.description,
                        meta_key: rowInfo.meta_key,
                        meta_description: rowInfo.meta_description,
                        status: rowInfo.status,
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

exports.create = async function (req, res, next) {

    try {
        let params = req.body;

        let data = {
            category: params.category,
            title: params.title,
            page_key: params.page_key,
            description: params.description,
            meta_key: params.meta_key,
            meta_description: params.meta_description,
            status: params.status,
        };
        req.connection.query(`INSERT INTO pages SET ? , created_at=NOW(), updated_at=NOW()`, data, function(err, results){

            if (err) {
                helper.sendErrorResponse(req, res, err);
            } else {

                let result = {
                    status: true,
                    message: 'Page created successfully.',
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

        let query = `SELECT * FROM pages WHERE id = ${params.id} AND deleted_at IS NULL`;
        req.connection.query(query, function (err, results, fields) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            }
            else if (!results.length) {
                helper.sendErrorResponse(req, res, 'Page not found.');
            }
            else {

                let rowInfo = results[0];
                let data = {
                    id: rowInfo.id,
                    category: rowInfo.category,
                    title: rowInfo.title,
                    page_key: rowInfo.page_key,
                    description: rowInfo.description,
                    meta_key: rowInfo.meta_key,
                    meta_description: rowInfo.meta_description,
                    status: rowInfo.status,
                    status_for_display: helper.getStatus(rowInfo.status),
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

exports.update = function (req, res, next) {

    try {
        let params = req.body;
        
        let data = {
            category: params.category,
            title: params.title,
            page_key: params.page_key,
            description: params.description,
            meta_key: params.meta_key,
            meta_description: params.meta_description,
            status: params.status,
        };
        req.connection.query(`UPDATE pages SET ? , updated_at=NOW() WHERE id=${params.id}`, data, function(err, results){

            if (err) {
                helper.sendErrorResponse(req, res, err);
            } else {

                let result = {
                    status: true,
                    message: 'Page updated successfully.',
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

        let query = `UPDATE pages SET status=${params.status}, updated_at=NOW() WHERE id=${params.id}`;
        req.connection.query(query, function (err, results) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            } else {

                let result = {
                    status: true,
                    message: 'Page status updated successfully.',
                }
                helper.sendResponse(req, res, result);
            }
        });
    }
    catch (err) {
        helper.sendErrorResponse(req, res, err);
    }
}

exports.delete = function (req, res, next) {

    try {
        let params = req.params;
        let id = params.id;

        let query = `SELECT * FROM pages WHERE id = ${id} AND deleted_at IS NULL`;
        req.connection.query(query, function (err, results, fields) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            }
            else if (!results.length) {
                helper.sendErrorResponse(req, res, 'Page is not found, may be already deleted.');
            }
            else {

                let query = `UPDATE pages SET deleted_at=NOW(), updated_at=NOW() WHERE id=${id}`;
                req.connection.query(query, function (err, results) {

                    if (err) {
                        helper.sendErrorResponse(req, res, err);
                    } else {

                        let result = {
                            status: true,
                            message: 'Page deleted successfully.',
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

exports.archive = function (req, res, next) {

    try {
        let params = req.params;

        let query = `SELECT * FROM pages WHERE deleted_at IS NOT NULL`;
        req.connection.query(query, function (err, results, fields) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            } else {

                let rows = [];
                async.forEach(results, (rowInfo) => {
                    rows.push({
                        id: rowInfo.id,
                        category: rowInfo.category,
                        title: rowInfo.title,
                        page_key: rowInfo.page_key,
                        description: rowInfo.description,
                        meta_key: rowInfo.meta_key,
                        meta_description: rowInfo.meta_description,
                        status: rowInfo.status,
                        deleted_at: helper.getFormatedDate(rowInfo.deleted_at),
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

exports.restore = function (req, res, next) {

    try {
        let params = req.params;
        let id = params.id;

        let query = `SELECT * FROM pages WHERE id = ${id} AND deleted_at IS NOT NULL`;
        req.connection.query(query, function (err, results, fields) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            }
            else if (!results.length) {
                helper.sendErrorResponse(req, res, 'Page is not found, may be already restored.');
            }
            else {

                let query = `UPDATE pages SET deleted_at=NULL, updated_at=NOW() WHERE id=${id}`;
                req.connection.query(query, function (err, results) {

                    if (err) {
                        helper.sendErrorResponse(req, res, err);
                    } else {

                        let result = {
                            status: true,
                            message: 'Page restored successfully.',
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
