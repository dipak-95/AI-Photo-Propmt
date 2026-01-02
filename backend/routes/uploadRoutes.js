const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/', upload.single('image'), (req, res) => {
    // Return relative path. In server.js we will serve 'uploads' folder static.
    // The client will need to prepend server URL.
    res.send({
        filePath: `/uploads/${req.file.filename}`,
        fileName: req.file.filename
    });
});

module.exports = router;
