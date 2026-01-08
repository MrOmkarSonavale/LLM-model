import { indexDocument } from "./prepare.js";

const filePath = './cg-internal-docs.pdf';

(async () => {
    await indexDocument(filePath);
})();