-- =====================================================================
-- Sample data. Run AFTER schema.sql. Safe to edit freely.
-- 25 published challenges. Base points total 152.
--   easy:   1 x 5 + 9 x 3 = 32
--   medium: 9 x 6  = 54
--   hard:   6 x 11 = 66
-- First-solve bonuses add 5 points each, so leaderboard max is 277.
-- The original sample rows stay in the table but are unpublished.
-- Test formats:
--   stdin test: {"stdin":"5\n","expected":"1\n2\n","visible":true}
--   call test:  {"call":"add(2,3)","expected":"5"} (expected = repr of result)
-- Visible tests show expected vs got. Hidden tests show pass/fail only.
-- Every description includes a worked example.
-- =====================================================================

insert into public.rooms (name, code, status)
values ('Test Room', 'TEST1', 'lobby');

insert into public.challenges
  (title, tier, type, description, starter_code, tests, rubric, points, sort_order, published)
values

-- ---------------- EASY ----------------
('Star Line', 'easy', 'python',
 $d$Read one whole number from `input()`.
Print exactly that many asterisks on one line.

Steps:
1. Read a single integer `n` with `input()`.
2. Convert it to an integer with `int()`.
3. Use string repetition to build `n` stars.
4. Print the stars. Print no spaces and no extra lines.

Example input:
5

Example output:
*****

Example input:
1

Example output:
*$d$,
 $c$n = int(input())
print()  # replace this line with the star output
$c$,
 $j$[
   {"stdin":"5\n","expected":"*****\n","visible":true},
   {"stdin":"1\n","expected":"*\n","visible":true},
   {"stdin":"3\n","expected":"***\n"},
   {"stdin":"10\n","expected":"**********\n"}
 ]$j$,
 $j$[]$j$, 5, 1, true),

('Fizz Buzz Single', 'easy', 'python',
 $d$Read one whole number from `input()`.
Print one label based on divisibility.

Steps:
1. Read an integer `n`.
2. If `n` is divisible by both 3 and 5, print `FizzBuzz`.
3. Otherwise, if `n` is divisible by 3, print `Fizz`.
4. Otherwise, if `n` is divisible by 5, print `Buzz`.
5. Otherwise, print `n` as a number.

Check both 3 and 5 before checking one of them alone.

Example input:
15

Example output:
FizzBuzz

Example input:
10

Example output:
Buzz

Example input:
7

Example output:
7$d$,
 $c$n = int(input())
# print the correct label
$c$,
 $j$[
   {"stdin":"3\n","expected":"Fizz\n","visible":true},
   {"stdin":"10\n","expected":"Buzz\n","visible":true},
   {"stdin":"15\n","expected":"FizzBuzz\n"},
   {"stdin":"7\n","expected":"7\n"},
   {"stdin":"30\n","expected":"FizzBuzz\n"},
   {"stdin":"1\n","expected":"1\n"}
 ]$j$,
 $j$[]$j$, 5, 2, true),

('Palindrome Word', 'easy', 'python',
 $d$Read one word from `input()`.
Print `YES` if the word reads the same forward and backward. Ignore uppercase and lowercase.

Steps:
1. Read the word with `input()`.
2. Convert it to lowercase.
3. Compare the word with its reverse. Slicing with `[::-1]` gives the reverse.
4. Print `YES` when they match. Print `NO` when they do not.

The input has no spaces.

Example input:
level

Example output:
YES

Example input:
Python

Example output:
NO

Example input:
Racecar

Example output:
YES$d$,
 $c$word = input()
# compare the lowercase word with its reverse
$c$,
 $j$[
   {"stdin":"level\n","expected":"YES\n","visible":true},
   {"stdin":"Python\n","expected":"NO\n","visible":true},
   {"stdin":"Racecar\n","expected":"YES\n"},
   {"stdin":"a\n","expected":"YES\n"},
   {"stdin":"ab\n","expected":"NO\n"},
   {"stdin":"rotator\n","expected":"YES\n"}
 ]$j$,
 $j$[]$j$, 5, 3, true),

('Ticket Price', 'easy', 'python',
 $d$Read one `age` from `input()`.
Print the ticket price label for that `age`.

Price bands:
- age under 12: `FREE`
- age 12 to 17: `HALF`
- age 18 to 59: `FULL`
- age 60 and above: `SENIOR`

Steps:
1. Read the `age` and convert it to an integer.
2. Use `if` and `elif` checks from the smallest band upward.
3. Print one label only.

Example input:
15

Example output:
HALF

Example input:
60

Example output:
SENIOR

Example input:
8

Example output:
FREE$d$,
 $c$age = int(input())
# print the price label
$c$,
 $j$[
   {"stdin":"8\n","expected":"FREE\n","visible":true},
   {"stdin":"15\n","expected":"HALF\n","visible":true},
   {"stdin":"18\n","expected":"FULL\n"},
   {"stdin":"60\n","expected":"SENIOR\n"},
   {"stdin":"11\n","expected":"FREE\n"},
   {"stdin":"12\n","expected":"HALF\n"},
   {"stdin":"17\n","expected":"HALF\n"},
   {"stdin":"59\n","expected":"FULL\n"}
 ]$j$,
 $j$[]$j$, 5, 4, true),

('Rectangle Stamp', 'easy', 'python',
 $d$Read two whole numbers from `input()`.
The first is `width`. The second is `height`.
Print a solid rectangle of asterisks.

Steps:
1. Read `width` and convert it to an integer.
2. Read `height` and convert it to an integer.
3. Build one row with `width` stars.
4. Print that row `height` times. Use a loop or repeat the row string.
5. Print no spaces between stars.

Example input:
3
2

Example output:
***
***

Example input:
1
3

Example output:
*
*
*$d$,
 $c$width = int(input())
height = int(input())
# build one row, then print it height times
$c$,
 $j$[
   {"stdin":"3\n2\n","expected":"***\n***\n","visible":true},
   {"stdin":"1\n3\n","expected":"*\n*\n*\n","visible":true},
   {"stdin":"4\n1\n","expected":"****\n"},
   {"stdin":"5\n2\n","expected":"*****\n*****\n"}
 ]$j$,
 $j$[]$j$, 5, 5, true),

-- ---------------- MEDIUM ----------------
('Fizz Buzz Range', 'medium', 'python',
 $d$Write a function named `fizz_range(n)`.
It returns the Fizz Buzz labels for every number from 1 through `n`.

Rules:
- Multiples of both 3 and 5 become `FizzBuzz`.
- Multiples of 3 become `Fizz`.
- Multiples of 5 become `Buzz`.
- Every other number becomes its number as a string.
- The list contains strings only.

Steps:
1. Create an empty list named `result`.
2. Loop from 1 through `n`.
3. Check both 3 and 5 before checking one of them alone.
4. Append each label to `result`.
5. Return `result`.

Example call:
fizz_range(5)

Example return:
['1', '2', 'Fizz', '4', 'Buzz']

Example call:
fizz_range(0)

Example return:
[]$d$,
 $c$def fizz_range(n):
    result = []
    # loop from 1 to n
    return result
$c$,
 $j$[
   {"call":"fizz_range(5)","expected":"['1', '2', 'Fizz', '4', 'Buzz']","visible":true},
   {"call":"fizz_range(3)","expected":"['1', '2', 'Fizz']","visible":true},
   {"call":"fizz_range(15)","expected":"['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz']"},
   {"call":"fizz_range(1)","expected":"['1']"},
   {"call":"fizz_range(0)","expected":"[]"}
 ]$j$,
 $j$[]$j$, 10, 6, true),

('Countdown Capsule', 'medium', 'python',
 $d$Write a function named `countdown(n)`.
It returns a list that counts down from `n` to 1, then ends with `GO!`.

Rules:
- For `n` = 3, the list is `[3, 2, 1, 'GO!']`.
- For `n` <= 0, the list is `['GO!']`.
- Use a `while` loop for the countdown.

Steps:
1. Create an empty list named `result`.
2. While `n` is greater than 0, append `n`, then subtract 1.
3. Append `'GO!'` after the loop.
4. Return `result`.

Example call:
countdown(3)

Example return:
[3, 2, 1, 'GO!']

Example call:
countdown(0)

Example return:
['GO!']$d$,
 $c$def countdown(n):
    result = []
    # count down with a while loop
    result.append("GO!")
    return result
$c$,
 $j$[
   {"call":"countdown(3)","expected":"[3, 2, 1, 'GO!']","visible":true},
   {"call":"countdown(1)","expected":"[1, 'GO!']","visible":true},
   {"call":"countdown(5)","expected":"[5, 4, 3, 2, 1, 'GO!']"},
   {"call":"countdown(0)","expected":"['GO!']"},
   {"call":"countdown(-2)","expected":"['GO!']"}
 ]$j$,
 $j$[]$j$, 10, 7, true),

('Palindrome Phrase', 'medium', 'python',
 $d$Write a function named `is_palindrome_phrase(text)`.
It returns `True` when a phrase reads the same forward and backward after cleanup.

Cleanup rules:
- Keep only letters and digits.
- Ignore spaces, punctuation, and symbols.
- Ignore uppercase and lowercase.
- Return `True` or `False`, not `YES` or `NO`.

Steps:
1. Create an empty string named `cleaned`.
2. Loop through every character in `text`.
3. Keep the character when it is a letter or a digit. Lowercase it before adding.
4. Compare `cleaned` with its reverse. Slicing with `[::-1]` gives the reverse.
5. Return the comparison result.

Example call:
is_palindrome_phrase("A man, a plan, a canal: Panama")

Example return:
True

Example call:
is_palindrome_phrase("hello")

Example return:
False$d$,
 $c$def is_palindrome_phrase(text):
    cleaned = ""
    # keep only letters and digits, lowercased
    return cleaned == cleaned[::-1]
$c$,
 $j$[
   {"call":"is_palindrome_phrase(\"A man, a plan, a canal: Panama\")","expected":"True","visible":true},
   {"call":"is_palindrome_phrase(\"hello\")","expected":"False","visible":true},
   {"call":"is_palindrome_phrase(\"No 'x' in Nixon\")","expected":"True"},
   {"call":"is_palindrome_phrase(\"12321\")","expected":"True"},
   {"call":"is_palindrome_phrase(\"abc!\")","expected":"False"},
   {"call":"is_palindrome_phrase(\"\")","expected":"True"}
 ]$j$,
 $j$[]$j$, 10, 8, true),

-- ---------------- HARD ----------------
('Grid Escape', 'hard', 'python',
 $d$Write a function named `escape_time(grid)`.
It returns the fewest minutes needed to walk from `S` to `E`.

The `grid` is a list of strings. Each string is one row.
Characters:
- `S` is the start.
- `E` is the exit.
- `.` is an open square.
- `#` is a wall.

Rules:
- Move one square at a time, up, down, left, or right.
- You cannot move outside the `grid` or onto a wall.
- Each move takes 1 minute.
- Return `-1` when the exit cannot be reached.
- The `grid` always has exactly one `S` and one `E`.

Steps:
1. Find the row and column of `S` and `E`.
2. Start a search from `S`. Track the distance for each square.
3. Visit neighbors in the four directions.
4. Stop when you reach `E`.
5. Return the distance, or `-1` if no path exists.

Example call:
escape_time(["S..", "...", "..E"])

Example return:
4

Example call:
escape_time(["S#E"])

Example return:
-1$d$,
 $c$def escape_time(grid):
    # find S and E, then search
    return -1
$c$,
 $j$[
   {"call":"escape_time([\"S..\", \"...\", \"..E\"])","expected":"4","visible":true},
   {"call":"escape_time([\"S#E\"])","expected":"-1","visible":true},
   {"call":"escape_time([\"S..\", \"###\", \"..E\"])","expected":"-1"},
   {"call":"escape_time([\"S.#\", \"..#\", \"...\", \"..E\"])","expected":"5"},
   {"call":"escape_time([\"SE\"])","expected":"1"},
   {"call":"escape_time([\"S...#\", \".###.\", \".#...\", \".#.#.\", \"...#E\"])","expected":"12"}
 ]$j$,
 $j$[]$j$, 20, 9, true),

('Live Scoreboard Card', 'hard', 'web',
 $d$Build a single-page scoreboard card.
Use plain HTML, CSS, and JavaScript, or use React. No backend is needed.

Build this page:
1. A form with two inputs: `name` as text, and `score` as a number.
2. A `Submit` button.
3. When submitted, show a card with the `name`, the `score`, and a badge.
4. Badge rules:
   - score under 20: `ROOKIE`
   - score 20 to 59: `SOLID`
   - score 60 to 89: `SHARP`
   - score 90 or more: `ACE`
5. A progress bar from 0 to 100 that matches the `score`.
6. A history list with the last 3 submissions, newest first.
7. Block empty names and scores outside 0 to 100. Show a short error message.
8. Keep the layout usable on a phone width with no horizontal scrolling.

Example:
Enter name Ada and score 92, then submit.
The card shows Ada, 92, badge `ACE`, and a bar filled to 92%.
Submit Ben with 45, then Cy with 12.
The history shows Cy 12, Ben 45, Ada 92.

This challenge is judged in person. Keep the project easy to open and run.$d$,
 '',
 $j$[]$j$,
 $j$[
   {"label":"Form submits name and score","points":4},
   {"label":"Card shows name, score, and correct badge for all four bands","points":6},
   {"label":"Progress bar reflects score from 0 to 100","points":4},
   {"label":"History keeps last 3 entries, newest first","points":5},
   {"label":"Phone width works without horizontal overflow","points":3},
   {"label":"Empty name or score outside 0-100 is blocked","points":3}
 ]$j$, 25, 10, true);

-- ---------------- STUDENT-FRIENDLY PYTHON PUZZLES (APPEND) ----------------
-- 15 additional challenges from python_puzzles_student_with_hints.sql.
-- Kept in sync with supabase/migrations/20261124142615_append_student_puzzles.sql.

with new_challenges (title, tier, description, starter_code, tests, points, source_order) as (
  values
    (
      'Even or Odd',
      'easy',
      $d$Return `Even` if the integer is even, otherwise return `Odd`.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
even_or_odd(4)

Example return:
'Even'

**Hints**
- Use the remainder operator `%`.
- An even number has a remainder of zero when divided by 2.$d$,
      $c$def even_or_odd(number):
    """Return 'Even' or 'Odd'."""
    # Return the result. Do not print it.
    pass
$c$,
      $j$[{"call": "even_or_odd(4)", "expected": "'Even'", "visible": true}, {"call": "even_or_odd(7)", "expected": "'Odd'", "visible": true}, {"call": "even_or_odd(0)", "expected": "'Even'", "visible": true}, {"call": "even_or_odd(-3)", "expected": "'Odd'", "visible": true}, {"call": "even_or_odd(1024)", "expected": "'Even'", "visible": false}]$j$::jsonb,
      100,
      1
    ),
    (
      'Grade Checker',
      'easy',
      $d$Return `Pass` if the score is at least 75; otherwise return `Fail`.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
grade(75)

Example return:
'Pass'

**Hints**
- Use an `if` statement to compare the score with 75.
- Remember that a score of exactly 75 passes.$d$,
      $c$def grade(score):
    """Return 'Pass' or 'Fail'."""
    # Return the result. Do not print it.
    pass
$c$,
      $j$[{"call": "grade(75)", "expected": "'Pass'", "visible": true}, {"call": "grade(74)", "expected": "'Fail'", "visible": true}, {"call": "grade(100)", "expected": "'Pass'", "visible": true}, {"call": "grade(0)", "expected": "'Fail'", "visible": true}, {"call": "grade(89)", "expected": "'Pass'", "visible": false}]$j$::jsonb,
      100,
      2
    ),
    (
      'Count Vowels',
      'easy',
      $d$Count the vowels a, e, i, o, u in the string, ignoring case.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
count_vowels('Hello')

Example return:
2

**Hints**
- Convert the text to lowercase first.
- Loop through the characters and check membership in `aeiou`.$d$,
      $c$def count_vowels(text):
    """Return the number of vowels in text."""
    # Return the result. Do not print it.
    pass
$c$,
      $j$[{"call": "count_vowels('Hello')", "expected": "2", "visible": true}, {"call": "count_vowels('AEIOU')", "expected": "5", "visible": true}, {"call": "count_vowels('rhythm')", "expected": "0", "visible": true}, {"call": "count_vowels('')", "expected": "0", "visible": true}, {"call": "count_vowels('PyThOn PrOgRaMmInG')", "expected": "4", "visible": false}]$j$::jsonb,
      100,
      3
    ),
    (
      'Even Number Sum',
      'easy',
      $d$Return the sum of all even integers in the list. Return 0 for an empty list.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
even_sum([1, 2, 3, 4])

Example return:
6

**Hints**
- Start with a total of zero.
- Loop through the list and add a number only when its remainder after division by 2 is zero.$d$,
      $c$def even_sum(numbers):
    """Return the sum of even numbers."""
    # Return the result. Do not print it.
    pass
$c$,
      $j$[{"call": "even_sum([1, 2, 3, 4])", "expected": "6", "visible": true}, {"call": "even_sum([])", "expected": "0", "visible": true}, {"call": "even_sum([1, 3])", "expected": "0", "visible": true}, {"call": "even_sum([-2, 0, 8])", "expected": "6", "visible": true}, {"call": "even_sum([10, -4, 7, 2])", "expected": "8", "visible": false}]$j$::jsonb,
      100,
      4
    ),
    (
      'Reverse a Word',
      'easy',
      $d$Return the string with its characters in reverse order. Preserve capitalization.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
reverse_word('Python')

Example return:
'nohtyP'

**Hints**
- Think about reading characters from the end to the beginning.
- Python string slicing supports a negative step.$d$,
      $c$def reverse_word(word):
    """Return word reversed."""
    # Return the result. Do not print it.
    pass
$c$,
      $j$[{"call": "reverse_word('Python')", "expected": "'nohtyP'", "visible": true}, {"call": "reverse_word('a')", "expected": "'a'", "visible": true}, {"call": "reverse_word('')", "expected": "''", "visible": true}, {"call": "reverse_word('123')", "expected": "'321'", "visible": true}, {"call": "reverse_word('AbCd')", "expected": "'dCbA'", "visible": false}]$j$::jsonb,
      100,
      5
    ),
    (
      'FizzBuzz List',
      'medium',
      $d$Return a list for integers 1 through n. Replace multiples of 3 with `Fizz`, multiples of 5 with `Buzz`, and multiples of both with `FizzBuzz`. Keep other numbers as integers. n is nonnegative.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
fizzbuzz(5)

Example return:
[1, 2, 'Fizz', 4, 'Buzz']

**Hints**
- Use `range()` to visit the numbers from 1 through n.
- Check divisibility by both 3 and 5 before checking either one separately.$d$,
      $c$def fizzbuzz(n):
    """Return the FizzBuzz list from 1 to n."""
    # Return the result. Do not print it.
    pass
$c$,
      $j$[{"call": "fizzbuzz(5)", "expected": "[1, 2, 'Fizz', 4, 'Buzz']", "visible": true}, {"call": "fizzbuzz(0)", "expected": "[]", "visible": true}, {"call": "fizzbuzz(3)", "expected": "[1, 2, 'Fizz']", "visible": true}, {"call": "fizzbuzz(15)", "expected": "[1, 2, 'Fizz', 4, 'Buzz', 'Fizz', 7, 8, 'Fizz', 'Buzz', 11, 'Fizz', 13, 14, 'FizzBuzz']", "visible": true}, {"call": "fizzbuzz(1)", "expected": "[1]", "visible": false}]$j$::jsonb,
      200,
      6
    ),
    (
      'Remove Duplicates',
      'medium',
      $d$Return a list containing each integer only once, keeping the order of its first appearance.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
unique_items([2, 1, 2, 3, 1])

Example return:
[2, 1, 3]

**Hints**
- Start with an empty result list.
- Before appending a number, check whether it is already in the result.$d$,
      $c$def unique_items(numbers):
    """Return numbers with duplicates removed, preserving first-seen order."""
    # Return the result. Do not print it.
    pass
$c$,
      $j$[{"call": "unique_items([2, 1, 2, 3, 1])", "expected": "[2, 1, 3]", "visible": true}, {"call": "unique_items([])", "expected": "[]", "visible": true}, {"call": "unique_items([4, 4])", "expected": "[4]", "visible": true}, {"call": "unique_items([0, -1, 0])", "expected": "[0, -1]", "visible": true}, {"call": "unique_items([5, 5, 5, 1, 2, 1])", "expected": "[5, 1, 2]", "visible": false}]$j$::jsonb,
      200,
      7
    ),
    (
      'Second Highest Score',
      'medium',
      $d$Return the second highest distinct integer score. If fewer than two distinct scores exist, return `None`.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
second_highest([90, 80, 90, 70])

Example return:
80

**Hints**
- Remove repeated scores before comparing them.
- Sort the distinct scores and check that at least two remain.$d$,
      $c$def second_highest(scores):
    """Return the second highest distinct score, or None."""
    # Return the result. Do not print it.
    pass
$c$,
      $j$[{"call": "second_highest([90, 80, 90, 70])", "expected": "80", "visible": true}, {"call": "second_highest([5, 5])", "expected": "None", "visible": true}, {"call": "second_highest([])", "expected": "None", "visible": true}, {"call": "second_highest([-3, -1, -2])", "expected": "-2", "visible": true}, {"call": "second_highest([10])", "expected": "None", "visible": false}]$j$::jsonb,
      200,
      8
    ),
    (
      'Word Counter',
      'medium',
      $d$Return a dictionary mapping each lowercase word to its count. Words are separated by whitespace; inputs contain only letters and whitespace.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
word_count('Cat dog CAT')

Example return:
{'cat': 2, 'dog': 1}

**Hints**
- Use `lower()` and `split()` to prepare the words.
- Use a dictionary to store counts; `get()` can supply a default of zero.$d$,
      $c$def word_count(text):
    """Return a dictionary of lowercase word counts."""
    # Return the result. Do not print it.
    pass
$c$,
      $j$[{"call": "word_count('Cat dog CAT')", "expected": "{'cat': 2, 'dog': 1}", "visible": true}, {"call": "word_count('')", "expected": "{}", "visible": true}, {"call": "word_count('  hi  HI ')", "expected": "{'hi': 2}", "visible": true}, {"call": "word_count('one two')", "expected": "{'one': 1, 'two': 1}", "visible": true}, {"call": "word_count('red Red RED blue')", "expected": "{'red': 3, 'blue': 1}", "visible": false}]$j$::jsonb,
      200,
      9
    ),
    (
      'Shopping Cart Total',
      'medium',
      $d$Each item is a list `[price, quantity]` of nonnegative integers. Return the total cost of all items. An empty cart costs 0.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
cart_total([[20, 2], [15, 3]])

Example return:
85

**Hints**
- Each item contains two values: price and quantity.
- Multiply those values for each item and accumulate the results.$d$,
      $c$def cart_total(items):
    """Return the total cart cost."""
    # Return the result. Do not print it.
    pass
$c$,
      $j$[{"call": "cart_total([[20, 2], [15, 3]])", "expected": "85", "visible": true}, {"call": "cart_total([])", "expected": "0", "visible": true}, {"call": "cart_total([[100, 0]])", "expected": "0", "visible": true}, {"call": "cart_total([[5, 4], [10, 1]])", "expected": "30", "visible": true}, {"call": "cart_total([[7, 3], [2, 5], [9, 1]])", "expected": "40", "visible": false}]$j$::jsonb,
      200,
      10
    ),
    (
      'Student Leaderboard',
      'hard',
      $d$Each student is `[name, score]`. Return the names sorted from highest to lowest score. For tied scores, sort names alphabetically (case-sensitive). Names are unique.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
leaderboard([['Ben', 90], ['Ana', 90], ['Cal', 80]])

Example return:
['Ana', 'Ben', 'Cal']

**Hints**
- Each student has a name and a score.
- Consider a sorting key with two parts: negative score first, then name.$d$,
      $c$def leaderboard(students):
    """Return student names ordered by rank."""
    # Return the result. Do not print it.
    pass
$c$,
      $j$[{"call": "leaderboard([['Ben', 90], ['Ana', 90], ['Cal', 80]])", "expected": "['Ana', 'Ben', 'Cal']", "visible": true}, {"call": "leaderboard([])", "expected": "[]", "visible": true}, {"call": "leaderboard([['Zed', 99], ['Amy', 10]])", "expected": "['Zed', 'Amy']", "visible": true}, {"call": "leaderboard([['C', 2], ['B', 2], ['A', 2]])", "expected": "['A', 'B', 'C']", "visible": true}, {"call": "leaderboard([['Mia', 50], ['Noa', 75], ['Lia', 75]])", "expected": "['Lia', 'Noa', 'Mia']", "visible": false}]$j$::jsonb,
      300,
      11
    ),
    (
      'Inventory Tracker',
      'hard',
      $d$Stock is a dictionary of item names and nonnegative quantities. Each sale is `[item, quantity]` with a positive integer quantity. Process sales in order, ignoring unknown items and sales exceeding available stock. Return the final stock dictionary, retaining zero quantities.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
inventory({'pen': 5, 'bag': 2}, [['pen', 3], ['bag', 3], ['pen', 2]])

Example return:
{'pen': 0, 'bag': 2}

**Hints**
- Process one sale at a time using a loop.
- Check that the item exists and has enough stock before subtracting the quantity.$d$,
      $c$def inventory(stock, sales):
    """Return final stock after processing valid sales in order."""
    # Return the result. Do not print it.
    pass
$c$,
      $j$[{"call": "inventory({'pen': 5, 'bag': 2}, [['pen', 3], ['bag', 3], ['pen', 2]])", "expected": "{'pen': 0, 'bag': 2}", "visible": true}, {"call": "inventory({'a': 1}, [['b', 1]])", "expected": "{'a': 1}", "visible": true}, {"call": "inventory({}, [])", "expected": "{}", "visible": true}, {"call": "inventory({'a': 2}, [['a', 3], ['a', 1]])", "expected": "{'a': 1}", "visible": true}, {"call": "inventory({'apple': 3, 'pear': 1}, [['apple', 1], ['apple', 1], ['pear', 1]])", "expected": "{'apple': 1, 'pear': 0}", "visible": false}]$j$::jsonb,
      300,
      12
    ),
    (
      'Password Validator',
      'hard',
      $d$Return True only if the password has at least 8 characters, at least one uppercase letter, one lowercase letter, one digit, and one of `!@#$`. Inputs contain only ASCII letters, digits and printable symbols.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
valid_password('Hello123!')

Example return:
True

**Hints**
- Check the length first, then track each required character category.
- Character methods such as `isupper()`, `islower()`, and `isdigit()` can help; test special symbols using `in`.$d$,
      $c$def valid_password(password):
    """Return True if password meets all rules, else False."""
    # Return the result. Do not print it.
    pass
$c$,
      $j$[{"call": "valid_password('Hello123!')", "expected": "True", "visible": true}, {"call": "valid_password('hello123!')", "expected": "False", "visible": true}, {"call": "valid_password('Aa1!')", "expected": "False", "visible": true}, {"call": "valid_password('Hello123?')", "expected": "False", "visible": true}, {"call": "valid_password('HELLO123!')", "expected": "False", "visible": true}, {"call": "valid_password('Helloabc!')", "expected": "False", "visible": true}, {"call": "valid_password('GoodPass1#')", "expected": "True", "visible": false}]$j$::jsonb,
      300,
      13
    ),
    (
      'Tic-Tac-Toe Winner',
      'hard',
      $d$Given a 3 by 3 list of lists containing `X`, `O`, or an empty string, return `X` or `O` if that player has three in a row, column, or diagonal. Otherwise return `None`. At most one player has a winning line.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
winner([['X', 'X', 'X'], ['O', '', 'O'], ['', '', '']])

Example return:
'X'

**Hints**
- Check rows, columns, and the two diagonals separately.
- A winning line contains three equal, nonempty values.$d$,
      $c$def winner(board):
    """Return 'X', 'O', or None."""
    # Return the result. Do not print it.
    pass
$c$,
      $j$[{"call": "winner([['X', 'X', 'X'], ['O', '', 'O'], ['', '', '']])", "expected": "'X'", "visible": true}, {"call": "winner([['O', 'X', ''], ['O', 'X', ''], ['O', '', '']])", "expected": "'O'", "visible": true}, {"call": "winner([['X', 'O', ''], ['O', 'X', ''], ['', '', 'X']])", "expected": "'X'", "visible": true}, {"call": "winner([['X', 'O', 'X'], ['X', 'O', 'O'], ['O', 'X', 'X']])", "expected": "None", "visible": true}, {"call": "winner([['', '', 'O'], ['', 'O', ''], ['O', '', 'X']])", "expected": "'O'", "visible": true}, {"call": "winner([['X', 'O', 'X'], ['O', 'O', 'X'], ['', '', 'X']])", "expected": "'X'", "visible": false}]$j$::jsonb,
      300,
      14
    ),
    (
      'Cashier Change',
      'hard',
      $d$Given a nonnegative integer amount in pesos, return a dictionary with string keys `100`, `50`, `20`, `10`, `5`, `1` and integer counts. Use the largest denomination first, then the next largest. Include all denominations even when their count is zero.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
make_change(186)

Example return:
{'100': 1, '50': 1, '20': 1, '10': 1, '5': 1, '1': 1}

**Hints**
- Start with the largest denomination and work downward.
- Use integer division `//` to find how many fit and `%` to update the remaining change.$d$,
      $c$def make_change(amount):
    """Return a denomination-count dictionary for amount."""
    # Return the result. Do not print it.
    pass
$c$,
      $j$[{"call": "make_change(186)", "expected": "{'100': 1, '50': 1, '20': 1, '10': 1, '5': 1, '1': 1}", "visible": true}, {"call": "make_change(0)", "expected": "{'100': 0, '50': 0, '20': 0, '10': 0, '5': 0, '1': 0}", "visible": true}, {"call": "make_change(99)", "expected": "{'100': 0, '50': 1, '20': 2, '10': 0, '5': 1, '1': 4}", "visible": true}, {"call": "make_change(205)", "expected": "{'100': 2, '50': 0, '20': 0, '10': 0, '5': 1, '1': 0}", "visible": true}, {"call": "make_change(7)", "expected": "{'100': 0, '50': 0, '20': 0, '10': 0, '5': 1, '1': 2}", "visible": false}]$j$::jsonb,
      300,
      15
    )
)
insert into public.challenges
  (title, tier, type, description, starter_code, tests, rubric, points, sort_order, published)
select
  n.title,
  n.tier,
  'python',
  n.description,
  n.starter_code,
  n.tests,
  '[]'::jsonb,
  n.points,
  n.source_order + 10,
  true
from new_challenges n
where not exists (
  select 1 from public.challenges c where c.title = n.title
);

with new_challenges (title, tier, description, starter_code, tests, points, source_order) as (
  values
    (
      'Star Staircase',
      'easy',
      $d$Read one whole number from `input()`.
Print `n` lines. Line 1 has one star, line 2 has two stars, and so on.

Steps:
1. Read an integer `n`.
2. Loop `i` from 1 through `n`.
3. Print `i` asterisks on each line.
4. Print no spaces between stars.

Example input:
4

Example output:
*
**
***
****

**Hints**
- Use `range(1, n + 1)` to visit the row numbers.
- `"*" * i` builds one row.$d$,
      $c$n = int(input())

# print the staircase here
$c$,
      $j$[{"stdin":"1\n","expected":"*\n","visible":true},{"stdin":"4\n","expected":"*\n**\n***\n****\n","visible":true},{"stdin":"3\n","expected":"*\n**\n***\n","visible":false},{"stdin":"6\n","expected":"*\n**\n***\n****\n*****\n******\n","visible":false},{"stdin":"8\n","expected":"*\n**\n***\n****\n*****\n******\n*******\n********\n","visible":false}]$j$::jsonb,
      3,
      26
    ),
    (
      'Hollow Frame',
      'easy',
      $d$Read two whole numbers from `input()`: `width` first, then `height`. Both are at least 3.
Print a rectangle border made of stars. Middle rows have a star at each end and spaces inside.

Steps:
1. Read `width` and `height` as integers.
2. Print the top row as `width` stars.
3. For each middle row, print `*`, then `width - 2` spaces, then `*`.
4. Print the bottom row as `width` stars.

Example input:
5
3

Example output:
*****
*   *
*****

**Hints**
- The top and bottom rows are the same string.
- A middle row is `"*" + " " * (width - 2) + "*".$d$,
      $c$width = int(input())
height = int(input())

# print the frame here
$c$,
      $j$[{"stdin":"5\n3\n","expected":"*****\n*   *\n*****\n","visible":true},{"stdin":"3\n4\n","expected":"***\n* *\n* *\n***\n","visible":true},{"stdin":"4\n4\n","expected":"****\n*  *\n*  *\n****\n","visible":false},{"stdin":"6\n3\n","expected":"******\n*    *\n******\n","visible":false},{"stdin":"3\n3\n","expected":"***\n* *\n***\n","visible":false}]$j$::jsonb,
      3,
      27
    ),
    (
      'Star Bar Chart',
      'easy',
      $d$Read one integer `n`, then `n` whole numbers, one per line.
For each number, print one row with that many asterisks. A value of 0 prints an empty line.

Steps:
1. Read `n` and convert it to an integer.
2. Loop `n` times and read one value each time.
3. Print the value repeated as stars.

Example input:
3
3
1
4

Example output:
***
*
****

**Hints**
- Read the count once, then read the values inside a loop.
- Use string repetition to build each row.$d$,
      $c$n = int(input())

# read n values and print the bars
$c$,
      $j$[{"stdin":"3\n3\n1\n4\n","expected":"***\n*\n****\n","visible":true},{"stdin":"2\n6\n2\n","expected":"******\n**\n","visible":true},{"stdin":"4\n5\n2\n0\n3\n","expected":"*****\n**\n\n***\n","visible":false},{"stdin":"1\n7\n","expected":"*******\n","visible":false},{"stdin":"5\n1\n2\n3\n4\n5\n","expected":"*\n**\n***\n****\n*****\n","visible":false}]$j$::jsonb,
      3,
      28
    ),
    (
      'Checkerboard Sprint',
      'easy',
      $d$Read two whole numbers from `input()`: `rows` first, then `cols`.
Print a checkerboard using `*` and `.`. The top-left cell is `*`. Neighboring cells alternate.

Steps:
1. Read `rows` and `cols` as integers.
2. Loop over each row and column with zero-based indexes.
3. Print `*` when `row + column` is even. Print `.` otherwise.
4. Print no spaces between cells.

Example input:
2
3

Example output:
*.*
.*.

**Hints**
- Zero-based indexes make the parity rule simple.
- Build one row as a string, then print it.$d$,
      $c$rows = int(input())
cols = int(input())

# print the checkerboard
$c$,
      $j$[{"stdin":"2\n3\n","expected":"*.*\n.*.\n","visible":true},{"stdin":"3\n3\n","expected":"*.*\n.*.\n*.*\n","visible":true},{"stdin":"1\n1\n","expected":"*\n","visible":false},{"stdin":"4\n5\n","expected":"*.*.*\n.*.*.\n*.*.*\n.*.*.\n","visible":false},{"stdin":"2\n6\n","expected":"*.*.*.\n.*.*.*\n","visible":false}]$j$::jsonb,
      3,
      29
    ),
    (
      'Pyramid Parade',
      'medium',
      $d$Read one whole number `n` from `input()`.
Print a centered pyramid with `n` rows. Row `i` starts at 1 and has `n - i` leading spaces followed by `2 * i - 1` stars.

Steps:
1. Read `n` as an integer.
2. Loop `i` from 1 through `n`.
3. Build the row from spaces, then stars.
4. Print the row. Leading spaces matter; trailing spaces do not.

Example input:
4

Example output:
   *
  ***
 *****
*******

**Hints**
- Each row is `" " * (n - i) + "*" * (2 * i - 1)`.
- The last row has no leading spaces.$d$,
      $c$n = int(input())

# print the pyramid
$c$,
      $j$[{"stdin":"1\n","expected":"*\n","visible":true},{"stdin":"4\n","expected":"   *\n  ***\n *****\n*******\n","visible":true},{"stdin":"3\n","expected":"  *\n ***\n*****\n","visible":false},{"stdin":"5\n","expected":"    *\n   ***\n  *****\n *******\n*********\n","visible":false},{"stdin":"7\n","expected":"      *\n     ***\n    *****\n   *******\n  *********\n ***********\n*************\n","visible":false}]$j$::jsonb,
      6,
      30
    ),
    (
      'Multiplication Table',
      'medium',
      $d$Read one whole number `n` from `input()`. `n` is between 1 and 9.
Print an `n` by `n` multiplication table. Row `i` holds the products `i * 1` through `i * n`.

Steps:
1. Read `n` as an integer.
2. Loop `i` from 1 through `n` for the rows.
3. Loop `j` from 1 through `n` for the columns.
4. Join the products of one row with a single space.

Example input:
3

Example output:
1 2 3
2 4 6
3 6 9

**Hints**
- Build a list of strings, then use `" ".join(row)`.
- Both loops use `range(1, n + 1)`.$d$,
      $c$n = int(input())

# print the multiplication table
$c$,
      $j$[{"stdin":"3\n","expected":"1 2 3\n2 4 6\n3 6 9\n","visible":true},{"stdin":"1\n","expected":"1\n","visible":true},{"stdin":"5\n","expected":"1 2 3 4 5\n2 4 6 8 10\n3 6 9 12 15\n4 8 12 16 20\n5 10 15 20 25\n","visible":false},{"stdin":"9\n","expected":"1 2 3 4 5 6 7 8 9\n2 4 6 8 10 12 14 16 18\n3 6 9 12 15 18 21 24 27\n4 8 12 16 20 24 28 32 36\n5 10 15 20 25 30 35 40 45\n6 12 18 24 30 36 42 48 54\n7 14 21 28 35 42 49 56 63\n8 16 24 32 40 48 56 64 72\n9 18 27 36 45 54 63 72 81\n","visible":false},{"stdin":"4\n","expected":"1 2 3 4\n2 4 6 8\n3 6 9 12\n4 8 12 16\n","visible":false}]$j$::jsonb,
      6,
      31
    ),
    (
      'Scoreboard Roster',
      'medium',
      $d$Read one integer `n`, then `n` lines containing a name and a score separated by a space.
Print a header and one row per entry. Use these exact widths:

- name: left-aligned in 8 characters
- score: right-aligned in 5 characters
- one space between the columns

Names are at most 8 characters. Scores are at most 5 digits.

Example input:
2
Ada 92
Ben 7

Example output:
NAME     SCORE
Ada         92
Ben          7

**Hints**
- Split each input line with `.split()`.
- An f-string like `f"{name:<8} {score:>5}"` applies both widths.$d$,
      $c$n = int(input())

# read n name-score lines and print the roster
$c$,
      $j$[{"stdin":"2\nAda 92\nBen 7\n","expected":"NAME     SCORE\nAda         92\nBen          7\n","visible":true},{"stdin":"3\nMia 100\nJo 85\nAlex 9\n","expected":"NAME     SCORE\nMia        100\nJo          85\nAlex         9\n","visible":true},{"stdin":"1\nSam 0\n","expected":"NAME     SCORE\nSam          0\n","visible":false},{"stdin":"2\nLongName 12\nBo 123\n","expected":"NAME     SCORE\nLongName    12\nBo         123\n","visible":false},{"stdin":"4\nA 1\nBB 22\nCCC 333\nDDDD 4444\n","expected":"NAME     SCORE\nA            1\nBB          22\nCCC        333\nDDDD      4444\n","visible":false}]$j$::jsonb,
      6,
      32
    ),
    (
      'Hourglass Hustle',
      'medium',
      $d$Read one odd whole number `n` from `input()`.
Print an hourglass of stars. The first row has `n` stars. Each following row has two fewer stars and one more leading space, down to one star. Then grow back to `n` stars.

Steps:
1. Read `n` as an integer.
2. Print rows while the star count is greater than 0, reducing it by 2 each time.
3. Count leading spaces as `(n - stars) // 2`.
4. Print rows while growing the star count back to `n`.

Example input:
5

Example output:
*****
 ***
  *
 ***
*****

**Hints**
- Keep the current star count in one variable.
- The space count is `(n - stars) // 2` for every row.$d$,
      $c$n = int(input())

# print the hourglass
$c$,
      $j$[{"stdin":"3\n","expected":"***\n *\n***\n","visible":true},{"stdin":"5\n","expected":"*****\n ***\n  *\n ***\n*****\n","visible":true},{"stdin":"1\n","expected":"*\n","visible":false},{"stdin":"7\n","expected":"*******\n *****\n  ***\n   *\n  ***\n *****\n*******\n","visible":false},{"stdin":"9\n","expected":"*********\n *******\n  *****\n   ***\n    *\n   ***\n  *****\n *******\n*********\n","visible":false}]$j$::jsonb,
      6,
      33
    ),
    (
      'Robot Courier',
      'hard',
      $d$Write a function named `deliver(grid, moves)`.

`grid` is a list of strings. Each string is one row. Characters:
- `S` is the start.
- `.` is an open square.
- `#` is a wall.
There is exactly one `S`.

`moves` is a string of `U`, `D`, `L`, and `R`. Start at `S` and apply each move in order. Ignore a move that would leave the grid or land on a wall.

Return the final position as `[row, column]` with zero-based indexes.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
deliver(["S..", ".#.", "..."], "RRDD")

Example return:
[2, 2]

**Hints**
- Find `S` first by looping over rows and columns.
- Keep the row and column in variables. Update them only for valid moves.$d$,
      $c$def deliver(grid, moves):
    """Return the final [row, column] after all valid moves."""
    # Find S, then apply moves one by one.
    pass
$c$,
      $j$[{"call":"deliver([\"S..\", \".#.\", \"...\"], \"RRDD\")","expected":"[2, 2]","visible":true},{"call":"deliver([\"S#.\", \"...\"], \"RR\")","expected":"[0, 0]","visible":true},{"call":"deliver([\"S\"], \"UDLR\")","expected":"[0, 0]","visible":false},{"call":"deliver([\"S#.\", \"..#\", \"...\"], \"RRDD\")","expected":"[2, 0]","visible":false},{"call":"deliver([\"S..\", \"...\", \"..#\"], \"RDLU\")","expected":"[0, 0]","visible":false}]$j$::jsonb,
      11,
      34
    )
)
insert into public.challenges
  (title, tier, type, description, starter_code, tests, rubric, points, sort_order, published)
select
  n.title,
  n.tier,
  'python',
  n.description,
  n.starter_code,
  n.tests,
  '[]'::jsonb,
  n.points,
  n.source_order,
  true
from new_challenges n
where not exists (
  select 1 from public.challenges c where c.title = n.title
);

-- ---------------- FINAL CATALOG BALANCE ----------------
-- 25 published challenges total 152 base points:
--   1 easy x 5 + 9 easy x 3 + 9 medium x 6 + 6 hard x 11.
-- The original sample rows stay in the table but are unpublished.

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
    ('Cashier Change'),
    ('Star Line'),
    ('Star Staircase'),
    ('Hollow Frame'),
    ('Star Bar Chart'),
    ('Checkerboard Sprint'),
    ('Pyramid Parade'),
    ('Multiplication Table'),
    ('Scoreboard Roster'),
    ('Hourglass Hustle'),
    ('Robot Courier')
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
    ('Cashier Change'),
    ('Star Staircase'),
    ('Hollow Frame'),
    ('Star Bar Chart'),
    ('Checkerboard Sprint'),
    ('Pyramid Parade'),
    ('Multiplication Table'),
    ('Scoreboard Roster'),
    ('Hourglass Hustle'),
    ('Robot Courier')
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
