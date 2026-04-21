// Web stub — @stripe/stripe-react-native is native-only.
// This file is returned by the metro resolver when bundling for web.
const React = require("react");

const noop = () => {};
const nullComponent = () => null;

module.exports = {
  StripeProvider: ({ children }) => children ?? null,
  CardField: nullComponent,
  CardForm: nullComponent,
  CardView: nullComponent,
  useStripe: () => ({
    confirmPayment: async () => ({ error: { message: "Not supported on web" } }),
    createPaymentMethod: async () => ({ error: { message: "Not supported on web" } }),
    handleNextAction: async () => ({ error: { message: "Not supported on web" } }),
    retrievePaymentIntent: async () => ({ error: { message: "Not supported on web" } }),
    confirmSetupIntent: async () => ({ error: { message: "Not supported on web" } }),
    initPaymentSheet: async () => ({ error: { message: "Not supported on web" } }),
    presentPaymentSheet: async () => ({ error: { message: "Not supported on web" } }),
    confirmPaymentSheetPayment: async () => ({ error: { message: "Not supported on web" } }),
  }),
  usePaymentSheet: () => ({ loading: false, presentPaymentSheet: async () => ({}) }),
  useConfirmPayment: () => ({ confirmPayment: async () => ({}), loading: false }),
};
