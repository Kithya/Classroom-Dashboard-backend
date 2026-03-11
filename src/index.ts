import express from "express";
import subjectRouter from "./routes/subjects";
import cors from "cors";

const app = express();
const PORT = 8000;
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/subjects", subjectRouter);

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Classroom backend is running." });
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
