import { ANIMALS_CATEGORY } from './flashcards/animals';
import { FRUITS_CATEGORY } from './flashcards/fruits';
import { VEGETABLES_CATEGORY } from './flashcards/vegetables';
import { FOOD_DRINKS_CATEGORY } from './flashcards/food_drinks';
import { BODY_PARTS_CATEGORY } from './flashcards/body_parts';
import { CLOTHES_CATEGORY } from './flashcards/clothes';
import { TOYS_CATEGORY } from './flashcards/toys';
import { STATIONERY_CATEGORY } from './flashcards/stationery';
import { HOUSE_CATEGORY } from './flashcards/house';
import { KITCHEN_CATEGORY } from './flashcards/kitchen';
import { BATHROOM_CATEGORY } from './flashcards/bathroom';
import { TRANSPORTATION_CATEGORY } from './flashcards/transportation';
import { PLACES_CATEGORY } from './flashcards/places';
import { PROFESSIONS_CATEGORY } from './flashcards/professions';
import { FAMILY_CATEGORY } from './flashcards/family';
import { SHAPES_COLORS_CATEGORY } from './flashcards/shapes_colors';
import { ACTIONS_CATEGORY } from './flashcards/actions';
import { WEATHER_SKY_CATEGORY } from './flashcards/weather_sky';
import { NATURE_CATEGORY } from './flashcards/nature';
import { SEA_LIFE_CATEGORY } from './flashcards/sea_life';
import { FARM_CATEGORY } from './flashcards/farm';
import { WILD_ANIMALS_CATEGORY } from './flashcards/wild_animals';
import { INSECTS_CATEGORY } from './flashcards/insects';
import { MUSIC_CATEGORY } from './flashcards/music';
import { SPORTS_CATEGORY } from './flashcards/sports';
import { GARDEN_CATEGORY } from './flashcards/garden';
import { SPACE_CATEGORY } from './flashcards/space';
import { MEDICAL_CATEGORY } from './flashcards/medical';
import { BUILDINGS_CATEGORY } from './flashcards/buildings';
import { NUMBERS_CATEGORY } from './flashcards/numbers';

export interface FlashcardItem {
  id: string;
  word: string;
  phonetic: string;
  translation: string;
  emoji: string;
  imageUrl?: string;
  category: string;
  exampleSentence: string;
  exampleTranslation: string;
  hint: string;
  color: string;
}

export interface FlashcardCategory {
  id: string;
  title: string;
  titleIndonesian: string;
  icon: string;
  color: string;
  borderColor: string;
  description: string;
  cards: FlashcardItem[];
}

export const FLASHCARD_CATEGORIES: FlashcardCategory[] = [
  ANIMALS_CATEGORY,
  FRUITS_CATEGORY,
  VEGETABLES_CATEGORY,
  FOOD_DRINKS_CATEGORY,
  BODY_PARTS_CATEGORY,
  CLOTHES_CATEGORY,
  TOYS_CATEGORY,
  STATIONERY_CATEGORY,
  HOUSE_CATEGORY,
  KITCHEN_CATEGORY,
  BATHROOM_CATEGORY,
  TRANSPORTATION_CATEGORY,
  PLACES_CATEGORY,
  PROFESSIONS_CATEGORY,
  FAMILY_CATEGORY,
  SHAPES_COLORS_CATEGORY,
  ACTIONS_CATEGORY,
  WEATHER_SKY_CATEGORY,
  NATURE_CATEGORY,
  SEA_LIFE_CATEGORY,
  FARM_CATEGORY,
  WILD_ANIMALS_CATEGORY,
  INSECTS_CATEGORY,
  MUSIC_CATEGORY,
  SPORTS_CATEGORY,
  GARDEN_CATEGORY,
  SPACE_CATEGORY,
  MEDICAL_CATEGORY,
  BUILDINGS_CATEGORY,
  NUMBERS_CATEGORY,
];

