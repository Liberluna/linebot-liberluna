export default (async (c)=>{
    const msg = await c.req.json();
    for (const event of msg.events){
        if (event.type !== "message") {
            continue;
        }
        const { message , replyToken  } = event;
        switch(message.type){
            case "text":
                {
                    let result = "";
                    const { text  } = message;
                    const res = await fetch(`https://api.freasearch.org/search?q=${text}`);
                    const json = await res.json();
                    if (json.results.length === 0) {
                        result = "え?";
                    } else {
                        result = `${json.results[0].content}\n\nこれで答えになりましたよね？ね？`;
                    }
                    const data = {
                        replyToken: replyToken,
                        messages: [
                            {
                                type: "text",
                                text: result
                            }
                        ]
                    };
                    fetch("https://api.line.me/v2/bot/message/reply", {
                        method: "post",
                        headers: {
                            "Content-type": "application/json",
                            "Authorization": "Bearer " + Deno.env.get("line_token")
                        },
                        "body": JSON.stringify(data)
                    });
                    break;
                }
            default:
                break;
        }
    }
    return c.text("a");
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvbGliZXJsdW5hLWxpbmVib3RkZXYvYm90LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnRleHQgfSBmcm9tIFwiaG9ub1wiO1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKGM6IENvbnRleHQpID0+IHtcbiAgY29uc3QgbXNnID0gYXdhaXQgYy5yZXEuanNvbigpO1xuICBmb3IgKGNvbnN0IGV2ZW50IG9mIG1zZy5ldmVudHMpIHtcbiAgICBpZiAoZXZlbnQudHlwZSAhPT0gXCJtZXNzYWdlXCIpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBjb25zdCB7IG1lc3NhZ2UsIHJlcGx5VG9rZW4gfSA9IGV2ZW50O1xuICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICBjYXNlIFwidGV4dFwiOiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBcIlwiO1xuICAgICAgICBjb25zdCB7IHRleHQgfSA9IG1lc3NhZ2U7XG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGBodHRwczovL2FwaS5mcmVhc2VhcmNoLm9yZy9zZWFyY2g/cT0ke3RleHR9YCk7XG4gICAgICAgIGNvbnN0IGpzb24gPSBhd2FpdCByZXMuanNvbigpO1xuICAgICAgICBpZiAoanNvbi5yZXN1bHRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJlc3VsdCA9IFwi44GIP1wiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdCA9IGAke2pzb24ucmVzdWx0c1swXS5jb250ZW50fVxcblxcbuOBk+OCjOOBp+etlOOBiOOBq+OBquOCiuOBvuOBl+OBn+OCiOOBre+8n+OBre+8n2A7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgICByZXBseVRva2VuOiByZXBseVRva2VuLFxuICAgICAgICAgIG1lc3NhZ2VzOiBbe1xuICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gICAgICAgICAgICB0ZXh0OiByZXN1bHQsXG4gICAgICAgICAgfV0sXG4gICAgICAgIH07XG4gICAgICAgIGZldGNoKFwiaHR0cHM6Ly9hcGkubGluZS5tZS92Mi9ib3QvbWVzc2FnZS9yZXBseVwiLCB7XG4gICAgICAgICAgbWV0aG9kOiBcInBvc3RcIixcbiAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICBcIkNvbnRlbnQtdHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIERlbm8uZW52LmdldChcImxpbmVfdG9rZW5cIiksXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImJvZHlcIjogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYy50ZXh0KFwiYVwiKTtcbn07XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsZUFBZSxDQUFBLE9BQU8sSUFBZTtJQUNuQyxNQUFNLE1BQU0sTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJO0lBQzVCLEtBQUssTUFBTSxTQUFTLElBQUksTUFBTSxDQUFFO1FBQzlCLElBQUksTUFBTSxJQUFJLEtBQUssV0FBVztZQUM1QixRQUFTO1FBQ1gsQ0FBQztRQUNELE1BQU0sRUFBRSxRQUFPLEVBQUUsV0FBVSxFQUFFLEdBQUc7UUFDaEMsT0FBUSxRQUFRLElBQUk7WUFDbEIsS0FBSztnQkFBUTtvQkFDWCxJQUFJLFNBQVM7b0JBQ2IsTUFBTSxFQUFFLEtBQUksRUFBRSxHQUFHO29CQUNqQixNQUFNLE1BQU0sTUFBTSxNQUFNLENBQUMsb0NBQW9DLEVBQUUsS0FBSyxDQUFDO29CQUNyRSxNQUFNLE9BQU8sTUFBTSxJQUFJLElBQUk7b0JBQzNCLElBQUksS0FBSyxPQUFPLENBQUMsTUFBTSxLQUFLLEdBQUc7d0JBQzdCLFNBQVM7b0JBQ1gsT0FBTzt3QkFDTCxTQUFTLENBQUMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDO29CQUMzRCxDQUFDO29CQUNELE1BQU0sT0FBTzt3QkFDWCxZQUFZO3dCQUNaLFVBQVU7NEJBQUM7Z0NBQ1QsTUFBTTtnQ0FDTixNQUFNOzRCQUNSO3lCQUFFO29CQUNKO29CQUNBLE1BQU0sNENBQTRDO3dCQUNoRCxRQUFRO3dCQUNSLFNBQVM7NEJBQ1AsZ0JBQWdCOzRCQUNoQixpQkFBaUIsWUFBWSxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUM7d0JBQzVDO3dCQUNBLFFBQVEsS0FBSyxTQUFTLENBQUM7b0JBQ3pCO29CQUNBLEtBQU07Z0JBQ1I7WUFDQTtnQkFDRSxLQUFNO1FBQ1Y7SUFDRjtJQUNBLE9BQU8sRUFBRSxJQUFJLENBQUM7QUFDaEIsQ0FBQSxFQUFFIn0=