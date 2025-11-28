import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema.ts"


const filename = process.env.DB_FILE_NAME;

if (!filename) throw new Error("DB: filename not found in the env")

const devMode = process.env.NODE_ENV != "production";
const db = drizzle({
  connection: filename,
  schema: schema,
  logger: devMode
})

export default db;
