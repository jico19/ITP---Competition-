-- Current challenges exported from the linked Supabase project ITP - Competition.
-- Source: public.challenges. Generated: 2026-11-24T21:58:14

insert into public.challenges
  (id, title, tier, type, description, starter_code, tests, rubric, points, sort_order, published)
values
  ('3e4c9b1e-0a4f-4522-b34a-3e99ccf5f096', $itp$Star Line$itp$, 'easy', 'python', $itp$Read one whole number from input.
Print exactly that many asterisks on one line.

Steps:
1. Read a single integer n with input().
2. Convert it to an integer with int().
3. Use string repetition to build n stars.
4. Print the stars. Print no spaces and no extra lines.

Example input:
5

Example output:
*****

Example input:
1

Example output:
*$itp$, $itp$n = int(input())
print()  # replace this line with the star output
$itp$, $itp$[{"expected":"*****\n","stdin":"5\n","visible":true},{"expected":"*\n","stdin":"1\n","visible":true},{"expected":"***\n","stdin":"3\n"},{"expected":"**********\n","stdin":"10\n"}]$itp$::jsonb, $itp$[]$itp$::jsonb, 5, 1, true),
  ('2feddd97-5001-457b-ae4d-720c4003403d', $itp$Fizz Buzz Single$itp$, 'easy', 'python', $itp$Read one whole number from input.
Print one label based on divisibility.

Steps:
1. Read an integer n.
2. If n is divisible by both 3 and 5, print FizzBuzz.
3. Otherwise, if n is divisible by 3, print Fizz.
4. Otherwise, if n is divisible by 5, print Buzz.
5. Otherwise, print n as a number.

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
7$itp$, $itp$n = int(input())
# print the correct label
$itp$, $itp$[{"expected":"Fizz\n","stdin":"3\n","visible":true},{"expected":"Buzz\n","stdin":"10\n","visible":true},{"expected":"FizzBuzz\n","stdin":"15\n"},{"expected":"7\n","stdin":"7\n"},{"expected":"FizzBuzz\n","stdin":"30\n"},{"expected":"1\n","stdin":"1\n"}]$itp$::jsonb, $itp$[]$itp$::jsonb, 5, 2, true),
  ('ca4b19a9-1f8d-496e-a63a-1e67e720d590', $itp$Palindrome Word$itp$, 'easy', 'python', $itp$Read one word from input.
Print YES if the word reads the same forward and backward. Ignore uppercase and lowercase.

Steps:
1. Read the word with input().
2. Convert it to lowercase.
3. Compare the word with its reverse. Slicing with [::-1] gives the reverse.
4. Print YES when they match. Print NO when they do not.

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
YES$itp$, $itp$word = input()
# compare the lowercase word with its reverse
$itp$, $itp$[{"expected":"YES\n","stdin":"level\n","visible":true},{"expected":"NO\n","stdin":"Python\n","visible":true},{"expected":"YES\n","stdin":"Racecar\n"},{"expected":"YES\n","stdin":"a\n"},{"expected":"NO\n","stdin":"ab\n"},{"expected":"YES\n","stdin":"rotator\n"}]$itp$::jsonb, $itp$[]$itp$::jsonb, 5, 3, true),
  ('0ce68205-d228-422f-84f2-382e040c7461', $itp$Ticket Price$itp$, 'easy', 'python', $itp$Read one age from input.
Print the ticket price label for that age.

Price bands:
- age under 12: FREE
- age 12 to 17: HALF
- age 18 to 59: FULL
- age 60 and above: SENIOR

Steps:
1. Read the age and convert it to an integer.
2. Use if and elif checks from the smallest band upward.
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
FREE$itp$, $itp$age = int(input())
# print the price label
$itp$, $itp$[{"expected":"FREE\n","stdin":"8\n","visible":true},{"expected":"HALF\n","stdin":"15\n","visible":true},{"expected":"FULL\n","stdin":"18\n"},{"expected":"SENIOR\n","stdin":"60\n"},{"expected":"FREE\n","stdin":"11\n"},{"expected":"HALF\n","stdin":"12\n"},{"expected":"HALF\n","stdin":"17\n"},{"expected":"FULL\n","stdin":"59\n"}]$itp$::jsonb, $itp$[]$itp$::jsonb, 5, 4, true),
  ('95bcd12d-7809-453e-9f18-5b3ba580b731', $itp$Rectangle Stamp$itp$, 'easy', 'python', $itp$Read two whole numbers from input.
The first is width. The second is height.
Print a solid rectangle of asterisks.

Steps:
1. Read width and convert it to an integer.
2. Read height and convert it to an integer.
3. Build one row with width stars.
4. Print that row height times. Use a loop or repeat the row string.
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
*$itp$, $itp$width = int(input())
height = int(input())
# build one row, then print it height times
$itp$, $itp$[{"expected":"***\n***\n","stdin":"3\n2\n","visible":true},{"expected":"*\n*\n*\n","stdin":"1\n3\n","visible":true},{"expected":"****\n","stdin":"4\n1\n"},{"expected":"*****\n*****\n","stdin":"5\n2\n"}]$itp$::jsonb, $itp$[]$itp$::jsonb, 5, 5, true),
  ('f41ffac9-e744-4dfe-9728-636f1a076352', $itp$Fizz Buzz Range$itp$, 'medium', 'python', $itp$Write a function named fizz_range(n).
It returns the Fizz Buzz labels for every number from 1 through n.

Rules:
- Multiples of both 3 and 5 become FizzBuzz.
- Multiples of 3 become Fizz.
- Multiples of 5 become Buzz.
- Every other number becomes its number as a string.
- The list contains strings only.

Steps:
1. Create an empty list named result.
2. Loop from 1 through n.
3. Check both 3 and 5 before checking one of them alone.
4. Append each label to result.
5. Return result.

Example call:
fizz_range(5)

Example return:
['1', '2', 'Fizz', '4', 'Buzz']

Example call:
fizz_range(0)

Example return:
[]$itp$, $itp$def fizz_range(n):
    result = []
    # loop from 1 to n
    return result
$itp$, $itp$[{"call":"fizz_range(5)","expected":"[\u00271\u0027, \u00272\u0027, \u0027Fizz\u0027, \u00274\u0027, \u0027Buzz\u0027]","visible":true},{"call":"fizz_range(3)","expected":"[\u00271\u0027, \u00272\u0027, \u0027Fizz\u0027]","visible":true},{"call":"fizz_range(15)","expected":"[\u00271\u0027, \u00272\u0027, \u0027Fizz\u0027, \u00274\u0027, \u0027Buzz\u0027, \u0027Fizz\u0027, \u00277\u0027, \u00278\u0027, \u0027Fizz\u0027, \u0027Buzz\u0027, \u002711\u0027, \u0027Fizz\u0027, \u002713\u0027, \u002714\u0027, \u0027FizzBuzz\u0027]"},{"call":"fizz_range(1)","expected":"[\u00271\u0027]"},{"call":"fizz_range(0)","expected":"[]"}]$itp$::jsonb, $itp$[]$itp$::jsonb, 10, 6, true),
  ('b874f79b-1955-47fd-ab11-8084535c66ae', $itp$Countdown Capsule$itp$, 'medium', 'python', $itp$Write a function named countdown(n).
It returns a list that counts down from n to 1, then ends with GO!.

Rules:
- For n = 3, the list is [3, 2, 1, 'GO!'].
- For n <= 0, the list is ['GO!'].
- Use a while loop for the countdown.

Steps:
1. Create an empty list named result.
2. While n is greater than 0, append n, then subtract 1.
3. Append 'GO!' after the loop.
4. Return result.

Example call:
countdown(3)

Example return:
[3, 2, 1, 'GO!']

Example call:
countdown(0)

Example return:
['GO!']$itp$, $itp$def countdown(n):
    result = []
    # count down with a while loop
    result.append("GO!")
    return result
$itp$, $itp$[{"call":"countdown(3)","expected":"[3, 2, 1, \u0027GO!\u0027]","visible":true},{"call":"countdown(1)","expected":"[1, \u0027GO!\u0027]","visible":true},{"call":"countdown(5)","expected":"[5, 4, 3, 2, 1, \u0027GO!\u0027]"},{"call":"countdown(0)","expected":"[\u0027GO!\u0027]"},{"call":"countdown(-2)","expected":"[\u0027GO!\u0027]"}]$itp$::jsonb, $itp$[]$itp$::jsonb, 10, 7, true),
  ('20c67f47-9a2b-42a3-b00f-c03f558c721e', $itp$Palindrome Phrase$itp$, 'medium', 'python', $itp$Write a function named is_palindrome_phrase(text).
It returns True when a phrase reads the same forward and backward after cleanup.

Cleanup rules:
- Keep only letters and digits.
- Ignore spaces, punctuation, and symbols.
- Ignore uppercase and lowercase.
- Return True or False, not YES or NO.

Steps:
1. Create an empty string named cleaned.
2. Loop through every character in text.
3. Keep the character when it is a letter or a digit. Lowercase it before adding.
4. Compare cleaned with its reverse. Slicing with [::-1] gives the reverse.
5. Return the comparison result.

Example call:
is_palindrome_phrase("A man, a plan, a canal: Panama")

Example return:
True

Example call:
is_palindrome_phrase("hello")

Example return:
False$itp$, $itp$def is_palindrome_phrase(text):
    cleaned = ""
    # keep only letters and digits, lowercased
    return cleaned == cleaned[::-1]
$itp$, $itp$[{"call":"is_palindrome_phrase(\"A man, a plan, a canal: Panama\")","expected":"True","visible":true},{"call":"is_palindrome_phrase(\"hello\")","expected":"False","visible":true},{"call":"is_palindrome_phrase(\"No \u0027x\u0027 in Nixon\")","expected":"True"},{"call":"is_palindrome_phrase(\"12321\")","expected":"True"},{"call":"is_palindrome_phrase(\"abc!\")","expected":"False"},{"call":"is_palindrome_phrase(\"\")","expected":"True"}]$itp$::jsonb, $itp$[]$itp$::jsonb, 10, 8, true),
  ('99981373-a7a6-4192-8b09-9ea59a2458f9', $itp$Grid Escape$itp$, 'hard', 'python', $itp$Write a function named escape_time(grid).
It returns the fewest minutes needed to walk from S to E.

The grid is a list of strings. Each string is one row.
Characters:
- S is the start.
- E is the exit.
- . is an open square.
- # is a wall.

Rules:
- Move one square at a time, up, down, left, or right.
- You cannot move outside the grid or onto a wall.
- Each move takes 1 minute.
- Return -1 when the exit cannot be reached.
- The grid always has exactly one S and one E.

Steps:
1. Find the row and column of S and E.
2. Start a search from S. Track the distance for each square.
3. Visit neighbors in the four directions.
4. Stop when you reach E.
5. Return the distance, or -1 if no path exists.

Example call:
escape_time(["S..", "...", "..E"])

Example return:
4

Example call:
escape_time(["S#E"])

Example return:
-1$itp$, $itp$def escape_time(grid):
    # find S and E, then search
    return -1
$itp$, $itp$[{"call":"escape_time([\"S..\", \"...\", \"..E\"])","expected":"4","visible":true},{"call":"escape_time([\"S#E\"])","expected":"-1","visible":true},{"call":"escape_time([\"S..\", \"###\", \"..E\"])","expected":"-1"},{"call":"escape_time([\"S.#\", \"..#\", \"...\", \"..E\"])","expected":"5"},{"call":"escape_time([\"SE\"])","expected":"1"},{"call":"escape_time([\"S...#\", \".###.\", \".#...\", \".#.#.\", \"...#E\"])","expected":"12"}]$itp$::jsonb, $itp$[]$itp$::jsonb, 20, 9, true),
  ('af3966c7-092d-4e5e-9d82-42a48ca45084', $itp$Live Scoreboard Card$itp$, 'hard', 'web', $itp$Build a single-page scoreboard card.
Use plain HTML, CSS, and JavaScript, or use React. No backend is needed.

Build this page:
1. A form with two inputs: name as text, and score as a number.
2. A Submit button.
3. When submitted, show a card with the name, the score, and a badge.
4. Badge rules:
   - score under 20: ROOKIE
   - score 20 to 59: SOLID
   - score 60 to 89: SHARP
   - score 90 or more: ACE
5. A progress bar from 0 to 100 that matches the score.
6. A history list with the last 3 submissions, newest first.
7. Block empty names and scores outside 0 to 100. Show a short error message.
8. Keep the layout usable on a phone width with no horizontal scrolling.

Example:
Enter name Ada and score 92, then submit.
The card shows Ada, 92, badge ACE, and a bar filled to 92%.
Submit Ben with 45, then Cy with 12.
The history shows Cy 12, Ben 45, Ada 92.

This challenge is judged in person. Keep the project easy to open and run.$itp$, $itp$$itp$, $itp$[]$itp$::jsonb, $itp$[{"label":"Form submits name and score","points":4},{"label":"Card shows name, score, and correct badge for all four bands","points":6},{"label":"Progress bar reflects score from 0 to 100","points":4},{"label":"History keeps last 3 entries, newest first","points":5},{"label":"Phone width works without horizontal overflow","points":3},{"label":"Empty name or score outside 0-100 is blocked","points":3}]$itp$::jsonb, 25, 10, true);
