# Bionify Chinese Reading Edition

This repository is an independent improvement edition based on **Bionify**, an open-source Chrome extension originally created by **Vincent Wu**. The original project and its author deserve full credit:

- Original project: https://github.com/cveinnt/bionify
- Original author: Vincent Wu
- Original upstream website: https://bionify.xyz

This edition is not the official Chrome Web Store release. It adds Chinese reading support and several interface improvements while retaining the original project's core idea and license.

## Download This Edition

The Chrome Web Store link below is the original Bionify release, not this edition:

https://chrome.google.com/webstore/detail/bionify-read-faster-with/gomhfpbcjfidhpffhecghfdieincgncc

Download this edition from GitHub:

https://github.com/liz-shaw/bionify/archive/refs/heads/main.zip

Install it in Chrome:

1. Download and unzip `main.zip`.
2. Open `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the unzipped `bionify-main` folder.

After installation, click the extension's reload button whenever the code is updated. Refresh already-open webpages after reloading the extension.

## Updates

Compared with the original Bionify project, this edition adds:

- Chinese text rendering with a separate Chinese configuration.
- Chinese continuous Gap/Highlight patterns that ignore punctuation and whitespace when counting.
- Dynamic re-rendering for text inserted or replaced by translation extensions such as Immersive Translate.
- An optional floating `B` button that appears automatically on supported webpages.
- A floating button state indicator: gray means not rendered, green means Bionify is active.
- A floating button that stays attached to the right edge and can move vertically only.
- Optional highlight color with an enable/disable switch.
- Chinese highlight intensity levels: normal, bold, and bold with underline.
- Snapshots for saving, applying, and deleting favorite reading modes.
- Safer configuration migration so extension updates do not overwrite existing user settings.

## Algorithm Specification

English and Chinese use separate configuration formats.

### English Algorithm

Edit `Highlight Algorithm` in the popup. The default is:

```text
- 0 1 1 2 0.4
```

Values are separated by spaces:

- The first value is `-` or `+`. `-` skips common short English words; `+` highlights all English words.
- The next values define highlighted character counts for words of lengths 1, 2, 3, and so on.
- The final value is the fraction of longer words to highlight. In the default, `0.4` means 40% rounded up.

### Chinese Algorithm

Edit `Chinese Settings` in the popup. The default is:

```text
5 2 0.8 2
```

The four values are:

```text
Gap Highlight GapOpacity Intensity
```

- `Gap`: number of Chinese characters left unhighlighted.
- `Highlight`: number of Chinese characters highlighted after each gap.
- `GapOpacity`: opacity applied to gap text, from `0` to `1`.
- `Intensity`: `1` normal, `2` bold, `3` bold with underline.

Chinese punctuation and whitespace remain in place but do not count toward `Gap` or `Highlight`.

## Credits

This edition is based on the original work by **Vincent Wu** and the Bionify project contributors. Please refer to the upstream repository for the original project history and licensing information:

https://github.com/cveinnt/bionify
