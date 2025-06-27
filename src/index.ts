import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import databaseConnection from "./config/database";
import affiliateCodeRouter from "./routes/affiliateCode.routes";
import authRouter from "./routes/auth.routes";
import faqRouter from "./routes/faq.routes";
import reelRouter from "./routes/reels.routes";
import termsRouter from "./routes/terms.routes";
import userRouter from "./routes/users.routes";

const app = express();
dotenv.config();

app.use(cors({ origin: "*", credentials: true }));

app.use(cookieParser()); // Needed to read cookies
app.use(express.json()); // Parses data as JSON
app.use(express.text()); // Parses data as text
app.use(express.urlencoded({ extended: true })); // Parses data as URL-encoded

// ✅ Handle Invalid JSON Errors
app.use(
  (
    err: SyntaxError & { status?: number; body?: any },
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res.status(400).send({ message: "Invalid JSON format" });
    }
    next();
  }
);

app.use("/public", express.static(path.join(__dirname, "../public")));

const baseApiUrl = "/api";

app.use(`${baseApiUrl}/users`, userRouter);
app.use(`${baseApiUrl}/auth`, authRouter);
app.use(`${baseApiUrl}/reels`, reelRouter);
app.use(`${baseApiUrl}/affiliate-codes`, affiliateCodeRouter);
app.use(`${baseApiUrl}/faqs`, faqRouter);
app.use(`${baseApiUrl}/terms`, termsRouter);

app.get("/", (req, res) => {
  return res.status(200).send({
    name: "rippin",
    developer: "Abir",
    version: "1.0.0",
    description: "Backend server for rippin",
    status: "success",
  });
});

// ✅ Handle 404 Routes
app.use((req, res) => {
  return res.status(400).send({ message: "Route does not exist" });
});

// ✅ Handle Global Errors
app.use((err: SyntaxError, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).send({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 3001;
databaseConnection(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
