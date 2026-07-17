import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { hash } from "argon2";

const users: Awaited<ReturnType<typeof prisma.user.create>>[] = [];
const tags: Awaited<ReturnType<typeof prisma.tag.create>>[] = [];

const prisma = new PrismaClient();

const TOTAL_USERS = 10;
const TOTAL_TAGS = 10;
const TOTAL_POSTS = 400;
const COMMENTS_PER_POST = 20;

function generateSlug(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "") +
    "-" +
    faker.string.alphanumeric(6).toLowerCase()
  );
}

async function main() {
  console.log("Seeding...");

  // USERS
  const users: Awaited<ReturnType<typeof prisma.user.create>>[] = [];
  const defaultPasswordHash = await hash("password123");

  // Create a predictable test user for front-end verification
  const testUser = await prisma.user.create({
    data: {
      name: "Test User",
      email: "testuser@example.com",
      bio: "This is a default test user account for testing.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=testuser",
      password: defaultPasswordHash,
    },
  });
  users.push(testUser);

  for (let i = 1; i < TOTAL_USERS; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        bio: faker.lorem.sentence(),
        avatar: faker.image.avatar(),
        password: defaultPasswordHash,
      },
    });

    users.push(user);
  }

  console.log(`✓ Users: ${users.length}`);

  // TAGS
  const tagNames = [
    "JavaScript",
    "TypeScript",
    "React",
    "NextJS",
    "NodeJS",
    "Prisma",
    "PostgreSQL",
    "CSS",
    "Docker",
    "AI",
  ];

  const tags: Awaited<ReturnType<typeof prisma.tag.create>>[] = [];

  for (const name of tagNames) {
    const tag = await prisma.tag.create({
      data: { name },
    });

    tags.push(tag);
  }

  console.log(`✓ Tags: ${tags.length}`);

  // POSTS
  for (let i = 0; i < TOTAL_POSTS; i++) {
    const title = faker.lorem.sentence();

    const author = faker.helpers.arrayElement(users);

    const selectedTags = faker.helpers.arrayElements(
      tags,
      faker.number.int({ min: 1, max: 4 })
    );

    const post = await prisma.post.create({
      data: {
        title,
        slug: generateSlug(title),
        content: faker.lorem.paragraphs(4),
        thumbnail: faker.image.urlPicsumPhotos(),
        published: true,
        authorId: author.id,

        tags: {
          connect: selectedTags.map((t) => ({
            id: t.id,
          })),
        },
      },
    });

    // COMMENTS
    await prisma.comment.createMany({
      data: Array.from({ length: COMMENTS_PER_POST }).map(() => ({
        content: faker.lorem.sentences({
          min: 1,
          max: 3,
        }),
        authorId: faker.helpers.arrayElement(users).id,
        postId: post.id,
      })),
    });

    // LIKES
    const likedUsers = faker.helpers.arrayElements(
      users,
      faker.number.int({
        min: 0,
        max: users.length,
      })
    );

    if (likedUsers.length) {
      await prisma.like.createMany({
        data: likedUsers.map((u) => ({
          userId: u.id,
          postId: post.id,
        })),
        skipDuplicates: true,
      });
    }

    if ((i + 1) % 20 === 0) {
      console.log(`✓ Posts: ${i + 1}/${TOTAL_POSTS}`);
    }
  }

  console.log("✅ Seed completed");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });