# Parse CSV File with Node.js Streams - Backend Exercise

🧪 Realistic Backend Exercise – Node.js Streams

🧩 Scenario:
You’re building an internal tool that allows users to upload very large CSV files (over 2GB) containing customer data.

Your task is to:
•	Stream the CSV file line by line.
•	Process each line (validate and transform the data).
•	Write the processed output to a new file.
•	The solution must not load the entire file into memory at any point.

⸻

✅ Requirements:
1.	Read an input file named input.csv.
2.	For each line:
•	Split the values (name, email, age).
•	Validate that the email contains @ and that age is a valid number.
•	Convert the name to uppercase.
3.	Write each valid line to output.csv.
4.	Skip lines that are invalid (either due to malformed structure or failed validation).
5.	You may only use built-in Node.js modules (fs, stream, readline, etc.).

⸻

🔧 Hints:
•	Use fs.createReadStream to read the file as a stream.
•	Use readline.createInterface to handle line-by-line reading.
•	Use fs.createWriteStream to write the transformed output.
•	Use String.prototype.split and basic validation with regular expressions or Number() to parse and check the data.
