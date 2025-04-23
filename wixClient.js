import { createClient, ApiKeyStrategy } from '@wix/sdk';
import dotenv from 'dotenv';
dotenv.config();

const rawMembers = await import('@wix/members');

const cleanMembers = {};
for (const key in rawMembers.members) {
  const val = rawMembers.members[key];
  if (val && typeof val === 'function') {
    cleanMembers[key] = val;
  }
}

export const wixClient = createClient({
  modules: {
    members: cleanMembers
  },
  auth: ApiKeyStrategy({
    apiKey: process.env.WIX_API_KEY
  })
});
