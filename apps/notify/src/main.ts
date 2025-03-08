import puppeteer from "puppeteer";
import notifier from "node-notifier";
import axios from "axios";

interface RedditPost {
  title: string;
  href: string;
}

const subreddit = "3Dprintmything"; // Change this to your target subreddit
const url = `https://www.reddit.com/r/${subreddit}/new/`;

// Telegram Bot Credentials
const TELEGRAM_BOT_TOKEN = "7922584287:AAG0YRVngNMNDx71CHthhIgB4N2XC_qY9WQ";
const TELEGRAM_CHAT_ID = "7258290954";

// Discord Webhook URL
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1215615615615615615/1215615615615615615";

// Function to send a Telegram notification
const sendTelegramMessage = async (message: string) => {
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    await axios.post(telegramUrl, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      disable_web_page_preview: true
    });
    console.log("Sent Telegram notification");
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
};

// Function to send a Discord notification
const sendDiscordMessage = async (message: string) => {
  try {
    await axios.post(DISCORD_WEBHOOK_URL, { content: message });
    console.log("Sent Discord notification");
  } catch (error) {
    console.error("Error sending Discord message:", error);
  }
};

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

        const message = `📢 *New Reddit Post!*\n**${post.title}**\n🔗 [View Post](${post.href})`;

        // Send desktop notification
        notifier.notify({
          title: "New Reddit Post!",
          message: post.title,
          open: post.href
        });

        // Send Telegram and Discord notifications
        sendTelegramMessage(message);
        //sendDiscordMessage(message);
      }
    });
  }, 30000); // Check every 30 seconds
})();
