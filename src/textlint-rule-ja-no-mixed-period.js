// LICENSE : MIT
"use strict";
const RuleHelper = require("textlint-rule-helper").RuleHelper;
const emojiRegExp = require("emoji-regex")();
const japaneseRegExp = /(?:[々〇〻\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]|[\uD840-\uD87F][\uDC00-\uDFFF]|[ぁ-んァ-ヶ])/;
const exceptionMarkRegExp = /[!?！？\)）」』]/;
const defaultPeriodMark = /[。\.]/;
const defaultOptions = {
    // 優先する句点文字
    periodMark: "。",
    // 末尾に絵文字を置くことを許可するか
    allowEmojiAtEnd: false
};
const reporter = (context, options = {}) => {
    const {Syntax, RuleError, report, fixer, getSource} = context;
    const helper = new RuleHelper(context);
    const periodMark = options.periodMark || defaultOptions.periodMark;
    const allowEmojiAtEnd = options.allowEmojiAtEnd !== undefined ? options.allowEmojiAtEnd : defaultOptions.allowEmojiAtEnd;
    const ignoredNodeTypes = [Syntax.ListItem, Syntax.Link, Syntax.Code, Syntax.Image, Syntax.BlockQuote, Syntax.Emphasis];
    return {
        [Syntax.Paragraph](node){
            if (helper.isChildNode(node, ignoredNodeTypes)) {
                return;
            }
            const lastNode = node.children[node.children.length - 1];
            if (lastNode === undefined || lastNode.type !== Syntax.Str) {
                return;
            }
            const lastStrText = getSource(lastNode);
            // 日本語が含まれていない文章は無視する
            if (!japaneseRegExp.test(lastStrText)) {
                return;
            }
            // サロゲートペアを考慮した文字列長・文字アクセス
            const characters = [...lastStrText];
            const lastIndex = characters.length - 1;
            const lastChar = characters[lastIndex];
            if (lastChar === undefined) {
                return;
            }
            // 文末がスペースである場合
            // TODO: fixに対応したい
            if (/\s/.test(lastChar)) {
                report(lastNode, new RuleError(`文末が"${periodMark}"で終わっていません。末尾に不要なスペースがあります。`, {
                    index: lastIndex
                }));
                return
            }
            // 末尾の"文字"が句点以外で末尾に使われる文字であるときは無視する
            // 例外: 感嘆符
            // 例外: 「」 () （）『』
            // http://ncode.syosetu.com/n8977bb/12/
            // https://ja.wikipedia.org/wiki/%E7%B5%82%E6%AD%A2%E7%AC%A6
            if (exceptionMarkRegExp.test(lastChar)) {
                return;
            }
            if (allowEmojiAtEnd && emojiRegExp.test(lastChar)) {
                return;
            }
            if (lastChar === periodMark) {
                return;
            }
            // "." であるなら "。"に変換
            // そうでない場合は末尾に"。"を追加する
            let fix = null;
            if (defaultPeriodMark.test(lastChar)) {
                fix = fixer.replaceTextRange([lastIndex, lastIndex + 1], periodMark);
            } else {
                fix = fixer.replaceTextRange([lastIndex + 1, lastIndex + 1], periodMark);
            }
            report(lastNode, new RuleError(`文末が"${periodMark}"で終わっていません。`, {
                index: lastIndex,
                fix
            }));

        }
    }
};

module.exports = {
    linter: reporter,
    fixer: reporter
};
