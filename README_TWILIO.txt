TWILIO INTEGRATION SETUP COMPLETE

The Twilio integration for SMS notification has been added successfully!

1. Edit your main `.env` file and add the required Twilio variables:
2. The system now supports cleanly formatted, specific messages for:
- Verification (OTP)
- Order Confirmation (Fired automatically on order placement)
- Abandoned Carts / Updates (Fired for incomplete checkout items)

These triggers apply globally—whether the customer completed the actions on the Web (`user-ui`) or `mobile` app, the backend logic handles both.
