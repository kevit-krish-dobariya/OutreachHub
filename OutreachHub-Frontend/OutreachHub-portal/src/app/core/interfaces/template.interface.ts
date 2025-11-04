export interface Template {
  _id: string;
  name: string;
  type: 'Text' | 'Text-Image';
  message: {
    text: string;
    imageUrl?: string;
  };
  workspaceId: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}
