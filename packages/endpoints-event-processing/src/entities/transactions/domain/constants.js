const TransactionTypes = {
  NODE_OPERATOR_REWARD: 'NODE_OPERATOR_REWARD',
  CAO_ISSUING_REWARD: 'CAO_ISSUING_REWARD',
  ISSUER_ISSUING_REWARD: 'ISSUER_ISSUING_REWARD',
  CAO_ISSUING_REWARD_REVERSAL: 'CAO_ISSUING_REWARD_REVERSAL',
  ISSUER_ISSUING_REWARD_REVERSAL: 'ISSUER_ISSUING_REWARD_REVERSAL',
  REDEEMVOUCHER: 'REDEEMVOUCHER',
  REDEEMFIAT: 'REDEEMFIAT',
  REWARD: 'REWARD',
  REVERSAL: 'REVERSAL',
  SELL: 'SELL',
  STAKE: 'STAKE',
  UNSTAKE: 'UNSTAKE',
  HOLD: 'HOLD',
  UNHOLD: 'UNHOLD',
};

const TransactionReasons = {
  NODE_OPERATOR_REWARD: 'NODE_OPERATOR_REWARD',
  CAO_ISSUING_REWARD: 'CAO_ISSUING_REWARD',
  ISSUER_ISSUING_REWARD: 'ISSUER_ISSUING_REWARD',
  CREDIT_SALE: 'CREDIT_SALE',
  COUPON_PURCHASE: 'COUPON_PURCHASE',
  CAO_ISSUING_REWARD_REVERSAL: 'CAO_ISSUING_REWARD_REVERSAL',
  ISSUER_ISSUING_REWARD_REVERSAL: 'ISSUER_ISSUING_REWARD_REVERSAL',
};

module.exports = {
  TransactionTypes,
  TransactionReasons,
};
