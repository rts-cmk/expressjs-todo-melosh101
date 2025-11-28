import passport from "passport"
import { Strategy as LocalStrategy } from "passport-local";
import db from "../db"
import { userRegisterSchema, userTable } from "../db/schema";
import { eq } from "drizzle-orm";
import argon2 from "argon2";
import { Router } from "express"
import z from "zod";
const router = Router();

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
    }
  }
}

const SECRET_KEY_BASE = process.env.SECRET_KEY_BASE;

if (!SECRET_KEY_BASE) {
  throw new Error("AUTH: Missing secret key base")
}

const argonOptions: argon2.Options = {
  secret: Buffer.from(SECRET_KEY_BASE),
}


passport.use(new LocalStrategy(async (username, password, cb) => {
  const [user] = await db.select().from(userTable).where(eq(userTable.username, username as string)).limit(1);
  console.log("password:", password)
  if (!user) {
    console.log("user not found!")
    return cb(null, false, { message: "Incorrect username or password" });
  }

  if (!argon2.verify(user.password, password, argonOptions)) {
    console.log("password doesnt match")
    return cb(null, false, { message: "Incorrect username or password" });
  }
  console.log("user matched")
  return cb(null, user)

}));

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, {
      id: user.id,
      username: user.username,
    })
  })
})

passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
    if (!user) {
      return cb(new Error("User not found"))
    }
    if (typeof user === "object" && "id" in user && "username" in user) {
      return cb(null, user as Express.User)
    }

    return cb(new Error("User not found"))
  })
})

router.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login"
}))

router.post("/register", async (req, res) => {
  const data = userRegisterSchema.safeParse(req.body);

  if (!data.success) {
    res.status(422);
    return res.json({
      status: 422,
      message: "Invalid post body",
      errors: z.treeifyError(data.error)
    });
  }

  const user = await db.query.userTable.findFirst({
    where: eq(userTable.username, data.data.username)
  })

  if (user) {
    return res.json({
      status: 200,
      message: "username already taken"
    })
  }

  const pwdHash = await argon2.hash(data.data.password, argonOptions);
  const newUser = await db.insert(userTable).values({
    ...data.data,
    password: pwdHash
  }).returning();

  if (!newUser || !newUser[0]) {
    throw new Error("failed to create new user")
  }
  req.login(newUser[0], (err) => {
    if (err) throw new Error(err)
  })
  res.redirect("/login")
})


export default router;
