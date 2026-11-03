# news-ticker

A news ticker application

## Getting Started

### Installation

1. Clone the repository: git clone https://github.com/your-username/news-ticker.git
2. Install dependencies: npm install
3. Start the application: npm run dev

### Scripts

* dev: Start the application in development mode
* build: Build the application for production
* lint: Run ESLint on the code
* lint:fix: Fix ESLint errors
* typecheck: Run TypeScript type checking
* preview: Preview the application

### Dependencies

* React: ^18.2.0
* React-dom: ^18.2.0
* Vite: ^8.2.0
* ... (list of dependencies)

### Components

* TickerSearch: A search component for finding news articles
* WatchlistChips: A component for displaying watchlist chips
* SettingsPanel: A settings panel for configuring the application
* BriefAllPanel: A panel for displaying all briefing results
* BriefedStocks: A component for displaying briefed stock information
* ... (list of components)

### APIs

* fetchBriefing: Fetches briefing data for a given symbol
* fetchProfile: Fetches profile data for the user
* mutateWatchlist: Mutates the watchlist for the user

### Functions

* clockOf: Converts an ISO date to a human-readable time string
* load: Loads briefing data for a given symbol
* toggleWatch: Toggles a stock's watch status

### States

* symbol: The current symbol being displayed
* watchlist: The user's watchlist
* settings: The user's settings
* briefing: The briefing data for the current symbol
* loading: Whether the application is loading data
* error: Any error messages
* settingsOpen: Whether the settings panel is open
* allOpen: Whether the all panel is open
* allResults: The all results for the current symbol
* allRunning: Whether the all panel is running
* allAbort: The abort controller for the all panel