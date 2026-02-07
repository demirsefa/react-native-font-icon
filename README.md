# react-native-font-icon

Automatically generates icon fonts (TTF) from SVGs for React Native, providing faster rendering than raw SVGs.

> [!WARNING]
> ## Icon türleri / destek durumu (ÖNEMLİ)
>
> Bu proje **her SVG ikon türünü** desteklemeyi hedeflemez. Üç ayrı senaryo vardır:
>
> ### 1) Monochrome “filled/solid” SVG → Font family (TTF) ✅ DESTEKLENİR
> - **Ana/önerilen kullanım budur.**
> - En iyi sonuç için ikonlar **stroke’suz**, tek renk (filled/solid) olmalıdır.
> - CLI: `generate:monochrome` (alias: `generate:font`)
>
> ### 2) Stroke/outline SVG → Monochrome font (normalize/sanitize) ⚠️ DENEYSEL (Inkscape / Paper)
> - Stroke’lu ikonların font’a çevrilebilmesi için SVG’ler **stroke-to-path** olacak şekilde normalize edilir.
> - Bu akış **deneyseldir**; çıktı kalitesi ikonlara/SVG yapısına göre değişebilir.
> - CLI: `generate:monochrome --sanitize [--sanitize-engine inkscape|paper]`
>   - `inkscape`: en iyi fidelity (Inkscape kurulu olmalı)
>   - `paper`: best-effort JS dönüşüm (daha kayıplı olabilir)
>
> ### 3) Colorful SVG → Color font family ⚠️ DENEYSEL (nanoemoji)
> - Renkli (multi-color) SVG’lerden color-font üretimi **deneyseldir**.
> - Bu akış `nanoemoji` ile çalışır ve platforma göre farklı hedefler üretir (örn. Android COLR, iOS SBIX).
> - CLI: `generate:colors`
>
> ### Not
> - “SVG’yi runtime’da olduğu gibi kullanmak” (standalone/inline SVG) bu projenin hedefi değildir; bu araç **SVG → font** üretimine odaklanır.

## Installation

```sh
npm install react-native-font-icon
```

## Usage

```js
import { multiply } from 'react-native-font-icon';

// ...

const result = multiply(3, 7);
```

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
