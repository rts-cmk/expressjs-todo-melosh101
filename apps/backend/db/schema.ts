import { relations } from "drizzle-orm";
import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createSelectSchema, createInsertSchema, createUpdateSchema } from "drizzle-zod"

export const todoTable = sqliteTable("todos", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text(),
  user_id: int().references(() => userTable.id)
}, (table) => [
  index("todo_title_idx").on(table.id)
])

export const userTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text().notNull().unique(),
  email: text().notNull(),
  password: text().notNull()
}, (table) => [
  index("user_username_idx").on(table.username)
])

export const userRelations = relations(userTable, ({ many }) => ({
  todos: many(todoTable)
}))

export const todoRelations = relations(todoTable, ({ one }) => ({
  owner: one(userTable, {
    fields: [todoTable.user_id],
    references: [userTable.id]
  })
}))

export const todoSelectSchema = createSelectSchema(todoTable);
export const todoInsertSchema = createInsertSchema(todoTable);
export const todoUpdateSchema = createUpdateSchema(todoTable);

export const userRegisterSchema = createInsertSchema(userTable);


