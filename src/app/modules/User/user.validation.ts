import { z } from "zod";

export const UserPayloadSchema = z.object({
  body: z.object({
    name: z.string().nonempty().optional(),
    admin: z.object({
      name: z.string(),
      email: z.string(),
      contactNumber: z.string(),
    }),
    contactNumber: z.number().optional(),
  }),
});
