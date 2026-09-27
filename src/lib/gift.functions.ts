import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { notifyTeam } from "./notify";

const GiftClaimInput = z.object({
  donorName: z.string().trim().min(2).max(120),
  contact: z.string().trim().min(5).max(200),
  address: z.string().trim().min(10).max(1000),
  amount: z.number().int().min(5000).max(10_000_000),
});

/** Saves a gift claim (donations ≥ ₹5,000) and emails the team. */
export const submitGiftClaim = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GiftClaimInput.parse(input))
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("gift_claims").insert({
        donor_name: data.donorName,
        contact: data.contact,
        address: data.address,
        amount: data.amount,
      });
      if (error) {
        console.error("[gift] insert failed:", error.message);
        return { ok: false as const, error: "Your gift request could not be saved. Please try again." };
      }
    } catch (err) {
      console.error("[gift] db unavailable:", err);
      return { ok: false as const, error: "Your gift request could not be saved. Please try again." };
    }

    await notifyTeam("New gift claim — VOX Care", {
      Name: data.donorName,
      "Email / phone": data.contact,
      "Delivery address": data.address,
      "Donation amount": `₹${data.amount.toLocaleString("en-IN")}`,
    });

    return { ok: true as const };
  });
