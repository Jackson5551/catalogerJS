const mysql = require('mysql');
const fileUpload = require('express-fileupload');
const fs = require('fs');
require('dotenv').config();

// Connection Pool
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.SFTWR_DB_HOST,
    user: process.env.SFTWR_DB_USER,
    password: process.env.SFTWR_DB_PASS,
    databse: process.env.SFTWR_DB_NAME
});

//====================================================================================================================================

exports.view = (req, res) => {
    // Connect to DB
    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log('Connected as ID ' + connection.threadId);
        // Use the connection
        connection.query('USE jackson_catalog');
        connection.query('SELECT * FROM software ORDER BY `catagory` ASC', (err, rows) => {
            // Whem done with connection, release it
            connection.release();
            if (!err) {
                let removedSoftware = req.query.removed;
                let editedSoftware = req.query.edited;
                let addedSoftware = req.query.added;
                let error = req.query.error;
                res.render('software-catalog', { rows, error, removedSoftware, editedSoftware, addedSoftware });
            } else {
                console.log(err);
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
        connection.query('SELECT * FROM software WHERE name LIKE ? OR mnfctr LIKE ? OR version LIKE ? ORDER BY `catagory` ASC', ['%' + searchTerm + '%', '%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {
            // Whem done with connection, release it
            connection.release();
            if (!err) {
                res.render('software-catalog', { rows });
            } else {
                // console.log(err);
                let error = encodeURIComponent(`Error`);
                res.redirect('/software-catalog?error=' + error);
            }
            //console.log('The data from table: \n', rows);
        });
    });
}

//====================================================================================================================================

exports.form = (req, res) => {
    res.render('add-software');
}

// add new item
exports.create = (req, res) => {

    const { name, mnfctr, version, format, num_of_media, architecture, catagory, prod_key } = req.body;

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log('Connected as ID ' + connection.threadId);

        let sampleFile;
        let uploadPath;

        console.log("File Stuff: ", req.files);
        if (!req.files || Object.keys(req.files).length === 0) {
            connection.query('USE jackson_catalog');
            connection.query('INSERT INTO software SET name = ?, mnfctr = ?, version = ?, format = ?, num_of_media = ?, architecture = ?, catagory = ?, prod_key = ?', [name, mnfctr, version, format, num_of_media, architecture, catagory, prod_key], (err, rows) => {
                id = req.params.id
                //connection.query("INSERT INTO `software`(image) VALUES(BINARY(:data)) WHERE id = :id", { data, id});
                // Whem done with connection, release it
                connection.release();
                if (!err) {
                    // res.render('software-catalog', { alert: `${name} has been added successfully.` });
                    let addedSoftware = encodeURIComponent(`${name}`);
                    res.redirect('/software-catalog?added=' + addedSoftware);
                } else {
                    // console.log(err);
                    let error = encodeURIComponent(`Error`);
                    res.redirect('/software-catalog?error=' + error);
                }
                //console.log('The data from table: \n', rows);
            });
        } else {

            sampleFile = req.files.softwareImage;
            uploadPath = '.' + '/upload/' + sampleFile.name;

            // console.log(sampleFile);
            // console.log(uploadPath);

            sampleFile.mv(uploadPath, function (err) {
                if (err) return res.status(500).send(err);

                const data = readImageFile(uploadPath);

                // Use the connection
                connection.query('USE jackson_catalog');
                connection.query('INSERT INTO software SET name = ?, mnfctr = ?, version = ?, format = ?, num_of_media = ?, architecture = ?, catagory = ?, prod_key = ?, image = BINARY(?)', [name, mnfctr, version, format, num_of_media, architecture, catagory, prod_key, data], (err, rows) => {
                    id = req.params.id
                    //connection.query("INSERT INTO `software`(image) VALUES(BINARY(:data)) WHERE id = :id", { data, id});
                    // Whem done with connection, release it
                    connection.release();
                    if (!err) {
                        // res.render('add-software', { alert: `${name} has been added successfully.` });
                        let addedSoftware = encodeURIComponent(`${name}`);
                        res.redirect('/software-catalog?added=' + addedSoftware);
                    } else {
                        // console.log(err);
                        let error = encodeURIComponent(`Error`);
                        res.redirect('/software-catalog?error=' + error);
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
        connection.query('SELECT * FROM software WHERE id = ?', [req.params.id], (err, rows) => {
            // Whem done with connection, release it
            connection.release();
            if (!err) {
                res.render('edit-software', { rows });
            } else {
                // console.log(err);
                let error = encodeURIComponent(`Error`);
                res.redirect('/software-catalog?error=' + error);
            }
            //console.log('The data from table: \n', rows);
        });
    });
};

exports.update = (req, res) => {
    const { name, mnfctr, version, format, num_of_media, architecture, catagory, prod_key } = req.body;
    console.log("Body: ",req.body)
    console.log(name);
    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log('Connected as ID ' + connection.threadId);

        console.log("File Stuff: ", req.files);
        console.log("File Stuff: ", req.params.id);

            let sampleFile;
            let uploadPath;

        if (!req.files || Object.keys(req.files).length === 0) {
            console.log('No Image')
            // Use the connection
            connection.query('USE jackson_catalog');
            connection.query('UPDATE software SET name = ?, mnfctr = ?, version = ?, format = ?, num_of_media = ?, architecture = ?, catagory = ?, prod_key = ? WHERE id = ?', [name, mnfctr, version, format, num_of_media, architecture, catagory, prod_key, req.params.id], (err, rows) => {
                // Whem done with connection, release it
                connection.release();
                if (!err) {
                    pool.getConnection((err, connection) => {
                        if (err) throw err; // not connected
                        console.log('Connected as ID ' + connection.threadId);
                        // Use the connection
                        connection.query('USE jackson_catalog');
                        connection.query('SELECT * FROM software ORDER BY `catagory` ASC', (err, rows) => {
                            // Whem done with connection, release it
                            connection.release();
                            if (!err) {
                                console.log(rows);
                                // res.render('software-catalog', { rows, alert: `${name} has been updated.` });
                                let editedsoftware = encodeURIComponent(`${name}`);
                                res.redirect('/software-catalog?edited=' + editedsoftware);
                            } else {
                                // console.log(err);
                                let error = encodeURIComponent(`Error`);
                                res.redirect('/software-catalog?error=' + error);
                            }
                            //console.log('The data from table: \n', rows);
                        });
                    });
                } else{
                    // console.log(err);
                    let error = encodeURIComponent(`Error`);
                    res.redirect('/software-catalog?error=' + error);
                }
            });
        } else {
            console.log('Image')
            sampleFile = req.files.softwareImage;
            uploadPath = '.' + '/upload/' + sampleFile.name;

            // console.log(sampleFile);
            // console.log(uploadPath);

            sampleFile.mv(uploadPath, function (err) {
                if (err) return res.status(500).send(err);
                console.log('Before Read')
                const data = readImageFile(uploadPath);
                console.log('After Read')
                // Use the connection
                connection.query('USE jackson_catalog');
                connection.query('UPDATE software SET name = ?, mnfctr = ?, version = ?, format = ?, num_of_media = ?, architecture = ?, catagory = ?, image = BINARY(?), prod_key = ? WHERE id = ?', [name, mnfctr, version, format, num_of_media, architecture, catagory, data, prod_key, req.params.id], (err, rows) => {
                    // Whem done with connection, release it
                    console.log('After Insert')
                    connection.release();
                    console.log('After Relase')
                    if (!err) {
                        pool.getConnection((err, connection) => {
                            if (err) throw err; // not connected
                            console.log('Connected as ID ' + connection.threadId);
                            console.log('ID: ', req.params.id)
                            // Use the connection
                            connection.query('USE jackson_catalog');
                            connection.query('SELECT * FROM software WHERE id = ?', [req.params.id], (err, rows) => {
                                // Whem done with connection, release it
                                connection.release();
                                if (!err) {
                                    // console.log('The data from table: \n', rows);
                                    // res.render('edit-software', { rows, alert: `${name} has been updated.` });
                                    let editedsoftware = encodeURIComponent(`${name}`);
                                    res.redirect('/software-catalog?edited=' + editedsoftware);
                                } else {
                                    // console.log(err);
                                    let error = encodeURIComponent(`Error`);
                                    res.redirect('/software-catalog?error=' + error);
                                }
                                // console.log('The data from table: \n', rows);
                            });
                        });
                    } else {
                        // console.log(err);
                        let error = encodeURIComponent(`Error`);
                        res.redirect('/software-catalog?error=' + error);
                    }
                });
            });
        };
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
        connection.query('DELETE FROM software WHERE id = ?', [req.params.id], (err, rows) => {
            // Whem done with connection, release it
            connection.release();
            if (!err) {
                let removedSoftware = encodeURIComponent('Removed');
                res.redirect('/software-catalog?removed=' + removedSoftware);
            } else {
                // console.log(err);
                let error = encodeURIComponent(`Error`);
                res.redirect('/software-catalog?error=' + error);
            }
            //console.log('The data from table: \n', rows);
        });
    });
};

//====================================================================================================================================

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
                // console.log(err);
                let error = encodeURIComponent(`Error`);
                res.redirect('/software-catalog?error=' + error);
            }
            //console.log('The data from table: \n', rows);
        });
    });
};

//====================================================================================================================================