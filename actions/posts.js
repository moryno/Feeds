"use server";

import { uploadImage } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

const { storePost, updatePostLikeStatus } = require("@/lib/posts");
const { redirect } = require("next/navigation");

export async function createPost(prevState, formData) {
  const title = formData.get("title");
  const image = formData.get("image");
  const content = formData.get("content");

  let errors = [];

  if (!title || title.length === 0) {
    errors.push("Title is required.");
  }
  if (!content || content.length === 0) {
    errors.push("Content is required.");
  }
  if (!image || image.size === 0) {
    errors.push("Image is required.");
  }

  if (errors.length > 0) {
    return { errors };
  }

  let imageUrl;

  try {
    imageUrl = await uploadImage(image);
  } catch (error) {
    throw new Error(
      "Image upload failed, post was not created. Please try again later."
    );
  }

  await storePost({
    imageUrl,
    title,
    content,
    userId: 1,
  });

  revalidatePath("/feed");
  redirect("/feed");
}

export async function togglePostLikeStatus(postId) {
  await updatePostLikeStatus(postId, 2);
  revalidatePath("/", "layout");
}
