import fs from "fs";

try {
  const data = fs.readFileSync("data.txt", "utf8");

  // Split data by lines and map each line to an array of values
  const result = data
    .trim() // Remove any trailing newlines
    .split("\n") // Split by each line
    .map((line) => line.split(",").map((item) => item.trim())); // Split by comma and trim spaces

  console.log("result", result);
} catch (err) {
  console.error("Error reading file:", err);
}
