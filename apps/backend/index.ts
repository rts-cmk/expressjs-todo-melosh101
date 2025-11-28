import express, { json, urlencoded } from "express"
import cors from "cors"
import todoRouter from "./routes/todo.ts"
import authRouter from "./routes/auth.ts"
import session from "express-session"
import passport from "passport"
import morgan from "morgan"

const app = express();

const PORT = process.env.LISTEN_PORT || 3000
const SECRET_KEY_BASE = process.env.SECRET_KEY_BASE;
const devMode = process.env.NODE_ENV != "production";

if (!SECRET_KEY_BASE) {
  throw new Error("AUTH: Missing secret key base")
}

app.use(json())
app.use(urlencoded())
app.use(morgan("dev"))
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}))
app.use(session({
  secret: process.env.SECRET_KEY_BASE!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: !devMode, // Set to true in production (requires HTTPS)
    maxAge: 60 * 60 * 24 * 1000,
    httpOnly: true,
  }
}))
app.use(passport.initialize())
app.use(passport.session())

app.use("/auth", authRouter)
app.use("/todo", todoRouter);

app.get("/", (req, res) => {
  res.status(200)
  res.send(JSON.stringify({
    status: 200,
    message: "OK"
  }));
})


app.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`Backend service listening on 127.0.0.1:${PORT}`)
})
