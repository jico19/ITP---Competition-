-- Append the student-friendly Python puzzle set to the existing challenge catalog.
-- Reconciled from python_puzzles_student_with_hints.sql: public.puzzles -> public.challenges,
-- and args/JSON-value tests -> call/repr-string tests understood by the Pyodide runner.
-- Append-only: existing challenges and their submissions/scores are untouched.

with new_challenges (title, tier, description, starter_code, tests, points, source_order) as (
  values
    (
      'Even or Odd',
      'easy',
      $d$Return `Even` if the integer is even, otherwise return `Odd`.

**Example:** `even_or_odd(4)` returns `'Even'`.

Return the result; do not print it.

**Hints**
- Use the remainder operator `%`.
- An even number has a remainder of zero when divided by 2.$d$,
      $c$def even_or_odd(number):
    pass
$c$,
      $j$[{"call":"even_or_odd(4)","expected":"'Even'","visible":true},{"call":"even_or_odd(7)","expected":"'Odd'","visible":true},{"call":"even_or_odd(0)","expected":"'Even'","visible":true},{"call":"even_or_odd(-3)","expected":"'Odd'","visible":true}]$j$::jsonb,
      100,
      1
    ),
    (
      'Grade Checker',
      'easy',
      $d$Return `Pass` if the score is at least 75; otherwise return `Fail`.

**Example:** `grade(75)` returns `'Pass'`.

Return the result; do not print it.

**Hints**
- Use an `if` statement to compare the score with 75.
- Remember that a score of exactly 75 passes.$d$,
      $c$def grade(score):
    pass
$c$,
      $j$[{"call":"grade(75)","expected":"'Pass'","visible":true},{"call":"grade(74)","expected":"'Fail'","visible":true},{"call":"grade(100)","expected":"'Pass'","visible":true},{"call":"grade(0)","expected":"'Fail'","visible":true}]$j$::jsonb,
      100,
      2
    ),
    (
      'Count Vowels',
      'easy',
      $d$Count the vowels a, e, i, o, u in the string, ignoring case.

**Example:** `count_vowels('Hello')` returns `2`.

Return the result; do not print it.

**Hints**
- Convert the text to lowercase first.
- Loop through the characters and check membership in `aeiou`.$d$,
      $c$def count_vowels(text):
    pass
$c$,
      $j$[{"call":"count_vowels('Hello')","expected":"2","visible":true},{"call":"count_vowels('AEIOU')","expected":"5","visible":true},{"call":"count_vowels('rhythm')","expected":"0","visible":true},{"call":"count_vowels('')","expected":"0","visible":true}]$j$::jsonb,
      100,
      3
    ),
    (
      'Even Number Sum',
      'easy',
      $d$Return the sum of all even integers in the list. Return 0 for an empty list.

**Example:** `even_sum([1, 2, 3, 4])` returns `6`.

Return the result; do not print it.

**Hints**
- Start with a total of zero.
- Loop through the list and add a number only when its remainder after division by 2 is zero.$d$,
      $c$def even_sum(numbers):
    pass
$c$,
      $j$[{"call":"even_sum([1, 2, 3, 4])","expected":"6","visible":true},{"call":"even_sum([])","expected":"0","visible":true},{"call":"even_sum([1, 3])","expected":"0","visible":true},{"call":"even_sum([-2, 0, 8])","expected":"6","visible":true}]$j$::jsonb,
      100,
      4
    ),
    (
      'Reverse a Word',
      'easy',
      $d$Return the string with its characters in reverse order. Preserve capitalization.

**Example:** `reverse_word('Python')` returns `'nohtyP'`.

Return the result; do not print it.

**Hints**
- Think about reading characters from the end to the beginning.
- Python string slicing supports a negative step.$d$,
      $c$def reverse_word(word):
    pass
$c$,
      $j$[{"call":"reverse_word('Python')","expected":"'nohtyP'","visible":true},{"call":"reverse_word('a')","expected":"'a'","visible":true},{"call":"reverse_word('')","expected":"''","visible":true},{"call":"reverse_word('123')","expected":"'321'","visible":true}]$j$::jsonb,
      100,
      5
    ),
    (
      'FizzBuzz List',
      'medium',
      $d$Return a list for integers 1 through n. Replace multiples of 3 with `Fizz`, multiples of 5 with `Buzz`, and multiples of both with `FizzBuzz`. Keep other numbers as integers. n is nonnegative.

**Example:** `fizzbuzz(5)` returns `[1, 2, 'Fizz', 4, 'Buzz']`.

Return the result; do not print it.

**Hints**
- Use `range()` to visit the numbers from 1 through n.
- Check divisibility by both 3 and 5 before checking either one separately.$d$,
      $c$def fizzbuzz(n):
    pass
$c$,
      $j$[{"call":"fizzbuzz(5)","expected":"[1, 2, 'Fizz', 4, 'Buzz']","visible":true},{"call":"fizzbuzz(0)","expected":"[]","visible":true},{"call":"fizzbuzz(3)","expected":"[1, 2, 'Fizz']","visible":true},{"call":"fizzbuzz(15)","expected":"[1, 2, 'Fizz', 4, 'Buzz', 'Fizz', 7, 8, 'Fizz', 'Buzz', 11, 'Fizz', 13, 14, 'FizzBuzz']","visible":true}]$j$::jsonb,
      200,
      6
    ),
    (
      'Remove Duplicates',
      'medium',
      $d$Return a list containing each integer only once, keeping the order of its first appearance.

**Example:** `unique_items([2, 1, 2, 3, 1])` returns `[2, 1, 3]`.

Return the result; do not print it.

**Hints**
- Start with an empty result list.
- Before appending a number, check whether it is already in the result.$d$,
      $c$def unique_items(numbers):
    pass
$c$,
      $j$[{"call":"unique_items([2, 1, 2, 3, 1])","expected":"[2, 1, 3]","visible":true},{"call":"unique_items([])","expected":"[]","visible":true},{"call":"unique_items([4, 4])","expected":"[4]","visible":true},{"call":"unique_items([0, -1, 0])","expected":"[0, -1]","visible":true}]$j$::jsonb,
      200,
      7
    ),
    (
      'Second Highest Score',
      'medium',
      $d$Return the second highest distinct integer score. If fewer than two distinct scores exist, return `None`.

**Example:** `second_highest([90, 80, 90, 70])` returns `80`.

Return the result; do not print it.

**Hints**
- Remove repeated scores before comparing them.
- Sort the distinct scores and check that at least two remain.$d$,
      $c$def second_highest(scores):
    pass
$c$,
      $j$[{"call":"second_highest([90, 80, 90, 70])","expected":"80","visible":true},{"call":"second_highest([5, 5])","expected":"None","visible":true},{"call":"second_highest([])","expected":"None","visible":true},{"call":"second_highest([-3, -1, -2])","expected":"-2","visible":true}]$j$::jsonb,
      200,
      8
    ),
    (
      'Word Counter',
      'medium',
      $d$Return a dictionary mapping each lowercase word to its count. Words are separated by whitespace; inputs contain only letters and whitespace.

**Example:** `word_count('Cat dog CAT')` returns `{'cat': 2, 'dog': 1}`.

Return the result; do not print it.

**Hints**
- Use `lower()` and `split()` to prepare the words.
- Use a dictionary to store counts; `get()` can supply a default of zero.$d$,
      $c$def word_count(text):
    pass
$c$,
      $j$[{"call":"word_count('Cat dog CAT')","expected":"{'cat': 2, 'dog': 1}","visible":true},{"call":"word_count('')","expected":"{}","visible":true},{"call":"word_count('  hi  HI ')","expected":"{'hi': 2}","visible":true},{"call":"word_count('one two')","expected":"{'one': 1, 'two': 1}","visible":true}]$j$::jsonb,
      200,
      9
    ),
    (
      'Shopping Cart Total',
      'medium',
      $d$Each item is a list `[price, quantity]` of nonnegative integers. Return the total cost of all items. An empty cart costs 0.

**Example:** `cart_total([[20, 2], [15, 3]])` returns `85`.

Return the result; do not print it.

**Hints**
- Each item contains two values: price and quantity.
- Multiply those values for each item and accumulate the results.$d$,
      $c$def cart_total(items):
    pass
$c$,
      $j$[{"call":"cart_total([[20, 2], [15, 3]])","expected":"85","visible":true},{"call":"cart_total([])","expected":"0","visible":true},{"call":"cart_total([[100, 0]])","expected":"0","visible":true},{"call":"cart_total([[5, 4], [10, 1]])","expected":"30","visible":true}]$j$::jsonb,
      200,
      10
    ),
    (
      'Student Leaderboard',
      'hard',
      $d$Each student is `[name, score]`. Return the names sorted from highest to lowest score. For tied scores, sort names alphabetically (case-sensitive). Names are unique.

**Example:** `leaderboard([['Ben', 90], ['Ana', 90], ['Cal', 80]])` returns `['Ana', 'Ben', 'Cal']`.

Return the result; do not print it.

**Hints**
- Each student has a name and a score.
- Consider a sorting key with two parts: negative score first, then name.$d$,
      $c$def leaderboard(students):
    pass
$c$,
      $j$[{"call":"leaderboard([['Ben', 90], ['Ana', 90], ['Cal', 80]])","expected":"['Ana', 'Ben', 'Cal']","visible":true},{"call":"leaderboard([])","expected":"[]","visible":true},{"call":"leaderboard([['Zed', 99], ['Amy', 10]])","expected":"['Zed', 'Amy']","visible":true},{"call":"leaderboard([['C', 2], ['B', 2], ['A', 2]])","expected":"['A', 'B', 'C']","visible":true}]$j$::jsonb,
      300,
      11
    ),
    (
      'Inventory Tracker',
      'hard',
      $d$Stock is a dictionary of item names and nonnegative quantities. Each sale is `[item, quantity]` with a positive integer quantity. Process sales in order, ignoring unknown items and sales exceeding available stock. Return the final stock dictionary, retaining zero quantities.

**Example:** `inventory({'pen': 5, 'bag': 2}, [['pen', 3], ['bag', 3], ['pen', 2]])` returns `{'pen': 0, 'bag': 2}`.

Return the result; do not print it.

**Hints**
- Process one sale at a time using a loop.
- Check that the item exists and has enough stock before subtracting the quantity.$d$,
      $c$def inventory(stock, sales):
    pass
$c$,
      $j$[{"call":"inventory({'pen': 5, 'bag': 2}, [['pen', 3], ['bag', 3], ['pen', 2]])","expected":"{'pen': 0, 'bag': 2}","visible":true},{"call":"inventory({'a': 1}, [['b', 1]])","expected":"{'a': 1}","visible":true},{"call":"inventory({}, [])","expected":"{}","visible":true},{"call":"inventory({'a': 2}, [['a', 3], ['a', 1]])","expected":"{'a': 1}","visible":true}]$j$::jsonb,
      300,
      12
    ),
    (
      'Password Validator',
      'hard',
      $d$Return True only if the password has at least 8 characters, at least one uppercase letter, one lowercase letter, one digit, and one of `!@#$`. Inputs contain only ASCII letters, digits and printable symbols.

**Example:** `valid_password('Hello123!')` returns `True`.

Return the result; do not print it.

**Hints**
- Check the length first, then track each required character category.
- Character methods such as `isupper()`, `islower()`, and `isdigit()` can help; test special symbols using `in`.$d$,
      $c$def valid_password(password):
    pass
$c$,
      $j$[{"call":"valid_password('Hello123!')","expected":"True","visible":true},{"call":"valid_password('hello123!')","expected":"False","visible":true},{"call":"valid_password('Aa1!')","expected":"False","visible":true},{"call":"valid_password('Hello123?')","expected":"False","visible":true},{"call":"valid_password('HELLO123!')","expected":"False","visible":true},{"call":"valid_password('Helloabc!')","expected":"False","visible":true}]$j$::jsonb,
      300,
      13
    ),
    (
      'Tic-Tac-Toe Winner',
      'hard',
      $d$Given a 3 by 3 list of lists containing `X`, `O`, or an empty string, return `X` or `O` if that player has three in a row, column, or diagonal. Otherwise return `None`. At most one player has a winning line.

**Example:** `winner([['X', 'X', 'X'], ['O', '', 'O'], ['', '', '']])` returns `'X'`.

Return the result; do not print it.

**Hints**
- Check rows, columns, and the two diagonals separately.
- A winning line contains three equal, nonempty values.$d$,
      $c$def winner(board):
    pass
$c$,
      $j$[{"call":"winner([['X', 'X', 'X'], ['O', '', 'O'], ['', '', '']])","expected":"'X'","visible":true},{"call":"winner([['O', 'X', ''], ['O', 'X', ''], ['O', '', '']])","expected":"'O'","visible":true},{"call":"winner([['X', 'O', ''], ['O', 'X', ''], ['', '', 'X']])","expected":"'X'","visible":true},{"call":"winner([['X', 'O', 'X'], ['X', 'O', 'O'], ['O', 'X', 'X']])","expected":"None","visible":true},{"call":"winner([['', '', 'O'], ['', 'O', ''], ['O', '', 'X']])","expected":"'O'","visible":true}]$j$::jsonb,
      300,
      14
    ),
    (
      'Cashier Change',
      'hard',
      $d$Given a nonnegative integer amount in pesos, return a dictionary with string keys `100`, `50`, `20`, `10`, `5`, `1` and integer counts. Use the largest denomination first, then the next largest. Include all denominations even when their count is zero.

**Example:** `make_change(186)` returns `{'100': 1, '50': 1, '20': 1, '10': 1, '5': 1, '1': 1}`.

Return the result; do not print it.

**Hints**
- Start with the largest denomination and work downward.
- Use integer division `//` to find how many fit and `%` to update the remaining change.$d$,
      $c$def make_change(amount):
    pass
$c$,
      $j$[{"call":"make_change(186)","expected":"{'100': 1, '50': 1, '20': 1, '10': 1, '5': 1, '1': 1}","visible":true},{"call":"make_change(0)","expected":"{'100': 0, '50': 0, '20': 0, '10': 0, '5': 0, '1': 0}","visible":true},{"call":"make_change(99)","expected":"{'100': 0, '50': 1, '20': 2, '10': 0, '5': 1, '1': 4}","visible":true},{"call":"make_change(205)","expected":"{'100': 2, '50': 0, '20': 0, '10': 0, '5': 1, '1': 0}","visible":true}]$j$::jsonb,
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
