
exports.login = function (req, res, next) {

    try {
        var params = req.body;

        let query = `SELECT * FROM users WHERE email='${params.username}' AND deleted_at IS NULL`;
        c.log('query:', query)
        req.connection.query(query, function (err, results) {
            if (err) {
                helper.sendErrorResponse(req, res, err);
            }
            else if (!results.length) {
                helper.sendErrorResponse(req, res, 'Invalid username/email.');
            }
            else if (!results[0].status) {
                helper.sendErrorResponse(req, res, 'Your account in-active, please contact to administrator.');
            }
            else {

                let rowInfo = results[0];

                helper.matchPassword(params.password, rowInfo.password, (err, status) => {
                    if (err) {
                        helper.sendErrorResponse(req, res, err);
                    }
                    else if (!status) {
                        helper.sendErrorResponse(req, res, 'Invalid password.');
                    }
                    else {
                        let data = {
                            id: rowInfo.id,
                            role: rowInfo.role,
                            name: rowInfo.name,
                            email: rowInfo.email,
                            mobile: rowInfo.mobile,
                        }

                        manageToken(req, params, rowInfo, (err, token) => {

                            if (err) {
                                helper.sendErrorResponse(req, res, err);
                            } else {
                                let result = {
                                    status: true,
                                    message: 'Logged in successfully.',
                                    token: token,
                                    data: data,
                                }
                                helper.sendResponse(req, res, result);
                            }
                        });
                    }
                })
            }
        });
    }
    catch (err) {
        helper.sendErrorResponse(req, res, err);
    }
}

function manageToken(req, params, userInfo, callback) {

    let token = helper.generateToken(userInfo.id + userInfo.email);

    let query = `SELECT * FROM user_tokens WHERE user_id=${userInfo.id}`;
    req.connection.query(query, function (err, results) {
        console.log('results:', results)
        if (err) {
            callback(err);
        }
        else if (!results.length) {

            let query = `INSERT INTO user_tokens SET user_id=${userInfo.id}, token='${token}', created_at=NOW(), updated_at=NOW()`;
            c.log('query:', query)
            req.connection.query(query, function (err, results) {
                console.log('results:', results)
                if (err) {
                    callback(err);
                } else {
                    callback(null, token);
                }
            });
        }
        else {
            let query = `UPDATE user_tokens SET token='${token}', updated_at=NOW() WHERE user_id=${userInfo.id}`;
            c.log('query:', query)
            req.connection.query(query, function (err, results) {
                console.log('results:', results)
                if (err) {
                    callback(err);
                } else {
                    callback(null, token);
                }
            });
        }
    });
}

exports.logout = function (req, res, next) {

    try {
        let authorization = req.header('authorization');
        let token = authorization.replace('Bearer ', '');
        let query = `DELETE FROM user_tokens WHERE token='${token}'`;
        c.log('query:', query)
        req.connection.query(query, function (err, results) {
            if (err) {
                helper.sendErrorResponse(req, res, err);
            } else {
                let result = {
                    status: true,
                    message: 'Logout successfully.',
                }
                helper.sendResponse(req, res, result);
            }
        });
    }
    catch (err) {
        helper.sendErrorResponse(req, res, err);
    }
}

exports.create_account = async function (req, res, next) {

    try {
        let params = req.body;

        let data = {
            role: 'User',
            name: params.name,
            email: params.email,
            mobile: params.mobile,
            dob: params.dob,
            gender: params.gender,
            status: params.status,
        };
        req.connection.query(`INSERT INTO users SET ? , created_at=NOW(), updated_at=NOW()`, data, function(err, results){


            if (err) {
                helper.sendErrorResponse(req, res, err);
            } else {

                let insertId = results.insertId;

                // add user account settings 
                let query = `INSERT INTO user_settings SET user_id='${insertId}', created_at=NOW(), updated_at=NOW()`;
                req.connection.query(query, function (err, results) {

                    if (err) {
                        console.log('Account created, but error in account settings creation for the user-id:', insertId);
                    }
                });

                let result = {
                    status: true,
                    message: 'Account created successfully.',
                }
                helper.sendResponse(req, res, result);
            }
        });
    }
    catch (err) {
        helper.sendErrorResponse(req, res, err);
    }
}

exports.list_users = function (req, res, next) {

    try {
        let params = req.params;

        let query = `SELECT * FROM users WHERE role='User' AND deleted_at IS NULL`;
        req.connection.query(query, function (err, results, fields) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            } else {

                let rows = [];
                async.forEach(results, (rowInfo) => {
                    rows.push({
                        id: rowInfo.id,
                        role: rowInfo.role,
                        name: rowInfo.name,
                        email: rowInfo.email,
                        mobile: rowInfo.mobile,
                        gender: rowInfo.gender,
                        dob: helper.getFormatedDate(rowInfo.dob, 'YYYY-MM-DD'),
                        status: rowInfo.status,
                    });
                });

                let result = {
                    status: true,
                    message: 'List accounts.',
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

exports.detail_account = function (req, res, next) {

    try {
        let params = req.params;
        let user_id = (currentUser.id == params.user_id) ? currentUser.id : params.user_id;

        let query = `SELECT * FROM users WHERE id = ${user_id} AND deleted_at IS NULL`;
        req.connection.query(query, function (err, results, fields) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            }
            else if (!results.length) {
                helper.sendErrorResponse(req, res, 'Account not found.');
            }
            else {

                let rowInfo = results[0];
                let data = {
                    id: rowInfo.id,
                    user_id: rowInfo.id,
                    role: rowInfo.role,
                    name: rowInfo.name,
                    email: rowInfo.email,
                    mobile: rowInfo.mobile,
                    gender: rowInfo.gender,
                    dob: helper.getFormatedDate(rowInfo.dob, 'YYYY-MM-DD'),
                    status: rowInfo.status,
                    status_for_display: helper.getStatus(rowInfo.status),
                    created_at: helper.getFormatedDate(rowInfo.created_at),
                    updated_at: helper.getFormatedDate(rowInfo.updated_at),
                }

                let result = {
                    status: true,
                    message: 'Detail account.',
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

exports.update_account = function (req, res, next) {

    try {
        let params = req.body;
        let user_id = (currentUser.id == params.user_id) ? currentUser.id : params.user_id;
        let isSelf = (currentUser.id == params.user_id) ? true : false;

        let data = {};
        if (!isSelf) {
            data = {
                name: params.name,
                email: params.email,
                mobile: params.mobile,
                dob: params.dob,
                gender: params.gender,
                status: params.status,
            };
        } else {
            data = {
                name: params.name,
                email: params.email,
                mobile: params.mobile,
            };
        }
        req.connection.query(`UPDATE users SET ? , updated_at=NOW() WHERE id=${user_id}`, data, function(err, results){

            if (err) {
                helper.sendErrorResponse(req, res, err);
            } else {

                let result = {
                    status: true,
                    message: 'Account updated successfully.',
                }
                helper.sendResponse(req, res, result);
            }
        });

    }
    catch (err) {
        helper.sendErrorResponse(req, res, err);
    }
}

exports.change_password = function (req, res, next) {

    var params = req.body;
    console.log(currentUser.id, '==', params.user_id);
    let user_id = (currentUser.id == params.user_id) ? currentUser.id : params.user_id;
    let isSelf = (currentUser.id == params.user_id) ? true : false;

    let internalData = {};

    async.series([
        // function (do_callback) {
        //     // create databae req.connection
        //     req.connection.connect(function (err) {
        //         if (err) {
        //             do_callback(err);
        //         } else {
        //             do_callback();
        //         }
        //     });
        // },
        function (do_callback) {
            let query = `SELECT * FROM users WHERE id = ${user_id}`;
            req.connection.query(query, function (err, results, fields) {

                if (err) {
                    do_callback(err);
                }
                else if (!results.length) {
                    do_callback('Account not found.');
                }
                else {
                    internalData.rowInfo = results[0];
                    do_callback();
                }
            });
        },
        function (do_callback) {
            if (isSelf) {
                helper.matchPassword(params.old_password, internalData.rowInfo.password, (err, status) => {
                    if (err) {
                        do_callback(err);
                    }
                    else if (!status) {
                        do_callback('Old password are not match.');
                    }
                    else {
                        do_callback();
                    }
                });
            } else {
                do_callback();
            }
        },
        function (do_callback) {
            helper.generatePassword(params.password, (err, hashPassword) => {
                if (err) {
                    do_callback(err);
                } else {
                    internalData.hashPassword = hashPassword;
                    do_callback();
                }
            });
        },
        function (do_callback) {
            let query = `UPDATE users SET password='${internalData.hashPassword}', updated_at=NOW() WHERE id=${internalData.rowInfo.id}`;
            req.connection.query(query, function (err, results) {

                if (err) {
                    do_callback(err);
                } else {
                    do_callback();
                }
            });
        },
    ], function (err) {
        // req.connection.end(); // end req.connection here 
        if (err) {
            helper.sendErrorResponse(req, res, err);
        } else {

            let result = {
                status: true,
                message: 'Password changed successfully.',
            }
            helper.sendResponse(req, res, result);
        }
    });
}

exports.change_status = function (req, res, next) {

    try {
        let params = req.params;

        let query = `UPDATE users SET status=${params.status}, updated_at=NOW() WHERE id=${params.user_id}`;
        req.connection.query(query, function (err, results) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            } else {

                let result = {
                    status: true,
                    message: 'Account status updated successfully.',
                }
                helper.sendResponse(req, res, result);
            }
        });
    }
    catch (err) {
        helper.sendErrorResponse(req, res, err);
    }
}

exports.update_account_settings = function (req, res, next) {

    try {
        let params = req.body;
        let user_id = (currentUser.id == params.user_id) ? currentUser.id : params.user_id;

        if (params.margin_per && params.margin_fix) {
            helper.sendErrorResponse(req, res, 'You can not set both type margin at same time.');
        }
        else if (params.margin_per > 100) {
            helper.sendErrorResponse(req, res, 'You can not set margin more then 100%');
        }
        else {

            let query = `UPDATE users SET margin_per='${params.margin_per}', margin_fix='${params.margin_fix}', is_betting_locked=${params.is_betting_locked}, status=${params.status}, updated_at=NOW() WHERE id=${user_id}`;
            c.log('query:', query);
            req.connection.query(query, function (err, results) {

                if (err) {
                    helper.sendErrorResponse(req, res, err);
                } else {

                    let result = {
                        status: true,
                        message: 'Account settings updated successfully.',
                    }
                    helper.sendResponse(req, res, result);
                }
            });
        }
    }
    catch (err) {
        helper.sendErrorResponse(req, res, err);
    }
}

exports.delete_account = function (req, res, next) {

    try {
        let params = req.params;
        let user_id = params.user_id;

        let query = `SELECT * FROM users WHERE id = ${user_id} AND deleted_at IS NULL`;
        req.connection.query(query, function (err, results, fields) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            }
            else if (!results.length) {
                helper.sendErrorResponse(req, res, 'Account is not found, may be already deleted.');
            }
            else {

                let query = `UPDATE users SET deleted_at=NOW(), updated_at=NOW() WHERE id=${user_id}`;
                req.connection.query(query, function (err, results) {

                    if (err) {
                        helper.sendErrorResponse(req, res, err);
                    } else {

                        let result = {
                            status: true,
                            message: 'Account deleted successfully.',
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

exports.archive_users = function (req, res, next) {

    try {
        let params = req.params;

        let query = `SELECT * FROM users WHERE role='User' AND deleted_at IS NOT NULL`;
        req.connection.query(query, function (err, results, fields) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            } else {

                let rows = [];
                async.forEach(results, (rowInfo) => {
                    rows.push({
                        id: rowInfo.id,
                        role: rowInfo.role,
                        name: rowInfo.name,
                        email: rowInfo.email,
                        mobile: rowInfo.mobile,
                        gender: rowInfo.gender,
                        deleted_at: helper.getFormatedDate(rowInfo.deleted_at),
                        status: rowInfo.status,
                    });
                });

                let result = {
                    status: true,
                    message: 'List accounts.',
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

exports.restore_account = function (req, res, next) {

    try {
        let params = req.params;
        let user_id = params.user_id;

        let query = `SELECT * FROM users WHERE id = ${user_id} AND deleted_at IS NOT NULL`;
        req.connection.query(query, function (err, results, fields) {

            if (err) {
                helper.sendErrorResponse(req, res, err);
            }
            else if (!results.length) {
                helper.sendErrorResponse(req, res, 'Account is not found, may be already restored.');
            }
            else {

                let query = `UPDATE users SET deleted_at=NULL, updated_at=NOW() WHERE id=${user_id}`;
                req.connection.query(query, function (err, results) {

                    if (err) {
                        helper.sendErrorResponse(req, res, err);
                    } else {

                        let result = {
                            status: true,
                            message: 'Account restored successfully.',
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
