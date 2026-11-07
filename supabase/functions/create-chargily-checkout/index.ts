import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { order_id, public_token, amount, customer_name, phone, email, payment_method, description } = await req.json();

    const chargilySecretKey = Deno.env.get("CHARGILY_SECRET_KEY");
    const chargilyMode = Deno.env.get("CHARGILY_MODE") || "test";
    const siteUrl = Deno.env.get("PUBLIC_SITE_URL") || "https://abdoustore.vercel.app";

    if (!chargilySecretKey) {
      throw new Error("CHARGILY_SECRET_KEY غير مضاف في إعدادات Supabase Edge Functions Secrets.");
    }

    const baseUrl =
      chargilyMode === "live"
        ? "https://pay.chargily.net/api/v2/checkouts"
        : "https://pay.chargily.net/test/api/v2/checkouts";

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${chargilySecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Number(amount),
        currency: "dzd",
        payment_method: payment_method || "edahabia",
        locale: "ar",
        description: description || `طلب اشتراك رقمي`,
        success_url: `${siteUrl}/order/${public_token}?status=success`,
        failure_url: `${siteUrl}/order/${public_token}?status=failed`,
        collect_shipping_address: false,
        metadata: {
          order_id: String(order_id || ""),
          public_token: String(public_token),
          customer_email: String(email || ""),
          customer_phone: String(phone || ""),
          customer_name: String(customer_name || ""),
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabaseAdmin
      .from("digital_orders")
      .update({
        chargily_checkout_id: data.id,
        chargily_checkout_url: data.checkout_url,
      })
      .eq("public_token", public_token);

    return new Response(
      JSON.stringify({
        checkout_url: data.checkout_url,
        checkout_id: data.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
