-- Normalize inline '**Example:** ...' descriptions to the format the app
-- already renders as example blocks: 'Example call:' / 'Example return:'.
-- This keeps the Examples tab populated without changing challenge points.

update public.challenges
   set description = $d$Return `Even` if the integer is even, otherwise return `Odd`.

Example call:
even_or_odd(4)

Example return:
'Even'

Return the result; do not print it.

**Hints**
- Use the remainder operator `%`.
- An even number has a remainder of zero when divided by 2.$d$
 where title = 'Even or Odd';

update public.challenges
   set description = $d$Return `Pass` if the score is at least 75; otherwise return `Fail`.

Example call:
grade(75)

Example return:
'Pass'

Return the result; do not print it.

**Hints**
- Use an `if` statement to compare the score with 75.
- Remember that a score of exactly 75 passes.$d$
 where title = 'Grade Checker';

update public.challenges
   set description = $d$Count the vowels a, e, i, o, u in the string, ignoring case.

Example call:
count_vowels('Hello')

Example return:
2

Return the result; do not print it.

**Hints**
- Convert the text to lowercase first.
- Loop through the characters and check membership in `aeiou`.$d$
 where title = 'Count Vowels';

update public.challenges
   set description = $d$Return the sum of all even integers in the list. Return 0 for an empty list.

Example call:
even_sum([1, 2, 3, 4])

Example return:
6

Return the result; do not print it.

**Hints**
- Start with a total of zero.
- Loop through the list and add a number only when its remainder after division by 2 is zero.$d$
 where title = 'Even Number Sum';

update public.challenges
   set description = $d$Return the string with its characters in reverse order. Preserve capitalization.

Example call:
reverse_word('Python')

Example return:
'nohtyP'

Return the result; do not print it.

**Hints**
- Think about reading characters from the end to the beginning.
- Python string slicing supports a negative step.$d$
 where title = 'Reverse a Word';

update public.challenges
   set description = $d$Return a list for integers 1 through n. Replace multiples of 3 with `Fizz`, multiples of 5 with `Buzz`, and multiples of both with `FizzBuzz`. Keep other numbers as integers. n is nonnegative.

Example call:
fizzbuzz(5)

Example return:
[1, 2, 'Fizz', 4, 'Buzz']

Return the result; do not print it.

**Hints**
- Use `range()` to visit the numbers from 1 through n.
- Check divisibility by both 3 and 5 before checking either one separately.$d$
 where title = 'FizzBuzz List';

update public.challenges
   set description = $d$Return a list containing each integer only once, keeping the order of its first appearance.

Example call:
unique_items([2, 1, 2, 3, 1])

Example return:
[2, 1, 3]

Return the result; do not print it.

**Hints**
- Start with an empty result list.
- Before appending a number, check whether it is already in the result.$d$
 where title = 'Remove Duplicates';

update public.challenges
   set description = $d$Return the second highest distinct integer score. If fewer than two distinct scores exist, return `None`.

Example call:
second_highest([90, 80, 90, 70])

Example return:
80

Return the result; do not print it.

**Hints**
- Remove repeated scores before comparing them.
- Sort the distinct scores and check that at least two remain.$d$
 where title = 'Second Highest Score';

update public.challenges
   set description = $d$Return a dictionary mapping each lowercase word to its count. Words are separated by whitespace; inputs contain only letters and whitespace.

Example call:
word_count('Cat dog CAT')

Example return:
{'cat': 2, 'dog': 1}

Return the result; do not print it.

**Hints**
- Use `lower()` and `split()` to prepare the words.
- Use a dictionary to store counts; `get()` can supply a default of zero.$d$
 where title = 'Word Counter';

update public.challenges
   set description = $d$Each item is a list `[price, quantity]` of nonnegative integers. Return the total cost of all items. An empty cart costs 0.

Example call:
cart_total([[20, 2], [15, 3]])

Example return:
85

Return the result; do not print it.

**Hints**
- Each item contains two values: price and quantity.
- Multiply those values for each item and accumulate the results.$d$
 where title = 'Shopping Cart Total';

update public.challenges
   set description = $d$Each student is `[name, score]`. Return the names sorted from highest to lowest score. For tied scores, sort names alphabetically (case-sensitive). Names are unique.

Example call:
leaderboard([['Ben', 90], ['Ana', 90], ['Cal', 80]])

Example return:
['Ana', 'Ben', 'Cal']

Return the result; do not print it.

**Hints**
- Each student has a name and a score.
- Consider a sorting key with two parts: negative score first, then name.$d$
 where title = 'Student Leaderboard';

update public.challenges
   set description = $d$Stock is a dictionary of item names and nonnegative quantities. Each sale is `[item, quantity]` with a positive integer quantity. Process sales in order, ignoring unknown items and sales exceeding available stock. Return the final stock dictionary, retaining zero quantities.

Example call:
inventory({'pen': 5, 'bag': 2}, [['pen', 3], ['bag', 3], ['pen', 2]])

Example return:
{'pen': 0, 'bag': 2}

Return the result; do not print it.

**Hints**
- Process one sale at a time using a loop.
- Check that the item exists and has enough stock before subtracting the quantity.$d$
 where title = 'Inventory Tracker';

update public.challenges
   set description = $d$Return True only if the password has at least 8 characters, at least one uppercase letter, one lowercase letter, one digit, and one of `!@#$`. Inputs contain only ASCII letters, digits and printable symbols.

Example call:
valid_password('Hello123!')

Example return:
True

Return the result; do not print it.

**Hints**
- Check the length first, then track each required character category.
- Character methods such as `isupper()`, `islower()`, and `isdigit()` can help; test special symbols using `in`.$d$
 where title = 'Password Validator';

update public.challenges
   set description = $d$Given a 3 by 3 list of lists containing `X`, `O`, or an empty string, return `X` or `O` if that player has three in a row, column, or diagonal. Otherwise return `None`. At most one player has a winning line.

Example call:
winner([['X', 'X', 'X'], ['O', '', 'O'], ['', '', '']])

Example return:
'X'

Return the result; do not print it.

**Hints**
- Check rows, columns, and the two diagonals separately.
- A winning line contains three equal, nonempty values.$d$
 where title = 'Tic-Tac-Toe Winner';

update public.challenges
   set description = $d$Given a nonnegative integer amount in pesos, return a dictionary with string keys `100`, `50`, `20`, `10`, `5`, `1` and integer counts. Use the largest denomination first, then the next largest. Include all denominations even when their count is zero.

Example call:
make_change(186)

Example return:
{'100': 1, '50': 1, '20': 1, '10': 1, '5': 1, '1': 1}

Return the result; do not print it.

**Hints**
- Start with the largest denomination and work downward.
- Use integer division `//` to find how many fit and `%` to update the remaining change.$d$
 where title = 'Cashier Change';
