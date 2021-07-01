const { response } = require('express');
const mysql = require('mysql');
//const  connect  = require('../routes/items');
require('dotenv').config();

// Connection Pool
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.PASS,
    databse: process.env.DB_NAME
});
console.log(process.env.DB_NAME);

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
                res.render('home', { rows, removedItem});
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
        connection.query('SELECT * FROM items WHERE title LIKE ? OR descr LIKE ? OR mnfctr LIKE ?', ['%' + searchTerm + '%', '%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {
            // Whem done with connection, release it
            connection.release();
            if (!err) {
                res.render('home', { rows });
            } else {
                console.log(err);
            }
            //console.log('The data from table: \n', rows);
        });
    });
}

exports.form = (req, res) =>{
    res.render('add-item');
}

// add new item
exports.create = (req, res) => {

    const { title, descr, orgin, current, catagory, strg_amnt_gb, mem_amnt_mb, mnfctr, frm_fctr } = req.body;

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log('Connected as ID ' + connection.threadId);

        let searchTerm = req.body.search;

        // Use the connection
        connection.query('USE jackson_catalog');
        connection.query('INSERT INTO items SET title = ?, descr = ?, orgin = ?, current = ?, catagory = ?, strg_amnt_gb = ?, mem_amnt_mb = ?, mnfctr = ?, frm_fctr = ?', [title, descr, orgin, current, catagory, strg_amnt_gb, mem_amnt_mb, mnfctr, frm_fctr], (err, rows) => {
            // Whem done with connection, release it
            connection.release();
            if (!err) {
                res.render('add-item', { alert: `${title} has been added successfully.`});
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
        connection.query('SELECT * FROM items WHERE id = ?', [req.params.id], (err, rows) => {
            // Whem done with connection, release it
            connection.release();
            if (!err) {
                res.render('edit-item', { rows });
            } else {
                console.log(err);
            }
            //console.log('The data from table: \n', rows);
        });
    });
};

//Update item
exports.update = (req, res) => {
    const { title, descr, orgin, current, catagory, strg_amnt_gb, mem_amnt_mb, mnfctr, frm_fctr } = req.body;

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log('Connected as ID ' + connection.threadId);
        // Use the connection
        connection.query('USE jackson_catalog');
        connection.query('UPDATE items SET title = ?, descr = ?, orgin = ?, current = ?, catagory = ?, strg_amnt_gb = ?, mem_amnt_mb = ?, mnfctr = ?, frm_fctr = ? WHERE id = ?', [title, descr, orgin, current, catagory, strg_amnt_gb, mem_amnt_mb, mnfctr, frm_fctr, req.params.id], (err, rows) => {
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
                            res.render('edit-item', { rows, alert: `${title} has been updated.` });
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
        connection.query('DELETE FROM items WHERE id = ?', [req.params.id], (err, rows) => {
            // Whem done with connection, release it
            connection.release();
            if (!err) {
                let rmovedItem = encodeURIComponent('Item removed.');
                res.redirect('/?removed=' + rmovedItem);
            } else {
                console.log(err);
            }
            //console.log('The data from table: \n', rows);
        });
    });
};

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
                try{
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
                console.log(err);
            }
            //console.log('The data from table: \n', rows);
        });
    });
};