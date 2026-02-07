## Kaynak: `src/scripts/generate-colors/index.js` (salt-okuma)
Bu doküman; mevcut tek dosyalık implementasyondaki fonksiyonları semantik olarak açıklar ve “abartmadan” SRP uyumlu dosyalara dağıtım önerir.

---

## 1) Fonksiyonların semantik açıklaması (kısa)

### A) Dosya/Path yardımcıları
- **`pathExists(targetPath)`**
  - Bir path erişilebilir mi kontrol eder (`fs.promises.access`).
  - “Var mı?” kontrolü için kullanılır (build.py, üretilen font dosyası vb.).

- **`resolvePythonBinary(explicitBinary)`**
  - Kullanıcı `--python` verdiyse önce onu dener.
  - Sonra sırayla `python3`, `python` dener (`--version` ile).
  - Bulamazsa “Python gerekli” hatası üretir.

- **`resolveColorFontsRepoPath(explicitPath)`**
  - `googlefonts/color-fonts` repo path’ini bulmaya çalışır:
    - arg → env (`RN_FONT_ICON_COLOR_FONTS_PATH`) → `cwd/color-fonts` → `repoRoot/example/color-fonts`
  - Adayların içinde `build.py` var mı kontrol eder.

### B) SVG discovery & pre-processing
- **`collectSvgFiles(folderPath)`**
  - Verilen klasörü recursive gezer.
  - `.svg` uzantılı tüm dosyaların **absolute path** listesini döndürür.

- **`shouldSkipSvg(svgContent)`**
  - Bazı SVG’lerde `clipPath` içinde `use href="#id"` ile referans verilip,
    aynı `id`’de gradient tanımı varsa, bu set “unsupported” kabul edilip skip edilir.
  - Amaç: toolchain’in patlayacağı dosyaları erken elemek.

- **`normalizeSvgContent(svgContent)`**
  - SVG içinde `<use href="...">` varsa `xlink:href`’e normalize eder.
  - `xmlns:xlink` namespace’i eksikse `<svg ...>` tag’ine ekler.
  - Amaç: downstream tool’ların daha uyumlu parse etmesi.

### C) Staging + codepoint mapping
- **`stageSvgFiles(svgFiles, stagingDir, configDir)`**
  - `stagingDir`’i sıfırlar ve yeniden oluşturur.
  - Her SVG’yi okur:
    - `shouldSkipSvg` true ise skip
    - Private Use Area’dan (PUA) artan codepoint atar (`0xE000..0xF8FF`)
    - dosyayı `emoji_u<hex>.svg` formatında staging’e yazar
    - `glyphMappings` üretir (orijinal path, name, codepoint, staged relative path)
  - Sonuçta:
    - `stagedRelativePaths` (toml config içinde kullanılacak)
    - `glyphMappings` (metadata json için) döner.

### D) Config üretimi (TOML)
- **`buildConfigContent({ family, outputFile, colorFormat, relativeSrcs })`**
  - color-fonts build.py’nin beklediği toml içeriğini string üretir.

- **`createConfigFiles({ configDir, fontName, relativeSrcs })`**
  - Platform hedeflerine göre iki config yazar:
    - Android: `glyf_colr_1`
    - iOS: `sbix`
  - Her biri için configPath + outputFile bilgisi döndürür.

### E) Build çalıştırma
- **`spawnWithLogs(command, args, options)`**
  - `spawn` wrapper: stdio inherit, exit code kontrolü.

- **`runBuild(pythonBinary, repoPath, configs)`**
  - `python build.py <config1> <config2> ...` çalıştırır (repoPath cwd).
  - `pythonBinary` absolute ise PATH’e directory’sini ekler.

### F) Output + metadata
- **`copyOutputFonts(repoPath, outputFolder, configs, fontName)`**
  - `repoPath/fonts/<outputFile>` bekler.
  - Bulamazsa hata verir.
  - Bulursa outputFolder’a `fontName-<platform>.ttf` şeklinde kopyalar.

- **`writeGlyphMetadata({ glyphMappings, outputFolder, fontName })`**
  - `fontName-glyphmap.json` yazar:
    - name
    - codepoint (int)
    - codepointHex (`0xE001`)
    - unicode (`\uE001`)
    - originalSvg / stagedSvg path

### G) Cleanup
- **`cleanup(configs, stagingDir)`**
  - Yazdığı toml config’leri siler.
  - staging klasörünü siler.

### H) Orchestrator
- **`generateColorFonts({ assetsFolder, outputFolder, colorFontsRepoPath, pythonBinary, fontName })`**
  - input doğrular
  - svg’leri toplayıp staging’e alır
  - config yazar
  - build çalıştırır
  - output’ları kopyalar + glyphmap yazar
  - finally cleanup yapar

---

## 2) SRP dengeli dosyalara dağıtım (öneri)
“Az dosya, net sorumluluk” hedefiyle:

### `cli/scripts/colors/svg.ts`
Topla + karar ver + staging:
- `collectSvgFiles`
- `shouldSkipSvg`
- `normalizeSvgContent`
- `stageSvgFiles` (sanitize hook burada olacak)

### `cli/scripts/colors/config.ts`
- `buildConfigContent`
- `createConfigFiles`

### `cli/scripts/colors/build.ts`
- `spawnWithLogs`
- `runBuild`

### `cli/scripts/colors/output.ts`
- `copyOutputFonts`
- `writeGlyphMetadata`
- `cleanup`

### `cli/scripts/colors/index.ts`
- `generateColorFonts` orchestrator
- `runColors` (CLI param parsing/resolve + generateColorFonts çağrısı)

### `cli/scripts/colors/sanitize/default-adapter.ts`
- sanitize giriş/çıkış kontratı (string in → string out)
- `python-utils/sanitize.py` çağırma (auto-install yok)

---

## 3) Sanitize entegrasyonu için önerilen hook noktası
`stageSvgFiles` döngüsünde (her SVG için):

1. `content = readFile(svgPath)`
2. `if shouldSkipSvg(content) -> continue`
3. `if sanitize: content = await defaultSanitize(content, svgPath)`
4. `content = normalizeSvgContent(content)`
5. staging’e yaz

Detaylar için: `dev/colors-task1-sanitize.md`

