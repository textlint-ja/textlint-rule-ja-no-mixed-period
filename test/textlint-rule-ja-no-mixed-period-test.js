import rule from "../src/textlint-rule-ja-no-mixed-period";

const TextLintTester = require("textlint-tester");
const reviewPlugin = require("textlint-plugin-review");
const tester = new TextLintTester();
tester.run(
    "Re:view + textlint-rule-ja-no-mixed-period",
    {
        plugins: [
            {
                pluginId: "review",
                plugin: reviewPlugin
            }
        ],
        rules: [
            {
                ruleId: "ja-no-mixed-period",
                rule: rule,
                options: {
                    checkFootnote: false
                }
            }
        ]
    },
    {
        valid: [
            {
                text: `//footnote[test][脚注はデフォルトで無視される]`,
                ext: ".re"
            },
            {
                text: `= はじめてのRe:VIEW

「Hello, Re:VIEW.」

== Re:VIEWとは

@<b>{Re:VIEW}は、EWBやRDあるいはWikiに似た簡易フォーマットで記述したテキストファイルを、目的に応じて各種の形式に変換するツールセットです。

平易な文法ながらも、コンピュータ関係のドキュメント作成のための多くの機能を備えており、次のような形式に変換できます。

 * テキスト（指示タグ付き）
 * LaTeX
 * HTML
 * XML

@<fn>{fuga}

現在入手手段としては次の3つがあります。

 1. Ruby gem
 2. Git
 3. Download from GitHub

ホームページは@<tt>{https://reviewml.org/}です。

//footnote[fuga][ふがー]
`,
                ext: ".re"
            }

        ],
    }
);

tester.run("textlint-rule-ja-no-mixed-period", rule, {
    valid: [
        "これは問題ないです。",
        "1行目。\n2行目。\n3行目。",
        "1行目。  \nHard Breakを入れるパターン。",
        "1行目  空白はあるけど末尾に句点はある。",
        // 例外: 感嘆符などが末尾にある場合は問題なし
        "「これはセリフ」",
        "末尾に句点はある!",
        "english only",
        // 例外のNode type
        `- 箇条書きは無視される`,
        `![画像の説明も無視される](img/img.png)`,
        `[リンクの説明も無視される](http://example.com)`,
        `[リンクリファレンスも][]`,
        `__強調表示も同じく__`,
        `> 引用も無視される`,
        {
            text: "絵文字が末尾にある。😆",
            options: {
                allowEmojiAtEnd: true
            }
        },
        {
            text: "これはOK",
            options: {
                allowPeriodMarks: ["OK"]
            }
        },
        {
            text: `次のコード:

    code block

`,
            options: {
                allowPeriodMarks: [":"]
            }
        },
        // 脚注はMarkdownでは常に無視される
        {
            text: `テストです。[^1]
            
[^1]: 脚注はデフォルトで無視される`,
            ext: ".md"
        }
    ],
    invalid: [
        // single match
        {
            text: "これは句点がありません",
            output: "これは句点がありません。",
            options: {
                forceAppendPeriod: true
            },
            errors: [
                {
                    message: `文末が"。"で終わっていません。`,
                    line: 1,
                    column: 11
                }
            ]
        },
        // multiple match in multiple lines
        {
            text: "これは句点がありません\n\nこれは句点がありません",
            output: "これは句点がありません。\n\nこれは句点がありません。",
            options: {
                forceAppendPeriod: true
            },
            errors: [
                {
                    message: `文末が"。"で終わっていません。`,
                    line: 1,
                    column: 11
                },
                {
                    message: `文末が"。"で終わっていません。`,
                    line: 3,
                    column: 11
                }
            ]
        },
        {
            text: "末尾にスペースがある。 ",
            output: "末尾にスペースがある。",
            errors: [
                {
                    message: `文末が"。"で終わっていません。末尾に不要なスペースがあります。`,
                    line: 1,
                    column: 12 // space
                }
            ]
        },
        {
            text: "末尾にスペースがある。           ",
            output: "末尾にスペースがある。",
            errors: [
                {
                    message: `文末が"。"で終わっていません。末尾に不要なスペースがあります。`,
                    line: 1,
                    column: 12 // space の開始位置
                }
            ]
        },
        // multiple hit items in a line
        {
            text: "これは句点がありません、これは句点がありません",
            output: "これは句点がありません、これは句点がありません。",
            options: {
                forceAppendPeriod: true
            },
            errors: [
                {
                    message: `文末が"。"で終わっていません。`,
                    line: 1,
                    column: 23
                }
            ]
        },
        // options
        {
            text: "これはダメ",
            output: "これはダメ.",
            options: {
                periodMark: ".",
                forceAppendPeriod: true
            },
            errors: [
                {
                    message: `文末が"."で終わっていません。`,
                    line: 1,
                    column: 5
                }
            ]
        },
        // emojis are not allowed by default
        {
            text: "絵文字が末尾にある。😆",
            errors: [
                {
                    message: `文末が"。"で終わっていません。`,
                    line: 1,
                    column: 11
                }
            ]
        }
    ]
});
