const multer = require('multer');
const mkdirp = require('mkdirp');
const fs = require('fs');

const getDirImage = () => {
    return `./public/images/users`;
}

const ImageStorage = multer.diskStorage({
    destination : (req , file , cb) => {
        let dir = getDirImage();

        mkdirp(dir , (err) => cb(null , dir))
    },
    filename : (req , file , cb) => {
        let filePath = getDirImage() + '/' + file.originalname;
        if(!fs.existsSync(filePath))
            cb(null , file.originalname);
        else
            cb(null , Date.now() + '-' + file.originalname);
            
    }
})

const uploadImage = multer({
    storage : ImageStorage,
    limits : {
        fileSize : 1024 * 1024 * 10
    }
});

module.exports = uploadImage;