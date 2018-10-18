// LICENSE : MIT
"use strict";
const RuleHelper = require("textlint-rule-helper").RuleHelper;
const japaneseRegExp = /(?:[々〇〻\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]|[\uD840-\uD87F][\uDC00-\uDFFF]|[ぁ-んァ-ヶ])/;
/***
 * 典型的な句点のパターン
 * これは`periodMark`と交換しても違和感がないものを登録
 * @type {RegExp}
 */
const classicPeriodMarkPattern = /[。\.]/;
const checkEndsWithPeriod = require("check-ends-with-period");
const defaultOptions = {
    // 優先する句点文字
    periodMark: "。",
    // 句点文字として許可する文字列の配列
    // 例外として許可したい文字列を設定する
    // `periodMark`に指定したものは自動的に許可リストに加わる
    allowPeriodMarks: [],
    // 末尾に絵文字を置くことを許可するか
    allowEmojiAtEnd: false,
    // 句点で終わって無い場合に`periodMark`を--fix時に追加するかどうか
    // デフォルトでは自動的に追加しない
    forceAppendPeriod: false,
    // [Note] このオプションは標準外なので隠しオプション扱い
    // [Warning] このオプションはsemverの範囲外なのでいつでも壊れる可能性がある
    // 脚注はチェック対象から外すかどうか(実質Re:View向け)
    // デフォルトでは脚注構文(Re:View)は無視する
    checkFootnote: false
};
const reporter = (context, options = {}) => {
    const { Syntax, RuleError, report, fixer, getSource } = context;
    const helper = new RuleHelper(context);
    // 優先する句点記号
    const preferPeriodMark = options.periodMark || defaultOptions.periodMark;
    // 優先する句点記号は常に句点として許可される
    const allowPeriodMarks = (options.allowPeriodMarks || defaultOptions.allowPeriodMarks).concat(preferPeriodMark);
    const allowEmojiAtEnd =
        options.allowEmojiAtEnd !== undefined ? options.allowEmojiAtEnd : defaultOptions.allowEmojiAtEnd;
    const forceAppendPeriod =
        options.forceAppendPeriod !== undefined ? options.forceAppendPeriod : defaultOptions.forceAppendPeriod;
    // [Note] Un-document option
    const checkFootnote = options.checkFootnote !== undefined ? options.checkFootnote : defaultOptions.checkFootnote;
    // 脚注のNode Typeを定義(TxtASTの定義外)
    const FootnoteNodes = [
        // https://github.com/orangain/textlint-plugin-review
        "Footnote",
        // https://github.com/textlint/textlint/blob/master/packages/%40textlint/markdown-to-ast/src/mapping/markdown-syntax-map.js
        // 実際にはmarkdown-to-astではこれはParagraphを含まないInlineNodeなのであまり意味はない
        "Definition"
    ];
    const ignoredNodeTypes = [
        Syntax.ListItem,
        Syntax.Link,
        Syntax.Code,
        Syntax.Image,
        Syntax.BlockQuote,
        Syntax.Emphasis
    ].concat(checkFootnote ? [] : FootnoteNodes);
    return {
        [Syntax.Paragraph](node) {
            if (helper.isChildNode(node, ignoredNodeTypes)) {
                return;
            }
            const lastNode = node.children[node.children.length - 1];
            if (lastNode === undefined || lastNode.type !== Syntax.Str) {
                return;
            }
            const lastStrText = getSource(lastNode);
            if (lastStrText.length === 0) {
                return;
            }
            // 日本語が含まれていない文章は無視する
            if (!japaneseRegExp.test(lastStrText)) {
                return;
            }
            const { valid, periodMark, index } = checkEndsWithPeriod(lastStrText, {
                periodMarks: allowPeriodMarks,
                allowEmoji: allowEmojiAtEnd
            });
            // 問題が無い場合は何もしない
            if (valid) {
                return;
            }
            // 文末がスペースである場合はスペースを削除する
            if (/\s/.test(periodMark)) {
                report(
                    lastNode,
                    new RuleError(`文末が"${preferPeriodMark}"で終わっていません。末尾に不要なスペースがあります。`, {
                        index,
                        fix: fixer.replaceTextRange([index, index + periodMark.length], "")
                    })
                );
                return;
            }
            // 典型的なパターンは自動的に`preferPeriodMark`に置き換える
            // 例) "." であるなら "。"に変換
            if (classicPeriodMarkPattern.test(periodMark)) {
                report(
                    lastNode,
                    new RuleError(`文末が"${preferPeriodMark}"で終わっていません。`, {
                        index: index,
                        fix: fixer.replaceTextRange([index, index + preferPeriodMark.length], preferPeriodMark)
                    })
                );
            } else {
                // 句点を忘れているパターン
                if (forceAppendPeriod) {
                    // `forceAppendPeriod`のオプションがtrueならば、自動で句点を追加する。
                    report(
                        lastNode,
                        new RuleError(`文末が"${preferPeriodMark}"で終わっていません。`, {
                            index: index,
                            fix: fixer.replaceTextRange([index + 1, index + 1], preferPeriodMark)
                        })
                    );
                } else {
                    report(
                        lastNode,
                        new RuleError(`文末が"${preferPeriodMark}"で終わっていません。`, {
                            index: index
                        })
                    );
                }
            }
        }
    };
};

module.exports = {
    linter: reporter,
    fixer: reporter
};
