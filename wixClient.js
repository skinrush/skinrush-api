import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { plans } from '@wix/pricing-plans';

export const wixClient = createClient({
  modules: { plans },
  auth: ApiKeyStrategy({
    apiKey: process.env.WIX_API_KEY
  })
});
