(() => {
  const $ = (sel) => document.querySelector(sel);

  const bg = $("#mq-bg");
  const quoteText = $("#mq-quote-text");
  const quoteAuthor = $("#mq-quote-author");
  const statusBadge = $("#mq-status");
  const statusText = $("#mq-status-text");
  const btnNew = $("#mq-new");
  const btnCopy = $("#mq-copy");
  const btnShare = $("#mq-share");
  const quoteWrapper = $("#mq-quote-wrapper");

  const CACHE_KEY = "dp_motivation_quotes_cache_v1";
  const cache = new Set(JSON.parse(localStorage.getItem(CACHE_KEY) || "[]"));

  const fallbackImages = [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=70",
    "https://images.unsplash.com/photo-1500534314211-0a24cd03f2c0?auto=format&fit=crop&w=2000&q=70",
    "https://images.unsplash.com/photo-1500534317648-0004f78c57ec?auto=format&fit=crop&w=2000&q=70",
    "https://images.unsplash.com/photo-1500534314211-0a24cd03f2c0?auto=format&fit=crop&w=2000&q=70",
  ];

  const fallbackQuotes = [
    {
      content: "Small, consistent improvements every day compound into extraordinary results.",
      author: "Deepak Panwar",
    },
    {
      content: "You don’t rise to the level of your goals; you fall to the level of your systems.",
      author: "James Clear",
    },
    {
      content: "Done is better than perfect when perfect is never done.",
      author: "Sheryl Sandberg",
    },
    {
      content: "Discipline is choosing between what you want now and what you want most.",
      author: "Abraham Lincoln",
    },
    {
      content: "Every great product started as an uncomfortable first commit.",
      author: "Unknown",
    },
  ];

  function setStatus(label, loading) {
    if (statusText) statusText.textContent = label;
    if (btnNew) btnNew.disabled = loading;
    if (btnCopy) btnCopy.disabled = loading;
  }

  function keyForQuote(q) {
    return `${q.content}__${q.author || ""}`.slice(0, 2000);
  }

  function persistCache() {
    localStorage.setItem(CACHE_KEY, JSON.stringify(Array.from(cache).slice(-80)));
  }

  async function fetchUnsplashUrl() {
    try {
      const res = await fetch("/.netlify/functions/unsplash-random");
      if (!res.ok) throw new Error("Unsplash function error");
      const data = await res.json();
      return data?.urls?.regular || data?.urls?.full;
    } catch {
      const rnd = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
      return rnd;
    }
  }

  async function fetchQuoteFromApi() {
    const res = await fetch(
      "https://api.quotable.io/random?tags=motivational|inspirational|success"
    );
    if (!res.ok) throw new Error("Quote API error");
    const data = await res.json();
    return { content: data.content, author: data.author || "Unknown" };
  }

  function quoteFromFallback() {
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  }

  async function getQuote() {
    for (let i = 0; i < 5; i++) {
      let q;
      try {
        q = await fetchQuoteFromApi();
      } catch {
        q = quoteFromFallback();
      }
      const key = keyForQuote(q);
      if (!cache.has(key) || cache.size < 5) {
        cache.add(key);
        persistCache();
        return q;
      }
    }
    return quoteFromFallback();
  }

  function updateShareLink(q) {
    if (!btnShare) return;
    const text = `"${q.content}" — ${q.author || "Unknown"}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    btnShare.href = url;
  }

  async function refresh() {
    if (!quoteWrapper) return;
    try {
      setStatus("Loading…", true);
      quoteWrapper.classList.add("opacity-0", "translate-y-1");

      const [img, q] = await Promise.all([fetchUnsplashUrl(), getQuote()]);

      if (bg && img) {
        bg.style.backgroundImage = `url("${img}")`;
      }

      if (quoteText) quoteText.textContent = q.content;
      if (quoteAuthor) quoteAuthor.textContent = q.author ? `— ${q.author}` : "—";

      updateShareLink(q);

      window.setTimeout(() => {
        quoteWrapper.classList.remove("translate-y-1");
        quoteWrapper.classList.add("opacity-100");
      }, 80);

      setStatus("Ready", false);
    } catch (err) {
      if (quoteText)
        quoteText.textContent =
          "Could not fetch a new quote right now. Please check your connection and try again.";
      if (quoteAuthor) quoteAuthor.textContent = "—";
      if (statusText) statusText.textContent = "Offline fallback";
      if (btnNew) btnNew.disabled = false;
      if (btnCopy) btnCopy.disabled = false;
      quoteWrapper.classList.add("opacity-100");
    }
  }

  async function copyCurrentQuote() {
    if (!btnCopy || !quoteText) return;
    const text = `${quoteText.textContent || ""} ${quoteAuthor?.textContent || ""}`.trim();
    try {
      await navigator.clipboard.writeText(text);
      const original = btnCopy.textContent;
      btnCopy.textContent = "Copied!";
      window.setTimeout(() => {
        btnCopy.textContent = original;
      }, 1200);
    } catch {
      const original = btnCopy.textContent;
      btnCopy.textContent = "Copy failed";
      window.setTimeout(() => {
        btnCopy.textContent = original;
      }, 1200);
    }
  }

  btnNew?.addEventListener("click", refresh);
  btnCopy?.addEventListener("click", copyCurrentQuote);

  // Initial load
  refresh();
})();

