import type { RequestHandler } from "express";
import { ZodType } from "zod";

export const validate = (schema: ZodType): RequestHandler => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).json({
            msg: "Validation failed",
            errors: result.error.message
        });
    }

    req.body = result.data; // replace body with sanitized data
    next();
};