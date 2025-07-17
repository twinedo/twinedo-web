export type Platform = 'mobile' | 'website';

export interface ProjectInput {
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

export interface ProjectUpdateInput extends Partial<ProjectInput> {}

export interface Project {
  id: string;
  year: string;
  platform: Platform;
  tag: string;
  project_name: string;
  description: string[];
  link_appstore?: string | null;
  link_playstore?: string | null;
  link_website?: string | null;
  display: string;
  bucket: string;
  createdAt: Date;
  updatedAt: Date;
}