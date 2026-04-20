// Data hub - imports all JSON config files
// To add new projects, simply edit the corresponding JSON file

import homepageData from './homepage.json';
import aboutData from './about.json';
import visualArtsData from './visual-arts.json';
import brandingData from './branding.json';
import photoGraphicData from './photo-graphic.json';

export { homepageData, aboutData, visualArtsData, brandingData, photoGraphicData };

// Types
export interface GalleryImage {
  src: string;
  title: string;
  category?: string;
}

export interface AwardEntry {
  date: string;
  award: string;
  project: string;
}

export interface NavItem {
  label: string;
  path: string;
  external: boolean;
}

// Background artwork configuration per route
export const routeBackgrounds: Record<string, { type: 'cycle' | 'single' | 'solid'; images?: string[]; color?: string }> = {
  '/': {
    type: 'cycle',
    images: homepageData.backgroundImages,
  },
  '/about': {
    type: 'single',
    images: [aboutData.backgroundImage],
  },
  '/visual-arts': {
    type: 'single',
    images: visualArtsData.projects.length > 0 ? [visualArtsData.projects[0].image] : [],
  },
  '/branding': {
    type: 'single',
    images: brandingData.projects.length > 0 ? [brandingData.projects[0].image] : [],
  },
  '/photo-graphic': {
    type: 'solid',
    color: '#1B3A6B',
  },
};
