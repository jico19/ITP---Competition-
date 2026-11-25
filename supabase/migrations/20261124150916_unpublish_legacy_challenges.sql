-- Restore the 100-point published catalog: only sort_order 11-25 are student puzzles.
-- Legacy rows are kept for history but must not be available to players.

update public.challenges
   set published = false
 where sort_order between 1 and 10;
