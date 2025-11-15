// const express = require('express');
// const Courses = require("../models/Courses");
// const { get } = require("mongoose");

// const allCourses = [
//     {
//       title: "Intro to JS",
//       instructor: "Alice",
//       rating: 4.5,
//       students: 20,
//       updatedAt: "2025-04-12"
//     },
//     {
//       title: "Python Basics",
//       instructor: "Bob",
//       rating: 4.7,
//       students: 30,
//       updatedAt: "2025-04-10"
//     }
//   ];

//   // const 

//   const allTutors = [
//     {
//       name: "John Doe",
//       email: "123@gmail.com",
//       phone: "1234567890",
//       bio: "Experienced tutor with a passion for teaching.",
//       image: "tutor1.jpg",
//       field:  ["Mathematics", "Computer Science"],
//       exp: "3",  
//     }
//   ];

//   const getCourses = async (req, res) => {
//     // const sort = req.query.sort;
//     // try {
//     //   let courses = await Courses.find();
  
//     //   if (sort === 'rating_desc') {
//     //     courses.sort((a, b) => b.rating - a.rating);
//     //   } else if (sort === 'rating_asc') {
//     //     courses.sort((a, b) => a.rating - b.rating);
//     //   } else if (sort === 'students_desc') {
//     //     courses.sort((a, b) => b.students - a.students);
//     //   } else if (sort === 'students_asc') {
//     //     courses.sort((a, b) => a.students - b.students);
//     //   }
  
//       res.render("institutionCourses", {
//         courses: allCourses,
//         sort: req.query.sort
//       });
//     // } catch (err) {
//     //   console.error("Error fetching courses:", err);
//     //   res.status(500).send("Internal Server Error");
//     // }
//   };


// const getTutorDetail = (req, res) => {
//     res.render("institutionTutorDetail", { courses: allCourses,});
// }

// const getTutor = (req, res) => {
//     // const { id } = req.params;
//     // const tutor = allTutors.find(t => t.id === parseInt(id));
//     // if (!tutor) {
//         // return res.status(404).send('Tutor not found');
//     // }
//     res.render("institutionTutor", { });
    
// }

// //fix this
// const deleteCourse = async (req, res) => {
//     const { title } = req.params;
//     try {
//         const course = await Courses.findAndDelete(title);
//         if (!course) {
//             return res.status(404).send('Course not found');
//         }
//         res.status(200).send('Course deleted successfully');
//     } catch (err) {
//         console.error("Error deleting course:", err);
//         res.status(500).send("Internal Server Error");
//     }
// }

// module.exports = {
//   getCourses,
//     getTutor,
//     getTutorDetail,
//     deleteCourse,
// }