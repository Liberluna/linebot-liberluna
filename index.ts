import { serve } from "https://deno.land/std@0.184.0/http/server.ts";
import { Hono } from "hono";
import { serveStatic } from "hono/middleware";
import bot from "./bot.ts";

const app = new Hono();

app.post("/webhook", bot);

app.use("/*", serveStatic({ root: "./static/" }));

serve(app.fetch);
