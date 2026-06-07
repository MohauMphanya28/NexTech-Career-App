"use strict";
// Document text extraction service - Node.js/Express version
// Runs on port 3031 as a separate process
// Handles: PDF (via unpdf), DOCX (via mammoth), TXT text extraction
// No Bun dependency — runs with plain Node.js + Express
//
// Usage:
//   npm install          (first time)
//   npm run dev          (development with auto-reload)
//   npm start            (production)
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mammoth_1 = __importDefault(require("mammoth"));
const app = (0, express_1.default)();
const PORT = 3031;
// Middleware
app.use(express_1.default.json({ limit: '15mb' }));
// CORS headers
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
// Handle OPTIONS preflight
app.options('*', (_req, res) => {
    res.status(204).end();
});
// --- Text Extraction Functions ---
async function extractTextFromPdf(base64) {
    // Use unpdf — serverless-friendly PDF parser (same as the main Next.js app)
    const { getDocumentProxy, extractText } = await Promise.resolve().then(() => __importStar(require('unpdf')));
    const buffer = Buffer.from(base64, 'base64');
    const uint8 = new Uint8Array(buffer);
    const pdf = await getDocumentProxy(uint8);
    const result = await extractText(pdf);
    return result && Array.isArray(result.text) ? result.text.join('\n') : '';
}
async function extractTextFromDocx(base64) {
    const buffer = Buffer.from(base64, 'base64');
    const result = await mammoth_1.default.extractRawText({ buffer });
    return result.value || '';
}
function extractTextFromTxt(base64) {
    return Buffer.from(base64, 'base64').toString('utf-8');
}
async function extractText(base64, mimeType) {
    if (mimeType === 'application/pdf')
        return extractTextFromPdf(base64);
    if (mimeType.includes('word') || mimeType.includes('document'))
        return extractTextFromDocx(base64);
    return extractTextFromTxt(base64);
}
// --- Health Check ---
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'resume-analyzer', port: PORT });
});
// --- Main Extraction Endpoint ---
app.post('/', async (req, res) => {
    try {
        const { fileBase64, mimeType } = req.body;
        if (!fileBase64 || !mimeType) {
            return res.status(400).json({ error: 'Missing fields' });
        }
        const base64SizeBytes = Math.ceil((fileBase64.length * 3) / 4);
        if (base64SizeBytes > 10 * 1024 * 1024) {
            return res.status(400).json({ error: 'File too large' });
        }
        console.log('Extracting text, mimeType:', mimeType);
        const extractedContent = await extractText(fileBase64, mimeType);
        console.log('Extraction complete, length:', extractedContent.length);
        return res.json({ success: true, extractedContent });
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('Extraction error:', msg);
        return res.status(400).json({
            error: 'Could not read the resume file. Please ensure it is a valid PDF, DOCX, or TXT file.',
        });
    }
});
// --- Start Server ---
const server = app.listen(PORT, () => {
    console.log(`Document Extraction service running on port ${PORT}`);
});
server.on('error', (err) => {
    console.error('Server error:', err);
});
process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('[FATAL] Unhandled Rejection:', reason);
});
