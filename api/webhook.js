import { createClient } from "@supabase/supabase-js";

const MP_API = "https://api.mercadopago.com";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }

  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!MP_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: "Missing server configuration" });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const { type, data } = req.body;

    if (type === "subscription_preapproval" && data?.id) {
      // Fetch subscription details from Mercado Pago
      const mpRes = await fetch(`${MP_API}/preapproval/${data.id}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      });
      const mpSub = await mpRes.json();

      if (!mpRes.ok) {
        return res.status(200).send("OK");
      }

      // Find the subscription in our database
      const { data: assinatura } = await supabase
        .from("assinaturas")
        .select("*")
        .eq("mp_preapproval_id", data.id)
        .single();

      if (!assinatura) {
        return res.status(200).send("OK");
      }

      const newStatus = mpSub.status; // authorized, paused, cancelled, pending
      const isActive = newStatus === "authorized";

      // Update subscription status
      await supabase
        .from("assinaturas")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(mpSub.date_created ? { data_inicio: mpSub.date_created } : {}),
          ...(mpSub.next_payment_date ? { proximo_pagamento: mpSub.next_payment_date } : {}),
          ...(mpSub.last_modified ? { ultimo_pagamento: mpSub.last_modified } : {}),
        })
        .eq("id", assinatura.id);

      // Update oficina active status based on subscription
      await supabase
        .from("oficinas")
        .update({ ativa: isActive })
        .eq("id", assinatura.oficina_id);
    }

    if (type === "payment" && data?.id) {
      // Fetch payment details from Mercado Pago
      const mpRes = await fetch(`${MP_API}/v1/payments/${data.id}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      });
      const mpPayment = await mpRes.json();

      if (!mpRes.ok) {
        return res.status(200).send("OK");
      }

      // If this payment is related to a preapproval (subscription)
      const preapprovalId = mpPayment.metadata?.preapproval_id;
      if (preapprovalId) {
        const { data: assinatura } = await supabase
          .from("assinaturas")
          .select("*")
          .eq("mp_preapproval_id", preapprovalId)
          .single();

        if (assinatura) {
          // Record the payment
          await supabase.from("pagamentos").insert({
            id: crypto.randomUUID(),
            assinatura_id: assinatura.id,
            oficina_id: assinatura.oficina_id,
            mp_payment_id: String(data.id),
            valor: mpPayment.transaction_amount || assinatura.valor,
            status: mpPayment.status,
            data_pagamento: mpPayment.date_approved || mpPayment.date_created,
          });

          // If payment approved, ensure oficina is active
          if (mpPayment.status === "approved") {
            await supabase
              .from("oficinas")
              .update({ ativa: true })
              .eq("id", assinatura.oficina_id);

            await supabase
              .from("assinaturas")
              .update({
                status: "authorized",
                ultimo_pagamento: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", assinatura.id);
          }

          // If payment rejected, disable oficina
          if (mpPayment.status === "rejected") {
            await supabase
              .from("oficinas")
              .update({ ativa: false })
              .eq("id", assinatura.oficina_id);

            await supabase
              .from("assinaturas")
              .update({
                status: "paused",
                updated_at: new Date().toISOString(),
              })
              .eq("id", assinatura.id);
          }
        }
      }
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(200).send("OK");
  }
}
