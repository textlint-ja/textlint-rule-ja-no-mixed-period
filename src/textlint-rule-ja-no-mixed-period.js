// LICENSE : MIT
"use strict";
const RuleHelper = require("textlint-rule-helper").RuleHelper;
const exceptionMarkRegExp = /[!?！？\)）」 』]/;
const defaultPeriodMark = /[。\.]/;
const defaultOptions = {
    // 優先する句点文字
    periodMark: "。"
};
const reporter = (context, options = {}) => {
    const {Syntax, RuleError, report, fixer, getSource} = context;
    const helper = new RuleHelper(context);
    const periodMark = options.periodMark || defaultOptions.periodMark;
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
            const lastIndex = lastStrText.length - 1;
            const lastChar = lastStrText[lastIndex];
            if (lastChar === undefined) {
                return;
            }
            // 例外: 感嘆符
            // 例外: 「」 () （）『』
            // http://ncode.syosetu.com/n8977bb/12/
            // https://ja.wikipedia.org/wiki/%E7%B5%82%E6%AD%A2%E7%AC%A6
            if (exceptionMarkRegExp.test(lastChar)) {
                return;
            }
            if (lastChar === periodMark) {
                return;
            }

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