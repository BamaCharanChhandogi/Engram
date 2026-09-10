import { pgTable, text, timestamp, integer, jsonb, date, uuid, uniqueIndex, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name'),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  passwordHash: text('password_hash'),
  githubId: text('github_id').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    providerProviderAccountIdIndex: uniqueIndex('accounts_provider_provider_account_id_idx').on(
      account.provider,
      account.providerAccountId
    ),
  })
);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').unique().notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    identifierTokenIndex: uniqueIndex('verification_tokens_identifier_token_idx').on(vt.identifier, vt.token),
  })
);

export const captures = pgTable(
  'captures',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    eventType: text('event_type').notNull(),
    tool: text('tool').notNull(),
    payload: jsonb('payload').notNull(),
    sessionId: text('session_id'),
    capturedAt: timestamp('captured_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdCapturedAtIndex: index('captures_user_id_captured_at_idx').on(table.userId, table.capturedAt),
    userIdEventTypeIndex: index('captures_user_id_event_type_idx').on(table.userId, table.eventType),
  })
);

export const questions = pgTable(
  'questions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    practiceDate: timestamp('practice_date', { mode: 'date' }).notNull(),
    questionType: text('question_type').notNull(),
    questionText: text('question_text').notNull(),
    codeContext: text('code_context'),
    referenceAnswer: text('reference_answer'),
    sourceCaptureIds: text('source_capture_ids').array().notNull(),
    difficulty: text('difficulty').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdPracticeDateIndex: index('questions_user_id_practice_date_idx').on(table.userId, table.practiceDate),
  })
);

export const answers = pgTable(
  'answers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => questions.id, { onDelete: 'cascade' }),
    answerText: text('answer_text').notNull(),
    aiEvaluation: jsonb('ai_evaluation'),
    answeredAt: timestamp('answered_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdAnsweredAtIndex: index('answers_user_id_answered_at_idx').on(table.userId, table.answeredAt),
  })
);

export const streaks = pgTable('streaks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  lastPracticeDate: timestamp('last_practice_date', { mode: 'date' }),
  totalQuestionsAnswered: integer('total_questions_answered').default(0).notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
export type Capture = typeof captures.$inferSelect;
export type NewCapture = typeof captures.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;
export type Streak = typeof streaks.$inferSelect;
export type NewStreak = typeof streaks.$inferInsert;
