import type { Chapter } from '../types';

export type ChapterData = {
  chapter: Chapter;
  zh: string;
  en: string;
  location: string;
  mapImageUrl: string;
};

export const CHAPTER_DATA: ChapterData[] = [
  {
    chapter: 1,
    zh: '第一回',
    en: 'Chapter 1',
    location: 'Black Wind Mountain',
    mapImageUrl: '/maps/chapter-1.webp',
  },
  {
    chapter: 2,
    zh: '第二回',
    en: 'Chapter 2',
    location: 'Yellow Wind Ridge',
    mapImageUrl: '/maps/chapter-2.webp',
  },
  {
    chapter: 3,
    zh: '第三回',
    en: 'Chapter 3',
    location: 'New West',
    mapImageUrl: '/maps/chapter-3.webp',
  },
  {
    chapter: 4,
    zh: '第四回',
    en: 'Chapter 4',
    location: 'The Webbed Hollow',
    mapImageUrl: '/maps/chapter-4.webp',
  },
  {
    chapter: 5,
    zh: '第五回',
    en: 'Chapter 5',
    location: 'Flaming Mountains',
    mapImageUrl: '/maps/chapter-5.webp',
  },
  {
    chapter: 6,
    zh: '第六回',
    en: 'Chapter 6',
    location: 'The Mythical Realm',
    mapImageUrl: '/maps/chapter-6.webp',
  },
];
