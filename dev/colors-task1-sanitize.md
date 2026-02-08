## Sanitize — tasarım notları (Task-1)

Bu doküman; sanitize’ın nasıl çalışacağı, `python-utils/` ile ilişki ve “auto-install yok” politikasını netleştirir.

---

## 1) Hedef davranış

- `sanitize: false | undefined` → sanitize yapılmaz.
- `sanitize: true` → **gömülü** `default-adapter` çalışır.
- `sanitizeAdapter path` → **şimdilik yok**.
  - Kullanıcı özelleştirmek isterse **yarn patch** ile `default-adapter`’ı değiştirir.

---

## 2) Sanitize nerede devreye girecek?

En doğru yer: `stageSvgFiles()` içinde, her SVG okunduktan sonra.

Önerilen sıra (fail-fast):

1. `readFile(svgPath)`
2. `shouldSkipSvg` (skip edilecekse sanitize’a girmeden geç)
3. `sanitize` (default-adapter)
4. `normalizeSvgContent`
5. staging’e yaz

---

## 3) Default adapter sorumluluğu

Dosya: `cli/scripts/colors/sanitize/default-adapter.ts`

### Giriş / çıkış

- Input: `svg: string`, opsiyonel `filePath` (log için)
- Output: sanitize edilmiş `svg: string`

### Yaptıkları

- Python binary seçimi: CLI paramından veya `python3/python` fallback.
- `python-utils/sanitize.py` çağırma:
  - SVG content’i stdin ile ver
  - stdout’tan sanitize edilmiş SVG’i al

### Yapmadıkları (kesin)

- **pip install çalıştırmaz**
- environment değiştirmez

---

## 4) python-utils (global, repo root)

Konum:
`/<repo>/python-utils`

Beklenen dosyalar:

- `sanitize.py`
  - stdin: svg string
  - stdout: sanitized svg string
  - exit code:
    - 0: başarı
    - !=0: hata (stderr’e açıklama)
- `requirements.txt`
  - sanitize.py’nin ihtiyaç duyduğu paketler

Opsiyonel:

- `README.md` (kurulum notları)

---

## 5) Dependency eksikse ne olacak? (auto-install yok)

İki seviyede kontrol mümkün:

### Önerilen yaklaşım (en temiz)

Dependency kontrolünü **sanitize.py** yapsın:

- Gerekli import’ları en başta dene
- Eksikse stderr’e şunu yaz:
  - “Dependencies missing”
  - “Run: python -m pip install -r python-utils/requirements.txt”
  - “If externally-managed: use venv …”
- exit code != 0 ile çık

TS tarafı:

- exit code != 0 ise hatayı yüzeye çıkarır (stderr ile).

### Alternatif yaklaşım (TS pre-check)

TS tarafı `requirements.txt`’yi parse edip import-check yapabilir; ama
paket adı ↔ import adı eşlemesi her zaman güvenilir değildir.

Bu yüzden ilk iterasyonda sanitize.py’nin kontrol etmesi daha doğru.

---

## 6) Kullanıcı override (yarn patch)

`default-adapter`’ı değiştirmek için:

1. `yarn patch <PACKAGE_NAME>`
2. patch klasöründe `cli/scripts/colors/sanitize/default-adapter.*` dosyasını düzenle
3. `yarn patch-commit -s`

Not: İleride ihtiyaç artarsa ikinci bir patch noktası olarak
`python-utils/sanitize.py` için de aynı yöntem kullanılabilir.
