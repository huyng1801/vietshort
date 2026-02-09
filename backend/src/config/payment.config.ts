export const paymentConfig = {
  vnpay: {
    tmnCode: process.env.VNPAY_TMN_CODE,
    hashSecret: process.env.VNPAY_HASH_SECRET,
    url: process.env.VNPAY_URL,
    returnUrl: process.env.VNPAY_RETURN_URL,
  },
  momo: {
    partnerCode: process.env.MOMO_PARTNER_CODE,
    accessKey: process.env.MOMO_ACCESS_KEY,
    secretKey: process.env.MOMO_SECRET_KEY,
    endpoint: process.env.MOMO_ENDPOINT,
  },
};

export default () => ({
  payment: paymentConfig,
});
