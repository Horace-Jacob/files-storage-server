import express from "express";
import mongoose from "mongoose";
import FileSchema from "../models/FileModel.js";
import GridFsStorage from "multer-gridfs-storage";
import multer from "multer";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import os from "os";

const promise = mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
});

const connect = mongoose.createConnection(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;

connect.once("open", () => {
  // initialize stream
  gfs = new mongoose.mongo.GridFSBucket(connect.db, {
    bucketName: "uploads",
  });
});

const storage = new GridFsStorage({
  db: promise,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage });

const router = express.Router();

router.post("/", upload.single("file"), (req, res, next) => {
  let newFile = new FileSchema({
    fileSize: req.body.fileSize,
    displayName: req.body.displayName,
    userId: req.body.userId,
    filename: req.file.filename,
    fileId: req.file.id,
  });

  newFile
    .save()
    .then((image) => {
      res.status(200).json({
        success: true,
        image,
      });
    })
    .catch((err) => res.status(500).json(err));
});

router.post("/fetchfiles", async (req, res) => {
  const getAllRespectiveImages = await FileSchema.find({
    userId: req.body.userId,
  }).sort({ createdAt: -1 });

  res.status(200).json(getAllRespectiveImages);
});

router.post("/delete", async (req, res) => {
  if (!mongoose.Types.ObjectId(req.body.id))
    return res.status(404).json({ message: "Invalid Id" });
  await FileSchema.findByIdAndRemove(req.body.id);
  gfs.delete(req.body.id, (err, data) => {
    res.status(200).json({
      success: true,
      message: `File with ID ${req.body.id} is deleted`,
    });
  });
});

router.post("/download", async (req, res) => {
  const { filename, mimetype, displayname } = req.body;
  const folderPath = os.homedir();
  const downloadFolderPath = `${folderPath}\\downloads\\`;
  const isFolderExist = fs.existsSync(downloadFolderPath);
  const outputFile = displayname + "." + mimetype;
  gfs
    .openDownloadStreamByName(filename)
    // .pipe(fs.createWriteStream(`${folderPath}\\downloads\\${outputFile}`))
    .pipe(
      fs.createWriteStream(
        isFolderExist
          ? `${folderPath}\\downloads\\${outputFile}`
          : `${folderPath}\\${outputFile}`
      )
    )
    .on("error", function (err) {
      return res
        .status(400)
        .json({ success: false, message: "File Download Failed" });
    })
    .on("finish", function () {
      res
        .status(200)
        .json({ success: true, message: "File download complete" });
    });
});

export default router;
