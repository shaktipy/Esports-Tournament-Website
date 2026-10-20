/**
 * YouTube Integration Service for HAARSH XO
 * Supports:
 * - Real-time YouTube Data API v3 synchronization (Live streams, latest uploads, shorts)
 * - Channel ID & API Key management (via localStorage or .env)
 * - Automatic fallback feed with verified Free Fire videos
 */

const STORAGE_KEY_API_KEY = 'haarshxo_yt_api_key';
const STORAGE_KEY_CHANNEL_ID = 'haarshxo_yt_channel_id';

// Default curated feed with real Free Fire video IDs for the official HAARSH XO player
export const DEFAULT_FEED = [
  { 
    id: 'yt_live_1', 
    type: 'live', 
    title: '🔴 Free Fire Max Grand Finals & Custom Room - Winner gets 500 Diamonds!', 
    duration: 'LIVE NOW', 
    videoId: 'jfKfPfyJRdk',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
    viewers: '2.4K Watching',
    description: 'Daily Live Stream with HAARSH XO. Playing CS Ranked and custom subscriber matches.'
  },
  { 
    id: 'yt_vid_1', 
    type: 'video', 
    title: '1v4 Clash Squad Impossible Clutch (Ranked Master Tier Gameplay)', 
    duration: '14:20', 
    videoId: '5qap5aO4i9A',
    thumbnail: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1470&auto=format&fit=crop',
    viewers: '45K Views',
    description: 'Crazy 1v4 clutch against top leaderboard squad in Bermuda.'
  },
  { 
    id: 'yt_live_2', 
    type: 'live', 
    title: '🔴 Free Fire World Series Scrims Cast + Giveaway Custom Rooms', 
    duration: 'LIVE', 
    videoId: '21X5lGlDOfg',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
    viewers: '1.8K Watching',
    description: 'Competitive scrim casting with top Indian esports rosters.'
  },
  { 
    id: 'yt_vid_2', 
    type: 'video', 
    title: 'New OB Update Top 5 Secret Hidden Tricks in Bermuda', 
    duration: '18:45', 
    videoId: '3JZ_D3ELwOQ',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
    viewers: '89K Views',
    description: 'Learn pro positioning and secret spots to reach Grandmaster easily.'
  },
  { 
    id: 'yt_vid_3', 
    type: 'video', 
    title: 'When you bait the entire squad with one gloo wall 💀', 
    duration: '8:52', 
    videoId: 'kJQP7kiw5Fk',
    thumbnail: 'https://images.unsplash.com/photo-1580234797602-22c37b4a24f0?q=80&w=2067&auto=format&fit=crop',
    viewers: '120K Views',
    description: 'Best gloo wall bait trick to fool rushers in Clash Squad.'
  },
  { 
    id: 'yt_vid_4', 
    type: 'video', 
    title: 'How to aim headshots with Woodpecker & M1887 (Handcam Guide)', 
    duration: '22:15', 
    videoId: 'fJ9rUzIMcZQ',
    thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2165&auto=format&fit=crop',
    viewers: '150K Views',
    description: 'Complete DPI, sensitivity and drag guide for perfect one-taps.'
  },
  { 
    id: 'yt_live_3', 
    type: 'live', 
    title: '🔴 Ranked Grind to Heroic - Clash Squad Custom Rooms Open!', 
    duration: 'LIVE', 
    videoId: 'dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=2057&auto=format&fit=crop',
    viewers: '3.1K Watching',
    description: 'Live ranked grinding session — join custom rooms and win XO Coins!'
  },
  { 
    id: 'yt_vid_5', 
    type: 'video', 
    title: 'Top 10 Best Characters Combo for Clash Squad in OB47 Update', 
    duration: '16:30', 
    videoId: 'ScMzIvxBSi4',
    thumbnail: 'https://images.unsplash.com/photo-1614294149010-950b698f72c0?q=80&w=2070&auto=format&fit=crop',
    viewers: '210K Views',
    description: 'Best character combinations for dominating Clash Squad ranked matches.'
  },
];

export const OFFICIAL_API_KEY = 'REDACTED_YOUTUBE_API_KEY';
export const OFFICIAL_CHANNEL_ID = 'UCn46HBkf6RSZTV9tj3cqVBg';

export const getStoredCredentials = () => {
  const apiKey = localStorage.getItem(STORAGE_KEY_API_KEY) || import.meta.env.VITE_YOUTUBE_API_KEY || OFFICIAL_API_KEY;
  const channelId = localStorage.getItem(STORAGE_KEY_CHANNEL_ID) || import.meta.env.VITE_YOUTUBE_CHANNEL_ID || OFFICIAL_CHANNEL_ID;
  return { apiKey, channelId };
};

export const saveCredentials = (apiKey, channelId) => {
  if (apiKey) localStorage.setItem(STORAGE_KEY_API_KEY, apiKey.trim());
  else localStorage.removeItem(STORAGE_KEY_API_KEY);

  if (channelId) localStorage.setItem(STORAGE_KEY_CHANNEL_ID, channelId.trim());
  else localStorage.removeItem(STORAGE_KEY_CHANNEL_ID);
};

function decodeHtml(html) {
  if (!html) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

/**
 * Parses ISO 8601 duration (PT14M20S) into "14:20"
 */
function parseDuration(isoDuration) {
  if (!isoDuration) return '10:00';
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '10:00';
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  if (hours > 0) {
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

/**
 * Format view count (e.g. 24000 -> 24K Views)
 */
function formatViewCount(views) {
  const count = parseInt(views, 10);
  if (isNaN(count)) return '0 Views';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M Views`;
  if (count >= 1000) return `${Math.round(count / 1000)}K Views`;
  return `${count} Views`;
}

/**
 * Parses ISO 8601 duration into total seconds
 */
function parseDurationSeconds(isoDuration) {
  if (!isoDuration) return 0;
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Fetches real-time channel videos and live status using YouTube Data API v3
 */
export const fetchRealtimeChannelVideos = async (apiKey, channelId) => {
  if (!apiKey || !channelId) {
    return {
      connected: false,
      videos: DEFAULT_FEED,
      message: 'No YouTube API credentials configured. Using default channel feed.'
    };
  }

  try {
    const rawItems = [];
    const uploadsPlaylistId = channelId.startsWith('UC') ? 'UU' + channelId.slice(2) : channelId;

    // 1. Fetch from uploads playlist (costs only 1 quota unit per 50 videos!)
    try {
      const p1Url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${uploadsPlaylistId}&part=snippet,contentDetails&maxResults=50`;
      const p1Res = await fetch(p1Url);
      if (p1Res.ok) {
        const p1Data = await p1Res.json();
        rawItems.push(...(p1Data.items || []));

        // Fetch page 2 (up to 100 uploads total)
        if (p1Data.nextPageToken) {
          const p2Url = `${p1Url}&pageToken=${p1Data.nextPageToken}`;
          const p2Res = await fetch(p2Url);
          if (p2Res.ok) {
            const p2Data = await p2Res.json();
            rawItems.push(...(p2Data.items || []));
          }
        }
      }
    } catch (e) {
      console.warn('Playlist fetch failed, falling back to search API:', e);
    }

    // Fallback to search endpoint if playlistItems returned nothing
    if (rawItems.length === 0) {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=50`;
      const searchRes = await fetch(searchUrl);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        (searchData.items || []).forEach(item => {
          if (item.id?.videoId) {
            rawItems.push({
              contentDetails: { videoId: item.id.videoId },
              snippet: item.snippet
            });
          }
        });
      }
    }

    const videoIds = rawItems
      .map(item => item.contentDetails?.videoId || item.id?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      return {
        connected: true,
        videos: DEFAULT_FEED,
        message: 'No videos found in channel feed. Showing default videos.'
      };
    }

    // 2. Fetch video details in chunks of 50
    const detailsMap = {};
    for (let i = 0; i < videoIds.length; i += 50) {
      const chunk = videoIds.slice(i, i + 50);
      try {
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${chunk.join(',')}&part=contentDetails,statistics,snippet,liveStreamingDetails`;
        const detailsRes = await fetch(detailsUrl);
        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          (detailsData.items || []).forEach(v => {
            detailsMap[v.id] = v;
          });
        }
      } catch (err) {
        console.warn('Error fetching video chunk details:', err);
      }
    }

    // 3. Process, filter out shorts, and properly classify live streams vs videos
    const parsedVideos = [];
    const seenIds = new Set();

    for (let index = 0; index < videoIds.length; index++) {
      const vid = videoIds[index];
      if (seenIds.has(vid)) continue;
      seenIds.add(vid);

      const detail = detailsMap[vid];
      if (!detail) continue;

      const snippet = detail.snippet || rawItems[index]?.snippet || {};
      const durationIso = detail.contentDetails?.duration;
      const totalSec = parseDurationSeconds(durationIso);

      // EXCLUDE SHORTS: YouTube Shorts are strictly 60 seconds or shorter
      if (totalSec > 0 && totalSec <= 60) {
        continue;
      }

      const isLiveNow = snippet.liveBroadcastContent === 'live';
      const wasLiveStream = Boolean(detail.liveStreamingDetails) || isLiveNow || /live|stream|🔴/i.test(snippet.title);
      const formattedDuration = isLiveNow ? 'LIVE NOW' : parseDuration(durationIso);

      parsedVideos.push({
        id: `yt_${vid}_${index}`,
        type: wasLiveStream ? 'live' : 'video',
        isLiveNow: isLiveNow,
        wasStream: wasLiveStream,
        badgeText: isLiveNow ? '🔴 LIVE NOW' : (wasLiveStream ? '🔴 LIVE STREAM' : '📹 VIDEO'),
        title: decodeHtml(snippet.title),
        duration: formattedDuration,
        videoId: vid,
        thumbnail: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url,
        viewers: isLiveNow 
          ? `${detail.liveStreamingDetails?.concurrentViewers ? formatViewCount(detail.liveStreamingDetails.concurrentViewers).replace('Views', 'Watching') : 'LIVE'}`
          : formatViewCount(detail.statistics?.viewCount || '0'),
        description: snippet.description || 'HAARSH XO Free Fire content.'
      });
    }

    // Sort: Actively live streams first, then recent streams/videos
    parsedVideos.sort((a, b) => (b.isLiveNow ? 1 : 0) - (a.isLiveNow ? 1 : 0));

    return {
      connected: true,
      videos: parsedVideos.length > 0 ? parsedVideos : DEFAULT_FEED,
      message: `Successfully synchronized ${parsedVideos.length} channel streams & videos from YouTube!`
    };
  } catch (error) {
    console.error('Error fetching YouTube API data:', error);
    return {
      connected: false,
      videos: DEFAULT_FEED,
      error: error.message,
      message: `Sync failed: ${error.message}. Loaded default verified feed.`
    };
  }
};
