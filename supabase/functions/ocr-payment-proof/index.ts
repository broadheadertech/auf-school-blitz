// Supabase Edge Function: ocr-payment-proof
// Processes uploaded payment proof images and extracts reference numbers via OCR.
// MVP: Simulates OCR extraction using the payment's existing reference_number.
// Production: Replace simulateOcr() with a real OCR service (Google Vision, AWS Textract).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OcrResult {
  extracted_text: string
  confidence: number
  matched: boolean
}

/**
 * MVP OCR Simulation
 * In production, this would call an OCR service with the actual image bytes.
 * For MVP, we simulate by using the payment's existing reference_number
 * and introducing slight noise to test the confidence threshold logic.
 */
function simulateOcr(referenceNumber: string | null): OcrResult {
  if (!referenceNumber) {
    return { extracted_text: '', confidence: 0, matched: false }
  }

  // Simulate OCR noise: randomly replace some characters
  const noise = Math.random()
  let extracted = referenceNumber

  if (noise < 0.15) {
    // 15% chance: low confidence — garbled text
    extracted = referenceNumber
      .replace(/0/g, 'O')
      .replace(/1/g, 'I')
      .replace(/5/g, 'S')
    return { extracted_text: extracted, confidence: Math.round(40 + Math.random() * 30), matched: false }
  }

  if (noise < 0.3) {
    // 15% chance: medium confidence — minor errors
    extracted = referenceNumber.replace(/0/g, 'O')
    return { extracted_text: extracted, confidence: Math.round(60 + Math.random() * 19), matched: false }
  }

  // 70% chance: high confidence — clean extraction
  return { extracted_text: extracted, confidence: Math.round(85 + Math.random() * 15), matched: true }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { paymentId } = await req.json() as { paymentId: string }

    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'paymentId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch payment record
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('id, reference_number, proof_url')
      .eq('id', paymentId)
      .single()

    if (fetchError || !payment) {
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Run OCR (simulated for MVP)
    const ocrResult = simulateOcr(payment.reference_number)

    // Store OCR results
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        ocr_extracted_text: ocrResult.extracted_text,
        ocr_confidence: ocrResult.confidence,
        ocr_matched: ocrResult.matched,
      })
      .eq('id', paymentId)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to store OCR results' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({
        extracted_text: ocrResult.extracted_text,
        confidence: ocrResult.confidence,
        matched: ocrResult.matched,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
