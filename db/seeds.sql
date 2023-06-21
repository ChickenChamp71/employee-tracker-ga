INSERT INTO departments (department_name)
VALUES  ('Hogwarts'),
        ('The Ministry'),
        ('Media'),
        ('The Dark');

INSERT INTO roles (job_title, department_id, salary)
VALUES  ('Student', 1, 10000.00),
        ('Head Teacher', 1, 100000.00),
        ('Headmaster', 1, 150000.00),
        ('Minister of Magic', 2, 150000.00),
        ('Politician', 2, 125000.00),
        ('Auror', 2, 100000.00),
        ('Reporter', 3, 100000.00),
        ('Camera Man', 3, 75000.00),
        ('Spy', 4, 100000.00),
        ('Death Eater', 4, 100000.00),
        ('Dark Lord', 4, 150000.00);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES  ('Tom', 'Riddle Jr.', 11, NULL),
        ('Albus', 'Dumbledore', 3, NULL),
        ('Rufus', 'Scrimgeour', 4, NULL),('Xenophilius', 'Lovegood', 7, NULL),
        ('Rita', 'Skeeter', 7, NULL),
        ('Minerva', 'McGonagall', 2, 2),
        ('Filius', 'Flitwick', 2, 2),
        ('Pomona', 'Sprout', 2, 2),
        ('Severus', 'Snape', 9, 2),
        ('Dolores', 'Umbridge', 5, 3),
        ('Bartemius', 'Crouch Sr.', 5, 3),
        ('Alastor', 'Moody', 6, 3),
        ('Nymphadora', 'Tonks', 6, 3),
        ('Bozo', 'Cameraguyidk', 8, 5),
        ('Bellatrix', 'Lestrange', 10, 1),
        ('Bartemius', 'Crouch Jr.', 10, 1),
        ('Lucius', 'Malfoy', 10, 1),
        ('Peter', 'Pettigrew', 9, 1),
        ('Antonin', 'Dolohov', 10, 1),
        ('Corban', 'Yaxley', 10, 1),
        ('Harry', 'Potter', 1, 6),
        ('Hermione', 'Granger', 1, 6),
        ('Ron', 'Weasley', 1, 6),
        ('Draco', 'Malfoy', 1, 9),
        ('Luna', 'Lovegood', 1, 7);
        
        
        
        
        
        