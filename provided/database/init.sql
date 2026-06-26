CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL
);

INSERT INTO employees (name, department)
VALUES
  ('Avery Johnson', 'Engineering'),
  ('Maya Chen', 'Human Resources'),
  ('Jordan Smith', 'Sales');
