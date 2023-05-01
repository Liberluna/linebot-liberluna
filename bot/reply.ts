import templateReply from "./template_reply.ts";

export default async ( text: string ) => {
  const templateReplyResponse = await templateReply(text);
  if(templateReplyResponse.point > 0.5){
    return templateReplyResponse.reply;
  }else{
    let result = "";
    const res = await fetch(`https://api.freasearch.org/search?q=${text}`);
    const json = await res.json();
    if (json.results.length === 0) {
      result = "え?";
    } else {
      result = `${json.results[0].content.replaceAll("。","。\n").replaceAll("...","")}`;
    }
    return result
  }
};