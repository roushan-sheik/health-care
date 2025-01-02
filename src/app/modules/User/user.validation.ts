import z from "zod";

export const userSchema = z.object({
  body: z.object({
    name: z.string().nonempty().optional(),
    contactNumber: z.number().optional(),
  }),
});
