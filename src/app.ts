import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send([{ id: 1, name: "Zet" }]);
});

export default app;
