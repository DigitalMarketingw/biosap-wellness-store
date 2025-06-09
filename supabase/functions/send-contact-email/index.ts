
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, subject, message }: ContactFormRequest = await req.json();

    console.log("Processing contact form submission:", { name, email, subject });

    // Send email to company
    const companyEmailResponse = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: ["plantsmedg@gmail.com"],
      subject: `New Contact Inquiry: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">
            New Contact Inquiry - Plants Med Laboratories
          </h2>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Contact Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border-left: 4px solid #16a34a; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
            <p>This email was sent from the Plants Med Laboratories contact form.</p>
          </div>
        </div>
      `,
    });

    // Send confirmation email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "Plants Med Laboratories <onboarding@resend.dev>",
      to: [email],
      subject: "Thank you for contacting Plants Med Laboratories",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">
            Thank you for your inquiry!
          </h2>
          
          <p>Dear ${name},</p>
          
          <p>Thank you for contacting <strong>Plants Med Laboratories Pvt. Ltd.</strong> We have received your inquiry and will get back to you as soon as possible.</p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Inquiry Details:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong> ${message}</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Our Contact Information:</h3>
            <p><strong>Email:</strong> plantsmedg@gmail.com</p>
            <p><strong>Phone:</strong> +91-9799774222, +91-9351120119</p>
            <p><strong>Address:</strong> G1-31, Road Number 2, RIICO Industrial Area, Sirsi Road, Bindayka, RIICO Industrial Area, Jaipur, Rajasthan - 302001, India</p>
          </div>
          
          <p>We typically respond within 24 hours during business days.</p>
          
          <p>Best regards,<br>
          <strong>Plants Med Laboratories Pvt. Ltd.</strong></p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
            <p>This is an automated confirmation email. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    });

    console.log("Emails sent successfully:", { companyEmailResponse, customerEmailResponse });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Contact form submitted successfully" 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
