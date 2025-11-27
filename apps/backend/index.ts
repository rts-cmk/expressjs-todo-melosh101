import express, { json } from "express"
import cors from "cors"

const app = express();

app.use(json())
app.use(cors())

app.get("/", (req, res) => {
  res.send(200, JSON.stringify({
    status: 200,
    message: "OK"
  }));
})


app.get("/todo")


console.log("Hello via Bun!");
