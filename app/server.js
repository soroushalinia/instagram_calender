"use server";
import { IgApiClient } from "instagram-private-api";
import fs from "fs";

const ig = new IgApiClient();

async function getSession() {
  try {
    let res = fs.readFileSync("session.json", "utf-8");
    return JSON.parse(res);
  } catch (err) {
    return null;
  }
}

export async function sessionExists() {
  const sessionData = await getSession();
  if (sessionData === null) {
    return false;
  } else {
    return true;
  }
}

export async function importSession(username) {
  ig.state.generateDevice(username);
  const sessionData = await getSession();
  await ig.state.deserialize(sessionData);
  return ig;
}

export async function login(username, password) {
  ig.state.generateDevice(username);
  const sessionData = await getSession();
  if (sessionData === null) {
    try {
      await ig.simulate.preLoginFlow();
      const loggedInUser = await ig.account.login(username, password);
      process.nextTick(async () => await ig.simulate.postLoginFlow());
      fs.writeFile(
        "session.json",
        JSON.stringify(await ig.state.serialize()),
        (err) => {
          return "error saving to file";
        }
      );

      return ["done", null];
    } catch (err) {
      return ["err login", err];
    }
  }
  return null;
}

export async function fetchPost(username, date) {
  await importSession("soroushalinia");
  try {
    const userId = await ig.user.getIdByUsername(username);
    const userFeed = ig.feed.user(userId);
    let targetPosts = [];

    for (var i = 0; i <= 5; i++) {
      console.log(i);
      const posts = await userFeed.items();
      for (const post of posts) {
        const targetDate = new Date(date);
        const postDate = new Date(post.taken_at * 1000);
        if (
          targetDate.getFullYear() == postDate.getFullYear() &&
          targetDate.getMonth() == postDate.getMonth() &&
          targetDate.getDate() == postDate.getDate()
        ) {
          targetPosts.push(post);
        }
      }
      if (posts.length === 0) {
        break;
      }
    }

    

    if (targetPosts.length === 0) {
      return null;
    }


    const urls = targetPosts.map((targetPost) => {
      if (targetPost.media_type == 1) {
        return [
          targetPost.caption.text,
          "photo",
          targetPost.image_versions2.candidates[0].url,
        ];
      } else if (targetPost.media_type == 2) {
        return [targetPost.caption.text, "video", targetPost.video_versions[0].url];
      } else if (targetPost.media_type == 8) {
        const carosel = targetPost.carousel_media.map((media) => {
          if (media.media_type === 1) {
            return ["photo", media.image_versions2.candidates[0].url];
          } else if (media.media_type === 2) {
            return ["video", media.video_versions[0].url];
          }
        });
        return [targetPost.caption.text, "carousel", carosel];
      }
    });


    console.log(urls);
    return JSON.stringify(urls);
  } catch (err) {
    return null;
  }
}
