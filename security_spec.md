# Security Specification for BrainQuest Jr.

## Data Invariants
1. A user profile must be owned by the authenticated user.
2. An attempt must be linked to the user's own profile.
3. Only users with the `parent` role can create or modify custom quizzes.
4. Users cannot modify their own `totalExp` or `level` directly without a valid quiz attempt (though in Firebase rules we usually enforce the write logic).
5. Timestamps must be server-generated.

## The "Dirty Dozen" Payloads
1. Attempt to create a user profile with `userId` of another person.
2. Attempt to update `totalExp` to a massive number without a quiz.
3. Attempt to create a `CustomQuiz` as a `child`.
4. Attempt to delete another user's quiz history.
5. Attempt to inject a 1MB string into the `displayName`.
6. Attempt to update a `QuizAttempt` after it's been created (immutable).
7. Attempt to set `email_verified` manually (not possible via rules but we check it).
8. Attempt to read PII (not many PII here, but profiles should be protected).
9. Attempt to create a quiz with invalid characters in the `quizId`.
10. Attempt to join another parent's linked children list (if we had one).
11. Attempt to bypass quiz difficulty constraints.
12. Attempt to write to a "System-Only" field like `globalScoreboard` if we had one.

## Test Runner (Mock summary)
The `firestore.rules.test.ts` will verify that:
- Non-owners cannot even read another user's attempts.
- Non-parents cannot create quizzes.
- All writes follow the `isValidUser` and `isValidAttempt` schemas.
