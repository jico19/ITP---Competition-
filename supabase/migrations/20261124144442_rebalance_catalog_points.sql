-- Make the published challenge catalog total exactly 100 base points.
-- Student puzzles: 5 easy x 3 + 5 medium x 6 + 5 hard x 11 = 100.
-- The original 10 challenges stay in the database but are unpublished so their
-- rows and structure are preserved; only the leftover test results are cleared.

delete from public.first_solves;
delete from public.judge_scores;
delete from public.scores;
delete from public.submissions;

with student_puzzles (title) as (
  values
    ('Even or Odd'),
    ('Grade Checker'),
    ('Count Vowels'),
    ('Even Number Sum'),
    ('Reverse a Word'),
    ('FizzBuzz List'),
    ('Remove Duplicates'),
    ('Second Highest Score'),
    ('Word Counter'),
    ('Shopping Cart Total'),
    ('Student Leaderboard'),
    ('Inventory Tracker'),
    ('Password Validator'),
    ('Tic-Tac-Toe Winner'),
    ('Cashier Change')
)
update public.challenges c
   set published = false
 where not exists (
   select 1 from student_puzzles s where s.title = c.title
 );

with student_puzzles (title) as (
  values
    ('Even or Odd'),
    ('Grade Checker'),
    ('Count Vowels'),
    ('Even Number Sum'),
    ('Reverse a Word'),
    ('FizzBuzz List'),
    ('Remove Duplicates'),
    ('Second Highest Score'),
    ('Word Counter'),
    ('Shopping Cart Total'),
    ('Student Leaderboard'),
    ('Inventory Tracker'),
    ('Password Validator'),
    ('Tic-Tac-Toe Winner'),
    ('Cashier Change')
)
update public.challenges c
   set points = case c.tier
                  when 'easy' then 3
                  when 'medium' then 6
                  when 'hard' then 11
                  else c.points
                end
  from student_puzzles s
 where c.title = s.title;
