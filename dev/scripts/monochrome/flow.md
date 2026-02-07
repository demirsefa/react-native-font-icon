## Monochrome script flow (CLI)

Bu doküman, `generate:monochrome` komutunun **hangi fonksiyonları hangi sırayla çağırdığını** ve nasıl çalıştığını anlatır.

### Entry (CLI komutu)
- Dosya: `cli/index.ts`
- Komut: `generate:monochrome` (alias: `generate:font`)
- Parametreler:
  - **`src`**: SVG klasörü
  - **`dest`**: output klasörü (TTF + glyphmap json)
  - **`--font-name`**: opsiyonel font adı (verilmezse klasör isminden türetilir)
  - **`--sanitize`**: **EXPERIMENTAL**: SVG'leri compile öncesi sanitize eder (staging klasörüne yazar)
  - **`--sanitize-engine`**: **EXPERIMENTAL**: `inkscape` (en iyi fidelity, inkscape gerekir) veya `paper` (JS best-effort)
  - **`--inkscape`**: **EXPERIMENTAL**: inkscape binary path override (`INKSCAPE_PATH` env de desteklenir)

CLI, komut çalışınca şurayı çağırır:
- `runMonochrome(params)` → `cli/scripts/monochrome/index.ts`

---

## `runMonochrome()` akışı
Dosya: `cli/scripts/monochrome/index.ts`

1) **Input doğrulama**
- `src` ve `dest` zorunlu.
- Relative ise `process.cwd()` baz alınarak absolute’a çevrilir.

2) **Folder doğrulama**
- `fileExistsAndValidates(assetsFolder, outputFolder)`
  - Dosya: `cli/scripts/monochrome/validate/fileExistsAndValidates.ts`
  - Kontroller:
    - assetsFolder var mı?
    - assetsFolder içinde en az 1 `.svg` var mı?
    - outputFolder var mı? (bu implementasyonda outputFolder’un var olması beklenir)

3) **Font adını belirle**
- `createFontName(fontName, assetsFolder)` → `cli/scripts/monochrome/utils/createFontName.ts`
  - klasör adı fallback olur
  - `normalizeFontName` trim + ext kırpma yapar (`cli/scripts/monochrome/utils/normalizeFontName.ts`)

4) **Font üretimini çalıştır**
- `generateFontFamily(assetsFolder, outputFolder, resolvedFontName)`
  - Dosya: `cli/scripts/monochrome/generator/generateFontFamily.ts`

5) **Post-run metadata üret**
- paralel:
  - `getFontFamilyHash(outputFolder, resolvedFontName)`
    - Dosya: `cli/scripts/monochrome/storage/getFontFamilyHash.ts`
    - `<outputFolder>/<fontName>.json` (glyphmap) dosyasının sha256 hash’ini alır
  - `getFolderLastChangeDate(assetsFolder)`
    - Dosya: `cli/scripts/monochrome/storage/getFolderLastChangeDate.ts`
    - assets folder `mtime` → ISO string

6) **Storage yaz**
- `setStorage({ folderLastChangeDate, fontFamilyHash, fontName })`
  - Dosya: `cli/scripts/monochrome/storage/setStorage.ts`
  - Target: `cli/scripts/monochrome/storage.json`
  - Path çözümü:
    - `getStoragePath()` → `cli/scripts/monochrome/storage/storageFile.ts`

7) **Çıktı**
- `{ generated: true, fontName: resolvedFontName }`

---

## `generateFontFamily()` akışı
Dosya: `cli/scripts/monochrome/generator/generateFontFamily.ts`

1) Font adını tekrar resolve eder (aynı util).
2) SVG icon isimlerini topla:
- `getIconNames(assetsFolder)` → `cli/scripts/monochrome/svg/getIconNames.ts`
  - sadece `.svg` dosyaları
  - isimler sort edilir
  - duplicate name varsa hata

3) Codepoint mapping üret:
- `buildCodepoints(iconNames)` → `cli/scripts/monochrome/codepoints/buildCodepoints.ts`
  - başlangıç: `START_CODEPOINT = 0xF101`
  - ne yapar?
    - Icon isimlerini (örn. `home`, `settings`) alır
    - Her isme artan bir Unicode codepoint atar (0xF101, 0xF102, ...)
    - Sonuç: `{ [iconName]: codepointNumber }` map’i
  - neden gerekli?
    - `svgtofont` her ikon için hangi karakterin kullanılacağını bilmek zorunda
    - Bu map aynı zamanda glyphmap JSON’a yazılır (output’ta `<fontName>.json`)

4) `svgtofont` modülünü kullan:
- `import svgtofont from 'svgtofont'` (direkt import)

5) `svgtofont(...)` ile font üret:
- `src`: assetsFolder
- `dist`: outputFolder
- `types`: `['ttf']`
- `getIconUnicode`: her icon name için codepoint’ten `String.fromCodePoint` üretir

6) Glyphmap yaz:
- `writeGlyphMap(outputFolder, codepoints, resolvedFontName)`
  - Dosya: `cli/scripts/monochrome/generator/writeGlyphMap.ts`
  - Çıktı: `<outputFolder>/<fontName>.json`

