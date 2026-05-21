import { createClient } from "@supabase/supabase-js";

const MP_API = "https://api.mercadopago.com";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!MP_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: "Missing server configuration" });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { oficina_id } = req.body;

  if (!oficina_id) {
    return res.status(400).json({ error: "Missing oficina_id" });
  }

  try {
    // Get the latest subscription for this oficina
    const { data: assinatura } = await supabase
      .from("assinaturas")
      .select("*")
      .eq("oficina_id", oficina_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!assinatura || !assinatura.mp_preapproval_id) {
      return res.status(200).json({ status: "no_subscription" });
    }

    // Fetch latest status from Mercado Pago
    const mpRes = await fetch(`${MP_API}/preapproval/${assinatura.mp_preapproval_id}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });

    if (!mpRes.ok) {
      return res.status(200).json({ status: assinatura.status });
    }

    const mpSub = await mpRes.json();
    const newStatus = mpSub.status;
    const isActive = newStatus === "authorized";

    // Update if status changed
    if (newStatus !== assinatura.status) {
      await supabase
        .from("assinaturas")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(mpSub.next_payment_date ? { proximo_pagamento: mpSub.next_payment_date } : {}),
        })
        .eq("id", assinatura.id);

      await supabase
        .from("oficinas")
        .update({ ativa: isActive })
        .eq("id", assinatura.oficina_id);
    }

    return res.status(200).json({
      status: newStatus,
      is_active: isActive,
      next_payment: mpSub.next_payment_date,
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro interno", details: String(err) });
  }
}
