export type Platform = 'mobile' | 'website';

export type ProjectInput = {
  year: string;
  platform: Platform;
  tag: string;
  project_name: string;
  description: string | string[];
  link_appstore?: string | null;
  link_playstore?: string | null;
  link_website?: string | null;
  display: string;
  bucket: string;
}

export type ProjectUpdateInput = {} & Partial<ProjectInput> 
