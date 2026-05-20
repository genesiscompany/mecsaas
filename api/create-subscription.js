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

  const { oficina_id, plano_id, plano_nome, valor, payer_email, oficina_nome } = req.body;

  if (!oficina_id || !plano_id || !valor || !payer_email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Determine frequency based on plan
  let frequency = 1;
  const frequency_type = "months";
  if (plano_nome === "Trimestral") {
    frequency = 3;
  } else if (plano_nome === "Anual") {
    frequency = 12;
  }

  const siteUrl = process.env.SITE_URL || "https://www.mecsaas.com.br";

  try {
    // Create subscription in Mercado Pago
    const mpResponse = await fetch(`${MP_API}/preapproval`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        reason: `Plano ${plano_nome} - macSaas - ${oficina_nome || "Oficina"}`,
        auto_recurring: {
          frequency,
          frequency_type,
          transaction_amount: Number(valor),
          currency_id: "BRL",
        },
        back_url: siteUrl,
        notification_url: `${siteUrl}/api/webhook`,
        payer_email,
        status: "pending",
      }),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      return res.status(400).json({ error: "Erro ao criar assinatura no Mercado Pago", details: mpData });
    }

    // Store subscription in Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const assinaturaId = crypto.randomUUID();

    const { error: dbError } = await supabase.from("assinaturas").insert({
      id: assinaturaId,
      oficina_id,
      plano_id,
      mp_preapproval_id: mpData.id,
      mp_init_point: mpData.init_point,
      status: "pending",
      valor: Number(valor),
    });

    if (dbError) {
      return res.status(500).json({ error: "Erro ao salvar assinatura", details: dbError });
    }

    return res.status(200).json({
      id: assinaturaId,
      mp_preapproval_id: mpData.id,
      init_point: mpData.init_point,
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro interno", details: String(err) });
  }
}
