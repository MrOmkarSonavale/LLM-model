import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.Groq_API_KEY });

async function main() {
    const completion = await groq.chat.completions.create({

        //limiting the max tokens for response
        max_completion_tokens: 100,

        model: "llama-3.1-8b-instant",
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content: `You  are an interview assistant . Your task is to genrate candidate answer and give score . output must be follow this json format :
                {
                "confidence": number between 1-10,
                "accuracy": number between 1-10,
                "pass": boolean true or false,
                "answer": "candidate answer here"
                "suggestion": "string""
                  }

                  the responce must :
                   1: Include all field show above
                   2: use only the exact field name shown
                   3: follow the exact data type specified
                   4: contain only the json object as responce
                   5: suggestion to improve the answer
                `
            },
            {
                role: "user",
                content: `Q: what does === do in javascript?
                 A: it checks strict equality-both value and type must be same.

                 Q: what is a closure in javascript?
                 A: A closure is a function that has access to its outer function scope even after the outer function has returned.

                Q: what is hoisting in javascript?
                A: i dont know.
                `
            }
        ]
    });

    console.log(completion.choices[0].message.content);
}


main();