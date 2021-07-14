const fileUpload = require('express-fileupload');
const fs = require('fs');
const mysql = require('mysql');
require('dotenv').config();

// Connection Pool
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.ITEM_DB_HOST,
    user: process.env.ITEM_DB_USER,
    password: process.env.ITEM_DB_PASS,
    databse: process.env.ITEM_DB_NAME
});

//====================================================================================================================================

// View users
exports.view = (req, res) => {
    // Connect to DB
    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log('Connected as ID ' + connection.threadId);
        // Use the connection
        connection.query('USE jackson_catalog');
        connection.query('SELECT * FROM items ORDER BY `catagory` ASC', (err, rows) => {
            // Whem done with connection, release it
            connection.release();
            if (!err) {
                let removedItem = req.query.removed;
                let editedItem = req.query.edited;
                let addedItem = req.query.added;
                let error = req.query.error;
                res.render('item-catalog', { rows, error, removedItem, editedItem, addedItem });
            } else {
                let error = encodeURIComponent(`Error`);
                res.redirect('/item-catalog?error=' + error);
            }
            //console.log('The data from table: \n', rows);
        });
    });
};

//====================================================================================================================================

// Find Item by search
exports.find = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log('Connected as ID ' + connection.threadId);

        let searchTerm = req.body.search;

        // Use the connection
        connection.query('USE jackson_catalog');
        connection.query('SELECT * FROM items WHERE title LIKE ? OR descr LIKE ? OR mnfctr LIKE ? ORDER BY `catagory` ASC', ['%' + searchTerm + '%', '%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {
            // Whem done with connection, release it
            connection.release();
            if (!err) {
                res.render('item-catalog', { rows });
            } else {
                // console.log(err);
                let error = encodeURIComponent(`Error`);
                res.redirect('/item-catalog?error=' + error);
            }
            //console.log('The data from table: \n', rows);
        });
    });
}

//====================================================================================================================================

exports.form = (req, res) => {
    res.render('add-item');
}

// add new item
exports.create = (req, res) => {

    const { title, descr, orgin, current, catagory, strg_amnt_gb, mem_amnt_mb, mnfctr, frm_fctr, part_num, serial_num } = req.body;

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log('Connected as ID ' + connection.threadId);

        let sampleFile;
        let uploadPath;

        if (!req.files || Object.keys(req.files).length === 0) {
            // Use the connection
            connection.query('USE jackson_catalog');
            connection.query('INSERT INTO items SET title = ?, descr = ?, orgin = ?, current = ?, catagory = ?, strg_amnt_gb = ?, mem_amnt_mb = ?, mnfctr = ?, frm_fctr = ?, part_num = ?, serial_num = ?', [title, descr, orgin, current, catagory, strg_amnt_gb, mem_amnt_mb, mnfctr, frm_fctr, part_num, serial_num], (err, rows) => {
                // Whem done with connection, release it
                connection.release();
                if (!err) {
                    // res.render('add-item', { alert: `${title} has been added successfully.` });
                    let addedItem = encodeURIComponent(`${title}`);
                    res.redirect('/item-catalog?added=' + addedItem);
                } else {
                    // console.log(err);
                    let error = encodeURIComponent(`Error`);
                    res.redirect('/item-catalog?error=' + error);
                }
                //console.log('The data from table: \n', rows);
            });
        } else {

            sampleFile = req.files.itemImage;
            uploadPath = '.' + '/upload/' + sampleFile.name;

            sampleFile.mv(uploadPath, function (err) {
                if (err) return res.status(500).send(err);

                const data = readImageFile(uploadPath);

                // Use the connection
                connection.query('USE jackson_catalog');
                connection.query('INSERT INTO items SET title = ?, descr = ?, orgin = ?, current = ?, catagory = ?, strg_amnt_gb = ?, mem_amnt_mb = ?, mnfctr = ?, frm_fctr = ?, image = BINARY(?), part_num = ?, serial_num = ?', [title, descr, orgin, current, catagory, strg_amnt_gb, mem_amnt_mb, mnfctr, frm_fctr, data, part_num, serial_num], (err, rows) => {
                    // Whem done with connection, release it
                    connection.release();
                    if (!err) {
                        // res.render('add-item', { alert: `${title} has been added successfully.` });
                        let addedItem = encodeURIComponent(`${title}`);
                        res.redirect('/item-catalog?added=' + addedItem);
                    } else {
                        // console.log(err);
                        let error = encodeURIComponent(`Error`);
                        res.redirect('/item-catalog?error=' + error);
                    }
                    //console.log('The data from table: \n', rows);
                });
            });
        }
    });
}

function readImageFile(file) {
    // read binary data from a file:
    const bitmap = fs.readFileSync(file);
    const buf = new Buffer(bitmap);
    return buf;
}

//====================================================================================================================================

// Edit items
exports.edit = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log('Connected as ID ' + connection.threadId);
        // Use the connection
        connection.query('USE jackson_catalog');
        connection.query('SELECT * FROM items WHERE id = ?', [req.params.id], (err, rows) => {
            // Whem done with connection, release it
            connection.release();
            if (!err) {
                res.render('edit-item', { rows });
            } else {
                // console.log(err);
                let error = encodeURIComponent(`Error`);
                res.redirect('/item-catalog?error=' + error);
            }
            //console.log('The data from table: \n', rows);
        });
    });
};

//Update item
exports.update = (req, res) => {
    const { title, descr, orgin, current, catagory, strg_amnt_gb, mem_amnt_mb, mnfctr, frm_fctr, itemImage, part_num, serial_num } = req.body;

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log('Connected as ID ' + connection.threadId);

        let sampleFile;
        let uploadPath;

        if (!req.files || Object.keys(req.files).length === 0) {
            connection.query('UPDATE items SET title = ?, descr = ?, orgin = ?, current = ?, catagory = ?, strg_amnt_gb = ?, mem_amnt_mb = ?, mnfctr = ?, frm_fctr = ?, part_num = ?, serial_num = ? WHERE id = ?', [title, descr, orgin, current, catagory, strg_amnt_gb, mem_amnt_mb, mnfctr, frm_fctr, part_num, serial_num, req.params.id], (err, rows) => {
                // Whem done with connection, release it
                connection.release();
                if (!err) {
                    pool.getConnection((err, connection) => {
                        if (err) throw err; // not connected
                        console.log('Connected as ID ' + connection.threadId);
                        // Use the connection
                        connection.query('USE jackson_catalog');
                        connection.query('SELECT * FROM items WHERE id = ?', [req.params.id], (err, rows) => {
                            // Whem done with connection, release it
                            connection.release();
                            if (!err) {
                                // res.render('edit-item', { rows, alert: `${title} has been updated.` });
                                let editedItem = encodeURIComponent(`${title}`);
                                res.redirect('/item-catalog?edited=' + editedItem);
                            } else {
                                // console.log(err);
                                let error = encodeURIComponent(`Error`);
                                res.redirect('/item-catalog?error=' + error);
                            }
                            //console.log('The data from table: \n', rows);
                        });
                    });
                } else {
                    // console.log(err);
                    let error = encodeURIComponent(`Error`);
                    res.redirect('/item-catalog?error=' + error);
                }
                //console.log('The data from table: \n', rows);
            });
        } else {
            console.log("Image")
            sampleFile = req.files.itemImage;
            uploadPath = '.' + '/upload/' + sampleFile.name;

            sampleFile.mv(uploadPath, function (err) {
                if (err) return res.status(500).send(err);

                const data = readImageFile(uploadPath);

                // Use the connection
                connection.query('USE jackson_catalog');
                connection.query('UPDATE items SET title = ?, descr = ?, orgin = ?, current = ?, catagory = ?, strg_amnt_gb = ?, mem_amnt_mb = ?, mnfctr = ?, frm_fctr = ?, image = BINARY(?), part_num = ?, serial_num = ? WHERE id = ?', [title, descr, orgin, current, catagory, strg_amnt_gb, mem_amnt_mb, mnfctr, frm_fctr, data, part_num, serial_num, req.params.id], (err, rows) => {
                    console.log(err);
                    // Whem done with connection, release it
                    connection.release();
                    if (!err) {
                        pool.getConnection((err, connection) => {
                            if (err) throw err; // not connected
                            console.log('Connected as ID ' + connection.threadId);

                            sampleFile = req.files.itemImage;
                            uploadPath = '.' + '/upload/' + sampleFile.name;

                            sampleFile.mv(uploadPath, function (err) {
                                if (err) return res.status(500).send(err);

                                const data = readImageFile(uploadPath);

                                // Use the connection
                                connection.query('USE jackson_catalog');
                                connection.query('SELECT * FROM items WHERE id = ?', [req.params.id], (err, rows) => {
                                    // Whem done with connection, release it
                                    connection.release();
                                    if (!err) {
                                        // res.render('edit-item', { rows, alert: `${title} has been updated.` });
                                        let editedItem = encodeURIComponent(`${title}`);
                                        res.redirect('/item-catalog?edited=' + editedItem);
                                    } else {
                                        // console.log(err);
                                        let error = encodeURIComponent(`Error`);
                                        res.redirect('/item-catalog?error=' + error);
                                    }
                                    //console.log('The data from table: \n', rows);
                                });
                            });
                        });
                    } else {
                        // console.log(err);
                        let error = encodeURIComponent(`Error`);
                        res.redirect('/item-catalog?error=' + error);
                    }
                    //console.log('The data from table: \n', rows);
                });

            });
        }
    });
};

//====================================================================================================================================

// Delete item
exports.delete = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log('Connected as ID ' + connection.threadId);
        // Use the connection
        connection.query('USE jackson_catalog');
        connection.query('DELETE FROM items WHERE id = ?', [req.params.id], (err, rows) => {
            // Whem done with connection, release it
            connection.release();
            if (!err) {
                let rmovedItem = encodeURIComponent('Item removed.');
                res.redirect('/item-catalog?removed=' + rmovedItem);
            } else {
                // console.log(err);
                let error = encodeURIComponent(`Error`);
                res.redirect('/item-catalog?error=' + error);
            }
            //console.log('The data from table: \n', rows);
        });
    });
};

//====================================================================================================================================

// View items
exports.viewall = (req, res) => {
    // Connect to DB
    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        //console.log('Connected as ID ' + connection.threadId);
        // Use the connection
        connection.query('USE jackson_catalog');
        connection.query('SELECT * FROM items WHERE id = ?', [req.params.id], (err, rows) => {
            // Whem done with connection, release it
            connection.release();
            if (!err) {
                try {
                    var blob = rows[0]["image"];
                    var base = Buffer.from(blob);
                    var conversion = base.toString('base64');
                    //var send = 'data:image;base64,'+conversion+'';
                    var send = 'data:image/png;base64,' + conversion + '';
                    //console.log(conversion);
                    res.render('view-item', { rows, send });
                } catch {
                    send = ""
                    res.render('view-item', { rows, send });
                } finally {
                    send = ""
                    res.render('view-item', { rows, send });
                }
            } else {
                // console.log(err);
                let error = encodeURIComponent(`Error`);
                res.redirect('/item-catalog?error=' + error);
            }
            //console.log('The data from table: \n', rows);
        });
    });
};

//====================================================================================================================================