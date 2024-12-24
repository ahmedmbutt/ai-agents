import { AlternatingDiscordSlack } from './alternating-discord-slack';
import { FailedStripeNotifications } from './failed-stripe-notifications';
import { HubspotMailchimpSync } from './hubspot-mailchimp-sync';
import { NewRowGoogleSheetsSendSlackMessage } from './new-row-google-sheets-send-slack-message';
import { RegularDiscordMessage } from './regular-discord-message';
import { SheetsConditionalEmail } from './sheets-conditional-email';
import { SheetsToBlogAI } from './sheets-to-blog-ai';
import { SheetsToAirtableConditional } from './sheets-to-airtable-conditional';
import { StripeCustomerPoems } from './stripe-customer-poems';
import { Scenario } from '../types/scenario';
import { FlowTrigger } from '../types/flow-outline';

export const scenarios: Scenario<FlowTrigger>[] = [
  new NewRowGoogleSheetsSendSlackMessage(),
  new SheetsToAirtableConditional(),
  new SheetsConditionalEmail(),
  new AlternatingDiscordSlack(),
  new RegularDiscordMessage(),
  new StripeCustomerPoems(),
  new FailedStripeNotifications(),
  new SheetsToBlogAI(),
  new HubspotMailchimpSync(),
];

