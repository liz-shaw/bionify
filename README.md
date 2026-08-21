# [Bionify - Read Faster!](https://bionify.xyz)

**LEGAL NOTICE:** To the _wonderful_ folks at Bionic Reading®, this is not a pirated version of your Bionic Reading® API, but rather a simple algorithm I developed in conjunction with other open source developers. It does NOT violate your precious Bionic Reading® copyrights.

[![banner](src/icons/marquee.png)](https://chrome.google.com/webstore/detail/bionify-read-faster-with/gomhfpbcjfidhpffhecghfdieincgncc)

A simple chrome extension designed to help you read faster and more efficiently.

Chinese, Japanese, and Korean text is supported. CJK text is segmented with the browser's built-in `Intl.Segmenter` when available, with a character-by-character fallback for older browsers.

The extension includes an optional draggable floating `B` button, separate Chinese settings, configurable highlight color and intensity, and snapshots for saving favorite reading modes. The default Chinese setting is `5 2 0.8 2`.

Here's an example of Bionified text to demonstrate the speed!

[![read](read.png)](https://bionify.xyz)

(example text from jiffy reader)

## Features

- Chinese text uses a separate rule from English text and is processed in a continuous character pattern.
- Chinese settings use the format `Gap Highlight GapOpacity Intensity`. For example, `5 2 0.8 2` leaves five Chinese characters unhighlighted, highlights the next two, applies `0.8` opacity to gap text, and uses intensity `2` for bold highlighting.
- Chinese punctuation and whitespace remain in place but do not count toward Gap or Highlight.
- Highlight color can be enabled or disabled independently and saved in snapshots.
- Snapshots save and restore the reading mode, including English and Chinese rules, styles, color value, and color-enabled state.
- An optional draggable floating `B` button can appear automatically on supported pages. It shows gray when the current page is not rendered and green when Bionify is active.
- Dynamically inserted or replaced text, including text updated by translation extensions such as Immersive Translate, is observed and reprocessed.

### Using Chinese Settings

Enter four space-separated values in the `Chinese Settings` field:

```text
Gap Highlight GapOpacity Intensity
```

Intensity values are `1` for normal text, `2` for bold text, and `3` for bold underlined text. The floating button can be enabled or disabled with `Show floating button` in the popup.

## Download

Bionify is available on the Chrome web store!

Get it here: https://chrome.google.com/webstore/detail/bionify-read-faster-with/gomhfpbcjfidhpffhecghfdieincgncc

Official website: https://bionify.xyz

## Development

First, clone the repository

```
git clone https://github.com/cveinnt/bionify.git
```

Then, follow [this instruction](https://developer.chrome.com/docs/extensions/mv3/getstarted/#unpacked) to develop unpacked extensions in Chrome.

## Algorithm Specification

We allow you to customize highlight algorithm using a string similar to this:

```
- 0 1 1 2 0.4
```

Note that all numbers and characters are separated by a space. Here is what this string means:

English text uses the `Highlight Algorithm` setting in the popup. Chinese text uses one `Chinese Settings` input with the format `Gap Highlight GapOpacity Intensity`, for example `6 2 0.9 3`. Intensity `1` is normal, `2` is bold, and `3` is bold with underline.

```
- 0 1 1 2 0.4
^
```

The first character can be either `-` or `+`. If it is `-`, we don't highlight common english words (for example 'a', 'and', etc.) if it is '+' we highlight all words.

```
- 0 1 1 2 0.4
  ^
```

This specifies the number of highlighted characters for words with length 1. For example 'a' and 'I'. Here we have specified that we don't want to highlight these characters.

```
- 0 1 1 2 0.4
    ^
```

This specifies the number of highlighted characters for words with length 2. For example 'an' and 'or'. Here we have specified that we highlight the first character of these words.

```
- 0 1 1 2 0.4
      ^
```

Highlight the first character of 3 letter words.

```
- 0 1 1 2 0.4
        ^
```

Highlight the first two character of 4 letter words.

```
- 0 1 1 2 0.4
           ^
```

Unlike the previews entries, the last entry is a fractional value between 0 and 1 which specified which fraction of words that are not specified by previous rules must be highlighted.
For example, here we highlight the first 40% characters of words with 5 or more characters.

## Credit

Bionify is a published fork of [fastread](https://github.com/ahrm/chrome-fastread).
