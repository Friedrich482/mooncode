import z from "zod";

export const BranchesSchema = z.array(z.string().min(1)).min(1);
