import postRepository from "../repositories/post.repository.js";
import cachingService from "./caching.service.js";
import { jsonCreatorFunction } from "./json.service.js";

const getAll = async (jsonStyle) => {
  const posts = await getPosts(
    `homePosts`,
    () => postRepository.findAllOrderByIdDesc(),
    jsonStyle,
  );
  return posts;
};

const getLatestPost = async (jsonStyle) => {
  const latestPost = await getPost(
    `homeLatestPost`,
    () => postRepository.findLastNOrderById(1),
    jsonStyle,
  );
  return latestPost;
};

const getById = async (id, jsonStyle) => {
  const post = await getPost(
    `blogpost:${id}`,
    () => postRepository.findById(id),
    jsonStyle,
  );
  return post;
};

async function getPosts(key, queryfn, keyCase) {
  const posts = await cachingService.getDataFromCache(
    key,
    queryfn,
    jsonCreatorFunction[keyCase],
  );
  return posts;
}

async function getPost(key, queryfn, keyCase) {
  const posts = await cachingService.getDataFromCache(
    key,
    queryfn,
    jsonCreatorFunction[keyCase],
  );
  return posts[0];
}

const createPost = async (post) => {
  const {
    title,
    content,
    poster,
    url,
    labels,
    releaseDate,
    releaseYear,
    authorId,
    jsonStyle,
  } = post;

  console.log("Post Service -> authorId: " + authorId);
  const result = await postRepository.savePost({
    title,
    content,
    poster,
    url,
    labels,
    releaseDate,
    releaseYear,
    authorId,
  });

  const keys = [ `homePosts`, `homeLatestPost` ];
  cachingService.deleteCacheKeys(keys);
  await getPosts(
    `homePosts`,
    () => postRepository.findAllOrderByIdDesc(),
    jsonStyle,
  );
  await getPost(
    `homeLatestPost`,
    () => postRepository.findLastNOrderById(1),
    jsonStyle,
  );

  return result;
};

export default { getAll, getLatestPost, getById, createPost };
