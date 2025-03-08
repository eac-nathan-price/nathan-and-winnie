import puppeteer from "puppeteer";
import notifier from "node-notifier";
import axios from "axios";

interface RedditPost {
  title: string;
  href: string;
}

//const subreddit = "r/3Dprintmything/new";
const subreddit = 'new';
const url = `https://www.reddit.com/${subreddit}/`;

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
  // Launch with more options to handle WSL2 environment
  const browser = await puppeteer.launch({ 
    headless: true, // Use boolean instead of "new" string
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080',
    ]
  });
  
  const page = await browser.newPage();
  
  // Set a realistic user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
  
  // Set viewport to a realistic size
  await page.setViewport({ width: 1920, height: 1080 });

  console.log(`Monitoring ${subreddit} for new posts...`);

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    console.log("Page loaded successfully");
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'reddit-debug.png' });
    console.log("Screenshot saved as reddit-debug.png");
    
    // Log the page HTML to see what we're working with
    const pageContent = await page.content();
    console.log(`Page content length: ${pageContent.length} characters`);
    
    let seenPosts = new Set<string>();

    const getPosts = async (): Promise<RedditPost[]> => {
      // Try multiple selectors to find Reddit posts
      return await page.evaluate(() => {
        // Try the original selector
        let posts = Array.from(document.querySelectorAll("shreddit-post [slot=title]"));
        
        // If that doesn't work, try alternative selectors
        if (posts.length === 0) {
          console.log("Original selector failed, trying alternatives...");
          
          // Try selector for old Reddit
          posts = Array.from(document.querySelectorAll(".thing .title a"));
          
          // Try selector for new Reddit
          if (posts.length === 0) {
            posts = Array.from(document.querySelectorAll("div[data-testid='post-container'] h3"));
          }
          
          // Try even more generic selector
          if (posts.length === 0) {
            posts = Array.from(document.querySelectorAll("h3 a[data-click-id='body']"));
          }
        }
        
        console.log(`Found ${posts.length} posts`);
        
        return posts.map(post => {
          const title = post.textContent || "No Title";
          let href = "";
          
          // Handle different element types
          if (post instanceof HTMLAnchorElement) {
            href = post.href;
          } else {
            // Try to find the closest anchor tag
            const anchor = post.closest('a') || post.querySelector('a');
            if (anchor) {
              href = anchor.href;
            }
          }
          
          return { title, href };
        }).filter(post => post.href); // Only include posts with valid URLs
      });
    };

    // Capture initial snapshot of posts
    const initialPosts = await getPosts();
    console.log(`Initial posts found: ${initialPosts.length}`);
    initialPosts.forEach(post => console.log(`- ${post.title}: ${post.href}`));
    
    seenPosts = new Set(initialPosts.map(post => post.href));
    console.log(`Initialized seenPosts with ${seenPosts.size} posts`);

    // Monitor for new posts every 30 seconds
    setInterval(async () => {
      console.log('Reloading page');
      try {
        await page.reload({ waitUntil: "networkidle2", timeout: 60000 });
        console.log('Page reloaded');

        const newPosts = await getPosts();
        console.log(`Found ${newPosts.length} posts after reload`);
        
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
      } catch (error) {
        console.error("Error during page reload:", error);
      }
    }, 30000); // Check every 30 seconds
  } catch (error) {
    console.error("Error during initial page load:", error);
    await browser.close();
  }
})();
