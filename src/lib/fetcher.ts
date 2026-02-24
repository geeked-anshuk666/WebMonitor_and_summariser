/**
 * WEB CONTENT FETCHER
 * 
 * Handles secure fetching of web pages, SSRF protection, and readable text extraction.
 */

import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

/**
 * Security: Patterns for IP ranges that must be blocked to prevent SSRF 
 * (Server-Side Request Forgery) attacks on the internal network.
 */
const PRIVATE_IP_PATTERNS = [
    /^127\./,
    /^10\./,
    /^192\.168\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^0\./,
    /^169\.254\./,
    /^fc00:/i,
    /^fe80:/i,
    /^::1$/,
    /^localhost$/i,
];

const BLOCKED_PROTOCOLS = ["file:", "ftp:", "data:", "javascript:"];

export interface FetchResult {
    text: string;
    title: string;
}

/**
 * Validates a URL for safety — blocks private IPs, localhost, and dangerous protocols.
 * Throws descriptive error if URL is not allowed.
 */
export function validateUrl(urlString: string): URL {
    let url: URL;
    try {
        url = new URL(urlString);
    } catch {
        throw new Error("Invalid URL format");
    }

    if (BLOCKED_PROTOCOLS.includes(url.protocol)) {
        throw new Error(`Protocol "${url.protocol}" is not allowed`);
    }

    if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Only HTTP and HTTPS URLs are supported");
    }

    const hostname = url.hostname;

    for (const pattern of PRIVATE_IP_PATTERNS) {
        if (pattern.test(hostname)) {
            throw new Error("URL not allowed (private network)");
        }
    }

    return url;
}

/**
 * Fetches a web page and extracts its readable text content.
 * Uses Readability to strip nav, ads, and boilerplate.
 */
/**
 * Main entry point for fetching a page.
 * 1. Validates URL safety
 * 2. Fetches HTML with a custom User-Agent and timeout
 * 3. Uses Readability to isolate main content
 * 4. Normalizes whitespace to prepare for diffing
 */
export async function fetchPageText(urlString: string): Promise<FetchResult> {
    const url = validateUrl(urlString);

    const response = await axios.get(url.toString(), {
        timeout: 15000,
        maxRedirects: 3,
        params: {
            // Dynamically bypass aggressive edge caching (e.g. Github CDN)
            _cb: Date.now(),
        },
        headers: {
            "User-Agent":
                "Mozilla/5.0 (compatible; WebMonitor/1.0; +https://github.com/web-monitor) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
        },
        responseType: "text",
    });

    const contentType = response.headers["content-type"] || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
        throw new Error("Cannot monitor this file type — only HTML pages are supported");
    }

    const dom = new JSDOM(response.data, { url: url.toString() });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent?.trim()) {
        // Fallback: extract body text directly
        const body = dom.window.document.body;
        const fallbackText = body?.textContent?.trim() || "";
        if (!fallbackText) {
            throw new Error("Could not extract readable text from this page");
        }
        return {
            text: fallbackText.replace(/\s+/g, " ").trim(),
            title: dom.window.document.title || url.hostname,
        };
    }

    return {
        text: article.textContent.replace(/\s\s+/g, " ").trim(),
        title: article.title || dom.window.document.title || url.hostname,
    };
}
