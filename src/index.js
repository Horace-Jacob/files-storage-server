import express from "express";
import cors from "cors";
import dotEnv from "dotenv";
import bodyParser from "body-parser";
import UserRoutes from "../routes/userRouter.js";
import UploadRoutes from "../routes/uploadRouter.js";
import { connectMongoose } from "../utils/connection_client.js";
dotEnv.config();

const PORT = process.env.PORT || 5000;

const Main = async () => {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: true, limit: "30mb" }));
  app.use(bodyParser.json({ limit: "30mb" }));
  app.use(cors());

  app.use("/users", UserRoutes);
  app.use("/uploads", UploadRoutes);

  app.get("/", async (req, res) => {
    res.send("Welcome to Files Storage API");
  });

  connectMongoose()
    .then(() =>
      app.listen(PORT, () => {
        console.log(`Server has started on port ${PORT}`);
      })
    )
    .catch((error) => console.log(error));
};

Main();
