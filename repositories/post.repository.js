import db, { schema } from "../infrastructure/database.js";

const findFirstNOrderById = async (n) => {
  const result = await db.query(
    `SELECT * FROM ${schema}.blog_posts ORDER BY id LIMIT $1;`,
    [n],
  );
  return result;
};

const findLastNOrderById = async (n) => {
  const result = await db.query(
    `SELECT * FROM ${schema}.blog_posts ORDER BY id DESC LIMIT $1;`,
    [n],
  );
  return result;
};

const findById = async (id) => {
  const result = await db.query(
    `SELECT * FROM ${schema}.blog_posts WHERE id = $1;`,
    [id],
  );
  return result;
};

const findByAuthorId = async (authorId) => {
  const result = await db.query(
    `SELECT * FROM ${schema}.blog_posts WHERE author_id = $1 ORDER BY id DESC;`,
    [authorId],
  );
  return result;
};

const findAll = async () => {
  const result = await db.query(`SELECT * FROM ${schema}.blog_posts;`, []);
  return result;
};

const findAllOrderByIdDesc = async () => {
  const result = await db.query(
    `SELECT * FROM ${schema}.blog_posts ORDER BY id DESC;`,
    [],
  );
  return result;
};

const savePost = async (post) => {
  const {
    title,
    content,
    poster,
    url,
    labels,
    releaseDate,
    releaseYear,
    authorId,
  } = post;
  console.log("Post Controller -> authorId: " + authorId);
  const result = await db.query(
    `INSERT INTO ${schema}.blog_posts (title, content, poster, image_url, labels, release_date, release_year, author_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
    [title, content, poster, url, labels, releaseDate, releaseYear, authorId],
  );
  return result;
};

export default {
  findFirstNOrderById,
  findLastNOrderById,
  findById,
  findByAuthorId,
  findAll,
  findAllOrderByIdDesc,
  savePost,
};
