# Angular SSR Pokemon Application

A modern Angular Server-Side Rendering (SSR) application that displays detailed Pokemon information using the PokeAPI, styled with Tailwind CSS.

## Features

- **Server-Side Rendering (SSR)** - Full Angular SSR implementation for better SEO and initial page load performance
- **Pokemon Detail View** - Display comprehensive Pokemon information including:
  - Basic stats (height, weight, base experience)
  - Type information with visual indicators
  - Base stats with progress bars
  - Abilities list with hidden ability indicators
  - Pokemon artwork and sprites
  - Evolution chain data (on-demand loading)
- **About Page** - Information page demonstrating SSR capabilities
- **Tailwind CSS** - Modern utility-first CSS framework for styling
- **Responsive Design** - Mobile-friendly layout with Tailwind's responsive utilities
- **Angular Signals** - Latest Angular state management with signals API
- **Error Handling** - Graceful error handling for API failures and edge cases

## Project Structure

```
src/
├── app/
│   ├── pages/
│   │   ├── about/
│   │   │   ├── about.component.html
│   │   │   ├── about.component.scss
│   │   │   └── about.component.ts
│   │   └── pokemonDetail/
│   │       ├── pokemon-detail.component.html
│   │       ├── pokemon-detail.component.scss
│   │       └── pokemon-detail.component.ts
│   ├── services/
│   │   └── pokeapi.service.ts
│   ├── app.routes.server.ts
│   ├── app.config.server.ts
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── app.html
│   ├── app.scss
│   └── app.ts
├── main.ts
├── main.server.ts
├── server.ts
├── styles.scss
└── index.html
```

## Technology Stack

- **Angular 20.1.0** - Latest Angular framework
- **Angular SSR 20.1.6** - Server-side rendering support
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **PostCSS** - CSS processing with Tailwind
- **PokeAPI (pokenode-ts)** - Pokemon data library
- **Express 5.1.0** - Server framework for SSR
- **RxJS** - Reactive programming library

## Installation

```bash
npm install
```

## Development

### Run Development Server

```bash
npm start
```

Server runs on `http://localhost:4200`

### Build for Production

```bash
npm run build
```

Output is generated in `dist/ssr-test`

### Serve SSR Production Build

```bash
npm run serve:ssr:ssr-test
```

## Key Components

### PokeApiService

Service for fetching Pokemon data from PokeAPI. Only available on the server side during SSR.

**Methods:**
- `getPokemonByName(name: string)` - Fetch Pokemon by name
- `getPokemonsList(limit, offset)` - Fetch list of Pokemon
- `getEvolutionChainById(id: number)` - Fetch evolution chain information

### PokemonDetailComponent

Displays comprehensive Pokemon information with the following features:

- **Signals for State Management:**
  - `pokemon` - Current Pokemon data
  - `loading` - Loading state
  - `error` - Error messages
  - `evolutionChain` - Evolution chain data
  - `evolutionLoading` - Evolution loading state
  - `evolutionError` - Evolution error messages

- **Methods:**
  - `ngOnInit()` - Initialize and fetch Pokemon data
  - `fetchEvolutionChain()` - Load evolution chain on demand

### AboutComponent

Simple about page demonstrating SSR routing capabilities.

## Routing

Routes are configured in `app.routes.ts`:

- `/` - Home page
- `/about` - About page (Client-side rendering)
- `/pokemondetail/:name` - Pokemon detail page (Client-side rendering)

Server-side routing configuration in `app.routes.server.ts` defines rendering modes.

## Styling

### Tailwind CSS Setup

- Configuration: `tailwind.config.js`
- PostCSS configuration: `postcss.config.js`
- Global styles: `src/styles.scss`

The application uses Tailwind's utility classes for responsive, modern styling:
- Gradient backgrounds (`from-slate-900 to-slate-800`)
- Responsive grids (`grid md:grid-cols-3`)
- Tailwind typography and spacing utilities

## Features Explained

### Pokemon Detail Page

When you navigate to `/pokemondetail/[pokemon-name]`:

1. **Loading State** - Displays loading message while fetching data
2. **Pokemon Information** - Shows name, ID, type indicators, and artwork
3. **Stats Section** - Displays base stats with visual progress bars
4. **Abilities** - Lists all abilities with hidden ability indicator
5. **Evolution Chain** - Button to fetch and display evolution data on-demand

### Evolution Chain Feature

Click "Load Evolution Chain" button to:
- Fetch the evolution chain for the current Pokemon
- Display evolution chain ID
- View full chain data in collapsible JSON format

## Error Handling

The application includes comprehensive error handling:

- **API Errors** - Displays user-friendly error messages
- **Missing Data** - Handles missing Pokemon properties gracefully
- **Evolution Chain Errors** - Specific error messages for evolution chain failures
- **Server-Side Errors** - Proper error propagation during SSR

## Performance Optimizations

- **Server-Side Rendering** - Initial page load includes pre-rendered content
- **Client-Side Rendering** - Dynamic routes use Client-side rendering to avoid build-time prerendering requirements
- **Lazy Loading** - Evolution chain data loads on demand
- **Efficient State Management** - Angular Signals for reactive state updates

## Development Server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
