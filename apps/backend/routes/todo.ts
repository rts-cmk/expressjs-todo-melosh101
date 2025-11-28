import { Router } from "express";
import db from "../db"
import { todoInsertSchema, todoTable, todoUpdateSchema } from "../db/schema";
import { eq } from "drizzle-orm";
import z from "zod";
import { int } from "drizzle-orm/sqlite-core";
import passport from "passport";


const router = Router();

const DEFAULT_PAGE_SIZE = 10;

router.use(passport.authenticate("session"))


router.get("/", async (req, res) => {
  var { page, limit } = req.query as { page: string | undefined, limit: string | undefined }
  page = page ?? "0"
  limit = limit ?? DEFAULT_PAGE_SIZE.toString()

  const parsedPage = Number.parseInt(page);
  const parsedLimit = Number.parseInt(limit)
  console.log(parsedPage, parsedLimit)

  if ((Number.isNaN(parsedLimit) || Number.isNaN(parsedPage))) {
    res.status(422)
    return res.json({
      status: 422,
      message: "page limit or page is not a number"
    })
  }

  const page_size = parsedLimit || DEFAULT_PAGE_SIZE

  const todos = await db.select().from(todoTable).limit(page_size).offset(parsedPage * page_size);

  res.status(200);
  return res.send({
    status: 200,
    message: "OK",
    results: todos
  })
})

router.get("/:id", async (req, res) => {
  const { id } = req.params

  if (!id) {
    res.status(404)
    return res.send({
      status: 404,
      message: "Not Found due to invalid ID"
    })
  }

  const parsedID = Number.parseInt(id);

  if (Number.isNaN(parsedID)) {
    if (!id) {
      res.status(404)
      return res.send({
        status: 404,
        message: "Not Found due to invalid ID"
      })
    }
  }

  const todo = await db.select().from(todoTable).limit(1).where(eq(todoTable.id, parsedID));

  if (todo.length < 1) {
    res.status(404)
    return res.send({
      status: 404,
      message: "Not Found"
    })
  }

  res.json({
    status: 200,
    result: todo[0]
  })
})

router.post("/", async (req, res) => {
  const data = todoInsertSchema.safeParse(req.body)

  if (!data.success) {
    res.status(422);

    return res.json({
      status: 422,
      message: "inavlid request body",
      errors: z.treeifyError(data.error)
    })
  }

  const newTodo = await db.insert(todoTable).values(data.data).returning();
  res.status(201)
  res.send(newTodo[0])
})


router.put("/todo/:id", async (req, res) => {

  const { id } = req.params

  if (!id) {
    res.status(404)
    return res.send({
      status: 404,
      message: "Not Found due to invalid ID"
    })
  }

  const parsedID = Number.parseInt(id);

  if (Number.isNaN(parsedID)) {
    if (!id) {
      res.status(404)
      return res.send({
        status: 404,
        message: "Not Found due to invalid ID"
      })
    }
  }


  const data = todoUpdateSchema.safeParse(req.body);

  if (!data.success) {
    res.status(422);
    return res.json({
      status: 422,
      message: "invalid request body",
      errors: z.treeifyError(data.error),
    })
  }
  const todo = await db.select().from(todoTable).where(eq(todoTable.id, parsedID))
  if (todo.length < 1) {
    res.status(404);
    res.json({
      status: 404,
      message: "no todo related to the provided id"
    })
  }
  await db.update(todoTable).set(data.data).where(eq(todoTable.id, parsedID))

  res.status(204);
  res.send()

})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  if (!id) {
    res.status(404)
    return res.send({
      status: 404,
      message: "Not Found due to invalid ID"
    })
  }

  const parsedID = Number.parseInt(id);

  if (Number.isNaN(parsedID)) {
    if (!id) {
      res.status(404)
      return res.send({
        status: 404,
        message: "Not Found due to invalid ID"
      })
    }
  }


  await db.delete(todoTable).where(eq(todoTable.id, parsedID));

  res.status(200)
  res.send()
})

export default router;
