# react-native-font-icon

Generate icon fonts (TTF) from SVG files for React Native, then render icons as plain `<Text>` instead of runtime SVG. This is typically **much faster** than `react-native-svg` for large icon grids/lists.

## Table of contents

- [What this library does](#what-this-library-does)
- [Installation](#installation)
- [CLI — generate fonts from SVGs](#cli--generate-fonts-from-svgs)
  - [generate:monochrome](#generatemonochrome)
  - [generate:monochrome + sanitize](#generatemonochrome--sanitize-experimental)
  - [generate:colors](#generatecolors-experimental)
  - [CLI options reference](#cli-options-reference)
- [Add fonts to your React Native app](#add-fonts-to-your-react-native-app)
- [Runtime API — render icons in your app](#runtime-api--render-icons-in-your-app)
  - [IconProvider](#iconprovider)
  - [Icon](#icon)
  - [useGetAllIcons](#usegetallicons)
  - [useFontIconContext](#usefonticoncontext)
- [Benchmarks](#benchmarks)
- [Limitations & compatibility](#limitations--compatibility)
- [Roadmap / TODO](#roadmap--todo)
- [Credits](#credits)
- [Contributing](#contributing)
- [License](#license)

---

## What this library does

This project focuses on **SVG → font** generation and a small runtime API to render the result. It is **not** aiming to support every possible SVG feature.

> **Blog post:** [I Built an Icon Font Library for React Native — Here's What I Learned](https://medium.com/@demir.h.sefa/i-built-an-icon-font-library-for-react-native-heres-what-i-learned-3e20a0e7cfcd) — motivation, approach, and real-world benchmark results.

| Icon type | Status | CLI command |
|---|---|---|
| **Monochrome (filled/solid SVG)** | Supported (recommended) | `generate:monochrome` |
| **Stroke/outline SVG → monochrome** | Experimental (requires Inkscape) | `generate:monochrome --sanitize` |
| **Colorful SVG → color font** | Experimental (requires Python + nanoemoji) | `generate:colors` |

---

## Installation

```sh
yarn add react-native-font-icon
# or
npm install react-native-font-icon
```

> **Node 22+** is required. The CLI entrypoint is a `.ts` file and relies on modern Node's TypeScript support.

---

## CLI — generate fonts from SVGs

The package ships a CLI binary named **`generate`**. You invoke it through `npx` (or `yarn`):

```sh
npx --package react-native-font-icon generate <command> [options]
```

### `generate:monochrome`

Generate a monochrome TTF font + glyph map from solid/filled SVG icons. This is the **recommended** path for most use cases.

**Alias:** `generate:font`

```sh
npx --package react-native-font-icon generate generate:monochrome \
  --src ./icons \
  --dest ./src/assets/fonts/common \
  --font-name my-icons
```

**Output files:**

| File | Description |
|---|---|
| `<dest>/<font-name>.ttf` | The generated monochrome font |
| `<dest>/<font-name>.json` | Glyph map (`{ "icon-name": <codepoint>, ... }`) |

---

### `generate:monochrome` + sanitize (experimental)

If your SVGs use **strokes** instead of fills, you can try the sanitize pipeline. It uses Inkscape to convert strokes to paths before compiling the font.

**Requires:** [Inkscape CLI](https://inkscape.org/) installed on your system.

```sh
npx --package react-native-font-icon generate generate:monochrome \
  --src ./icons \
  --dest ./src/assets/fonts/common \
  --font-name my-icons-sanitized \
  --sanitize \
  --sanitize-engine inkscape
```

You can also point to a custom Inkscape binary and enable an extra outline pass:

```sh
npx --package react-native-font-icon generate generate:monochrome \
  --src ./icons \
  --dest ./src/assets/fonts/common \
  --font-name my-icons-sanitized \
  --sanitize \
  --sanitize-engine inkscape \
  --inkscape /usr/local/bin/inkscape \
  --inkscape-outline
```

> Output quality depends heavily on the source SVGs. Best results come from simple, well-structured stroke icons.

---

### `generate:colors` (experimental)

Generate platform-specific **color fonts** (Android uses COLR, iOS uses SBIX). This produces separate TTF files per platform and a shared glyph map.

**Requires:** Python 3 + dependencies.

**Step 1 — install Python dependencies:**

```sh
python3 -m pip install -r node_modules/react-native-font-icon/python-utils/requirements.txt
```

**Step 2 — generate:**

```sh
npx --package react-native-font-icon generate generate:colors \
  --src ./color-icons \
  --dest ./src/assets/fonts/common \
  --platform-base-path ./src/assets/fonts \
  --font-name my-color-icons
```

**Output files:**

| File | Description |
|---|---|
| `<dest>/<font-name>-glyphmap.json` | Shared glyph map |
| `<platform-base-path>/ios/<font-name>.ttf` | iOS color font (SBIX) |
| `<platform-base-path>/android/<font-name>.ttf` | Android color font (COLR) |

> The color pipeline automatically skips some unsupported SVG patterns (e.g. certain `clipPath` + `gradient` combinations).

---

### CLI options reference

#### `generate:monochrome` / `generate:font`

| Option | Required | Default | Description |
|---|---|---|---|
| `--src <path>` | Yes | — | Folder containing SVG icons |
| `--dest <path>` | Yes | — | Destination folder for the `.ttf` and `.json` |
| `--font-name <name>` | No | Derived from folder name | Font family name and output file name |
| `--max <count>` | No | All icons | Limit number of icons (useful for quick tests) |
| `--sanitize` | No | `false` | Enable SVG sanitization before compilation |
| `--sanitize-engine <engine>` | No | `inkscape` | Sanitization engine (only `inkscape` is supported) |
| `--inkscape <path>` | No | Auto-detected | Custom path to Inkscape binary |
| `--inkscape-outline` | No | `false` | Run an extra outline pass after Inkscape |

#### `generate:colors`

| Option | Required | Default | Description |
|---|---|---|---|
| `--src <path>` | Yes | — | Folder containing SVG icons |
| `--dest <path>` | Yes | — | Destination folder for the glyph map |
| `--font-name <name>` | No | `color-family` | Font family name |
| `--platform-base-path <path>` | No | — | Base folder for `ios/` and `android/` TTF outputs |
| `--python <binary>` | No | `python3` | Python binary to use |
| `--max <count>` | No | All icons | Limit number of icons |

> Both commands also accept positional arguments: `generate:monochrome [src] [dest]`, but named flags are recommended for clarity.

---

## Add fonts to your React Native app

After generating the `.ttf` files, you need to make them available to the native runtime.

**Option A (recommended)** — use [`react-native-asset`](https://github.com/unimonkiez/react-native-asset):

```sh
npx react-native-asset
```

**Option B** — link fonts manually via iOS `Info.plist` / Android `assets` folder, depending on your project setup.

---

## Runtime API — render icons in your app

The library exports the following:

| Export | Type | Description |
|---|---|---|
| `IconProvider` | Component | Context provider — wraps your app and supplies font data |
| `Icon` | Component | Renders a single icon as a `<Text>` element |
| `useGetAllIcons` | Hook | Returns all icon names for a given font family |
| `useFontIconContext` | Hook | Returns the full font icon context |

### Quick start

```tsx
import React from 'react';
import { IconProvider, Icon } from 'react-native-font-icon';

// Import the generated glyph map (JSON)
import appIconsGlyphMap from './assets/fonts/common/app-icons.json';

// Define your font families
const fontData = [
  {
    family: 'app-icons',       // must match the font name used in generation
    glyphMap: appIconsGlyphMap,
  },
];

export default function App() {
  return (
    <IconProvider fontData={fontData}>
      {/* Renders the "home" icon from "app-icons" family */}
      <Icon name="home" family="app-icons" style={{ fontSize: 24 }} />
    </IconProvider>
  );
}
```

---

### `IconProvider`

Wraps your component tree and provides font data to all `Icon` components below it.

```tsx
<IconProvider fontData={fontData}>
  {children}
</IconProvider>
```

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `fontData` | `FontDataEntry[] \| Record<string, FontDataEntry>` | Yes | One or more font families with their glyph maps |
| `children` | `ReactNode` | Yes | Your app / component tree |

**`FontDataEntry` shape:**

```ts
{
  family: string;                    // Font family name (e.g. "app-icons")
  glyphMap: Record<string, number>;  // { "icon-name": codepoint }
}
```

**Behavior:**
- The **first** entry in `fontData` is used as the `fallbackFamily`. If you omit the `family` prop on `Icon`, it will use this fallback.
- `fontData` can be an array or an object keyed by family name.

**Multiple font families:**

```tsx
import monoGlyphMap from './assets/fonts/common/app-icons.json';
import colorGlyphMap from './assets/fonts/common/color-icons-glyphmap.json';

const fontData = [
  { family: 'app-icons', glyphMap: monoGlyphMap },
  { family: 'color-icons', glyphMap: colorGlyphMap },
];

<IconProvider fontData={fontData}>
  {/* app-icons is the fallback since it's first */}
  <Icon name="home" />                          {/* uses "app-icons" */}
  <Icon name="star" family="color-icons" />      {/* uses "color-icons" */}
</IconProvider>
```

---

### `Icon`

Renders a single icon. It is a wrapper around React Native's `<Text>` component, so all `TextProps` are supported (e.g. `style`, `onPress`, `testID`).

```tsx
<Icon name="home" family="app-icons" style={{ fontSize: 24, color: '#333' }} />
```

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | Yes | Icon name (must exist in the glyph map) |
| `family` | `string` | No | Font family to use. Falls back to the first entry in `fontData` |
| `style` | `TextStyle` | No | Standard React Native text styles (fontSize, color, etc.) |
| `...rest` | `TextProps` | — | Any other `TextProps` are passed through |

**Default font size:** `32`

**Error handling:**
- If `name` is not found in the glyph map, `Icon` **throws** an error.
- If no family is resolved, it renders a fallback "X" character.

---

### `useGetAllIcons`

Returns an array of all icon names for a given font family. Useful for building icon browsers or pickers.

```tsx
import { useGetAllIcons } from 'react-native-font-icon';

function IconGrid() {
  const allIcons = useGetAllIcons('app-icons');

  return (
    <FlatList
      data={allIcons}
      renderItem={({ item }) => <Icon name={item} family="app-icons" />}
    />
  );
}
```

**Signature:** `useGetAllIcons(family: string) => string[]`

- Returns all keys from the glyph map for that family.
- Returns an empty array if the family is not found.
- Memoized — only recalculates when the family or font data changes.

---

### `useFontIconContext`

Returns the full font icon context. Use this if you need direct access to font data (e.g. to build custom rendering logic).

```tsx
import { useFontIconContext } from 'react-native-font-icon';

function DebugInfo() {
  const { fontEntries, fallbackFamily, fontEntryByFamily } = useFontIconContext();

  console.log('Fallback family:', fallbackFamily);
  console.log('Registered families:', fontEntries.map(e => e.family));

  return null;
}
```

**Returns:**

| Field | Type | Description |
|---|---|---|
| `fontData` | `FontGlyphCollection` | Original font data as passed to `IconProvider` |
| `fontEntries` | `ReadonlyArray<FontDataEntry>` | Normalized array of all font entries |
| `fontEntryByFamily` | `Map<string, FontDataEntry>` | Fast lookup map keyed by family name |
| `fallbackFamily` | `string` | The default family (first entry) |

> Must be called inside an `IconProvider`. Throws if used outside of one.

---

## Benchmarks

Rendering performance measured in the example app (ScrollView grid). **Font** = this library's `<Icon>` component (renders via `<Text>`). **SVG** = same icons rendered with `react-native-svg`.

### iOS

| Type | Icons | Font (ms) | SVG (ms) | Speedup |
|---|---|---|---|---|
| Monochrome | 100 | 39.49 | 89.91 | **2.3x** |
| Monochrome | 500 | 201.82 | 460.28 | **2.3x** |
| Monochrome | 1000 | 444.93 | 914.80 | **2.1x** |
| Color | 100 | 41.40 | 238.44 | **5.8x** |
| Color | 500 | 203.41 | 1,151.28 | **5.7x** |
| Color | 1000 | 404.22 | 2,319.80 | **5.7x** |

#### Android

| Type | Icons | Font (ms) | SVG (ms) | Speedup |
|---|---|---|---|---|
| Monochrome | 100 | 79.47 | 141.85 | **1.8x** |
| Monochrome | 500 | 366.37 | 611.42 | **1.7x** |
| Monochrome | 1000 | 744.84 | 1,136.28 | **1.5x** |
| Color | 100 | 87.86 | 300.72 | **3.4x** |
| Color | 500 | 347.25 | 1,439.93 | **4.1x** |
| Color | 1000 | 708.55 | 2,733.14 | **3.9x** |

> **Summary:** The difference is most noticeable with **color icons** (up to **5.8x** on iOS, **4.1x** on Android). For monochrome icons the gap is smaller (**1.5x–2.3x**). For most apps with a moderate number of icons, `react-native-svg` works perfectly fine.

---

## Limitations & compatibility

- **Stroke-based SVGs** are not supported by default. The sanitize flow (Inkscape) is experimental.
- **Color fonts** are experimental but work on both iOS and Android.
- For best results, SVG icons should be **solid / filled** (no strokes).
- In the example app, this approach successfully transforms roughly **~95%** of icons. Failures usually come from stroke usage, unsupported SVG features, or complex path structures.
- For most use cases, [`react-native-svg`](https://github.com/software-mansion/react-native-svg) is a great choice and we recommend it. The font approach shows a noticeable improvement mainly with **color icons**; for monochrome icons the difference is small.

---

## Roadmap / TODO

- [ ] **Better solid icon sets** — find and bundle higher-quality solid/filled icon packs for the example app (current sets are for demonstration only).
- [ ] **Improved fallback mechanism** — a smarter runtime fallback that can help with color and stroke icons when font rendering fails (e.g. automatic SVG fallback per icon).
- [ ] **Better sanitization pipeline** — replace or supplement Inkscape with a lighter, more reliable stroke-to-path engine for the `--sanitize` flow.

Contributions are welcome! Feel free to [open a pull request](../../pulls) if you'd like to help with any of the above (or anything else).

---

## Credits

The example app uses the following icon packs **for demonstration purposes only** (not intended for commercial use):

- [SVG Owl — Halloween Scary Vectors](https://svgowl.com/packs/halloween-scary-vectors)
- [SVG Owl — Winter Town Filled Vectors](https://svgowl.com/packs/winter-town-filled-vectors)

---

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
