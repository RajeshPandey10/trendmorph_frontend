import SummaryApi from "../../api/SummaryApi";

const CATEGORY_ICONS = {
  Music: "🎵",
  Sports: "⚽",
  Entertainment: "🎬",
  News: "📰",
  Fashion: "👗",
  Food: "🍳",
  Travel: "✈️",
  Fitness: "💪",
  Business: "💼",
  Trending: "🔥",
  Movies: "🎭",
  Beauty: "💄",
  Asian: "🥢",
  Nepal: "🏔️",
  Nepalese: "🇳🇵",
  Songs: "🎤",
  Memes: "😂",
  Blogs: "📝",
  Shorts: "📱",
  Comedy: "🎪",
  Education: "📚",
  Lifestyle: "🌟",
  Art: "🎨",
  Automotive: "🚗",
  Youtube: "📺",
  Reddit: "🤖",
  Pinterest: "📌",
  Health: "🏥",
  Science: "🔬",
  Politics: "🏛️",
  DIY: "🔨",
  Pets: "🐕",
  Parenting: "👶",
  Cooking: "👨‍🍳",
  Photography: "📸",
  Design: "✨",
  default: "📱",
};

const fetchAvailableCategories = async (setLoading, setCategories) => {
  setLoading(true);

  // Add a small delay to prevent rapid successive calls
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Helper to add timeout to a promise
  const withTimeout = (promise, ms) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), ms)
      ),
    ]);
  }; // 🔥 ENHANCED: Start with all predefined categories
  const predefinedCategories = Object.keys(CATEGORY_ICONS).filter(
    (key) => key !== "default"
  );
  const categoryCounts = {};

  // Initialize all predefined categories with count 0
  predefinedCategories.forEach((cat) => {
    categoryCounts[cat] = 0;
  });

  const addCategory = (cat) => {
    if (!cat) return;
    const key = cat.trim();
    if (!key) return;

    // 🔥 ENHANCED: Filter out unwanted categories and hashtags
    const unwantedCategories = [
      "cas",
      "cigarettesaftersex",
      "visitmunich",
      "munichhotelsgermany",
      "general",
      "misc",
      "miscellaneous",
      "other",
      "undefined",
      "null",
      // Filter out very specific location hashtags
      "munich",
      "germany",
      
    ];

    // Check if the category should be filtered out
    const keyLower = key.toLowerCase();
    if (
      unwantedCategories.some(
        (unwanted) =>
          keyLower === unwanted ||
          keyLower.includes(unwanted) ||
          unwanted.includes(keyLower)
      )
    ) {
      return; // Skip unwanted categories
    }

    // Filter out categories that are too short (likely noise) or too long (likely specific content)
    if (key.length < 3 || key.length > 15) {
      return;
    }

    // Filter out categories that contain numbers (likely specific content IDs)
    if (/\d/.test(key)) {
      return;
    }

    // Check for exact match or close match with predefined categories
    const matchedCategory = predefinedCategories.find(
      (predefined) =>
        predefined.toLowerCase() === key.toLowerCase() ||
        key.toLowerCase().includes(predefined.toLowerCase()) ||
        predefined.toLowerCase().includes(key.toLowerCase())
    );

    if (matchedCategory) {
      categoryCounts[matchedCategory] =
        (categoryCounts[matchedCategory] || 0) + 1;
    } else {
      // Only add dynamic categories if they pass quality checks
      const isValidCategory =
        key.length >= 4 &&
        key.length <= 12 &&
        /^[a-zA-Z\s]+$/.test(key) && // Only letters and spaces
        !key.includes("#") && // No hashtags
        !key.includes("@") && // No mentions
        !key.includes("www") && // No URLs
        !key.includes(".com"); // No domains

      if (isValidCategory) {
        categoryCounts[key] = (categoryCounts[key] || 0) + 1;
      }
    }
  };

  try {
    console.log("🔍 Fetching categories from APIs...");

    const [youtubeResponse, redditResponse, pinterestResponse] =
      await Promise.allSettled([
        withTimeout(SummaryApi.getYoutubeTrending("trending"), 15000), // Increased timeout
        withTimeout(SummaryApi.getRedditTrending("popular"), 15000),
        withTimeout(SummaryApi.getPinterestTrending("trending"), 15000),
      ]);

    // 🔥 DETAILED API RESPONSE LOGGING FOR NICHE FETCHING
    console.log("📡 YouTube API Response:", {
      status: youtubeResponse.status,
      value: youtubeResponse.value,
      reason: youtubeResponse.reason,
      fullResponse: youtubeResponse,
    });

    console.log("📡 Reddit API Response:", {
      status: redditResponse.status,
      value: redditResponse.value,
      reason: redditResponse.reason,
      fullResponse: redditResponse,
    });

    console.log("📡 Pinterest API Response:", {
      status: pinterestResponse.status,
      value: pinterestResponse.value,
      reason: pinterestResponse.reason,
      fullResponse: pinterestResponse,
    });

    // 🔥 ENHANCED: Better response parsing
    const parseResponse = (response, platform) => {
      console.log(`🔍 Parsing ${platform} response:`, {
        status: response.status,
        hasValue: !!response.value,
        hasData: !!response.value?.data,
        dataType: typeof response.value?.data,
        dataStructure: response.value?.data
          ? Object.keys(response.value.data)
          : "No data",
      });

      if (response.status !== "fulfilled" || !response.value?.data) {
        console.warn(`❌ ${platform} API failed or returned no data`);
        return [];
      }

      let items = [];
      const data = response.value.data;

      console.log(`📊 ${platform} data analysis:`, {
        isArray: Array.isArray(data),
        hasResults: !!data.results,
        hasVideos: !!data.videos,
        hasPosts: !!data.posts,
        hasData: !!data.data,
        keys: Object.keys(data),
        sampleItem:
          data[0] ||
          data.results?.[0] ||
          data.videos?.[0] ||
          data.posts?.[0] ||
          "No items",
      });

      // Try multiple possible response structures
      if (Array.isArray(data)) {
        items = data;
      } else if (Array.isArray(data.results)) {
        items = data.results;
      } else if (Array.isArray(data.data)) {
        items = data.data;
      } else if (Array.isArray(data.videos)) {
        items = data.videos;
      } else if (Array.isArray(data.posts)) {
        items = data.posts;
      }

      console.log(
        `✅ ${platform}: Found ${items.length} items`,
        items.slice(0, 3)
      );
      return items;
    };

    // Parse YouTube
    const youtubeItems = parseResponse(youtubeResponse, "YouTube");
    youtubeItems.forEach((video) => {
      if (video.category) addCategory(video.category);
      if (video.hashtags) {
        if (Array.isArray(video.hashtags)) {
          video.hashtags.forEach(addCategory);
        } else if (typeof video.hashtags === "string") {
          video.hashtags.split(/[,#\s]+/).forEach(addCategory);
        }
      }

      // Enhanced keyword matching
      if (video.title) {
        predefinedCategories.forEach((cat) => {
          if (video.title.toLowerCase().includes(cat.toLowerCase())) {
            addCategory(cat);
          }
        });
      }
    });

    // Parse Reddit
    const redditItems = parseResponse(redditResponse, "Reddit");
    redditItems.forEach((post) => {
      if (post.subreddit) {
        const category =
          post.subreddit.charAt(0).toUpperCase() + post.subreddit.slice(1);
        addCategory(category);
      }
      if (post.hashtags) {
        if (Array.isArray(post.hashtags)) {
          post.hashtags.forEach(addCategory);
        } else if (typeof post.hashtags === "string") {
          post.hashtags.split(/[,#\s]+/).forEach(addCategory);
        }
      }

      // Enhanced keyword matching
      if (post.title) {
        predefinedCategories.forEach((cat) => {
          if (post.title.toLowerCase().includes(cat.toLowerCase())) {
            addCategory(cat);
          }
        });
      }
    });

    // Parse Pinterest
    const pinterestItems = parseResponse(pinterestResponse, "Pinterest");
    pinterestItems.forEach((pin) => {
      if (pin.topic) addCategory(pin.topic);
      if (pin.category) addCategory(pin.category);
      if (pin.hashtags) {
        if (Array.isArray(pin.hashtags)) {
          pin.hashtags.forEach(addCategory);
        } else if (typeof pin.hashtags === "string") {
          pin.hashtags.split(/[,#\s]+/).forEach(addCategory);
        }
      }

      // Enhanced keyword matching
      if (pin.title || pin.description) {
        const text = (pin.title || "") + " " + (pin.description || "");
        predefinedCategories.forEach((cat) => {
          if (text.toLowerCase().includes(cat.toLowerCase())) {
            addCategory(cat);
          }
        });
      }
    });

    console.log("📊 Category counts:", categoryCounts);

    // 🔥 ENHANCED: Much stricter filtering for better quality
    const popularPredefined = [
      "Music",
      "Gaming",
      "Entertainment",
      "Sports",
      "Fashion",
      "Tech",
      "Food",
      "Travel",
      "Fitness",
      "Beauty",
      "Education",
      "Comedy",
      "Art",
      "Business",
    ];

    // Only show categories that meet strict criteria
    const filteredCategories = Object.keys(categoryCounts).filter((cat) => {
      // Always include popular predefined categories (even with 0 count)
      if (popularPredefined.includes(cat)) {
        return true;
      }

      // For dynamic categories, require minimum activity and quality
      const count = categoryCounts[cat] || 0;
      const isQualityCategory =
        count >= 2 && // Minimum 2 occurrences
        cat.length >= 4 &&
        cat.length <= 12 &&
        /^[A-Z][a-z]*$/.test(cat) && // Proper capitalization
        !cat.includes(" ") && // Single word only
        popularPredefined.some(
          (pred) =>
            cat.toLowerCase().includes(pred.toLowerCase()) ||
            pred.toLowerCase().includes(cat.toLowerCase())
        ); // Must be related to predefined categories

      return isQualityCategory;
    });

    console.log("🔍 Filtered categories:", filteredCategories);

    // Sort by popularity and count
    const sortedCategories = filteredCategories.sort((a, b) => {
      const aIsPopular = popularPredefined.includes(a);
      const bIsPopular = popularPredefined.includes(b);

      if (aIsPopular && !bIsPopular) return -1;
      if (!aIsPopular && bIsPopular) return 1;

      return categoryCounts[b] - categoryCounts[a];
    });

    if (sortedCategories.length > 0) {
      const categoryNiches = sortedCategories
        .slice(0, 20) // Limit to 20 categories max
        .map((category) => ({
          icon: CATEGORY_ICONS[category] || CATEGORY_ICONS.default,
          title: category,
          description: `${category} content and videos`,
          count: categoryCounts[category] || 0,
        }));

      console.log(
        `✅ Showing ${categoryNiches.length} categories:`,
        categoryNiches.map((c) => c.title)
      );
      setCategories(categoryNiches);
    } else {
      // 🔥 ENHANCED: Show all predefined categories as fallback
      console.log("📋 Using comprehensive fallback categories");
      const comprehensiveFallback = [
        { icon: "🔥", title: "Trending", description: "What's hot right now" },
        { icon: "🎵", title: "Music", description: "Songs, Artists, Albums" },
        {
          icon: "🎮",
          title: "Gaming",
          description: "Games, Reviews, Gameplay",
        },
        {
          icon: "🎬",
          title: "Entertainment",
          description: "Movies, Shows, Celebrities",
        },
        {
          icon: "⚽",
          title: "Sports",
          description: "Games, Players, Highlights",
        },
        {
          icon: "💻",
          title: "Tech",
          description: "Technology, Gadgets, Reviews",
        },
        { icon: "👗", title: "Fashion", description: "Style, Trends, Outfits" },
        {
          icon: "🍳",
          title: "Food",
          description: "Recipes, Cooking, Restaurants",
        },
        {
          icon: "✈️",
          title: "Travel",
          description: "Destinations, Tips, Adventures",
        },
        {
          icon: "💪",
          title: "Fitness",
          description: "Workouts, Health, Wellness",
        },
        { icon: "📰", title: "News", description: "Latest News and Updates" },
        {
          icon: "📚",
          title: "Education",
          description: "Learning, Tutorials, Courses",
        },
        {
          icon: "🎭",
          title: "Movies",
          description: "Films, Reviews, Trailers",
        },
        { icon: "💄", title: "Beauty", description: "Makeup, Skincare, Tips" },
        {
          icon: "🎤",
          title: "Songs",
          description: "Latest hits and music videos",
        },
        {
          icon: "😂",
          title: "Memes",
          description: "Funny content and viral memes",
        },
        {
          icon: "🎪",
          title: "Comedy",
          description: "Stand-up, sketches, funny videos",
        },
        {
          icon: "🌟",
          title: "Lifestyle",
          description: "Daily life, trends, vlogs",
        },
        {
          icon: "🎨",
          title: "Art",
          description: "Creative content, tutorials",
        },
        {
          icon: "💼",
          title: "Business",
          description: "Entrepreneurship, finance, tips",
        },
      ];
      setCategories(comprehensiveFallback);
    }
  } catch (error) {
    console.error("❌ Failed to fetch categories:", error);

    // 🔥 ENHANCED: Comprehensive error fallback
    const errorFallback = [
      { icon: "🔥", title: "Trending", description: "What's hot right now" },
      { icon: "🎵", title: "Music", description: "Songs, Artists, Albums" },
      { icon: "🎮", title: "Gaming", description: "Games, Reviews, Gameplay" },
      {
        icon: "🎬",
        title: "Entertainment",
        description: "Movies, Shows, Celebrities",
      },
      {
        icon: "⚽",
        title: "Sports",
        description: "Games, Players, Highlights",
      },
      {
        icon: "💻",
        title: "Tech",
        description: "Technology, Gadgets, Reviews",
      },
      { icon: "👗", title: "Fashion", description: "Style, Trends, Outfits" },
      {
        icon: "🍳",
        title: "Food",
        description: "Recipes, Cooking, Restaurants",
      },
      {
        icon: "✈️",
        title: "Travel",
        description: "Destinations, Tips, Adventures",
      },
      {
        icon: "💪",
        title: "Fitness",
        description: "Workouts, Health, Wellness",
      },
      { icon: "📰", title: "News", description: "Latest News and Updates" },
      {
        icon: "📚",
        title: "Education",
        description: "Learning, Tutorials, Courses",
      },
      { icon: "🎭", title: "Movies", description: "Films, Reviews, Trailers" },
      { icon: "💄", title: "Beauty", description: "Makeup, Skincare, Tips" },
      {
        icon: "🎤",
        title: "Songs",
        description: "Latest hits and music videos",
      },
      {
        icon: "😂",
        title: "Memes",
        description: "Funny content and viral memes",
      },
    ];
    setCategories(errorFallback);
  }
  setLoading(false);
};

export default fetchAvailableCategories;
