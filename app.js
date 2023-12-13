const express = require("express");
const pool = require("./server"); // Import your database connection
const cors = require("cors");

const app = express();
// Enable CORS for all routes
app.use(cors());


/**Searches the database and returns the total count of search item while returning the data paginated
 * @param {int} keyboardId    This is the keyboard Id
 * @param {int} page   Extract page number from query
 * @param {int} pageSize     Extract page size from query
 * @return Returns the list of data that matches the search
 */
app.get("/search", (req, res) => {
  const searchTerm = req.query.search; // Extract the search term from the query parameter
  const page = parseInt(req.query.page) || 1; // or default to 1
  const pageSize = parseInt(req.query.pageSize) || 15; //or default to 10

  if (!searchTerm) {
    res.status(400).send("Search term is required"); // Handle missing search term
    return;
  }

  const offset = (page - 1) * pageSize; // Calculate the offset

  const countSql =
    "SELECT COUNT(*) AS totalCount FROM keyboard WHERE name LIKE ?";
  const searchValue = `%${searchTerm}%`;

  pool.query(countSql, [searchValue], (err, countResult) => {
    if (err) {
      console.error("Error counting total records:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    const totalCount = countResult[0].totalCount; // Total count of records
    const totalPages = Math.ceil(totalCount / pageSize); // Calculate total number of pages
    const sql = "SELECT * FROM keyboard WHERE name LIKE ? LIMIT ? OFFSET ?";

    pool.query(sql, [searchValue, pageSize, offset], (err, results) => {
      if (err) {
        console.error("Error searching for keyboard:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.json({ data: results, totalPages: totalPages }); // Send the search results and total pages as a JSON response
    });
  });
});

/**This checks if the keyoard has the same type but in another color
 * @param {int} keyboardId used to check if there is another instance with the same name
 * @return true or false
 */
app.get("/checkDuplicateKeyboardId", (req, res) => {
  const keyboardId = req.query.keyboardId;

  const sql =
    "SELECT COUNT(*) AS count FROM keyboard_details WHERE keyboard_id = ?";

  pool.query(sql, [keyboardId], (err, results) => {
    if (err) {
      console.error("Error checking for duplicate keyboard_id:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    const count = results[0].count;

    if (count > 1) {
      res.json({ keyboardId, hasDuplicates: true });
    } else {
      res.json({ keyboardId, hasDuplicates: false });
    }
  });
});

/** Get a list of 9 keyboards from the keyboard table
 * @returns A list of random keyboard models
 */
app.get("/random", (req, res) => {
  const sql = "SELECT * FROM keyboard ORDER BY RAND() LIMIT 9";

  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching random data:", err);
      res.status(500).json({ error: "Internal Server Error" });
      callback(err, null);
      return;
    }

    res.json({ data: results });
  });
});

/**This returns a list of keyboards if they have different colors but the same id
 * @param {int} keyboardId this is the id from the keyboard table
 * @return returns a list of all the keyboards that have the same id as long as their color is different
 */
app.get("/getKeyboards", (req, res) => {
  const keyboardId = req.query.keyboardId;

  const sql = `SELECT kd.color,kd.id, k.name,k.image,k.model,k.brand
FROM keyboard_details kd
JOIN keyboard k ON kd.keyboard_id = k.id
WHERE kd.keyboard_id = ?;`;



  pool.query(sql, [keyboardId], (err, results) => {
    if (err) {
      console.error("Error fetching random data:", err);
      res.status(500).json({ error: "Internal Server Error" });
      callback(err, null);
      return;
    }

    res.json({ data: results });
    // callback(null, results); // Pass fetched data to the callback function
  });
});

/**This returns a list of keyboards if they have different colors and also returns a single keyboard if it is the only existing variation
 * @param {int} keyboardId this is the id from the keyboard table
 * @return returns a list of all the keyboards that have the same id as long as their color is different
 */
app.get("/getKeyboardDetailById", (req, res) => {
  const keyboardId = req.query.keyboardId;

  const sql = `SELECT keyboard.*, keyboard_details.* FROM keyboard LEFT JOIN keyboard_details ON keyboard.id = keyboard_details.keyboard_id  WHERE keyboard.id = ?;`;

  pool.query(sql, [keyboardId], (err, results) => {
    if (err) {
      console.error("Error fetching keyboard data:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    res.json({ data: results });
  });
});

/** fetch comparison based on a keyboard_id
 * @param {int} keyboardId takes in the id it wants to get comparison for
 * @returns returns an array of every item that matches the list
 */
app.get("/getComparisonsByDetailId", (req, res) => {
  const keyboardId = req.query.keyboardId;

  if (!keyboardId) {
    res.status(400).send("Keyboard ID is required");
    return;
  }
  const sql = `SELECT * FROM comparison_table WHERE keyboard_details_id = ?`;

  pool.query(sql, [keyboardId], (error, results) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    res.json({ data: results });
  });
});





// function fetchList(pageNumber, pageSize, callback) {
//   const offset = (pageNumber - 1) * pageSize;
//   const sql = `SELECT * FROM keyboard LIMIT ${pageSize} OFFSET ${offset}`;

//   pool.query(sql, (err, results) => {
//     if (err) {
//       console.error("Error fetching data:", err);
//       callback(err, null);
//       return;
//     }

//     console.log("Fetched data:", results);
//     callback(null, results); // Pass fetched data to the callback function
//   });
// }

// // Endpoint to fetch paginated data
// app.get("/api/keyboardList", (req, res) => {
//   // Extract query parameters from the URL
//   const pageNumber = parseInt(req.query.pageNumber) || 1;
//   const pageSize = parseInt(req.query.pageSize) || 10;

//   // Call the fetchList function with the provided pagination parameters
//   fetchList(pageNumber, pageSize, (err, results) => {
//     if (err) {
//       res.status(500).json({ error: "Error fetching data" });
//       return;
//     }

//     // Respond with fetched data in JSON format
//     res.json(results);
//   });
// });

// function getComparisonsByKeyboardDetailsId(pool, keyboardDetailsId, callback) {
//   const sql = `
    
// 	   SELECT * FROM comparison_table WHERE keyboard_details_id = ?;
//   `;

//   pool.query(sql, [keyboardDetailsId], (err, results) => {
//     if (err) {
//       console.error("Error fetching comparisons:", err);
//       callback(err, null);
//       return;
//     }

//     console.log("Fetched comparisons:", results);
//     callback(null, results);
//   });
// }

// Start the server
const PORT = 3000; // Set your desired port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


module.exports = { app, pool };
