/**
 * Type definitions for schema-fixer
 */

export interface FixerConfig {
  root: string;
  schemaPath: string;
  targetVersion: string;
  autofix?: boolean;
  dryRun?: boolean;
  reportPath?: string;
  includePatterns?: string[];
  excludePatterns?: string[];
}

export interface UserStory {
  persona: string;
  goal: string;
  benefit: string;
}

export interface AcceptanceCriteria {
  given?: string[];
  when?: string[];
  then?: string[];
  and?: string[];
}

export interface SequenceBeat {
  name?: string;
  beat?: number;
  number?: number;
  event: string;
  title?: string;
  description?: string;
  userStory: UserStory;
  acceptanceCriteria: AcceptanceCriteria[];
  testFile: string;
  [key: string]: any;
}

export interface PartialSequenceBeat {
  name?: string;
  beat?: number;
  number?: number;
  event?: string;
  title?: string;
  description?: string;
  userStory?: Partial<UserStory>;
  acceptanceCriteria?: Partial<AcceptanceCriteria>[];
  testFile?: string;
  [key: string]: any;
}

export interface SequenceMovement {
  id?: string;
  name: string;
  description?: string;
  number?: number;
  userStory: UserStory;
  beats: SequenceBeat[];
  [key: string]: any;
}

export interface PartialSequenceMovement {
  id?: string;
  name?: string;
  description?: string;
  number?: number;
  userStory?: Partial<UserStory>;
  beats?: PartialSequenceBeat[];
  [key: string]: any;
}

export interface MusicalSequence {
  domainId: string;
  id: string;
  name: string;
  userStory: UserStory;
  movements: SequenceMovement[];
  metadata?: {
    version?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface PartialMusicalSequence {
  domainId?: string;
  id?: string;
  name?: string;
  userStory?: Partial<UserStory>;
  movements?: PartialSequenceMovement[];
  metadata?: {
    version?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface ValidationError {
  path: string;
  message: string;
  keyword?: string;
}

export interface ValidationResult {
  filePath: string;
  valid: boolean;
  errors?: ValidationError[];
  detectedVersion?: string;
}

export interface FileAnalysis {
  filePath: string;
  relativePath: string;
  detectedVersion: string;
  targetVersion: string;
  valid: boolean;
  errors: ValidationError[];
  requiresMigration: boolean;
  missingFields?: string[];
}

export interface AnalysisReport {
  summary: {
    totalFiles: number;
    totalScanned: number;
    totalSkipped: number;
    byVersion: Record<string, number>;
    failureCount: number;
  };
  files: FileAnalysis[];
  generatedAt: string;
}

export interface MigrationResult {
  filePath: string;
  relativePath: string;
  success: boolean;
  fromVersion: string;
  toVersion: string;
  error?: string;
  warnings?: string[];
  migrationsApplied?: string[];
  fieldsAdded?: string[];
}

export interface ValidationReport {
  summary: {
    totalValidated: number;
    validCount: number;
    invalidCount: number;
  };
  files: ValidationResult[];
  generatedAt: string;
}

export interface SchemaMigrationStep {
  fromVersion: string;
  toVersion: string;
  migrate: (doc: MusicalSequence) => MusicalSequence;
}
