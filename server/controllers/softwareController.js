const mysql = require('mysql');
const fileUpload = require('express-fileupload');
require('dotenv').config();

// Connection Pool
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.SFTWR_DB_HOST,
    user: process.env.SFTWR_DB_USER,
    password: process.env.SFTWR_DB_PASS,
    databse: process.env.SFTWR_DB_NAME
});

exports.view = (req, res) =>{
    // Connect to DB
    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log('Connected as ID ' + connection.threadId);
        // Use the connection
        connection.query('USE jackson_catalog');
        connection.query('SELECT * FROM software ORDER BY `name` ASC', (err, rows) => {
            // Whem done with connection, release it
            connection.release();
            if (!err) {
                let removedSoftware = req.query.removed;
                res.render('software-catalog', { rows, removedSoftware });
            } else {
                console.log(err);
            }
            //console.log('The data from table: \n', rows);
        });
    });
};

// Find Item by search
exports.find = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log('Connected as ID ' + connection.threadId);

        let searchTerm = req.body.search;

        // Use the connection
        connection.query('USE jackson_catalog');
        connection.query('SELECT * FROM software WHERE name LIKE ? OR mnfctr LIKE ? OR version LIKE ?', ['%' + searchTerm + '%', '%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {
            // Whem done with connection, release it
            connection.release();
            if (!err) {
                res.render('software-catalog', { rows });
            } else {
                console.log(err);
            }
            //console.log('The data from table: \n', rows);
        });
    });
}

exports.form = (req, res) => {
    res.render('add-software');
}

// add new item
exports.create = (req, res) => {

    const { name, mnfctr, version, format, num_of_media, architecture, prod_key } = req.body;

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log('Connected as ID ' + connection.threadId);

        let searchTerm = req.body.search;

        // Use the connection
        connection.query('USE jackson_catalog');
        connection.query('INSERT INTO software SET name = ?, mnfctr = ?, version = ?, format = ?, num_of_media = ?, architecture = ?, prod_key = ?', [name, mnfctr, version, format, num_of_media, architecture, prod_key], (err, rows) => {
            // Whem done with connection, release it
            connection.release();
            if (!err) {
                res.render('add-software', { alert: `${name} has been added successfully.` });
            } else {
                console.log(err);
            }
            //console.log('The data from table: \n', rows);
        });
    });
}

// Edit items
exports.edit = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log('Connected as ID ' + connection.threadId);
        // Use the connection
        connection.query('USE jackson_catalog');
        connection.query('SELECT * FROM software WHERE id = ?', [req.params.id], (err, rows) => {
            // Whem done with connection, release it
            connection.release();
            if (!err) {
                res.render('edit-software', { rows });
            } else {
                console.log(err);
            }
            //console.log('The data from table: \n', rows);
        });
    });
};

exports.update = (req, res) => {
    const { name, mnfctr, version, format, num_of_media, architecture, prod_key } = req.body;

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log('Connected as ID ' + connection.threadId);
        // Use the connection
        connection.query('USE jackson_catalog');
        connection.query('UPDATE software SET name = ?, mnfctr = ?, version = ?, format = ?, num_of_media = ?, architecture = ?, prod_key = ?', [name, mnfctr, version, format, num_of_media, architecture, prod_key], (err, rows) => {
            // Whem done with connection, release it
            connection.release();
            if (!err) {
                pool.getConnection((err, connection) => {
                    if (err) throw err; // not connected
                    console.log('Connected as ID ' + connection.threadId);
                    // Use the connection
                    connection.query('USE jackson_catalog');
                    connection.query('SELECT * FROM software WHERE id = ?', [req.params.id], (err, rows) => {
                        // Whem done with connection, release it
                        connection.release();
                        if (!err) {
                            res.render('edit-software', { rows, alert: `${name} has been updated.` });
                        } else {
                            console.log(err);
                        }
                        //console.log('The data from table: \n', rows);
                    });
                });
            } else {
                console.log(err);
            }
            //console.log('The data from table: \n', rows);
        });
    });
};

// Delete item
exports.delete = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log('Connected as ID ' + connection.threadId);
        // Use the connection
        connection.query('USE jackson_catalog');
        connection.query('DELETE FROM software WHERE id = ?', [req.params.id], (err, rows) => {
            // Whem done with connection, release it
            connection.release();
            if (!err) {
                let removedSoftware = encodeURIComponent('Item removed.');
                res.redirect('/software-catalog?removed=' + removedSoftware);
            } else {
                console.log(err);
            }
            //console.log('The data from table: \n', rows);
        });
    });
};

exports.viewall = (req, res) => {
    // Connect to DB
    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        //console.log('Connected as ID ' + connection.threadId);
        // Use the connection
        connection.query('USE jackson_catalog');
        connection.query('SELECT * FROM software WHERE id = ?', [req.params.id], (err, rows) => {
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
                    res.render('view-software', { rows, send });
                } catch {
                    send = ""
                    res.render('view-software', { rows, send });
                } finally {
                    send = ""
                    res.render('view-software', { rows, send });
                }
            } else {
                console.log(err);
            }
            //console.log('The data from table: \n', rows);
        });
    });
};