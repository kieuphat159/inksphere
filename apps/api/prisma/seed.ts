import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database...");
  await prisma.like.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.updateMany({ data: { lastMessageId: null } });
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tag.deleteMany();
  console.log("✓ Database cleaned");

  console.log("Seeding realistic data...");
  const defaultPasswordHash = await hash("password123");

  // 1. Tags
  const tagNames = [
    "NextJS",
    "NestJS",
    "TailwindCSS",
    "WebRTC",
    "Database",
    "DevOps",
    "DesignSystems",
    "TypeScript",
    "Docker",
    "Performance",
  ];
  const tags = await Promise.all(
    tagNames.map((name) => prisma.tag.create({ data: { name } }))
  );
  console.log(`✓ Tags created: ${tags.length}`);

  // 2. Users
  const userSeeds = [
    {
      name: "Test User",
      email: "testuser@example.com",
      bio: "Lead Frontend Engineer at InkSphere. Passionate about Next.js, React 19, and modern UX design.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=testuser",
    },
    {
      name: "Emily Watson",
      email: "emily@example.com",
      bio: "UI/UX Designer & Frontend Architect. Creator of accessible design systems and smooth interactions.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
    },
    {
      name: "Alex Rivera",
      email: "alex@example.com",
      bio: "Staff Backend Engineer. Focused on high-throughput distributed systems, databases, and NestJS architectures.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    },
    {
      name: "Sophia Chen",
      email: "sophia@example.com",
      bio: "DevOps & Cloud Architect. Kubernetes specialist, Docker enthusiast, and automation expert.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sophia",
    },
    {
      name: "Marcus Aurelius",
      email: "marcus@example.com",
      bio: "PostgreSQL DBA and Query Optimization expert. Passionate about database internals and performance tuning.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus",
    },
  ];

  const users = await Promise.all(
    userSeeds.map((u) =>
      prisma.user.create({
        data: {
          ...u,
          password: defaultPasswordHash,
        },
      })
    )
  );
  console.log(`✓ Users created: ${users.length}`);

  // 3. Posts
  const postSeeds = [
    // Test User Posts
    {
      authorEmail: "testuser@example.com",
      title: "Mastering Next.js 15 Server Actions & Forms",
      slug: "mastering-nextjs-15-server-actions-and-forms",
      thumbnail: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=800&auto=format&fit=crop&q=80",
      tags: ["NextJS", "TypeScript"],
      content: `<h2>Why Server Actions are the Future of Web Development</h2>
<p>Next.js Server Actions allow you to define asynchronous server functions that can be called directly from your client components. This eliminates the need to manually write API endpoints to handle form submissions.</p>

<h3>Handling Form Submissions with useActionState</h3>
<p>In React 19, the new <code>useActionState</code> hook simplifies tracking pending states and displaying validation errors returned from Server Actions. Let's look at an example implementation:</p>

<pre><code>"use server";

import { z } from "zod";

export async function savePost(prevState: any, formData: FormData) {
  const title = formData.get("title");
  if (!title || title.length &lt; 5) {
    return { ok: false, error: "Title is too short" };
  }
  // Perform database save...
  return { ok: true, error: "" };
}</code></pre>

<p>By connecting this action to a form, Next.js handles network errors, loading state, and client hydration gracefully. This makes form handling secure, fast, and progressively enhanced.</p>`,
    },
    {
      authorEmail: "testuser@example.com",
      title: "Transitioning to Tailwind CSS v4: What's New?",
      slug: "transitioning-to-tailwind-css-v4-whats-new",
      thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
      tags: ["TailwindCSS", "Performance"],
      content: `<h2>The Evolution of CSS Utility Libraries</h2>
<p>Tailwind CSS v4 is a major rewrite focused on compile-time performance, modern CSS features, and simpler configuration. Here is a breakdown of what makes it stand out.</p>

<h3>Key Features in Tailwind CSS v4</h3>
<ul>
  <li><strong>CSS-First Configuration:</strong> Instead of a JavaScript configuration file, v4 uses standard CSS directives directly in your main stylesheet.</li>
  <li><strong>Oxide Compiler:</strong> Written in Rust, the Oxide engine compiles classes up to 10x faster than previous engines.</li>
  <li><strong>Native Container Queries:</strong> Apply utility styles based on container constraints rather than browser viewport size.</li>
</ul>

<p>To declare custom colors in v4, simply use standard CSS variables inside the <code>@theme</code> directive:</p>
<pre><code>@theme {
  --color-brand-primary: #10b981;
  --color-brand-secondary: #06b6d4;
}</code></pre>
<p>This approach simplifies your build toolchains and delivers smaller, highly optimized stylesheets for production.</p>`,
    },

    // Emily Watson Posts
    {
      authorEmail: "emily@example.com",
      title: "Designing Accessible Web Applications with Radix UI",
      slug: "designing-accessible-web-applications-with-radix-ui",
      thumbnail: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80",
      tags: ["DesignSystems", "Performance"],
      content: `<h2>Accessibility is Not an Afterthought</h2>
<p>Building accessible components from scratch requires extensive WAI-ARIA implementation, keyboard navigation scripting, and thorough screen reader testing. This is where headless UI libraries save the day.</p>

<h3>Why Choose Headless Components?</h3>
<p>Radix UI provides primitive components that have zero styled-in opinions. They handle the complex structural semantics, focus rings, and screen-reader accessibility tags, allowing you to style the wrapper with absolute visual control.</p>

<p>For instance, an accessible Dialog modal is simple to build with Radix Dialog primitives:</p>
<pre><code>import * as Dialog from '@radix-ui/react-dialog';

export const Modal = () => (
  &lt;Dialog.Root&gt;
    &lt;Dialog.Trigger className="btn"&gt;Open Modal&lt;/Dialog.Trigger&gt;
    &lt;Dialog.Portal&gt;
      &lt;Dialog.Overlay className="overlay" /&gt;
      &lt;Dialog.Content className="modal-content"&gt;
        &lt;Dialog.Title&gt;Accessible Dialog&lt;/Dialog.Title&gt;
        &lt;Dialog.Close&gt;Close&lt;/Dialog.Close&gt;
      &lt;/Dialog.Content&gt;
    &lt;/Dialog.Portal&gt;
  &lt;/Dialog.Root&gt;
);</code></pre>
<p>Using these primitives guarantees compliance with WCAG standards without forcing you to write tedious focus-trapping scripts.</p>`,
    },
    {
      authorEmail: "emily@example.com",
      title: "The Art of Micro-interactions in Modern Web UIs",
      slug: "the-art-of-micro-interactions-in-modern-web-uis",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
      tags: ["DesignSystems"],
      content: `<h2>Enhancing Delight through Micro-interactions</h2>
<p>Micro-interactions are the subtle feedback loops built into interactive components—like button hover translations, notifications bubbles scaling, or form submission animations. These details transform static layouts into immersive experiences.</p>

<h3>Key Principles of Effective Animation</h3>
<ul>
  <li><strong>Keep it fast:</strong> Interaction animations should generally resolve within 150ms to 300ms. Anything slower feels sluggish.</li>
  <li><strong>Be purposeful:</strong> Every motion must guide the user's attention. Animate elements to show relation or status change.</li>
  <li><strong>Use easing:</strong> Avoid linear transitions. Utilize ease-out or cubic-bezier functions to mirror organic, real-world physics.</li>
</ul>
<p>Using CSS custom transitions makes it lightweight and GPU-optimized:</p>
<pre><code>.interactive-button {
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.interactive-button:hover {
  transform: scale(1.05);
}</code></pre>
<p>By keeping animations responsive and meaningful, you increase retention and build a premium digital product.</p>`,
    },

    // Alex Rivera Posts
    {
      authorEmail: "alex@example.com",
      title: "NestJS Dependency Injection Under the Hood",
      slug: "nestjs-dependency-injection-under-the-hood",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
      tags: ["NestJS", "TypeScript"],
      content: `<h2>Understanding Dependency Injection in Server Frameworks</h2>
<p>NestJS utilizes the Dependency Injection (DI) pattern to decouple software modules and simplify testing. When you add a class decorator like <code>@Injectable()</code>, NestJS registers it inside its internal IoC (Inversion of Control) container.</p>

<h3>How Providers are Resolved</h3>
<p>During startup, the NestJS runtime parses module declarations, tracks provider dependencies, and instantiates classes in topological order. Here is a simple provider module registration example:</p>

<pre><code>import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostResolver } from './post.resolver';

@Module({
  providers: [PostService, PostResolver],
  exports: [PostService],
})
export class PostModule {}</code></pre>

<p>When NestJS instantiates <code>PostResolver</code>, it checks the constructor parameters, instantiates <code>PostService</code> first (if not already instantiated as a singleton), and injects it. This architecture makes testing highly efficient since you can easily swap real service providers with mock providers using custom Testing Modules.</p>`,
    },
    {
      authorEmail: "alex@example.com",
      title: "Scaling Real-time Servers with WebSockets and Redis",
      slug: "scaling-real-time-servers-with-websockets-and-redis",
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
      tags: ["WebRTC", "NestJS", "Performance"],
      content: `<h2>The Scaling Challenge of WebSockets</h2>
<p>Unlike HTTP requests, WebSockets maintain persistent, stateful TCP connections between clients and servers. When you scale your backend horizontally across multiple server nodes, client sockets are distributed randomly. A client on Node A cannot directly broadcast messages to a client connected to Node B.</p>

<h3>Bridging Nodes with Redis Pub/Sub</h3>
<p>To enable cross-server socket broadcasts, we utilize a Redis adapter. When a message is sent to a socket room on Node A, Node A publishes the event to Redis, which distributes it to all other server nodes. Each server then delivers it to its local connected clients.</p>

<p>Here is how a standard Redis adapter is configured inside a NestJS IoC gateway:</p>
<pre><code>import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: any;

  async connectToRedis(): Promise&lt;void&gt; {
    const pubClient = new Redis(process.env.REDIS_URL);
    const subClient = pubClient.duplicate();
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}</code></pre>
<p>This pub/sub design lets your application scale effortlessly to support thousands of concurrent chat rooms and call channels.</p>`,
    },

    // Sophia Chen Posts
    {
      authorEmail: "sophia@example.com",
      title: "Building Multi-stage Docker Builds for Node.js Applications",
      slug: "building-multi-stage-docker-builds-for-nodejs-applications",
      thumbnail: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800&auto=format&fit=crop&q=80",
      tags: ["Docker", "DevOps"],
      content: `<h2>The Importance of Slim Docker Images</h2>
<p>Standard Node.js base images contain compiler tools, dev-dependencies, and package managers that are completely unnecessary in a running production container. Large images increase network deployment time and widen the attack surface of your server.</p>

<h3>Structure of a Multi-stage Dockerfile</h3>
<p>Multi-stage builds allow you to use temporary containers (stages) to build your source code, and copy only the compiled production output into a slim, runtime base image.</p>

<pre><code># Stage 1: Build source
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm ci --only=production
EXPOSE 8000
CMD ["node", "dist/main"]</code></pre>

<p>This technique typically reduces final image sizes from **1.2GB down to under 150MB**, speeding up continuous deployments and improving container security.</p>`,
    },
    {
      authorEmail: "sophia@example.com",
      title: "Continuous Integration with GitHub Actions: Best Practices",
      slug: "continuous-integration-with-github-actions-best-practices",
      thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop&q=80",
      tags: ["DevOps"],
      content: `<h2>Automating Quality Checks in Monorepos</h2>
<p>Continuous Integration (CI) guarantees that every code push passes formatting guidelines, code-style rules, and unit tests before merging into the main branch. In a monorepo setup, you can set up pipelines to build and lint all apps concurrently.</p>

<h3>Structuring a Clean GitHub Actions Workflow</h3>
<p>A standard workflow file (e.g. <code>ci.yml</code>) specifies triggering conditions, OS environments, cache structures, and execution steps. Here is a typical workflow configuration:</p>

<pre><code>name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test</code></pre>

<p>Utilizing caching for <code>node_modules</code> cuts pipeline execution time in half, providing developers with rapid feedback on build states.</p>`,
    },

    // Marcus Aurelius Posts
    {
      authorEmail: "marcus@example.com",
      title: "How We Optimized PostgreSQL Queries by 60%",
      slug: "how-we-optimized-postgresql-queries-by-60",
      thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80",
      tags: ["Database", "Performance"],
      content: `<h2>Eliminating Sequential Scans in Production Databases</h2>
<p>When a database table grows to hundreds of thousands of records, querying without indexes forces PostgreSQL to perform a Sequential Scan (full table search). This spikes CPU utilization and increases request execution time.</p>

<h3>Identifying Bottlenecks with EXPLAIN ANALYZE</h3>
<p>By running <code>EXPLAIN ANALYZE</code> on a query, we can review the exact execution plan. Let's look at how adding a compound index on comment trees drastically improved response speed:</p>

<pre><code>-- Creating compound index for parent-child relationship query
CREATE INDEX comment_postId_parentId_createdAt_idx 
ON "Comment" ("postId", "parentId", "createdAt" DESC);</code></pre>

<p>This compound index allowed PostgreSQL to perform an **Index Scan** instead of a Sequential Scan. In our test databases, query times for deep-nested comments dropped from **12.07ms down to 2.3ms**, relieving database load under concurrent reads.</p>`,
    },
    {
      authorEmail: "marcus@example.com",
      title: "Advanced Prisma Schema Relations and Performance Tips",
      slug: "advanced-prisma-schema-relations-and-performance-tips",
      thumbnail: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop&q=80",
      tags: ["Database", "Performance"],
      content: `<h2>Understanding Relational Mappings in Prisma</h2>
<p>Prisma simplifies database interactions but abstracts database joins. Knowing when to use implicit many-to-many relations versus explicit join tables is vital for optimization.</p>

<h3>Tuning Relations and Deletion Rules</h3>
<p>For tables with deep relationships, configuring cascading deletes ensures that deleting a parent entity cleans up all children automatically, avoiding orphaned records:</p>
<pre><code>model Post {
  id        Int        @id @default(autoincrement())
  comments  Comment[]
}

model Comment {
  id        Int      @id @default(autoincrement())
  postId    Int
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
}</code></pre>
<p>Additionally, use the <code>_count</code> feature in Prisma queries to fetch relation counts without loading full entities, saving bandwidth and network roundtrips.</p>`,
    },
  ];

  for (const postInfo of postSeeds) {
    const author = users.find((u) => u.email === postInfo.authorEmail);
    if (!author) continue;

    const selectedTags = tags.filter((t) => postInfo.tags.includes(t.name));

    const post = await prisma.post.create({
      data: {
        title: postInfo.title,
        slug: postInfo.slug,
        content: postInfo.content,
        thumbnail: postInfo.thumbnail,
        published: true,
        authorId: author.id,
        tags: {
          connect: selectedTags.map((t) => ({ id: t.id })),
        },
      },
    });

    // 4. Comments per post
    await prisma.comment.createMany({
      data: [
        {
          content: "Excellent write-up! This is exactly what I was looking for.",
          authorId: users[(users.indexOf(author) + 1) % users.length].id,
          postId: post.id,
        },
        {
          content: "Great article. Looking forward to your next post!",
          authorId: users[(users.indexOf(author) + 2) % users.length].id,
          postId: post.id,
        },
        {
          content: "Thanks for sharing this in-depth explanation.",
          authorId: users[(users.indexOf(author) + 3) % users.length].id,
          postId: post.id,
        },
      ],
    });

    // 5. Likes per post
    const likedUsers = users.filter((u) => u.id !== author.id);
    await prisma.like.createMany({
      data: likedUsers.map((u) => ({
        userId: u.id,
        postId: post.id,
      })),
      skipDuplicates: true,
    });
  }

  console.log(`✓ Posts created: ${postSeeds.length}`);
  console.log("✅ Seed completed successfully");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });