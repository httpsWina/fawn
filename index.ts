import { Hono } from "hono";
import { serveStatic } from "hono/bun"; 
import { rateLimiter } from "hono-rate-limiter";
// import { redis } from "bun";
import { getNet, getListeningTo } from "./server/store.ts";
import { Cron } from "croner";

const limiter = rateLimiter({
  windowMs:  60 * 1000, 
  limit: 50, 
  standardHeaders: 'draft-7', 
  keyGenerator: (c) => c.req.header('cf-connecting-ip') || 'unknown',
});


const app = new Hono();
app.use("*", limiter);
app.get("/", serveStatic({ path: "./static/index.html" }));

app.get("/api/manifold-nw",  async(c) => {
  let net = "";
  let change = "";
  try {
    // net = await redis.get("networth") || "";
    // change = await redis.get("24hchange") || "";
  } catch(e){
    console.log(e);
  }
  return c.json({ 
    net: net,
    change: change,
  });
});

app.get("/api/lastfm-last-played", async(c) => {
  let data = "";
  try {
    //data = await redis.get("lastfm-last-played") || "";
  } catch(e){
    console.log(e);
  }
  return c.json(JSON.parse(data || "[]"));
});

app.notFound((c) => c.json({ error: "404" }, 404));

app.onError((err, c) => {
  console.error("Server Error:", err);
  return c.json({ error: "500" }, 500);
});

const Updater = async () => {
  console.log(`Updating redis at ${new Date().toLocaleTimeString()}`);
  try {
    // getNet();
    // getListeningTo();
    console.log("Updated");
  } catch (error) {
    console.log(error);
  }
};
const updateRate = '*/1 * * * *';

const job = new Cron(updateRate, Updater);

export default {
  port: 3000,
  fetch: app.fetch,
};
