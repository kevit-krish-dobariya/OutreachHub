export interface Contact {
  _id: string;   // not optional
  name: string;
  email?: string;
  phoneNumber: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  workspaceId?: string;
  createdBy?: string;
}
