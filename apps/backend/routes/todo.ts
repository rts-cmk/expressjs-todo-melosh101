import { Router } from "express";
import db from "../db"
import { todoInsertSchema, todoTable, todoUpdateSchema } from "../db/schema";
import { eq, and } from "drizzle-orm";
import z from "zod";
import { int } from "drizzle-orm/sqlite-core";
import passport from "passport";


const router = Router();

const DEFAULT_PAGE_SIZE = 10;

// Middleware to check if user is authenticated
router.use((req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ status: 401, message: "Unauthorized" });
});

router.get("/", async (req, res) => {
  var { page, limit } = req.query as { page: string | undefined, limit: string | undefined }
  page = page ?? "0"
  limit = limit ?? DEFAULT_PAGE_SIZE.toString()

  const parsedPage = Number.parseInt(page);
  const parsedLimit = Number.parseInt(limit)
  
  if ((Number.isNaN(parsedLimit) || Number.isNaN(parsedPage))) {
    res.status(422)
    return res.json({
      status: 422,
      message: "page limit or page is not a number"
    })
  }

  const page_size = parsedLimit || DEFAULT_PAGE_SIZE
  const user = req.user as Express.User;

  // Filter by user_id
  const todos = await db.select().from(todoTable)
    .where(eq(todoTable.user_id, user.id))
    .limit(page_size)
    .offset(parsedPage * page_size);

  res.status(200);
  return res.send({
    status: 200,
    message: "OK",
    results: todos
  })
})

router.get("/:id", async (req, res) => {
  const { id } = req.params
  const user = req.user as Express.User;

  if (!id) {
    res.status(404)
    return res.send({
      status: 404,
      message: "Not Found due to invalid ID"
    })
  }

  const parsedID = Number.parseInt(id);

  if (Number.isNaN(parsedID)) {
      res.status(404)
      return res.send({
        status: 404,
        message: "Not Found due to invalid ID"
      })
  }

  // Check ownership
  const todo = await db.select().from(todoTable)
    .where(and(eq(todoTable.id, parsedID), eq(todoTable.user_id, user.id)))
    .limit(1);

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
  // We need to omit user_id from validation if it's in the schema but we set it manually
  // Or we merge it.
  // todoInsertSchema expects what's in the table.
  
  // Let's parse body first.
  // If todoInsertSchema requires user_id, we might fail if not provided in body.
  // But we want to force it from session.
  
  // Let's assume body contains title, description etc.
  const user = req.user as Express.User;
  
  const bodyWithUser = {
    ...req.body,
    user_id: user.id
  };

  const data = todoInsertSchema.safeParse(bodyWithUser)

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


router.put("/:id", async (req, res) => { // Fixed route path from /todo/:id to /:id because router is mounted at /todo

  const { id } = req.params
  const user = req.user as Express.User;

  if (!id) {
    res.status(404)
    return res.send({
      status: 404,
      message: "Not Found due to invalid ID"
    })
  }

  const parsedID = Number.parseInt(id);

  if (Number.isNaN(parsedID)) {
      res.status(404)
      return res.send({
        status: 404,
        message: "Not Found due to invalid ID"
      })
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
  
  // Check ownership
  const todo = await db.select().from(todoTable)
    .where(and(eq(todoTable.id, parsedID), eq(todoTable.user_id, user.id)))
    
  if (todo.length < 1) {
    res.status(404);
    return res.json({
      status: 404,
      message: "no todo related to the provided id"
    })
  }
  
  const updatedTodo = await db.update(todoTable)
    .set(data.data)
    .where(eq(todoTable.id, parsedID)) // We already checked ownership
    .returning();

  res.status(200); // Changed from 204 to return updated item if needed, or keep 204
  res.json(updatedTodo[0]);

})

router.delete("/:id", async (req, res) => {
  const { id } = req.params
  const user = req.user as Express.User;

  if (!id) {
    res.status(404)
    return res.send({
      status: 404,
      message: "Not Found due to invalid ID"
    })
  }

  const parsedID = Number.parseInt(id);

  if (Number.isNaN(parsedID)) {
      res.status(404)
      return res.send({
        status: 404,
        message: "Not Found due to invalid ID"
      })
  }

  // Check ownership before delete
  const todo = await db.select().from(todoTable)
    .where(and(eq(todoTable.id, parsedID), eq(todoTable.user_id, user.id)))
    
  if (todo.length < 1) {
    res.status(404);
    return res.json({
      status: 404,
      message: "Not Found"
    })
  }

  await db.delete(todoTable).where(eq(todoTable.id, parsedID));

  res.status(200)
  res.send()
})

export default router;
