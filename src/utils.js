export let defaultHighlightSheet = "font-weight: 600;";
export let defaultRestSheet = "opacity: 0.9;";
export let defaultHighlightColor = "#c0392b";
export let defaultAlgorithm = "- 0 1 1 2 0.4";
export let defaultChineseGap = 5;
export let defaultChineseHighlight = 2;
export let defaultChineseAlgorithm = "5 2 0.8 2";
export let defaultChineseGapOpacity = 0.8;
export let defaultChineseHighlightIntensity = "medium";
export let defaultFloatingButtonEnabled = true;

export function bionify() {
  var forceRefresh = window.bionifyForceRefresh === true;
  delete window.bionifyForceRefresh;
  function parseAlgorithm(algorithm) {
    try {
      var res = {
        exclude: true,
        sizes: [],
        restRatio: 0.4,
      };
      let parts = algorithm.split(" ");

      if (parts[0] == "+") {
        res.exclude = false;
      }

      res.restRatio = Number(parts[parts.length - 1]);

      for (var i = 1; i < parts.length - 1; i++) {
        res.sizes.push(parts[i]);
      }
      return res;
    } catch {
      var defaultRes = {
        exclude: true,
        sizes: [1, 1, 2],
        restRatio: 0.4,
      };
      console.log("not parsed");
      console.log(defaultRes);
      return defaultRes;
    }
  }

  chrome.storage.sync.get(
    [
      "algorithm",
      "chineseGap",
      "chineseHighlight",
      "chineseAlgorithm",
      "chineseGapOpacity",
      "chineseHighlightIntensity",
    ],
    (data) => {
    var algorithm = parseAlgorithm(data.algorithm || defaultAlgorithm);
    var chineseSettings = parseChineseSettings(data.chineseAlgorithm, data);
    var chineseRule = [chineseSettings.gap, chineseSettings.highlight];

    function createStylesheet() {
      chrome.storage.sync.get(
        [
          "highlightSheet",
          "restSheet",
          "highlightColor",
          "highlightColorEnabled",
          "chineseGapOpacity",
          "chineseHighlightIntensity",
        ],
        function (data) {
        var style = document.createElement("style");
        style.type = "text/css";
        style.id = "bionify-style-id";
        style.innerHTML =
          ".bionify-highlight {" +
          data.highlightSheet +
          (data.highlightColorEnabled
            ? " color: " + (data.highlightColor || defaultHighlightColor) + ";"
            : "") +
          " } .bionify-rest {" +
          data.restSheet +
          " } .bionify-chinese-rest { opacity: " +
          chineseSettings.gapOpacity +
          "; } .bionify-chinese-highlight {" +
          (chineseSettings.intensity === 2 || chineseSettings.intensity === 3
            ? " font-weight: 600;"
            : " font-weight: normal;") +
          (chineseSettings.intensity === 3
            ? " text-decoration: underline;"
            : "") +
          "}";
        document.getElementsByTagName("head")[0].appendChild(style);
        }
      );
    }

    function deleteStyleSheet() {
      var sheet = document.getElementById("bionify-style-id");
      sheet.remove();
    }

    function hasStyleSheet() {
      return document.getElementById("bionify-style-id") != null;
    }

    let commonWords = [
      "the",
      "be",
      "to",
      "of",
      "and",
      "a",
      "an",
      "it",
      "at",
      "on",
      "he",
      "she",
      "but",
      "is",
      "my",
    ];

    function bionifyifyWord(word, wordAlgorithm) {
      function isCommon(word) {
        return commonWords.indexOf(word) != -1;
      }

      var index = word.length - 1;

      var numBold = 1;

      if (word.length <= 3 && wordAlgorithm.exclude) {
        if (isCommon(word)) return word;
      }

      if (index < wordAlgorithm.sizes.length) {
        numBold = wordAlgorithm.sizes[index];
      } else {
        numBold = Math.ceil(word.length * wordAlgorithm.restRatio);
      }

      return (
        '<bionify class="bionify-highlight">' +
        escapeHtml(word.slice(0, numBold)) +
        "</bionify>" +
        '<bionify class="bionify-rest">' +
        escapeHtml(word.slice(numBold)) +
        "</bionify>"
      );
    }

    function parseChineseSettings(value, legacyData) {
      var numbers = String(value || "")
        .trim()
        .split(/\s+/)
        .map(Number);
      if (numbers.length !== 4) {
        numbers = [
          Number(legacyData.chineseGap),
          Number(legacyData.chineseHighlight),
          Number(legacyData.chineseGapOpacity),
          legacyData.chineseHighlightIntensity === "high"
            ? 3
            : legacyData.chineseHighlightIntensity === "low"
              ? 1
              : 2,
        ];
      }
      if (
        !Number.isInteger(numbers[0]) || numbers[0] < 0 ||
        !Number.isInteger(numbers[1]) || numbers[1] <= 0 ||
        !Number.isFinite(numbers[2]) || numbers[2] < 0 || numbers[2] > 1 ||
        !Number.isInteger(numbers[3]) || numbers[3] < 1 || numbers[3] > 3
      ) {
        numbers = [defaultChineseGap, defaultChineseHighlight, defaultChineseGapOpacity, 2];
      }
      return {
        gap: numbers[0],
        highlight: numbers[1],
        gapOpacity: numbers[2],
        intensity: numbers[3],
      };
    }

    function bionifyChineseText(text, chineseRule) {
      var gapLength = chineseRule[0];
      var highlightLength = chineseRule[1];
      var result = "";
      var cycleLength = gapLength + highlightLength;
      var countedCharacters = 0;
      var currentClass = "";
      var currentText = "";

      function flush() {
        if (!currentText) return;
        result += currentClass
          ? '<bionify class="' + currentClass + '">' +
            escapeHtml(currentText) +
            "</bionify>"
          : escapeHtml(currentText);
        currentText = "";
      }

      for (var character of text) {
        if (/[^\p{L}\p{N}]/u.test(character)) {
          flush();
          result += escapeHtml(character);
          continue;
        }

        var nextClass = countedCharacters % cycleLength < gapLength
          ? "bionify-rest bionify-chinese-rest"
          : "bionify-highlight bionify-chinese-highlight";
        if (nextClass !== currentClass) flush();
        currentClass = nextClass;
        currentText += character;
        countedCharacters++;
      }

      flush();

      return result;
    }

    function bionifyifyText(text, forceShortText = false) {
      var cjkPattern = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff\uac00-\ud7af]/;
      if (!forceShortText && text.length < 10 && !cjkPattern.test(text)) {
        return text;
      }

      var cjkSegmenter =
        typeof Intl !== "undefined" && Intl.Segmenter
          ? new Intl.Segmenter("zh", { granularity: "word" })
          : null;
      var res = "";

      for (var part of text.split(/((?:[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff]|[^\p{L}\p{N}])+)/u)) {
        if (!part) continue;
        if (!cjkPattern.test(part)) {
          res += part
            .split(/(\s+)/)
            .map((word) =>
              /[A-Za-z0-9]/.test(word)
                ? bionifyifyWord(word, algorithm)
                : escapeHtml(word)
            )
            .join("");
          continue;
        }

        if (cjkSegmenter) {
          var chineseText = "";
          for (var segment of cjkSegmenter.segment(part)) {
            chineseText += segment.segment;
          }
          res += bionifyChineseText(chineseText, chineseRule);
        } else {
          res += bionifyChineseText(part, chineseRule);
        }
      }

      return res;
    }

    var entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "/": "&#x2F;",
      "`": "&#x60;",
      "=": "&#x3D;",
    };

    function escapeHtml(string) {
      return String(string).replace(/[&<>"'`=\/]/g, function (s) {
        return entityMap[s];
      });
    }

    function htmlUnescape(str) {
      return str
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#x2F/g, "/")
        .replace(/&#x3D;/g, "=")
        .replace(/&#x60;/g, "`");
    }

    function normalizeText(string) {
      var normalized = String(string);
      for (var i = 0; i < 3; i++) {
        var unescaped = htmlUnescape(normalized);
        if (unescaped === normalized) break;
        normalized = unescaped;
      }
      return normalized;
    }

    function sanitize(unsafe_str) {
      return unsafe_str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;");
      // .replace(/\'/g, "&#39;");
      // .replace(/\//g, "&#x2F;");
    }

    function bionifyifyNode(node, forceShortText = false) {
      if (
        node.tagName === "SCRIPT" ||
        node.tagName === "STYLE" ||
        node.closest?.(".bionify-control") ||
        node.nodeType === 8
      )
        return;
      if (node.childNodes == undefined || node.childNodes.length == 0) {
        if (node.textContent != undefined && node.tagName == undefined) {
          if (node.parentElement?.closest("bionify")) return;
          var newNode = document.createElement("bionify");
          newNode.innerHTML = bionifyifyText(
            normalizeText(node.textContent),
            forceShortText
          );
          if (forceShortText || node.textContent.length > 20) {
            node.replaceWith(newNode);
          }
        }
      } else {
        for (var child of node.childNodes) {
          bionifyifyNode(child, forceShortText);
        }
      }
    }

    function startContentObserver() {
      if (typeof MutationObserver === "undefined") return;

      var observer = new MutationObserver((mutations) => {
        if (window.bionifyUpdatingTranslation) return;
        window.bionifyUpdatingTranslation = true;
        observer.disconnect();
        try {
          var formattedRoots = new Set();
          var addedNodes = [];
          for (var mutation of mutations) {
            var mutationTarget = mutation.target.nodeType === 3
              ? mutation.target.parentElement
              : mutation.target;
            var formattedRoot = mutationTarget?.closest?.("bionify");
            if (formattedRoot) {
              while (formattedRoot.parentElement?.closest("bionify")) {
                formattedRoot = formattedRoot.parentElement.closest("bionify");
              }
              formattedRoots.add(formattedRoot);
            }
            for (var addedNode of mutation.addedNodes) {
              addedNodes.push(addedNode);
            }
          }

          for (var root of formattedRoots) {
            if (!root.isConnected) continue;
            var plainText = document.createTextNode(root.textContent);
            root.replaceWith(plainText);
            bionifyifyNode(plainText, true);
          }
          for (var addedNode of addedNodes) {
            if (addedNode.isConnected) bionifyifyNode(addedNode, true);
          }
        } finally {
          window.bionifyUpdatingTranslation = false;
          observer.observe(document.body, {
            childList: true,
            characterData: true,
            subtree: true,
          });
        }
      });

      observer.observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true,
      });
      window.bionifyContentObserver = observer;
    }

    function stopContentObserver() {
      if (window.bionifyContentObserver) {
        window.bionifyContentObserver.disconnect();
        delete window.bionifyContentObserver;
      }
    }

    function clearBionifyFormatting() {
      var formattedNodes = document.querySelectorAll("bionify");
      for (var formattedNode of formattedNodes) {
        formattedNode.replaceWith(document.createTextNode(formattedNode.textContent));
      }
    }

    if (forceRefresh && !hasStyleSheet()) return;

    if (hasStyleSheet() && !forceRefresh) {
      stopContentObserver();
      clearBionifyFormatting();
      deleteStyleSheet();
    } else {
      if (hasStyleSheet()) {
        stopContentObserver();
        clearBionifyFormatting();
        deleteStyleSheet();
      }
      createStylesheet();
      bionifyifyNode(document.body);
      startContentObserver();
    }
  });
}

export function patternsInclude(patterns, url) {
  for (var pattern of patterns) {
    if (url.match(pattern)) {
      return true;
    }
  }
  return false;
}
