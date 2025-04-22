import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";

// Hardcoded Stripe publishable key for testing
// In production, this should be loaded from an environment variable
const STRIPE_PUBLISHABLE_KEY = "pk_test_51RF3moPU1VJ4VCmuUDtOdtpnkQVMmYSPLgXZgJQBXWpTZdTxgQFfXQAGNYjdRnPXVvbcYtxFxEwCwqBLDKYoG5Oc00Yl7YFHZZ";

// Function to create a checkout session directly from the client
export const createCheckoutSession = async (
  service: 'domain' | 'email',
  userId: string,
  domainName: string,
  domainSuffix: string
): Promise<string | null> => {
  try {
    const loadingToast = toast.loading("Creating checkout session...");
    
    // First, try to create a checkout session using the Supabase function
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          user_id: userId,
          domain_name: domainName,
          domain_suffix: domainSuffix,
          checkout_type: service,
          include_email: service === 'email'
        }
      });
      
      toast.dismiss(loadingToast);
      
      if (!error && data?.url) {
        toast.success("Redirecting to Stripe checkout...");
        return data.url;
      }
      
      // If there's an error, we'll fall back to a direct approach
      console.error("Error with Supabase function, trying direct approach:", error);
    } catch (supabaseError) {
      console.error("Supabase function error, trying direct approach:", supabaseError);
    }
    
    // If the Supabase function fails, we'll use a direct approach with a form submission
    toast.dismiss(loadingToast);
    toast.info("Using alternative checkout method...");
    
    // Create a form to submit to the appropriate Stripe payment link
    const form = document.createElement('form');
    form.method = 'GET'; // Payment links use GET method
    
    // Get the current origin for redirect URLs
    const origin = window.location.origin;
    const dashboardUrl = `${origin}/dashboard?checkout_success=true`;
    
    // Use the correct payment link based on the service type
    if (service === 'domain') {
      // Domain Registration link with success URL and additional parameters
      form.action = `https://buy.stripe.com/test_5kA5mCaWY0vc5WM000?client_reference_id=${encodeURIComponent(userId)}&success_url=${encodeURIComponent(dashboardUrl)}`;
    } else {
      // Email Suite link with success URL and additional parameters
      form.action = `https://buy.stripe.com/test_5kA02ifde4Lsfxm7st?client_reference_id=${encodeURIComponent(userId)}&success_url=${encodeURIComponent(dashboardUrl)}`;
    }
    
    // Add hidden fields with metadata
    const addHiddenField = (name: string, value: string) => {
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = name;
      hiddenField.value = value;
      form.appendChild(hiddenField);
    };
    
    addHiddenField('user_id', userId);
    addHiddenField('domain_name', domainName);
    addHiddenField('domain_suffix', domainSuffix);
    addHiddenField('checkout_type', service);
    addHiddenField('include_email', service === 'email' ? 'true' : 'false');
    
    // Add the form to the document and submit it
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    return null; // We're handling the redirect with the form submission
  } catch (error: any) {
    console.error("Error during checkout:", error);
    toast.error(`Checkout error: ${error.message}`);
    return null;
  }
};

// Function to redirect to Stripe checkout
export const redirectToStripeCheckout = async (
  service: 'domain' | 'email',
  userId: string | undefined,
  newDomain: string,
  domainSuffix: string
): Promise<void> => {
  if (!userId) {
    toast.error("You must be logged in to make a purchase");
    return;
  }
  
  try {
    console.log("Starting Stripe checkout process...");
    console.log("Service:", service);
    console.log("User ID:", userId);
    console.log("Domain:", newDomain);
    console.log("Suffix:", domainSuffix);
    
    const checkoutUrl = await createCheckoutSession(service, userId, newDomain, domainSuffix);
    
    if (checkoutUrl) {
      console.log("Checkout URL received, redirecting to:", checkoutUrl);
      // Short delay before redirect to ensure toast is visible
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 1000);
    } else {
      console.log("No checkout URL received, form submission should have handled the redirect");
    }
  } catch (error: any) {
    console.error("Error during checkout redirect:", error);
    toast.error(`Checkout error: ${error.message}`);
  }
};

// Function to check if a user has a payment method
export const checkPaymentMethod = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("payment_methods")
      .select("id")
      .eq("user_id", userId)
      .limit(1);
    
    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking payment method:", error);
    return false;
  }
};
