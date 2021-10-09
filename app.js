const express = require('express');
const axios = require('axios');
const moment = require('moment');
const { check, validationResult } = require('express-validator');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public/'));
app.use(express.urlencoded({ extended: true }));

//Port and hostname
const port = process.env.PORT || 3000;
const hostname = 'https://localhost:9000';

// Set base url to /blogs
app.get('/', (req, res) => {
  res.redirect('/blogs');
});

//Route for home page
app.get('/blogs', (req, res) => {
  let data = {};

  //GET request from api
  axios
    .get(hostname + '/posts')
    .then((result) => {
      // Sort posts by publish date
      data = result.data.sort((a, b) => {
        return a.publish_date > b.publish_date
          ? -1
          : a.publish_date < b.publish_date
          ? 1
          : 0;
      });
    })

    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      res.render('index', { data: data, title: 'Blogs Home' });
    });
});

//Route for single blog
app.get('/blogs/:slug', (req, res) => {
  const slug = req.params.slug;
  let data = {};
  let error = {};

  // GET request to api
  axios
    .get(hostname + '/posts')
    .then((result) => {
      // Find blog ID using slug

      let postIndex = result.data.findIndex((post) => {
        return post.slug === slug;
      });

      // Check if post index is returned

      if (postIndex < 0) {
        // Render 404 page
        res.render('404', { title: '404 Error' });
      } else {
        data.blog = result.data[postIndex];
        data.blog.postIndex = postIndex;
        data.blogs = result.data;

        // Get comments for the blog
        axios
          .get(hostname + '/posts/' + data.blog.id + '/comments')
          .then((result) => {
            // Sort comments by id to give most recent 1st
            data.comments = result.data.sort((a, b) => {
              return a.id > b.id ? -1 : a.id < b.id ? 1 : 0;
            });
          })
          .catch((e) => {
            console.log(e);
          })
          .then(() => {
            // render blog-detail page
            res.render('blog-detail', {
              data: data,
              title: data.blog.title,
              error,
            });
          });
      }
    })
    .catch((e) => {
      console.log(e);
    });
});

// Route to add a new comment
// Unable to get server side validation to work properly.

app.post(
  '/newcomment',
  [
    check('name', 'Please enter your name').isLength({ min: 1 }).trim(),
    check('content', 'Please write a comment').isLength({ min: 1 }).trim(),
  ],
  (req, res, next) => {
    let comment = {
      parent_id: null,
      user: req.body.name,
      date: moment().format('YYYY-MM-DD'),
      content: req.body.content,
    };

    let postId = parseInt(req.body.blogId);
    let errorMsg = req.body.errMsg;

    // POST to api
    axios
      .post(hostname + '/posts/' + postId + '/comments/', comment, errorMsg)

      .then(() => {
        const errors = validationResult(req);
        const alert = errors.array();
        if (!errors.isEmpty()) {
          // Became stuck on validation and redirecting back to
          // blog detail page to display errors to user
          // json of error messages returned
          return res.json(alert);
        }
        next();

        res.redirect(req.get('referer'));
      });
  }
);

app.listen(port, () => {
  console.log('server is running on port: ' + port);
});
