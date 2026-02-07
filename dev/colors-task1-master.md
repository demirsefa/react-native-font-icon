## Amaç

Bu doküman paketi; `src/scripts/generate-colors/index.js` içindeki renkli font üretim akışını **CLI tarafına** taşıma, modüllere bölme ve **sanitize + python-utils** kararlarını toplar.

> Not: Bu aşamada `src/scripts/*` dosyalarına **dokunmuyoruz** (sadece okuyoruz). Değişiklikler `cli/` ve repo root seviyesindeki `python-utils/` ile sınırlı olacak.

---

## Konuşmadan çıkan kesin kararlar

- **CLI çalıştırma şekli**: CLI “build edilmeden”, başka bir TS süreç tarafından çağrılıyor (TS runtime var).
- **CLI module sistemi**: `cli/package.json` içinde `"type": "module"` var → CLI tarafında ESM varsay.
- **Sanitize adapter**:
  - `sanitizeAdapter path` fikrinden **vazgeçildi**.
  - Şimdilik **gömülü tek bir** `default-adapter` olacak.
  - Kullanıcı override isterse **yarn patch** ile `default-adapter`’ı değiştirir.
- **Python yönetimi / auto-install**:
  - Default adapter **pip install çalıştırmayacak**.
  - Dependency eksikse **fail + net kurulum komutu** yazdıracak.
- **`python-utils` konumu**: Repo root’ta global klasör: `/<repo>/python-utils`.
- **Sanitize entegrasyon noktası**: `stageSvgFiles()` içinde:
  1. `readFile`
  2. `shouldSkipSvg` (erken eleme)
  3. sanitize (default-adapter)
  4. `normalizeSvgContent`
  5. staging’e yaz

---

## Önerilen hedef dosya yapısı (SRP + az dosya)

Amaç, “abartmadan” dağıtmak: yaklaşık 5–7 dosya.

```
cli/scripts/colors/
  index.ts                # runColors() + generateColorFonts orchestrator
  svg.ts                  # collectSvgFiles, shouldSkipSvg, normalizeSvgContent, stageSvgFiles
  config.ts               # buildConfigContent, createConfigFiles
  build.ts                # spawnWithLogs, runBuild
  output.ts               # copyOutputFonts, writeGlyphMetadata, cleanup
  sanitize/
    default-adapter.ts    # gömülü sanitize; python-utils/sanitize.py çağırır

python-utils/             # repo root (global)
  sanitize.py
  requirements.txt
  README.md (opsiyonel, kurulum notları)
```

> Alternatif: sanitize ile ilgili TS helper’lar `python-utils/node/*` altına da taşınabilir; ama ilk iterasyonda `default-adapter.ts` içinde tutmak daha hızlı.

---

## CLI API hedefi (öneri)

`cli/index.ts` şimdilik `runColors()` çağırıyor. Hedefte `runColors()` şunları yapacak:

- `src` ve `dest` path çözümü + doğrulama
- `generateColorFonts()` çağrısı (asıl iş)

Önerilen parametreler:

- `src` / `dest`
- `colorFonts` (googlefonts/color-fonts repo path)
- `python` (python binary override)
- `fontName`
- `sanitize?: boolean` (default false)

---

## Sanitize politikası (özet)

- `sanitize: true` ise `default-adapter` devreye girer.
- Default adapter:
  - `python-utils/sanitize.py`’yi çalıştırır (stdin → stdout).
  - Exit code != 0 ise: stderr’yi gösterir ve işlemi durdurur.
  - Dependency eksikse (python script import hatası):
    - Kullanıcıya şunu söyler:
      - `python -m pip install -r python-utils/requirements.txt`
      - gerekirse venv adımları
- **Auto-install yok**: `pip install` kesinlikle CLI tarafından koşturulmaz.

Detaylar için: `dev/colors-task1-sanitize.md`

---

## Yarn patch ile override (dokümana eklenecek metin)

Kullanıcı, sanitize davranışını değiştirmek isterse paket içindeki `default-adapter`’ı patch’ler:

1. Patch başlat:

- `yarn patch <PACKAGE_NAME>`

2. Açılan geçici klasörde `cli/scripts/colors/sanitize/default-adapter.*` dosyasını düzenle.

3. Patch’i kaydet:

- `yarn patch-commit -s`

Notlar:

- Bu yöntem `node_modules`’e kalıcı el ile müdahale etmeden override sağlar.
- Patch dosyaları repo’ya commit edilebilir.

---

## Task listesi

Bu liste “yapılacakları” parçalara ayırır. Task-1 doküman üretimidir.

- [x] **Task 1**: Doküman paketini oluştur (`dev/colors-task1-*.md`)
- [ ] **Task 2**: `src/scripts/generate-colors/index.js` → semantik modül haritasını netleştir (dosya sınırları + import/export taslağı)
- [ ] **Task 3**: `cli/scripts/colors` içinde yeni modül dosyalarını oluştur (TS) ve `runColors()`’u gerçek üretime bağla
- [ ] **Task 4**: `python-utils/` klasörünü ekle (sanitize.py + requirements + hata mesaj standardı)
- [ ] **Task 5**: Sanitize akışını `stageSvgFiles()` içine ekle (skip → sanitize → normalize sırası)
- [ ] **Task 6**: CLI command help + örnek kullanım + hata senaryoları (doc + örnek komutlar)
