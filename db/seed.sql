-- =====================================================================
-- Sample data. Run AFTER schema.sql. Safe to edit freely.
-- Test formats:
--   stdin test: {"stdin":"5\n","expected":"1\n2\n","visible":true}
--   call test:  {"call":"add(2,3)","expected":"5"}   (expected = repr of the result)
-- "visible": true tests are the ones shown/run by the Run button.
-- =====================================================================

insert into public.rooms (name, code, status)
values ('Test Room', 'TEST1', 'lobby');

insert into public.challenges
  (title, tier, type, description, starter_code, tests, rubric, points, sort_order, published)
values

-- ---------------- EASY ----------------
('Hello, ITP', 'easy', 'python',
 $d$Print exactly: Hello, ITP!$d$,
 $c$# Write your code below
$c$,
 $j$[{"stdin":"","expected":"Hello, ITP!\n","visible":true}]$j$,
 '[]', 10, 1, true),

('Greeter', 'easy', 'python',
 $d$Ask for the user's name using input(), then print: Hello, <name>!$d$,
 $c$name = input()
# print the greeting
$c$,
 $j$[{"stdin":"Ana\n","expected":"Hello, Ana!\n","visible":true},
     {"stdin":"Ben\n","expected":"Hello, Ben!\n"},
     {"stdin":"Zed\n","expected":"Hello, Zed!\n"}]$j$,
 '[]', 10, 2, true),

('Count to N', 'easy', 'python',
 $d$Read a number N with input(). Use a for loop to print the numbers from 1 to N, one per line.$d$,
 $c$n = int(input())
# use a for loop
$c$,
 $j$[{"stdin":"3\n","expected":"1\n2\n3\n","visible":true},
     {"stdin":"1\n","expected":"1\n"},
     {"stdin":"5\n","expected":"1\n2\n3\n4\n5\n"}]$j$,
 '[]', 10, 3, true),

-- ---------------- MEDIUM ----------------
('Sum Until Zero', 'medium', 'python',
 $d$Keep reading numbers with input() inside a while loop until the user enters 0. Then print the total of all numbers entered.$d$,
 $c$total = 0
# use a while loop
$c$,
 $j$[{"stdin":"3\n4\n0\n","expected":"7\n","visible":true},
     {"stdin":"0\n","expected":"0\n"},
     {"stdin":"10\n20\n30\n0\n","expected":"60\n"}]$j$,
 '[]', 20, 4, true),

('Evens Only', 'medium', 'python',
 $d$Write a function evens(nums) that takes a list of numbers and returns a new list containing only the even numbers.$d$,
 $c$def evens(nums):
    # your code here
    pass
$c$,
 $j$[{"call":"evens([1, 2, 3, 4])","expected":"[2, 4]","visible":true},
     {"call":"evens([1, 3, 5])","expected":"[]"},
     {"call":"evens([])","expected":"[]"},
     {"call":"evens([2, 4, 6])","expected":"[2, 4, 6]"}]$j$,
 '[]', 20, 5, true),

('Word Counter', 'medium', 'python',
 $d$Write a function count_words(text) that returns a dict mapping each word to how many times it appears. Words are separated by spaces.$d$,
 $c$def count_words(text):
    # your code here
    pass
$c$,
 $j$[{"call":"sorted(count_words('a b a').items())","expected":"[('a', 2), ('b', 1)]","visible":true},
     {"call":"sorted(count_words('x').items())","expected":"[('x', 1)]"},
     {"call":"count_words('')","expected":"{}"}]$j$,
 '[]', 20, 6, true),

-- ---------------- HARD (python) ----------------
('Top Scorer', 'hard', 'python',
 $d$Write a function top_scorer(scores) where scores is a dict like {"ana": [80, 90], "ben": [70, 100]}. Return the name of the student with the highest average. (No ties in the tests.)$d$,
 $c$def top_scorer(scores):
    # your code here
    pass
$c$,
 $j$[{"call":"top_scorer({'ana': [80, 90], 'ben': [70, 100], 'cy': [95, 95]})","expected":"'cy'","visible":true},
     {"call":"top_scorer({'x': [1]})","expected":"'x'"},
     {"call":"top_scorer({'a': [10, 20], 'b': [50]})","expected":"'b'"}]$j$,
 '[]', 40, 7, true),

-- ---------------- HARD (web, judged in person) ----------------
('Todo App', 'hard', 'web',
 $d$Build a simple web app (HTML, CSS, JavaScript, or React) where a user can:
1. Enter a task and submit it
2. Toggle a task as done / not done
3. Delete a task

Bonus: edit/update an existing task.
Keep it basic. When ready, go to the judge with your app running.$d$,
 '',
 '[]',
 $j$[{"label":"Add a task","points":10},
     {"label":"Toggle done","points":10},
     {"label":"Delete a task","points":10},
     {"label":"Looks usable (basic styling)","points":5},
     {"label":"Bonus: update/edit a task","points":10}]$j$,
 45, 8, true);