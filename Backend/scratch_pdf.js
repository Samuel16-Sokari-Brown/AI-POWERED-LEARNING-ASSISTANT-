import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';

async function testExtraction() {
    try {
        const dataBuffer = await fs.readFile('c:\\Users\\sammy\\OneDrive\\Desktop\\All Folders\\Ai powered learning assistant\\Backend\\uploads\\test.pdf'); 
        let parser = new PDFParse({ data: dataBuffer });
        const result = await parser.getText();
        console.log(result.text.substring(0, 1000));
        await parser.destroy();
    } catch(e) { console.error("Error:", e.message) }
}
testExtraction();
testExtraction();
