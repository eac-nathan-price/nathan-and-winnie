import puppeteer from "puppeteer";
import notifier from "node-notifier";

interface RedditPost {
  title: string;
  href: string;
}

const subreddit = "javascript"; // Change this to your target subreddit
const url = `https://www.reddit.com/r/3Dprintmything/new/`;

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`Monitoring r/${subreddit} for new posts...`);

  await page.goto(url, { waitUntil: "networkidle2" });

  let seenPosts = new Set<string>();

  const getPosts = async (): Promise<RedditPost[]> => {
    return await page.evaluate(() => {
      return Array.from(document.querySelectorAll("shreddit-post [slot=title]")).map(post => ({
        title: post.textContent || "No Title",
        href: (post as HTMLAnchorElement).href
      }));
    });
  };

  // Capture initial snapshot of posts
  seenPosts = new Set((await getPosts()).map(post => post.href));

  // Monitor for new posts every 30 seconds
  setInterval(async () => {
    await page.reload({ waitUntil: "networkidle2" });

    const newPosts = await getPosts();
    newPosts.forEach(post => {
      if (!seenPosts.has(post.href)) {
        console.log(`New Post: ${post.title} - ${post.href}`);
        seenPosts.add(post.href);

        // Send desktop notification
        notifier.notify({
          title: "New Reddit Post!",
          message: post.title,
          open: post.href
        });
      }
    });
  }, 30000); // Check every 30 seconds
})();
