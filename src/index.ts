import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.get("/holaMundo", (c)=>{ return c.text('Hola Mundo!')});
app.get("/adiosMundo", (c)=>{ return c.text("Adiós Mundo!")});
app.get("/dameunjson", (c)=>{
    return c.json({"mensaje": "mi primer json por http"});
});


serve(app);