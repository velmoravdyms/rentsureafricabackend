// controllers/paymentController.js
const axios = require("axios");

// Safaricom Daraja Environment Credentials
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const SHORTCODE = process.env.MPESA_PAYBILL_OR_TILL; // e.g., 174379 (Paybill)
const PASSKEY = process.env.MPESA_PASSKEY;
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL; // Public HTTPS endpoint

/**
 * 1. Generate M-Pesa OAuth Access Token
 */
const getMpesaToken = async () => {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Failed to generate Daraja token:", error.response?.data || error.message);
    throw new Error("M-Pesa authorization failed");
  }
};

/**
 * 2. Initiate STK Push (Tenant Rent Payment)
 */
exports.initiateStkPush = async (req, res) => {
  try {
    const { phoneNumber, amount, invoiceId } = req.body;

    if (!phoneNumber || !amount) {
      return res.status(400).json({ success: false, message: "Phone number and amount are required." });
    }

    // Format phone number to 2547XXXXXXXX
    let formattedPhone = phoneNumber.trim().replace("+", "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = `254${formattedPhone.substring(1)}`;
    }

    const token = await getMpesaToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14); // YYYYMMDDHHMMSS

    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString("base64");

    const stkData = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline", // Or CustomerBuyGoodsOnline
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: CALLBACK_URL,
      AccountReference: invoiceId || "RentPayment",
      TransactionDesc: "Rent Payment",
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.status(200).json({
      success: true,
      message: "STK push sent to tenant phone.",
      checkoutRequestId: response.data.CheckoutRequestID,
      response: response.data,
    });
  } catch (error) {
    console.error("STK Push error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to initiate M-Pesa payment.",
      error: error.response?.data || error.message,
    });
  }
};

/**
 * 3. Handle Safaricom Callback Webhook
 */
exports.handleMpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;

    if (!Body || !Body.stkCallback) {
      return res.status(400).json({ ResultCode: 1, ResultDesc: "Invalid Callback Data" });
    }

    const callbackData = Body.stkCallback;
    const resultCode = callbackData.ResultCode;
    const checkoutRequestId = callbackData.CheckoutRequestID;

    if (resultCode === 0) {
      // Payment Successful
      const metadataItems = callbackData.CallbackMetadata.Item;
      const amount = metadataItems.find((item) => item.Name === "Amount")?.Value;
      const mpesaReceiptNumber = metadataItems.find((item) => item.Name === "MpesaReceiptNumber")?.Value;
      const phoneNumber = metadataItems.find((item) => item.Name === "PhoneNumber")?.Value;

      console.log(`Payment Successful! Receipt: ${mpesaReceiptNumber}, Amount: KES ${amount}, Phone: ${phoneNumber}`);

      // TODO: Update database (Mark rent invoice as PAID using checkoutRequestId or AccountReference)
      // await Invoice.update({ status: 'PAID', receipt: mpesaReceiptNumber }, { where: { checkoutRequestId } });

    } else {
      // Payment Failed or Cancelled by User
      console.log(`Payment failed or cancelled for CheckoutRequestID: ${checkoutRequestId}. ResultDesc: ${callbackData.ResultDesc}`);
      // TODO: Update database status to 'FAILED' or 'CANCELLED'
    }

    // Always respond with ResultCode 0 to Safaricom
    return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("Error processing M-Pesa callback:", error);
    return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
};