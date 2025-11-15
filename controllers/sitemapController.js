const Course = require('../models/Course');
const User = require('../models/User'); // Instructors
const Post = require('../models/Post'); 

exports.renderSitemap = async (req, res) => {
  try {
    const [courses, instructors, posts] = await Promise.all([
      Course.find().lean(),
      User.find({ role: 'instructor' }).lean(),
      Post.find().lean()
    ]);

    res.render('sitemap', {
      courses,
      instructors,
      posts,
    });
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Internal Server Error');
  }
};
