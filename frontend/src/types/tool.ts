export interface Tool {
  id: string;
  name: string;
  description: string;
  domain: string;
  tags: string[];
  ui_type: string;
  available_actions: string[];
}