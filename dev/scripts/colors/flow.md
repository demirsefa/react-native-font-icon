## Colors script flow (CLI)

Bu doküman, `generate:colors` komutunun **hangi fonksiyonları hangi sırayla çağırdığını** ve sistemin nasıl çalıştığını anlatır.

### Entry (CLI komutu)
- Dosya: `cli/index.ts`
- Komut: `generate:colors`
- Parametreler:
  - **`src`**: SVG klasörü
  - **`dest`**: output klasörü (üretilen fontlar + glyph metadata)
  - **`--python`**: python binary override (opsiyonel)
  - **`--font-name`**: font family adı (opsiyonel)
  - **`--sanitize`**: SVG sanitize aç/kapat (default: false)

CLI, komut çalışınca şurayı çağırır:
- `runColors(params)` → `cli/scripts/colors/index.ts`

---

## `runColors()` akışı
Dosya: `cli/scripts/colors/index.ts`

1) **Input doğrulama**
- `src` ve `dest` zorunlu.
- Relative ise `process.cwd()` baz alınarak absolute’a çevrilir.

2) **İş motorunu başlat**
- `generateColorFonts({ assetsFolder, outputFolder, pythonBinary, fontName, sanitize })`
- Dosya: `cli/scripts/colors/generateColorFonts.ts`

---

## `generateColorFonts()` akışı (orchestrator)
Dosya: `cli/scripts/colors/generateColorFonts.ts`

### 1) Ön kontroller
- `pathExists(assetsFolder)` → `cli/scripts-utils/fs/pathExists.ts`
- assets klasörü yoksa hata.

### 2) SVG discovery
- `collectSvgFiles(assetsFolder)` → `cli/scripts/colors/svg/collectSvgFiles.ts`
  - Recursive gezer, `.svg` dosyalarını listeler.
  - Çıktı: `string[]` (SVG path’leri)

### 3) Python binary çözümü
- `resolvePythonBinary(pythonBinary)` → `cli/scripts/colors/utils/resolvePythonBinary.ts`
  - explicit → `python3` → `python` şeklinde dener (`--version`).
  - Çıktı: çalışabilir python binary string’i

### 4) Temporary workdir + staging (+ optional sanitize)
- `stageSvgFiles(svgFiles, stagingDir, configDir, { sanitize, pythonBinary })`
  - Dosya: `cli/scripts/colors/svg/stageSvgFiles.ts`
  - Bu akış bir **temporary work directory** oluşturur.
  - `configDir` = `<tmp>/config`
  - `stagingDir` = `<tmp>/config/fonticon-assets`

Her SVG için döngü:
1. SVG dosyasını oku
2. `shouldSkipSvg(content)` → `cli/scripts/colors/svg/shouldSkipSvg.ts`
   - unsupported clipPath/gradient pattern tespit ederse skip eder.
3. Eğer `sanitize: true`:
   - `sanitizeSvgWithDefaultAdapter(content, { pythonBinary })`
   - Dosya: `cli/scripts/colors/sanitize/default-adapter.ts`
   - Bu adapter `python-utils/sanitize.py`’yi çalıştırır.
     - **Policy**: pip install koşturmaz; hata olursa kurulum komutu önerir.
4. `normalizeSvgContent(content)` → `cli/scripts/colors/svg/normalizeSvgContent.ts`
   - `<use href="...">` varsa `xlink:href` ve `xmlns:xlink` normalizasyonu yapar.
5. Codepoint ata (PUA: `0xE000..0xF8FF`) ve staging’e yaz:
   - dosya adı: `emoji_u<hex>.svg`

`stageSvgFiles` çıktısı:
- **`stagedRelativePaths`**: TOML config’te kullanılacak relative svg listesi
- **`glyphMappings`**: glyph metadata üretimi için mapping

### 6) TOML config üretimi
- `createConfigFiles({ configDir, outputFolder, fontName, relativeSrcs })`
  - Dosya: `cli/scripts/colors/config/createConfigFiles.ts`
  - İçeride `buildConfigContent(...)` → `cli/scripts/colors/config/buildConfigContent.ts`
  - Platform hedefleri `COLOR_TARGETS`’tan gelir:
    - Android: `glyf_colr_1`
    - iOS: `sbix`
  - Çıktı: `GeneratedConfig[]` (configPath, outputFile, label, extension)

### 7) Runner (python) çalıştırma
- `runNanoemoji(python, configDir, configs)` → `cli/scripts/colors/runner/runNanoemoji.ts`
  - `spawnWithLogs(...)` → `cli/scripts/colors/runner/spawnWithLogs.ts`
  - Komut:
    - `python -m nanoemoji.nanoemoji <config1> <config2> ...` (cwd: configDir)

### 8) Output fontların oluşması
- Bu versiyonda `output_file` TOML içinde **direkt `outputFolder` içine** yazılır.
- Yani ayrıca “kopyalama” adımı yoktur.

### 9) Glyph metadata yazımı
- `writeGlyphMetadata({ glyphMappings, outputFolder, fontName })`
  - Dosya: `cli/scripts/colors/output/writeGlyphMetadata.ts`
  - Çıktı: `<outputFolder>/<fontName>-glyphmap.json`

### 10) Cleanup (her koşulda)
- `cleanup(configs, stagingDir)` → `cli/scripts/colors/output/cleanup.ts`
  - TOML config dosyalarını siler
  - staging klasörünü siler
  - Ayrıca temporary workdir recursive silinir

---

## Sanitize & python-utils
- `python-utils/` repo root’ta bulunur:
  - `python-utils/sanitize.py`
  - `python-utils/requirements.txt`
- Default adapter `sanitize.py`’yi stdin/stdout ile çalıştırır:
  - stdin: ham SVG
  - stdout: sanitize edilmiş SVG
  - exit != 0 ise hata + “manuel install komutları” mesajı

