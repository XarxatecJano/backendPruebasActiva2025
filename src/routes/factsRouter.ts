import { Hono } from "hono";

const factsRouter = new Hono();

factsRouter.get("/", async (c) => {
    return c.text(c.get('fact'));
});

export default factsRouter;