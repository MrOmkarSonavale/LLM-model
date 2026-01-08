import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone";
import { configDotenv } from "dotenv";
import { OpenAIEmbeddings } from "@langchain/openai";
import pkg from "@pinecone-database/pinecone";
const { Pinecone } = pkg;


configDotenv();



const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
    apiKey: process.env.API_KEY,
});

const pineconde = new Pinecone({
    apiKey: process.env.PINECONDE_KEY,
});

const pineconeIndex = pineconde.index(process.env.PINECONDE_NAME);

const verctorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: pineconeIndex,
});

export async function indexDocument(filePath) {
    const { PDFLoader } = await import("@langchain/community/document_loaders/fs/pdf");
    const loader = new PDFLoader(filePath, { splitPages: false });
    const doc = await loader.load();

    const textsplitters = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
    });

    const text = await textsplitters.splitDocuments(doc);

    console.log(text);

    const docs = text.map((t) => {
        return {
            pageContent: t.pageContent,
            metadata: t.metadata
        }
    })

    console.log(doc);

    await verctorStore.addDocuments(docs);


    // console.log("Document loaded:", doc[0]);
};