import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';

/**
 * Extract text from a PDF file
 * @param {string} filePath - The path to the PDF file
 * @returns {Promise<{text: string, numPages: number}>} - The extracted text from the PDF
 */
export const extractTextFromPDF = async (filePath) => {
    let parser;
    try{
        const dataBuffer = await fs.readFile(filePath);
        parser = new PDFParse({ data: dataBuffer });
        
        const textResult = await parser.getText({ pageJoiner: '\n[---PAGE_BOUNDARY---]\n' });
        const infoResult = await parser.getInfo();

        return {
            text: textResult.text,
            numPages: infoResult.total,
            info: infoResult.info,
        }
    } catch (error) {
        console.error('pdf parsing error:', error);
        throw new Error('Failed to extract text from PDF');
    } finally {
        if (parser) {
            await parser.destroy().catch(() => {});
        }
    }
}