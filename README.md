# news-ticker

A news ticker application

## Getting Started

### Prerequisites

Before you can run the application, you need to install the prerequisite dependencies. You can do this by running the following command:
```
curl -fsSL https://ollama.com/install.sh | sh;
ollama pull qwen3:latest;
ollama pull qwen3:0.6b;

```
This command will install the necessary dependencies, including Node.js and npm.

### Installation

1. Clone the repository: `git clone git@github.com:santenova/ticker.git`
2. Install dependencies: `npm install`
3. Start the application: `npm run dev`

### Scripts

* `dev`: Start the application in development mode
* `build`: Build the application for production
* `lint`: Run ESLint on the code
* `lint:fix`: Fix ESLint errors
* `typecheck`: Run TypeScript type checking
* `preview`: Preview the application

### Dependencies

* `React`: ^18.2.0
* `React-dom`: ^18.2.0
* `Vite`: ^8.2.0
* `news-api`: ^1.0.0 (for fetching news articles)
* `stock-api`: ^2.0.0 (for fetching stock data)
* `rss2json`: ^1.1.0 (for parsing RSS feeds)


### Components

* `TickerSearch`: A search component for finding news articles
* `WatchlistChips`: A component for displaying watchlist chips
* `SettingsPanel`: A settings panel for configuring the application
* `BriefAllPanel`: A panel for displaying all briefing results
* `BriefedStocks`: A component for displaying briefed stock information

### APIs

* `fetchBriefing`: Fetches briefing data for a given symbol
* `fetchProfile`: Fetches profile data for the user
* `mutateWatchlist`: Mutates the watchlist for the user

### Functions

* `clockOf`: Converts an ISO date to a human-readable time string
* `load`: Loads briefing data for a given symbol
* `toggleWatch`: Toggles a stock's watch status

### States

* `symbol`: The current symbol being displayed
* `watchlist`: The user's watchlist
* `settings`: The user's settings
* `briefing`: The briefing data for the current symbol
* `loading`: Whether the application is loading data
* `error`: Any error messages
* `settingsOpen`: Whether the settings panel is open
* `allOpen`: Whether the all panel is open
* `allResults`: The all results for the current symbol
* `allRunning`: Whether the all panel is running
* `allAbort`: The abort controller for the all panel

### News Feed Providers

* `Yahoo Finance`: Fetches news articles from Yahoo Finance
* `Google News`: Fetches news articles from Google News
* `CNBC`: Fetches news articles from CNBC
* `TheStreet`: Fetches news articles from TheStreet
* `Reuters`: Fetches news articles from Reuters
* `Bloomberg`: Fetches news articles from Bloomberg
* `Financial Times`: Fetches news articles from Financial Times
* `WSJ`: Fetches news articles from WSJ
* `Barron’s`: Fetches news articles from Barron’s
* `IBD`: Fetches news articles from IBD
* `Benzinga`: Fetches news articles from Benzinga
* `MarketWatch`: Fetches news articles from MarketWatch
* `Investopedia`: Fetches news articles from Investopedia
* `Seeking Alpha`: Fetches news articles from Seeking Alpha
* `Stocktwits`: Fetches news articles from Stocktwits
* `Business Insider`: Fetches news articles from Business Insider
* `New York Times`: Fetches news articles from New York Times
* `AP News`: Fetches news articles from AP News

### Data Source References

* `news-api`: Fetches news articles from various sources
* `stock-api`: Fetches stock data from various sources
* `rss2json`: Parses RSS feeds from various sources



### Prompts

#### system prompt

```
You are the night-desk editor of a markets briefing app.
You read the newest headlines about one stock and write a brief a trader can scan in fifteen seconds. Plain declarative prose,
no hype, no advice, no price targets.
```
#### summarize prompt

```
Stock: ${name || symbol} (${symbol})
${priceLine}
Time now: ${new Date().toISOString()}

Newest headlines, newest first:
${headlineLines}

Write the brief. Return JSON only with this shape:
{"summary": string, "sentiment": "bullish" | "bearish" | "neutral", "sentimentScore": number, "confidence": "low" | "medium" | "high", "bullets": string[], "keyEvents": [{"type": string, "title": string, "detail": string}]}

Rules:
- summary: 2 to 4 sentences of plain prose. Say what moved the stock or the story, and what matters next. No recommendations, no price predictions, no hedging filler.
- sentiment: the tone of this news flow for the next few sessions. sentimentScore: 0 is deeply bearish, 50 is mixed, 100 is deeply bullish.
- bullets: 2 to 4 factual takeaways, max 18 words each.
- keyEvents: only material items (earnings, guidance, analyst actions, products, regulatory, M&A, executive changes). type is one of earnings, analyst, product, regulatory, corporate, macro. Skip routine price commentary. Use an empty array if nothing material.
- Use only the headlines above. Never invent facts, numbers, or headlines.;


    
```
