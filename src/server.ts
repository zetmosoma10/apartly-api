import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { env } from "node:process";
import mongoose from "mongoose";

async function main() {
  const dbUrl = env.APARTLY_DATABASE_URL;
  if (!dbUrl)
    throw new Error("❌ Missing environment variable: APARTLY_DATABASE_URL");

  const port = env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Server running at port: ${port}`);
  });

  await mongoose.connect(dbUrl);
  console.log("Successfully connected to database...");
}

main().catch((err) => {
  console.log("App FAILED to run, ", err);
  process.exit(1);
});
