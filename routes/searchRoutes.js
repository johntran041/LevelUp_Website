const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const User = require("../models/User");

// Handle search requests
router.get("/", async (req, res) => {
  const searchQuery = req.query.query || "";
  const userId = req.signedCookies?.userId;
  const user = userId ? await User.findById(userId).lean() : null;

  // Debug
  console.log("Search query:", searchQuery);

  if (!searchQuery) {
    return res.render("searchResults", {
      courses: [],
      users: [],
      searchQuery: "",
      user,
    });
  }

  try {
    // Create a case-insensitive regex for the search term
    const searchRegex = new RegExp(searchQuery, "i");

    // Split search query into words for more flexible matching
    const searchTerms = searchQuery
      .split(/\s+/)
      .filter((term) => term.length > 0);
    const searchTermRegexes = searchTerms.map((term) => new RegExp(term, "i"));

    console.log("Search terms:", searchTerms);

    // 1. Find users who match the search query
    const matchingUsers = await User.find({
      $and: [
        { role: { $ne: "Admin" } }, // Exclude admin users
        {
          $or: [
            // Match either firstName or lastName individually
            { firstName: searchRegex },
            { lastName: searchRegex },
            // Match any search term in firstName or lastName
            ...searchTermRegexes.map((regex) => ({ firstName: regex })),
            ...searchTermRegexes.map((regex) => ({ lastName: regex })),
            // Match full name (for multiple word searches)
            ...(searchTerms.length > 1
              ? [
                  // This aggregates firstName + lastName to match full name
                  {
                    $expr: {
                      $regexMatch: {
                        input: { $concat: ["$firstName", " ", "$lastName"] },
                        regex: searchQuery,
                        options: "i",
                      },
                    },
                  },
                ]
              : []),
            // Also search in headline and description
            { headline: searchRegex },
            { description: searchRegex },
          ],
        },
      ],
    })
      .select("_id firstName lastName avatar role headline")
      .lean();

    console.log(`Found ${matchingUsers.length} matching users`);

    // 2. Get the IDs of matching users to find courses created by them
    const matchingUserIds = matchingUsers.map((user) => user._id);

    // 3. Search for courses that either match the query directly or are by matching users
    const courses = await Course.find({
      $or: [
        // Direct course matches
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        // Courses by matching users
        { author: { $in: matchingUserIds } },
      ],
    })
      .populate("author", "firstName lastName")
      .lean();

    console.log(`Found ${courses.length} matching courses`);

    // Render the search results page with both courses and users
    res.render("searchResults", {
      courses,
      users: matchingUsers,
      searchQuery,
      user,
    });
  } catch (err) {
    console.error("Error in search:", err);
    res.status(500).render("searchResults", {
      courses: [],
      users: [],
      searchQuery,
      error: "An error occurred while searching",
      user,
    });
  }
});

module.exports = router;
