export type Project = {
	bucket: string;
	description: string[] | string;
	display: string;
	id: string;
	key?: string;
	link_appstore: string;
	link_playstore: string;
	link_website: string;
	project_name: string 
	platform: string | 'mobile' | 'website';
	tag: string;
	year: string;
	createdAt?: string;
	updatedAt?: string
}

export type ProjectImage = {
  id: string;
  bucket: string;
  filename: string;
  isFeatured: boolean;
  isThumbnail: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  url?: string;
}