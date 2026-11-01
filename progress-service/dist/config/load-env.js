"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnvFile = loadEnvFile;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
function loadEnvFile(filePath = (0, node_path_1.resolve)(process.cwd(), '.env')) {
    if (!(0, node_fs_1.existsSync)(filePath))
        return;
    const contents = (0, node_fs_1.readFileSync)(filePath, 'utf8');
    for (const line of contents.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#'))
            continue;
        const separator = trimmed.indexOf('=');
        if (separator < 1)
            continue;
        const key = trimmed.slice(0, separator).trim();
        let value = trimmed.slice(separator + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        if (process.env[key] === undefined)
            process.env[key] = value;
    }
}
loadEnvFile();
//# sourceMappingURL=load-env.js.map