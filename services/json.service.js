// import { cachePosts } from "../utils/cacheutils.js";

const jsonCreator = {
  CAMEL_CASE: "CAMEL_CASE",
  SNAKE_CASE: "SNAKE_CASE",
};

const jsonCreatorFunction = {
  CAMEL_CASE: createPostJSONCamelCase,
  SNAKE_CASE: createPostJSONSnakeCase,
};

function createPostJSONCamelCase(post) {
  const id = post["id"];
  const title = post["title"];
  const content = post["content"];
  const poster = post["poster"];
  const imageUrl = post["image_url"];
  const transformation = post["transformation"];
  const labelsString = post["labels"];
  const releaseDateISO = post["release_date"];
  const releaseYear = post["release_year"];
  const authorId = post["author_id"];
  const createdDateISO = post["created_date"];

  const base64Image = `data:image/jpeg;base64,${poster.toString("base64")}`;
  const labels = labelsString.split(", ");
  const [rd, rm, ry] = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
    .format(releaseDateISO)
    .split(" ");
  const releaseDate = `${rd} ${rm}, ${ry}`;
  const [cd, cm, cy] = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
    .format(createdDateISO)
    .split(" ");
  const createdDate = `${cd} ${cm}, ${cy}`;

  const transformedUrl = imageUrl
    ? imageUrl.replace("/upload/", `/upload/${transformation}/`)
    : "https://res.cloudinary.com/dggtyfdjz/image/upload/f_auto,q_auto/v1754653543/you_cant_see_me_ienix2.jpg";

  return {
    id: id,
    title: title,
    content: content,
    poster: base64Image,
    labels: labels,
    releaseDate: releaseDate,
    releaseYear: releaseYear,
    authorId: authorId,
    createdDate: createdDate,
    imageUrl: transformedUrl,
  };
}

function createPostJSONSnakeCase(post) {
  const id = post["id"];
  const title = post["title"];
  const content = post["content"];
  const poster = post["poster"];
  const imageUrl = post["image_url"];
  const transformation = post["transformation"];
  const labelsString = post["labels"];
  const releaseDateISO = post["release_date"];
  const releaseYear = post["release_year"];
  const authorId = post["author_id"];
  const createdDateISO = post["created_date"];

  const base64Image = `data:image/jpeg;base64,${poster.toString("base64")}`;
  const labels = labelsString.split(", ");
  const [rd, rm, ry] = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
    .format(releaseDateISO)
    .split(" ");
  const releaseDate = `${rd} ${rm}, ${ry}`;
  const [cd, cm, cy] = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
    .format(createdDateISO)
    .split(" ");
  const createdDate = `${cd} ${cm}, ${cy}`;

  const transformedUrl = imageUrl
    ? imageUrl.replace("/upload/", `/upload/${transformation}/`)
    : "https://res.cloudinary.com/dggtyfdjz/image/upload/f_auto,q_auto/v1754653543/you_cant_see_me_ienix2.jpg";

  return {
    post_id: id,
    title: title,
    content: content,
    poster: base64Image,
    labels: labels,
    release_date: releaseDate,
    release_year: releaseYear,
    author_id: authorId,
    created_date: createdDate,
    image_url: transformedUrl,
  };
}

export {
  jsonCreator,
  jsonCreatorFunction,
  createPostJSONCamelCase,
  createPostJSONSnakeCase,
};
