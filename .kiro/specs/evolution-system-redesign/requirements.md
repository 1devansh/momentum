# Requirements Document

## Introduction

Redesign the Momentum app's 7-stage character evolution system to be psychologically meaningful, emotionally engaging, and identity-driven. The current system maps challenge counts to stages purely as decoration. The redesigned system should make each stage represent a psychological transformation, unlock meaningful rewards, deliver celebratory emotional feedback on evolution, display motivating identity-based progress messaging, and leverage behavioral psychology to improve habit consistency and long-term retention.

## Glossary

- **Evolution_Engine**: The pure business logic module (`src/features/character/engine.ts`) that computes a user's current evolution stage, progress, unlocks, and messaging from their challenge history.
- **Stage**: One of seven evolution levels representing a psychological transformation in the user's journey (Seed, Sprout, Sapling, Young Tree, Tree, Mighty Oak, Ancient Grove).
- **Stage_Identity**: The psychological meaning, emotional narrative, and identity label associated with a Stage.
- **Stage_Unlock**: A meaningful reward or feature that becomes available when a user reaches a new Stage (This is difficult to do, so can keep this optional, maybe badges or something like that). 
- **Evolution_Moment**: The celebratory experience (animation with heavily focused on animation, haptic feedback, messaging) triggered when a user transitions from one Stage to the next. It should really feel like a moment.
- **Progress_Display**: The UI component showing the user's current Stage, progress toward the next Stage, and identity-based motivational messaging.
- **Identity_Message**: Micro-copy that reinforces who the user is becoming, not just what they completed.
- **Challenge_History**: The record of all completed challenges across all goal plans.
- **Progress_Screen**: The screen (`app/(main)/progress.tsx`) displaying character evolution, evolution path, and statistics.
- **Home_Screen**: The screen (`app/(main)/home.tsx`) displaying the daily challenge and character summary.

## Requirements

### Requirement 1: Stage Identity and Psychological Meaning

**User Story:** As a user, I want each evolution stage to represent a psychological transformation in my journey, so that my growth feels meaningful and identity-driven rather than decorative.

#### Acceptance Criteria

1. THE Evolution_Engine SHALL define each Stage with a Stage_Identity containing: a symbolic name, an emoji, a minimum challenge threshold, an identity label (e.g., "The Beginner"), a psychological description (e.g., "You decided to begin."), and a transformation narrative describing what the user has become.
2. WHEN the Evolution_Engine computes the user's current Stage, THE Evolution_Engine SHALL return the full Stage_Identity including the identity label, psychological description, and transformation narrative.
3. THE Evolution_Engine SHALL preserve the seven-stage progression (Seed → Sprout → Sapling → Young Tree → Tree → Mighty Oak → Ancient Grove) with challenge thresholds of 0, 3, 7, 15, 30, 50, and 100.
4. THE Evolution_Engine SHALL ensure a user's Stage never regresses regardless of future activity or inactivity.

### Requirement 2: Stage Unlocks

**User Story:** As a user, I want to unlock meaningful rewards at each evolution stage, so that progression feels earned and gives me tangible value. (This is difficult to do, so can keep this optional, maybe badges or something like that). 

#### Acceptance Criteria

1. THE Evolution_Engine SHALL define a set of Stage_Unlocks for each Stage, where each unlock has a type (visual_variation, badge, ai_insight, reflection_prompt, feature_access, motivational_message, streak_protection, advanced_analytics), a title, and a description.
2. WHEN a user reaches a new Stage, THE Evolution_Engine SHALL return the list of newly available Stage_Unlocks for that Stage.
3. WHEN the Progress_Screen displays a Stage in the evolution path, THE Progress_Screen SHALL show the Stage_Unlocks associated with that Stage, distinguishing between unlocked and locked unlocks.
4. WHEN a Stage_Unlock has type "feature_access" and the user is not a Pro subscriber, THE Evolution_Engine SHALL gate that unlock behind the Pro subscription.

### Requirement 3: Evolution Moment Celebration

**User Story:** As a user, I want my evolution to a new stage to feel like a meaningful moment with celebratory feedback, so that I feel emotionally rewarded for my consistency.

#### Acceptance Criteria

1. WHEN a user completes a challenge that causes a Stage transition, THE Home_Screen SHALL trigger an Evolution_Moment celebration sequence.
2. WHEN an Evolution_Moment is triggered, THE Home_Screen SHALL display the new Stage emoji, the new identity label, and a transformation narrative Identity_Message (e.g., "You didn't just complete challenges. You became consistent.").
3. WHEN an Evolution_Moment is triggered, THE Home_Screen SHALL play a haptic feedback pattern and a confetti animation distinct from the regular challenge-completion confetti.
4. WHEN an Evolution_Moment is triggered, THE Home_Screen SHALL display the list of newly unlocked Stage_Unlocks for the new Stage.
5. IF the Evolution_Moment celebration is dismissed before the user views all content, THEN THE Progress_Screen SHALL provide access to review the evolution details for any reached Stage.

### Requirement 4: Identity-Based Progress Display

**User Story:** As a user, I want my progress toward the next evolution to be displayed with motivating, identity-based messaging, so that I feel pulled forward by who I'm becoming rather than pushed by a number.

#### Acceptance Criteria

1. WHEN the Progress_Screen displays progress toward the next Stage, THE Progress_Screen SHALL show an identity-based message in the format "N more steps to becoming a [next Stage name]" instead of "N more to next evolution".
2. WHEN the Progress_Screen displays the current Stage, THE Progress_Screen SHALL show the Stage_Identity including the identity label and psychological description.
3. WHEN the Home_Screen displays the character summary, THE Home_Screen SHALL show the current Stage emoji, identity label, and a short motivational Identity_Message relevant to the user's current Stage.
4. WHEN a user has reached the final Stage (Ancient Grove), THE Progress_Screen SHALL display a completion Identity_Message acknowledging mastery (e.g., "You are a force of nature. Keep growing.") instead of progress toward a next Stage.

### Requirement 5: Evolution Path Visualization

**User Story:** As a user, I want to see my full evolution path with clear visual distinction between reached, current, and future stages, so that I can appreciate how far I've come and feel motivated by what's ahead.

#### Acceptance Criteria

1. WHEN the Progress_Screen displays the evolution path, THE Progress_Screen SHALL visually distinguish between reached stages (completed), the current stage (active), and future stages (locked).
2. WHEN the Progress_Screen displays a future locked Stage, THE Progress_Screen SHALL show a preview of the Stage_Identity name and the Stage_Unlocks available at that Stage to create anticipation.
3. WHEN the Progress_Screen displays a reached Stage, THE Progress_Screen SHALL show the transformation narrative and the unlocked Stage_Unlocks for that Stage.

### Requirement 6: Retention Psychology Integration

**User Story:** As a user, I want the evolution system to reinforce my habit consistency through identity-based motivation, so that I stay engaged with the app long-term.

#### Acceptance Criteria

1. WHEN the Home_Screen displays the daily challenge, THE Home_Screen SHALL include a contextual Identity_Message that connects the current challenge to the user's Stage identity (e.g., for a Sapling: "Saplings grow by showing up. Here's today's step.").
2. WHEN a user returns to the app after missing one or more days, THE Home_Screen SHALL display a welcoming Identity_Message that reinforces continuity without punishment (e.g., "Welcome back. Your roots are still here.").
3. THE Evolution_Engine SHALL provide a stage-specific motivational message pool, where each Stage has a set of rotating Identity_Messages that the Home_Screen can display.
