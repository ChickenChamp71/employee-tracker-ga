const mysql = require('mysql2');
const inquirer = require('inquirer');
const Table = require('cli-table');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'employees_db',
    },
    console.log(`Connected to 'employees_db' :weary:`)
);

const startQuestions = ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role', 'Quit'];

function init() {

    inquirer
        .prompt([
            {
                type: 'list',
                name: 'start',
                message: 'What would you like to do?',
                choices: startQuestions,
            },
            {
                type: 'input',
                name: 'addDepartment',
                message: 'What is the name of the department?',
                when: (answers) => answers.start === startQuestions[3],
            },
            {
                type: 'input',
                name: 'addRole',
                message: 'What is the name of the role?',
                when: (answers) => answers.start === startQuestions[4],
            },
        ])
        .then((answers) => {
            const data = answers;

            if (data.start === startQuestions[0]) {

                db.query(`SELECT * FROM departments ORDER BY departments.id`, (err, rows) => {
                    if (err) {
                        console.log(err);
                    } else {
                        const departmentTable = new Table({
                            head: ['ID', 'Department']
                        });

                        rows.forEach((row) => {
                            departmentTable.push([row.id, row.department_name]);
                        });

                        console.log(departmentTable.toString());
                        init();
                    }
                });
                
            } else if (data.start === startQuestions[1]) {
                db.query(`SELECT * FROM roles ORDER BY roles.department_id`, (err, roles) => {
                    if (err) {
                        console.log(err);
                    } else {

                        const roleTable = new Table({
                            head: ['ID', 'Job Title', 'Department', 'Salary']
                        });

                        roles.forEach((role) => {
                            db.query(`SELECT department_name FROM departments WHERE id = ?`, [role.department_id], (err, depName) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    
                                    const departName = depName[0].department_name;
                                    roleTable.push([role.id, role.job_title, departName, role.salary]);

                                    if (roles.length === roleTable.length) {
                                        console.log(roleTable.toString());
                                        init();
                                    };
                                };
                            });
                        });
                    };
                });
                
            } else if (data.start === startQuestions[2]) {
                console.log(`employee list`);
                db.query(`SELECT * FROM employees`, (err, employees) => {
                    if (err) {
                        console.log(err);
                    } else {
                        const employeeTable = new Table([
                            'ID', 'First Name', 'Last Name', 'Title', 'Department', 'Salary', 'Manager'
                        ]);

                        nameList()
                            .then(() => {
                                employees.forEach((employee) => {

                                    var managerName = '';
                                    for (let i = 0; i < fullNameList.length; i++) {       
                                        if (employee.manager_id === fullNameList[i].id) {
                                            managerName = fullNameList[i].full_name;
                                            break;
                                        };
                                    };
                                    
                                    db.query(`SELECT * FROM roles WHERE id = ?`, [employee.role_id], (err, info) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            const employeeTitle = info[0].job_title;
                                            
                                            const employeeSalary = info[0].salary;

                                            db.query(`SELECT department_name FROM departments WHERE id = ?`, [info[0].department_id], (err, empDep) => {
                                                if (err) {
                                                    console.log(err);
                                                } else {

                                                    const departmentName = empDep[0].department_name;
                                                    
                                                    employeeTable.push([employee.id, employee.first_name, employee.last_name, employeeTitle, departmentName, employeeSalary, managerName
                                                    ]);

                                                    if (employeeTable.length === employees.length) {
                                                        console.log(employeeTable.toString());
                                                        init();
                                                    }
                                                }
                                            });
                                        }
                                    });
                                });
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    }
                });
            } else if (data.addDepartment) {
                
                db.query(`INSERT INTO departments (department_name)
                VALUES (?)`, [data.addDepartment], (err, dep) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Department added!');
                        init();
                    };
                });
            } else if (data.addRole) {

                departmentCheck()
                    .then(() => {

                        console.log(departments);

                        inquirer
                            .prompt([
                                {
                                    type: 'input',
                                    name: 'salary',
                                    message: 'What is the salary?',
                                    validate: function (salary) {
                                        const length = String(salary).length;
                                        const charLimit = 30;

                                        if (length > charLimit) {
                                            return `Too many characters used. Please try again.`
                                        }
                                        return true;
                                    },
                                },
                                {
                                    type: 'list',
                                    name: 'department',
                                    message: 'What department is it a part of?',
                                    choices: departments,
                                },
                            ])
                            .then((answers) => {

                                db.query(`SELECT id FROM departments WHERE department_name = ?`, [answers.department], (err, id) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        const depId = id[0].id;

                                        db.query(`INSERT INTO roles (job_title, salary, department_id)
                                        VALUES (?, ?, ?)`, [data.addRole, answers.salary, depId], (err, newRole) => {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log(`Job added!`);
                                                init();
                                            };
                                        });
                                    };
                                });
                            });
                    });

            } else if (data.start === startQuestions[5]) {
                roleCheck();
                nameList();
                newEmployee();
            } else if (data.start === startQuestions[6]) {
                updateEmployee();
            }
    }
)};

async function newEmployee() {
    try {
        await Promise.all([roleCheck(), nameList()]);
        const answers = await inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: 'What is their first name?',
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: 'What is their last name?',
                },
                {
                    type: 'list',
                    name: 'title',
                    message: 'What job do they have?',
                    choices: roles,
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: 'Who is their manager?',
                    choices: employeeList,
                },
            ]);
    
        var roleId;
        var managerId;
        
        const jobQuery = new Promise((resolve, reject) => {
            db.query(`SELECT id FROM roles WHERE job_title = ?`, [answers.title], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    roleId = rows[0].id;
                    resolve();
                }
            });
        });

        const name = answers.manager.split(" ");

        var first = name[0];
        var last = name[1];
        if (name[2]) {
            last = name[1] + ' ' + name[2];
        };

        const managerQuery = new Promise((resolve, reject) => {
            db.query(`SELECT id FROM employees WHERE first_name = ? AND last_name = ?`, [first, last], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    managerId = rows[0].id;
                    resolve();
                };
            });
        });

        await Promise.all([jobQuery, managerQuery]);

        
            const insertEmployee = new Promise((resolve, reject) => {
                db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id)
                VALUES (?, ?, ?, ?)`, [answers.firstName, answers.lastName, roleId, managerId], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {

                        console.log('Employee successfully added!');
                        resolve();
                    };
                }
            );
        });

        await insertEmployee;
        init();
    } catch (err) {
        console.log(err);
        init();
    }
};

async function updateEmployee() {
    try {
        await Promise.all([roleCheck(), departmentCheck(), nameList()]);
        const answers = await inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'empUpdate',
                    message: 'Which employee would you like to update?',
                    choices: employeeList,
                },
            ]);

        await answers;
        var employeeId = '';

        function employeeIdFind() {
            return new Promise((resolve, reject) => {
                for (let i = 0; i < fullNameList.length; i++) {       
                    if (answers.empUpdate === fullNameList[i].full_name) {
                        employeeId = fullNameList[i].id;
                        resolve();
                    } else if (i > fullNameList.length) {
                        reject();
                    }
                };
            });
        };

        await employeeIdFind();
        console.log(employeeId);
        
        var employeeInfo = [];

        function employee() {
            return new Promise((resolve, reject) => {
                db.query(`SELECT * FROM employees WHERE id = ?`, [employeeId], (err, resp) => {
                    if (err) {
                        reject(err);
                    } else {
                        resp = employeeInfo;
                        console.log(resp);
                        resolve();
                    };
                });
            });
        };

        await employee();
        console.log(employeeInfo);

        var jobInfo = '';

        function jobFind() {
            return new Promise((resolve, reject) => {
                db.query(`SELECT job_title FROM roles WHERE id = ?`, [employeeInfo.role_id], (err, info) => {
                    if (err) {
                        reject(err);
                    } else {
                        info = jobInfo;
                        resolve();
                    };
                });
            });
        };

        var managerName = '';

        function managerFind() {
            return new Promise((resolve, reject) => {
                for (let i = 0; i < fullNameList.length; i++) {       
                    if (employeeInfo.manager_id === fullNameList[i].id) {
                        managerName = fullNameList[i].full_name;
                        resolve();
                    } else if (i = fullNameList.length) {
                        reject();
                    }
                };
            });
        };
            
        await Promise.all([employeeIdFind(), employee(), jobFind(), managerFind()]);
        const employeeQuestions = await inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'changeList',
                    message: 'What would you like to change?',
                    choices: ['First name', 'Last name', 'Job', 'Manager',  'Back'],
                },
                {
                    type: 'input',
                    name: 'first',
                    message: `Change first name from ${employeeInfo.first_name} to:`,
                    when: (answers) => answers.changeList === 'First name',
                },
                {
                    type: 'input',
                    name: 'last',
                    message: `Change last name from ${employeeInfo.last_name} to:`,
                    when: (answers) => answers.changeList === 'Last name',
                },
                {
                    type: 'list',
                    name: 'job',
                    message: `Change job from ${jobInfo} to:`,
                    choices: roles,
                    when: (answers) => answers.changeList === 'Job',
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: `Change manager from ${managerName}`,
                    choices: employeeList,
                    when: (answers) => answers.changeList === 'Manager',
                },
            ]);

            await employeeQuestions;

            if (employeeQuestions.first) {
                console.log('answer one');
            };

        

    } catch (err) {
        console.log(err);
    };
};

var roles = [];

function roleCheck() {
    return new Promise((resolve, reject) => {
        db.query(`SELECT roles.job_title FROM roles`, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                roles = rows.map((row) => row.job_title);
                resolve();
            };
        });
    })
};

var departments = [];

function departmentCheck() {
    return new Promise((resolve, reject) => {
        db.query(`SELECT departments.department_name FROM departments`, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                departments = rows.map((row) => row.department_name);
                resolve();
            };
        });
    });
};

var employeeList = [];
var fullNameList = [];

function nameList() {
    return new Promise((resolve, reject) => {
        db.query(`SELECT id, first_name, last_name, CONCAT(first_name, ' ', last_name) AS full_name FROM employees`, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                employeeList = rows.map((row) => row.full_name);
                fullNameList = rows;
                resolve();
            };
        });
    })
    
};

init();