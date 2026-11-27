-- Add nine new published puzzles. Catalog goes from 16 to 25.
-- Idempotent: a title already in the table is skipped.
-- No schema, RLS, or trigger changes.

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
