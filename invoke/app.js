import readline from "node:readline/promises";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { tavily } from '@tavily/core';

dotenv.config();

const tvly = tavily({ apiKey: process.env.SEARCH_TOOL });
const groq = new Groq({ apiKey: process.env.Groq_API_KEY });

async function main() {
    const r1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const messages = [
        {
            role: 'system',
            content: 'you are a smart personal assistant who answers the asked questions briefly and accurately.'
        },
    ];

    while (true) {
        const question = await r1.question("You: ");

        messages.push({
            role: 'user',
            content: question
        });


        while (true) {


            const completion = await groq.chat.completions.create({


                //limiting the max tokens for response
                max_completion_tokens: 100,

                model: "llama-3.1-8b-instant",
                response_format: { type: 'text' },
                messages: messages,
                // Sample request body with tool definitions and messages
                "tools": [
                    {
                        "type": "function",
                        "function": {
                            "name": "webSearch",
                            "description": "get the latest information from the web about a topic and it must be brief and accurate and to the point",
                            "parameters": {
                                // JSON Schema object
                                "type": "object",
                                "properties": {
                                    "query": {
                                        "type": "string",
                                        "description": "The query to search for"
                                    },

                                },
                                "required": ["query"]
                            }
                        }
                    }
                ],

                tool_choice: 'auto'

            });

            // console.log("First Response:", JSON.stringify(completion.choices[0].message, null, 2));

            messages.push(completion.choices[0].message);


            const toolCalls = completion.choices[0].message.tool_calls;

            if (!toolCalls) {
                console.log(`AI : ${completion.choices[0].message.content}`);
                break;
            };

            for (const toolCall of toolCalls) {
                const funName = toolCall.function.name;
                const funArgs = toolCall.function.arguments;

                if (funName === 'webSearch') {
                    const toolRes = await webSearch(JSON.parse(funArgs));

                    messages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: toolRes
                    });
                }
            };

            const completion2 = await groq.chat.completions.create({

                //limiting the max tokens for response
                max_completion_tokens: 100,

                model: "llama-3.1-8b-instant",
                response_format: { type: 'text' },
                messages: messages,
                // Sample request body with tool definitions and messages
                "tools": [
                    {
                        "type": "function",
                        "function": {
                            "name": "webSearch",
                            "description": "get the latest information from the web about a topic and it must be brief and accurate and to the point",
                            "parameters": {
                                // JSON Schema object
                                "type": "object",
                                "properties": {
                                    "query": {
                                        "type": "string",
                                        "description": "The query to search for"
                                    },

                                },
                                "required": ["query"]
                            }
                        }
                    }
                ],
                tool_choice: 'auto'
            });


            // console.log(JSON.stringify(completion2.choices[0].message, null, 2));
        };
    }

};


main();

async function webSearch({ query }) {
    const searchResults = await tvly.search(query, { maxResults: 3 });

    // console.log(searchResults);

    const finalRes = searchResults.results.map((res, i) => {
        return res.content;
    })

    console.log("Search Results:", finalRes.join('\n\n'));
    return finalRes.join('\n\n');
}