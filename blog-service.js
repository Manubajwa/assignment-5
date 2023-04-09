
const fs = require("fs");
const postsPath = "./data/posts.json";
const categoriesPath = "./data/categories.json";

let posts = [];
let categories = [];

const Sequelize = require('sequelize');
const sequelize = new Sequelize('sslxcvzq', 'sslxcvzq', 'Fu8OXv-n7CRrDsN3_Ki7LShuVtfz6zk9', {
    host: 'host',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});
const Post = sequelize.define('Post', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: Sequelize.STRING,
    content: Sequelize.TEXT,
    category: Sequelize.INTEGER,
    postDate: Sequelize.DATEONLY,
    published: Sequelize.BOOLEAN
});
const initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(postsPath, "utf8", (err, data) => {
            if (err) {
                reject("Unable to read posts file");
            } else {
                posts = JSON.parse(data);
                fs.readFile(categoriesPath, "utf8", (err, data) => {
                    if (err) {
                        reject("Unable to read categories file");
                    } else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
};

const getAllPosts = () => {
    return new Promise((resolve, reject) => {
        if (posts.length === 0) {
            reject("No posts found");
        } else {
            resolve(posts);
        }
    });
};

const getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        const publishedPosts = posts.filter((post) => post.published);
        if (publishedPosts.length === 0) {
            reject("No published posts found");
        } else {
            resolve(publishedPosts);
        }
    });
};

const getCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            reject("No categories found");
        } else {
            resolve(categories);
        }
    });
};



const getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        const filteredPosts = posts.filter((post) => post.category === category);
        if (filteredPosts.length === 0) {
            reject("No results returned");
        } else {
            resolve(filteredPosts);
        }
    });
};

const getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        const filteredPosts = posts.filter((post) => new Date(post.postDate) >= new Date(minDateStr));
        if (filteredPosts.length === 0) {
            reject("No results returned");
        } else {
            resolve(filteredPosts);
        }
    });
};

const getPostById = (id) => {
    return new Promise((resolve, reject) => {
        const post = posts.find((post) => post.id === id);
        if (!post) {
            reject("No result returned");
        } else {
            resolve(post);
        }
    });
};




module.exports = {
    initialize,
    getAllPosts,
    getPublishedPosts,
    getCategories,
    getPostsByCategory,
    getPostsByMinDate,
    getPostById

};