// const pool = require('../config/database');
const S3 = require('../config/aws').S3;
const fs = require('fs');
const sharp = require('sharp');
module.exports = {
    upload: (req, res) => {
        const file = req.file;
        let width = 500;
        let height = 500;
        // console.log(file);
        if (file.size > 5000000) {
            res.json({
                status: 0,
                message: "Dung lượng ảnh không được vượt quá 5Mb"
            })
        } else {
            if (req.query.width) {
                width = Number(req.query.width);
            }

            if (req.query.height) {
                height = Number(req.query.height);
            }


            // file.originalname.split(".").pop();
            // fs.createReadStream(file.path)
            if (file.mimetype !== 'image/gif') {
                const fileName = file.filename;

                const date = new Date();
                const photoKey = "tmp/" + fileName + date.getMilliseconds() + ".jpg";
                sharp(file.path)
                    .resize(width, height)
                    .max()
                    .toBuffer()
                    .then(function (outputBuffer) {
                        S3.upload({
                            Key: photoKey,
                            Body: outputBuffer,
                            ContentType: "image/jpeg",
                            ACL: 'public-read'
                        }, function (err, data) {
                            fs.unlink(file.path);
                            if (err) {
                                return console.log(err);
                            }
                            res.json({
                                status: 1,
                                data: Object.assign({}, data, {
                                    photo_key: photoKey,
                                    url: process.env.S3_URL + "/" + photoKey
                                })
                            });
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                        res.json(error);
                    });
            } else {
                const fileName = file.filename;

                const date = new Date();
                const photoKey = "tmp/" + fileName + date.getMilliseconds() + ".gif";
                S3.upload({
                    Key: photoKey,
                    Body: fs.createReadStream(file.path),
                    ContentType: "image/gif",
                    ACL: 'public-read'
                }, function (err, data) {
                    fs.unlink(file.path);
                    if (err) {
                        return console.log(err);
                    }
                    res.json({
                        status: 1,
                        data: Object.assign({}, data, {
                            photo_key: photoKey,
                            url: process.env.S3_URL + "/" + photoKey
                        })
                    });
                });
            }


        }

    }
};
