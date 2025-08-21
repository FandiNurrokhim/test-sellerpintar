import { z } from "zod";

export const businessInformationSchema = z.object({
  name: z.string().min(1, "Branch Name is required."),
  latitude: z.number({ invalid_type_error: "Latitude must be a number." }),
  longitude: z.number({ invalid_type_error: "Longitude must be a number." }),
  paymentAccountName: z.string().nullable().optional(),
  paymentAccountCode: z.string().nullable().optional(),
  paymentAccountNumber: z.string().nullable().optional(),
  // paymentAccountName: z.string().min(1, "Payment Account Name is required."),
  // paymentAccountCode: z.string().min(1, "Payment Account Code is required."),
  // paymentAccountNumber: z
  //   .string()
  //   .min(1, "Payment Account Number is required."),
});

export type BusinessInformationFormData = z.infer<
  typeof businessInformationSchema
>;
