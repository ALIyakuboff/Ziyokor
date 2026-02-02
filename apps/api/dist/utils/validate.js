"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zISODate = void 0;
exports.mustParse = mustParse;
const zod_1 = require("zod");
exports.zISODate = zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
function mustParse(schema, data) {
    const r = schema.safeParse(data);
    if (!r.success) {
        const e = new Error("VALIDATION_ERROR");
        e.status = 400;
        e.code = "VALIDATION_ERROR";
        e.details = r.error.flatten();
        throw e;
    }
    return r.data;
}
