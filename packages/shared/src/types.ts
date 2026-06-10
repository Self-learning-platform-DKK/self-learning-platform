export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type SQLDialect = 'SQLITE' | 'POSTGRESQL' | 'MYSQL' | 'STANDARD';
export type Plan = 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE';
export type AIProvider = 'ANTHROPIC' | 'OPENAI' | 'GOOGLE';
export type ValidationType =
  | 'RESULT_SET'
  | 'ROW_COUNT'
  | 'COLUMN_NAMES'
  | 'COLUMN_VALUES'
  | 'SORT_ORDER'
  | 'AST_STRUCTURE'
  | 'TABLE_USAGE'
  | 'KEYWORD_REQUIRED'
  | 'FORBIDDEN_KEYWORD'
  | 'PERFORMANCE';

export interface ValidationRuleConfig {
  type: ValidationType;
  config: Record<string, unknown>;
  isRequired?: boolean;
}

export interface HintConfig {
  level: number;
  content: string;
}

export interface ChallengeSeed {
  legacyId: string;
  slug: string;
  title: string;
  concept: string;
  instructions: string;
  difficulty: Difficulty;
  dialect: SQLDialect;
  xpReward: number;
  pathSlug: string;
  moduleTitle: string;
  hints: HintConfig[];
  validationRules: ValidationRuleConfig[];
  solution?: string;
  successMsg: string;
  errorMsg: string;
  isPremium?: boolean;
  aiPrompt?: string;
}

export interface DatasetSchema {
  tables: Record<
    string,
    {
      columns: { name: string; type: string; note?: string }[];
      sample?: string;
    }
  >;
}

export interface SqlResult {
  columns: string[];
  rows: Record<string, unknown>[];
}

export interface ValidationLayerResult {
  passed: boolean;
  failures: string[];
}

export interface ValidationResult {
  passed: boolean;
  layers: {
    ast: ValidationLayerResult;
    result: ValidationLayerResult;
    structural: ValidationLayerResult;
    performance: ValidationLayerResult;
  };
  feedback: string;
  xpEarned: number;
}
