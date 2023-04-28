import { Context } from "hono";
export default async (c: Context) => {
  const msg = await c.req.json();
  for (const event of msg.events) {
    if (event.type !== "message") {
      continue;
    }
    const { message, replyToken } = event;
    switch (message.type) {
      case "text": {
        let result = "";
        const { text } = message;
        const res = await fetch(`https://api.freasearch.org/search?q=${text}`);
        const json = await res.json();
        if (json.results.length === 0) {
          result = "え?";
        } else {
          result = `${json.results[0].content}\n\nこれで答えになりましたよね？ね？`;
        }
        const data = {
          replyToken: replyToken,
          messages: [{
            type: "text",
            text: result,
          }],
        };
        const botRes = await fetch("https://api.line.me/v2/bot/message/reply", {
          method: "post",
          headers: {
            "Content-type": "application/json",
            "Authorization": "Bearer " + Deno.env.get("line_token"),
          },
          "body": JSON.stringify(data),
        });
        break;
      }
      default:
        break;
    }
  }
  return c.text("a");
};
