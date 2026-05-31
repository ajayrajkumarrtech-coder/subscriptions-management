/** Round to 2 decimal places (INR). */
export const roundMoney = (value) => Math.round(value * 100) / 100;

/**
 * Plan change pricing when the user receives a full new plan period.
 * Credit = unused value of the current plan for remaining days.
 * Amount due = max(0, new plan price − credit).
 */
export const calculateProratedAmount = (currentPlan, newPlan, remainingDays) => {
  const days = Math.max(0, remainingDays);
  const unusedCredit = roundMoney((currentPlan.price / currentPlan.duration) * days);
  const newPlanPrice = newPlan.price;
  const amountDue = roundMoney(newPlanPrice - unusedCredit);
  const proratedAmount = roundMoney(Math.max(amountDue, 0));
  const creditsGiven = roundMoney(Math.max(-amountDue, 0));

  return {
    proratedAmount,
    creditsGiven,
    unusedCredit,
    newPlanPrice,
    remainingDays: days,
    isUpgrade: newPlan.price > currentPlan.price,
    noPaymentNeeded: proratedAmount <= 0,
  };
};
