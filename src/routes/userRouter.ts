import { Hono } from "hono";
import { isAdmin } from "../middleware/authMiddleware.js";
import { UserController } from "../controller/UserController.js";

const userRouter = new Hono();

userRouter.get("/", isAdmin, UserController.findUsers);

userRouter.post("/", UserController.newUser);

userRouter.delete("/:id", isAdmin, UserController.deleteUser);

userRouter.put("/:id", isAdmin,UserController.updateUser);

export default userRouter;
