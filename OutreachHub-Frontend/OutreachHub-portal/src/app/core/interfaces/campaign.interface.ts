import { Contact } from "./contact.interface";

export interface Campaign {
  _id?: string;
  name: string;
  description?: string;
  status: 'Draft' | 'Running' | 'Completed' | 'Failed';
  audience?: number;
  progress?: number;
  selectedTags?: string[];
  templateId: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  workspaceId: string;
  createdBy: string;

  targetedContacts?: Contact[];
  contacts? : Contact[]
}


export interface CampaignMessage {
  _id?: string;
  campaignId: string;
  templateId: string;
  contactId: string;
  messageContent: string;
  status: 'Pending' | 'Sent' | 'Failed';
  createdAt?: Date;
}
