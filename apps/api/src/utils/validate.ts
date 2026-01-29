import { z } from "zod";

export const zISODate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export function mustParse<T>(schema: z.ZodType<T>, data: unknown) {
    const r = schema.safeParse(data);
    if (!r.success) {
        const e: any = new Error("VALIDATION_ERROR");
        e.status = 400;
        e.code = "VALIDATION_ERROR";
        e.details = r.error.flatten();
        throw e;
    }
    return r.data;
}
