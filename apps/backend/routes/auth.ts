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

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err: Error, user: Express.User, info: { message: string }) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ status: 401, message: info.message || "Login failed" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({
        status: 200,
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username
        }
      });
    });
  })(req, res, next);
});

router.post("/register", async (req, res, next) => {
  const data = userRegisterSchema.safeParse(req.body);

  if (!data.success) {
    res.status(422);
    return res.json({
      status: 422,
      message: "Invalid post body",
      errors: z.treeifyError(data.error)
    });
  }

  try {
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.username, data.data.username)
    })

    if (user) {
      return res.status(409).json({
        status: 409,
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
      if (err) return next(err);
      return res.status(201).json({
        status: 201,
        message: "Registration successful",
        user: {
          id: newUser[0].id,
          username: newUser[0].username
        }
      });
    })
  } catch (e) {
    next(e);
  }
})

router.get("/me", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ status: 401, message: "Unauthorized" });
  }
  
  const user = req.user as Express.User;
  return res.json({
    id: user.id,
    username: user.username
  });
})

export default router;
