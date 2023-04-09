


const express = require("express");
const hbs = require('hbs');

const blogService = require("./blog-service");
const app = express();
const path = require("path");
const bodyParser = require('body-parser');
const cloudinary = require('cloudinary').v2;
const upload = require('./expresshandlers/multer');
require('./expresshandlers/cloudinary');

app.use(express.static('public'));
const port = process.env.PORT || 3000;
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');

app.use(bodyParser.json()).use(bodyParser.urlencoded({ extended: true }));

cloudinary.config({
    cloud_name: 'dgf4nhbnp',
    api_key: '425133867252685',
    api_secret: '9W-zb2oZwpp4RMjoCf-GNwIh7H8'
});

function ensurelogin(req, res, next) {
    if (!req.session.username) {
        res.redirect('/login');
    } else {
        next();
    }
}

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});


// GET /login
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});


// GET /register
app.get('/register', function (req, res) {
    res.render(path.join(__dirname, '/views/register.hbs'));
});

// POST /register
app.post('/register', function (req, res) {
    var userData = req.body;
    authData.RegisterUser(userData)
        .then(function () {
            res.render('register', { successMessage: "User created" });
        })
        .catch(function (err) {
            res.render('register', { errorMessage: err, userName: req.body.userName });
        });
});

// POST /login
app.post('/login', function (req, res) {
    var userData = req.body;
    userData.userAgent = req.get('User-Agent');
    authData.CheckUser(userData)
        .then(function (user) {
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory
            };
            res.redirect('/posts');
        })
        .catch(function (err) {
            res.render('login', { errorMessage: err, userName: req.body.userName });
        });
});

// GET /logout
app.get('/logout', function (req, res) {
    req.session.reset();
    res.redirect('/');
});

// GET /userHistory
app.get('/userHistory', function (req, res) {
    res.render(path.join(__dirname, '/views/userHistory.hbs'));
});


app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.render(__dirname + '/views/about.hbs');
});

app.get('/posts/add', (req, res) => {
    res.render(path.join(__dirname, '/views/addPost.hbs'));
});

app.get("/blog", (req, res) => {
    blogService
        .getPublishedPosts()
        .then((posts) => res.json(posts))
        .catch((err) => res.status(500).send(err));
});
app.get('/blog', async (req, res) => {

    let viewData = {};

    try {

        let posts = [];


        if (req.query.category) {
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        } else {
            posts = await blogData.getPublishedPosts();
        }

        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));


        let post = posts[0];


        viewData.posts = posts;
        viewData.post = post;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        let categories = await blogData.getCategories();


        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }


    res.render("blog", { data: viewData })

});
app.get("/posts", (req, res) => {
    blogService
        .getAllPosts()
        .then((posts) => res.json(posts))
        .catch((err) => res.status(500).send(err));
});
app.get("/posts", function (req, res) {
    Post.find({})
        .then(function (data) {
            if (data.length) {
                res.render("posts", { posts: data });
            } else {
                res.render("posts", { message: "no results" });
            }
        })
        .catch(function (err) {
            res.render("posts", { message: "no results" });
        });
});

app.get("/categories", (req, res) => {
    blogService
        .getCategories()
        .then((categories) => res.json(categories))
        .catch((err) => res.status(500).send(err));
});

app.get("/posts", (req, res) => {
    const category = req.query.category;
    const minDate = req.query.minDate;

    if (category) {
        blogService
            .getPostsByCategory(category)
            .then((posts) => res.json(posts))
            .catch((err) => res.status(500).send(err));
    } else if (minDate) {
        blogService
            .getPostsByMinDate(minDate)
            .then((posts) => res.json(posts))
            .catch((err) => res.status(500).send(err));
    } else {
        blogService
            .getAllPosts()
            .then((posts) => res.json(posts))
            .catch((err) => res.status(500).send(err));
    }
});

app.get("/post/:id", (req, res) => {
    const id = req.params.id;

    blogService
        .getPostById(id)
        .then((post) => res.json(post))
        .catch((err) => res.status(500).send(err));
});


app.get('/posts/delete/:id', (req, res) => {
    const id = req.params.id;

    deletePostById(id)
        .then(() => {
            res.redirect('/posts');
        })
        .catch((err) => {
            res.status(500).send('Unable to Remove Post / ' + err);
        });
});

app.post('/posts/add', upload.single('image'), async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: File is not uploading ');
    }
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

blogService


blogService
    .initialize()
    .then(() => {
        app.listen(port, () => {
            console.log(`Express Server is starting on port ${port}`);
        });
    })
    .catch((err) => {
        console.error(err);
    });

