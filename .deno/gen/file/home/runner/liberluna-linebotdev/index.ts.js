import { serve } from "https://deno.land/std@0.184.0/http/server.ts";
import { Hono } from "hono";
import { serveStatic } from "hono/middleware";
import bot from "./bot.ts";
const app = new Hono();
app.post("/webhook", bot);
app.use("/*", serveStatic({
    root: "./static/"
}));
serve(app.fetch);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvbGliZXJsdW5hLWxpbmVib3RkZXYvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc2VydmUgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuMTg0LjAvaHR0cC9zZXJ2ZXIudHNcIjtcbmltcG9ydCB7IEhvbm8gfSBmcm9tIFwiaG9ub1wiO1xuaW1wb3J0IHsgc2VydmVTdGF0aWMgfSBmcm9tIFwiaG9uby9taWRkbGV3YXJlXCI7XG5pbXBvcnQgYm90IGZyb20gXCIuL2JvdC50c1wiO1xuXG5jb25zdCBhcHAgPSBuZXcgSG9ubygpO1xuXG5hcHAucG9zdChcIi93ZWJob29rXCIsIGJvdCk7XG5cbmFwcC51c2UoXCIvKlwiLCBzZXJ2ZVN0YXRpYyh7IHJvb3Q6IFwiLi9zdGF0aWMvXCIgfSkpO1xuXG5zZXJ2ZShhcHAuZmV0Y2gpO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsS0FBSyxRQUFRLCtDQUErQztBQUNyRSxTQUFTLElBQUksUUFBUSxPQUFPO0FBQzVCLFNBQVMsV0FBVyxRQUFRLGtCQUFrQjtBQUM5QyxPQUFPLFNBQVMsV0FBVztBQUUzQixNQUFNLE1BQU0sSUFBSTtBQUVoQixJQUFJLElBQUksQ0FBQyxZQUFZO0FBRXJCLElBQUksR0FBRyxDQUFDLE1BQU0sWUFBWTtJQUFFLE1BQU07QUFBWTtBQUU5QyxNQUFNLElBQUksS0FBSyJ9