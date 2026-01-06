export interface RedditPost {
  id: string;
  title: string;
  imageUrl: string;
  author: string;
  subreddit: string;
  postUrl: string;
  ups: number; // upvotes
}

export const fetchRedditMemes = async (subreddit: string, limit: number = 25): Promise<RedditPost[]> => {
  try {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Reddit');
    }

    const data = await response.json();
    
    // Filter for image posts only
    const posts = data.data.children
      .filter((post: any) => {
        const url = post.data.url;
        // Only include direct image links
        return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
      })
      .map((post: any) => ({
        id: post.data.id,
        title: post.data.title,
        imageUrl: post.data.url,
        author: post.data.author,
        subreddit: post.data.subreddit,
        postUrl: `https://reddit.com${post.data.permalink}`,
        ups: post.data.ups
      }));

    return posts;
  } catch (error) {
    console.error('Reddit API error:', error);
    return [];
  }
};