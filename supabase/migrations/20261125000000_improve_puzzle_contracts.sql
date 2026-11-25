-- Improve student puzzle clarity and edge-case coverage.
-- Call-test puzzles now explicitly say: return the value; do not print it.
-- Adds one hidden edge case per puzzle and clearer starter templates.
begin;
update public.challenges
   set description = 'Return `Even` if the integer is even, otherwise return `Odd`.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
even_or_odd(4)

Example return:
''Even''

**Hints**
- Use the remainder operator `%`.
- An even number has a remainder of zero when divided by 2.',
       starter_code = 'def even_or_odd(number):
    """Return ''Even'' or ''Odd''."""
    # Return the result. Do not print it.
    pass
',
       tests = '[{"call": "even_or_odd(4)", "expected": "''Even''", "visible": true}, {"call": "even_or_odd(7)", "expected": "''Odd''", "visible": true}, {"call": "even_or_odd(0)", "expected": "''Even''", "visible": true}, {"call": "even_or_odd(-3)", "expected": "''Odd''", "visible": true}, {"call": "even_or_odd(1024)", "expected": "''Even''", "visible": false}]'::jsonb
 where title = 'Even or Odd';

update public.challenges
   set description = 'Return `Pass` if the score is at least 75; otherwise return `Fail`.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
grade(75)

Example return:
''Pass''

**Hints**
- Use an `if` statement to compare the score with 75.
- Remember that a score of exactly 75 passes.',
       starter_code = 'def grade(score):
    """Return ''Pass'' or ''Fail''."""
    # Return the result. Do not print it.
    pass
',
       tests = '[{"call": "grade(75)", "expected": "''Pass''", "visible": true}, {"call": "grade(74)", "expected": "''Fail''", "visible": true}, {"call": "grade(100)", "expected": "''Pass''", "visible": true}, {"call": "grade(0)", "expected": "''Fail''", "visible": true}, {"call": "grade(89)", "expected": "''Pass''", "visible": false}]'::jsonb
 where title = 'Grade Checker';

update public.challenges
   set description = 'Count the vowels a, e, i, o, u in the string, ignoring case.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
count_vowels(''Hello'')

Example return:
2

**Hints**
- Convert the text to lowercase first.
- Loop through the characters and check membership in `aeiou`.',
       starter_code = 'def count_vowels(text):
    """Return the number of vowels in text."""
    # Return the result. Do not print it.
    pass
',
       tests = '[{"call": "count_vowels(''Hello'')", "expected": "2", "visible": true}, {"call": "count_vowels(''AEIOU'')", "expected": "5", "visible": true}, {"call": "count_vowels(''rhythm'')", "expected": "0", "visible": true}, {"call": "count_vowels('''')", "expected": "0", "visible": true}, {"call": "count_vowels(''PyThOn PrOgRaMmInG'')", "expected": "4", "visible": false}]'::jsonb
 where title = 'Count Vowels';

update public.challenges
   set description = 'Return the sum of all even integers in the list. Return 0 for an empty list.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
even_sum([1, 2, 3, 4])

Example return:
6

**Hints**
- Start with a total of zero.
- Loop through the list and add a number only when its remainder after division by 2 is zero.',
       starter_code = 'def even_sum(numbers):
    """Return the sum of even numbers."""
    # Return the result. Do not print it.
    pass
',
       tests = '[{"call": "even_sum([1, 2, 3, 4])", "expected": "6", "visible": true}, {"call": "even_sum([])", "expected": "0", "visible": true}, {"call": "even_sum([1, 3])", "expected": "0", "visible": true}, {"call": "even_sum([-2, 0, 8])", "expected": "6", "visible": true}, {"call": "even_sum([10, -4, 7, 2])", "expected": "8", "visible": false}]'::jsonb
 where title = 'Even Number Sum';

update public.challenges
   set description = 'Return the string with its characters in reverse order. Preserve capitalization.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
reverse_word(''Python'')

Example return:
''nohtyP''

**Hints**
- Think about reading characters from the end to the beginning.
- Python string slicing supports a negative step.',
       starter_code = 'def reverse_word(word):
    """Return word reversed."""
    # Return the result. Do not print it.
    pass
',
       tests = '[{"call": "reverse_word(''Python'')", "expected": "''nohtyP''", "visible": true}, {"call": "reverse_word(''a'')", "expected": "''a''", "visible": true}, {"call": "reverse_word('''')", "expected": "''''", "visible": true}, {"call": "reverse_word(''123'')", "expected": "''321''", "visible": true}, {"call": "reverse_word(''AbCd'')", "expected": "''dCbA''", "visible": false}]'::jsonb
 where title = 'Reverse a Word';

update public.challenges
   set description = 'Return a list for integers 1 through n. Replace multiples of 3 with `Fizz`, multiples of 5 with `Buzz`, and multiples of both with `FizzBuzz`. Keep other numbers as integers. n is nonnegative.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
fizzbuzz(5)

Example return:
[1, 2, ''Fizz'', 4, ''Buzz'']

**Hints**
- Use `range()` to visit the numbers from 1 through n.
- Check divisibility by both 3 and 5 before checking either one separately.',
       starter_code = 'def fizzbuzz(n):
    """Return the FizzBuzz list from 1 to n."""
    # Return the result. Do not print it.
    pass
',
       tests = '[{"call": "fizzbuzz(5)", "expected": "[1, 2, ''Fizz'', 4, ''Buzz'']", "visible": true}, {"call": "fizzbuzz(0)", "expected": "[]", "visible": true}, {"call": "fizzbuzz(3)", "expected": "[1, 2, ''Fizz'']", "visible": true}, {"call": "fizzbuzz(15)", "expected": "[1, 2, ''Fizz'', 4, ''Buzz'', ''Fizz'', 7, 8, ''Fizz'', ''Buzz'', 11, ''Fizz'', 13, 14, ''FizzBuzz'']", "visible": true}, {"call": "fizzbuzz(1)", "expected": "[1]", "visible": false}]'::jsonb
 where title = 'FizzBuzz List';

update public.challenges
   set description = 'Return a list containing each integer only once, keeping the order of its first appearance.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
unique_items([2, 1, 2, 3, 1])

Example return:
[2, 1, 3]

**Hints**
- Start with an empty result list.
- Before appending a number, check whether it is already in the result.',
       starter_code = 'def unique_items(numbers):
    """Return numbers with duplicates removed, preserving first-seen order."""
    # Return the result. Do not print it.
    pass
',
       tests = '[{"call": "unique_items([2, 1, 2, 3, 1])", "expected": "[2, 1, 3]", "visible": true}, {"call": "unique_items([])", "expected": "[]", "visible": true}, {"call": "unique_items([4, 4])", "expected": "[4]", "visible": true}, {"call": "unique_items([0, -1, 0])", "expected": "[0, -1]", "visible": true}, {"call": "unique_items([5, 5, 5, 1, 2, 1])", "expected": "[5, 1, 2]", "visible": false}]'::jsonb
 where title = 'Remove Duplicates';

update public.challenges
   set description = 'Return the second highest distinct integer score. If fewer than two distinct scores exist, return `None`.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
second_highest([90, 80, 90, 70])

Example return:
80

**Hints**
- Remove repeated scores before comparing them.
- Sort the distinct scores and check that at least two remain.',
       starter_code = 'def second_highest(scores):
    """Return the second highest distinct score, or None."""
    # Return the result. Do not print it.
    pass
',
       tests = '[{"call": "second_highest([90, 80, 90, 70])", "expected": "80", "visible": true}, {"call": "second_highest([5, 5])", "expected": "None", "visible": true}, {"call": "second_highest([])", "expected": "None", "visible": true}, {"call": "second_highest([-3, -1, -2])", "expected": "-2", "visible": true}, {"call": "second_highest([10])", "expected": "None", "visible": false}]'::jsonb
 where title = 'Second Highest Score';

update public.challenges
   set description = 'Return a dictionary mapping each lowercase word to its count. Words are separated by whitespace; inputs contain only letters and whitespace.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
word_count(''Cat dog CAT'')

Example return:
{''cat'': 2, ''dog'': 1}

**Hints**
- Use `lower()` and `split()` to prepare the words.
- Use a dictionary to store counts; `get()` can supply a default of zero.',
       starter_code = 'def word_count(text):
    """Return a dictionary of lowercase word counts."""
    # Return the result. Do not print it.
    pass
',
       tests = '[{"call": "word_count(''Cat dog CAT'')", "expected": "{''cat'': 2, ''dog'': 1}", "visible": true}, {"call": "word_count('''')", "expected": "{}", "visible": true}, {"call": "word_count(''  hi  HI '')", "expected": "{''hi'': 2}", "visible": true}, {"call": "word_count(''one two'')", "expected": "{''one'': 1, ''two'': 1}", "visible": true}, {"call": "word_count(''red Red RED blue'')", "expected": "{''red'': 3, ''blue'': 1}", "visible": false}]'::jsonb
 where title = 'Word Counter';

update public.challenges
   set description = 'Each item is a list `[price, quantity]` of nonnegative integers. Return the total cost of all items. An empty cart costs 0.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
cart_total([[20, 2], [15, 3]])

Example return:
85

**Hints**
- Each item contains two values: price and quantity.
- Multiply those values for each item and accumulate the results.',
       starter_code = 'def cart_total(items):
    """Return the total cart cost."""
    # Return the result. Do not print it.
    pass
',
       tests = '[{"call": "cart_total([[20, 2], [15, 3]])", "expected": "85", "visible": true}, {"call": "cart_total([])", "expected": "0", "visible": true}, {"call": "cart_total([[100, 0]])", "expected": "0", "visible": true}, {"call": "cart_total([[5, 4], [10, 1]])", "expected": "30", "visible": true}, {"call": "cart_total([[7, 3], [2, 5], [9, 1]])", "expected": "40", "visible": false}]'::jsonb
 where title = 'Shopping Cart Total';

update public.challenges
   set description = 'Each student is `[name, score]`. Return the names sorted from highest to lowest score. For tied scores, sort names alphabetically (case-sensitive). Names are unique.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
leaderboard([[''Ben'', 90], [''Ana'', 90], [''Cal'', 80]])

Example return:
[''Ana'', ''Ben'', ''Cal'']

**Hints**
- Each student has a name and a score.
- Consider a sorting key with two parts: negative score first, then name.',
       starter_code = 'def leaderboard(students):
    """Return student names ordered by rank."""
    # Return the result. Do not print it.
    pass
',
       tests = '[{"call": "leaderboard([[''Ben'', 90], [''Ana'', 90], [''Cal'', 80]])", "expected": "[''Ana'', ''Ben'', ''Cal'']", "visible": true}, {"call": "leaderboard([])", "expected": "[]", "visible": true}, {"call": "leaderboard([[''Zed'', 99], [''Amy'', 10]])", "expected": "[''Zed'', ''Amy'']", "visible": true}, {"call": "leaderboard([[''C'', 2], [''B'', 2], [''A'', 2]])", "expected": "[''A'', ''B'', ''C'']", "visible": true}, {"call": "leaderboard([[''Mia'', 50], [''Noa'', 75], [''Lia'', 75]])", "expected": "[''Lia'', ''Noa'', ''Mia'']", "visible": false}]'::jsonb
 where title = 'Student Leaderboard';

update public.challenges
   set description = 'Stock is a dictionary of item names and nonnegative quantities. Each sale is `[item, quantity]` with a positive integer quantity. Process sales in order, ignoring unknown items and sales exceeding available stock. Return the final stock dictionary, retaining zero quantities.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
inventory({''pen'': 5, ''bag'': 2}, [[''pen'', 3], [''bag'', 3], [''pen'', 2]])

Example return:
{''pen'': 0, ''bag'': 2}

**Hints**
- Process one sale at a time using a loop.
- Check that the item exists and has enough stock before subtracting the quantity.',
       starter_code = 'def inventory(stock, sales):
    """Return final stock after processing valid sales in order."""
    # Return the result. Do not print it.
    pass
',
       tests = '[{"call": "inventory({''pen'': 5, ''bag'': 2}, [[''pen'', 3], [''bag'', 3], [''pen'', 2]])", "expected": "{''pen'': 0, ''bag'': 2}", "visible": true}, {"call": "inventory({''a'': 1}, [[''b'', 1]])", "expected": "{''a'': 1}", "visible": true}, {"call": "inventory({}, [])", "expected": "{}", "visible": true}, {"call": "inventory({''a'': 2}, [[''a'', 3], [''a'', 1]])", "expected": "{''a'': 1}", "visible": true}, {"call": "inventory({''apple'': 3, ''pear'': 1}, [[''apple'', 1], [''apple'', 1], [''pear'', 1]])", "expected": "{''apple'': 1, ''pear'': 0}", "visible": false}]'::jsonb
 where title = 'Inventory Tracker';

update public.challenges
   set description = 'Return True only if the password has at least 8 characters, at least one uppercase letter, one lowercase letter, one digit, and one of `!@#$`. Inputs contain only ASCII letters, digits and printable symbols.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
valid_password(''Hello123!'')

Example return:
True

**Hints**
- Check the length first, then track each required character category.
- Character methods such as `isupper()`, `islower()`, and `isdigit()` can help; test special symbols using `in`.',
       starter_code = 'def valid_password(password):
    """Return True if password meets all rules, else False."""
    # Return the result. Do not print it.
    pass
',
       tests = '[{"call": "valid_password(''Hello123!'')", "expected": "True", "visible": true}, {"call": "valid_password(''hello123!'')", "expected": "False", "visible": true}, {"call": "valid_password(''Aa1!'')", "expected": "False", "visible": true}, {"call": "valid_password(''Hello123?'')", "expected": "False", "visible": true}, {"call": "valid_password(''HELLO123!'')", "expected": "False", "visible": true}, {"call": "valid_password(''Helloabc!'')", "expected": "False", "visible": true}, {"call": "valid_password(''GoodPass1#'')", "expected": "True", "visible": false}]'::jsonb
 where title = 'Password Validator';

update public.challenges
   set description = 'Given a 3 by 3 list of lists containing `X`, `O`, or an empty string, return `X` or `O` if that player has three in a row, column, or diagonal. Otherwise return `None`. At most one player has a winning line.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
winner([[''X'', ''X'', ''X''], [''O'', '''', ''O''], ['''', '''', '''']])

Example return:
''X''

**Hints**
- Check rows, columns, and the two diagonals separately.
- A winning line contains three equal, nonempty values.',
       starter_code = 'def winner(board):
    """Return ''X'', ''O'', or None."""
    # Return the result. Do not print it.
    pass
',
       tests = '[{"call": "winner([[''X'', ''X'', ''X''], [''O'', '''', ''O''], ['''', '''', '''']])", "expected": "''X''", "visible": true}, {"call": "winner([[''O'', ''X'', ''''], [''O'', ''X'', ''''], [''O'', '''', '''']])", "expected": "''O''", "visible": true}, {"call": "winner([[''X'', ''O'', ''''], [''O'', ''X'', ''''], ['''', '''', ''X'']])", "expected": "''X''", "visible": true}, {"call": "winner([[''X'', ''O'', ''X''], [''X'', ''O'', ''O''], [''O'', ''X'', ''X'']])", "expected": "None", "visible": true}, {"call": "winner([['''', '''', ''O''], ['''', ''O'', ''''], [''O'', '''', ''X'']])", "expected": "''O''", "visible": true}, {"call": "winner([[''X'', ''O'', ''X''], [''O'', ''O'', ''X''], ['''', '''', ''X'']])", "expected": "''X''", "visible": false}]'::jsonb
 where title = 'Tic-Tac-Toe Winner';

update public.challenges
   set description = 'Given a nonnegative integer amount in pesos, return a dictionary with string keys `100`, `50`, `20`, `10`, `5`, `1` and integer counts. Use the largest denomination first, then the next largest. Include all denominations even when their count is zero.

This puzzle is checked by calling your function. Return the value; do not print it.

Example call:
make_change(186)

Example return:
{''100'': 1, ''50'': 1, ''20'': 1, ''10'': 1, ''5'': 1, ''1'': 1}

**Hints**
- Start with the largest denomination and work downward.
- Use integer division `//` to find how many fit and `%` to update the remaining change.',
       starter_code = 'def make_change(amount):
    """Return a denomination-count dictionary for amount."""
    # Return the result. Do not print it.
    pass
',
       tests = '[{"call": "make_change(186)", "expected": "{''100'': 1, ''50'': 1, ''20'': 1, ''10'': 1, ''5'': 1, ''1'': 1}", "visible": true}, {"call": "make_change(0)", "expected": "{''100'': 0, ''50'': 0, ''20'': 0, ''10'': 0, ''5'': 0, ''1'': 0}", "visible": true}, {"call": "make_change(99)", "expected": "{''100'': 0, ''50'': 1, ''20'': 2, ''10'': 0, ''5'': 1, ''1'': 4}", "visible": true}, {"call": "make_change(205)", "expected": "{''100'': 2, ''50'': 0, ''20'': 0, ''10'': 0, ''5'': 1, ''1'': 0}", "visible": true}, {"call": "make_change(7)", "expected": "{''100'': 0, ''50'': 0, ''20'': 0, ''10'': 0, ''5'': 1, ''1'': 2}", "visible": false}]'::jsonb
 where title = 'Cashier Change';

commit;
