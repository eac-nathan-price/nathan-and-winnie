import puppeteer from "puppeteer";
import notifier from "node-notifier";
import axios from "axios";

import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, DISCORD_WEBHOOK_URL } from "./secret";

interface RedditPost {
  title: string;
  href: string;
}

// Keywords to filter posts by (case insensitive)
const KEYWORDS = [
  'US', 'U.S.', 'USA', 'United States', 
  'CA', 'Cal', 'Cali', 'California', 
  'SoCal', 'LA', 'Los Angeles', 'L.A.'
];

// Function to check if a post title contains any of the keywords
const containsKeyword = (title: string): boolean => {
  const lowerTitle = title.toLowerCase();
  return KEYWORDS.some(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    // Match keyword when it's surrounded by non-letters or at the end of the string
    const regex = new RegExp(`(^|[^a-zA-Z])${lowerKeyword}($|[^a-zA-Z])`, 'i');
    return regex.test(lowerTitle);
  });
};

// Counters for status updates
let totalSeenPosts = 0;
let newPostsCount = 0;
let newAlertsCount = 0;
let refreshCount = 0;
let alertCount = 0;

// Function to update the console output on the same line
const updateConsoleStatus = () => {
  const now = new Date();
  
  // Convert to Pacific Time (PT) with 12-hour format and AM/PM
  const ptFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  
  const ptTime = ptFormatter.format(now);
  
  const statusMessage = `Refreshes: ${refreshCount++} | Update time: ${ptTime} | Seen posts: ${totalSeenPosts} | New Posts: ${newPostsCount} | New Alerts: ${newAlertsCount} | Alerts: ${alertCount}`;
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(statusMessage);
};

const subreddit = "r/3Dprintmything/new";
//const subreddit = 'new';
const url = `https://www.reddit.com/${subreddit}/`;

// Function to send a Telegram notification
const sendTelegramMessage = async (message: string) => {
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    await axios.post(telegramUrl, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      disable_web_page_preview: true
    });
    // console.log("\nSent Telegram notification");
    updateConsoleStatus(); // Restore status line after log
  } catch (error) {
    console.error("\nError sending Telegram message:", error);
    updateConsoleStatus(); // Restore status line after error
  }
};

// Function to send a Discord notification
const sendDiscordMessage = async (message: string) => {
  try {
    await axios.post(DISCORD_WEBHOOK_URL, { content: message });
    // console.log("\nSent Discord notification");
    updateConsoleStatus(); // Restore status line after log
  } catch (error) {
    console.error("\nError sending Discord message:", error);
    updateConsoleStatus(); // Restore status line after error
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
    // console.log("Page loaded successfully");
    
    // Take a screenshot for debugging
    // await page.screenshot({ path: 'reddit-debug.png' });
    // console.log("Screenshot saved as reddit-debug.png");
    
    // Log the page HTML to see what we're working with
    const pageContent = await page.content();
    // console.log(`Page content length: ${pageContent.length} characters`);
    
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
    
    seenPosts = new Set(initialPosts.map(post => post.href));
    totalSeenPosts = seenPosts.size;
    
    // console.log("Starting monitoring...");
    updateConsoleStatus();

    // Monitor for new posts every 30 seconds
    setInterval(async () => {
      try {
        // Reset counters for this interval
        newPostsCount = 0;
        newAlertsCount = 0;
        
        await page.reload({ waitUntil: "networkidle2", timeout: 60000 });

        const newPosts = await getPosts();
        
        newPosts.forEach(post => {
          if (!seenPosts.has(post.href)) {
            newPostsCount++;
            seenPosts.add(post.href);
            totalSeenPosts++;

            // Only send notifications if the post title contains one of the keywords
            if (containsKeyword(post.title)) {
              newAlertsCount++;
              alertCount++;
              console.log(`\nKeyword match found: ${post.title} - ${post.href}`);
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
              
              updateConsoleStatus(); // Restore status line after logs
            }
          }
        });
        
        // Update the console with the latest status
        updateConsoleStatus();
      } catch (error) {
        console.error("\nError during page reload:", error);
        updateConsoleStatus(); // Restore status line after error
      }
    }, 30000); // Check every 30 seconds
  } catch (error) {
    console.error("Error during initial page load:", error);
    await browser.close();
  }
})();
