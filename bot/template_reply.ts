import ngram from "./ngram.ts";

export interface TemplateReplyReturn {
  reply: string;
  point: number;
}
export default async function(text: string): Promise<TemplateReplyReturn>{
  const replys = JSON.parse(await Deno.readTextFile("./reply.json")) as Record<string,string>;
  let maxPoint: number = -1;
  let resultReply: string = "";
  for(const [call,reply] of Object.entries(replys)){
    const point = ngram(call,text);
    if(maxPoint<point){
      maxPoint = point;
      resultReply = reply;
    }
  }
  return {
    reply: resultReply,
    point: maxPoint
  }
}