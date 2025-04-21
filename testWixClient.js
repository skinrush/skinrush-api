// testWixClient.js
import { wixClient } from './wixClient.js';

const run = async () => {
  try {
    const plans = await wixClient.pricingPlans.listPublicPlans();
    console.log('Plans:', plans);
  } catch (err) {
    console.error('Error fetching plans:', err.message);
  }
};

run();
