
export interface User {
  // Properties from Supabase Auth user
  id: string;
  email?: string;
  user_metadata?: { [key: string]: any };

  // Properties from public.users table, this is the source of truth for the name
  full_name?: string;
  telegram_id?: number;
}

export interface Role {
  id: number; // SERIAL
  name: string; // TEXT
}

export interface UserRole {
  user_id: string; // uuid
  role_id: number; // INT
}

export interface MenuSection {
  id: number; // SERIAL
  name: string; // TEXT
  is_active: boolean; // BOOLEAN
}

export interface MenuCategory {
  id: number; // SERIAL
  name: string; // TEXT
}

export interface SectionCategory {
  section_id: number; // INT
  category_id: number; // INT
}

export interface MenuItem {
  id: number; // SERIAL
  name: string; // TEXT
  description: string; // TEXT
  category_id: number; // INT
  price: number; // NUMERIC
  image_url: string; // TEXT
  key_features: Record<string, any>; // JSONB
  is_active: boolean; // BOOLEAN
}

export interface RecommendationLink {
  id: number; // BIGSERIAL
  source_item_id: number; // INT
  target_item_id: number; // INT
  link_type: string; // TEXT
  prompt_text: string; // TEXT
}

export interface SalesScenario {
  id: number; // SERIAL
  name: string; // TEXT
  is_active: boolean; // BOOLEAN
}

export interface ScenarioLink {
  scenario_id: number; // INT
  link_id: number; // INT
}

export interface UserLearningProgress {
  id: number; // BIGSERIAL
  user_id: string; // uuid
  menu_item_id: number; // INT
  status: 'new' | 'learning' | 'learned'; // TEXT
  familiarity_score: number; // INT
  last_reviewed_at: string; // TIMESTAMPTZ
  next_review_at: string; // TIMESTAMPTZ
}

export interface Quiz {
  id: number; // SERIAL
  title: string; // TEXT
  description: string; // TEXT
}

export interface Question {
  id: number; // SERIAL
  quiz_id: number; // INT
  question_text: string; // TEXT
  question_type: string; // TEXT
}

export interface Answer {
  id: number; // SERIAL
  question_id: number; // INT
  answer_text: string; // TEXT
  is_correct: boolean; // BOOLEAN
}

export interface GameSession {
  id: string; // uuid
  user_id: string; // uuid
  quiz_id: number; // INT
  score: number; // INT
  status: 'started' | 'completed'; // TEXT
}

export interface UserAnswer {
  id: number; // BIGSERIAL
  session_id: string; // uuid
  question_id: number; // INT
  chosen_answer_id: number; // INT
  is_correct: boolean; // BOOLEAN
}

export interface Achievement {
  id: number; // SERIAL
  name: string; // TEXT
  description: string; // TEXT
  icon_url: string; // TEXT
}

export interface UserAchievement {
  id: number; // BIGSERIAL
  user_id: string; // uuid
  achievement_id: number; // INT
}