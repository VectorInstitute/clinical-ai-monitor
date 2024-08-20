import sqlite3


# Connect to the SQLite database
conn = sqlite3.connect("users.db")

# Create a cursor object to execute SQL queries
cursor = conn.cursor()

# Execute a SELECT query to fetch all rows from a table (replace 'users' with your table name)
cursor.execute("SELECT * FROM users")

# Fetch all rows from the result
rows = cursor.fetchall()

# Print the column names
column_names = [description[0] for description in cursor.description]
print("Columns:", column_names)

# Print each row
for row in rows:
    print(row)

# Close the cursor and the database connection
cursor.close()
conn.close()
