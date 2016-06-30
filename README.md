# textlint-rule-ja-no-mixed-period

文末の句点(。)の統一 OR 抜けをチェックするtextlintルール

```
OK: これは問題ない文章です。
NG: これは問題ある文章です
```
パラグラフの末尾に必ず句点記号を付けていることをチェックするルールです。


## Install

Install with [npm](https://www.npmjs.com/):

    npm install textlint-rule-ja-no-mixed-period

## Usage

Via `.textlintrc`(Recommended)

```json
{
    "rules": {
        "ja-no-mixed-period": true
    }
}
```

Via CLI

```
textlint --rule ja-no-mixed-period README.md
```

## Options

- `periodMark`(string):
    - 文末に使用する句点文字
    - デフォルト: "。"

```json
{
    "rules": {
        "ja-no-mixed-period": {
            "periodMark": "。"
        }
    }
}
```

## 参考情報

- [句点 - Wikipedia](https://ja.wikipedia.org/wiki/%E5%8F%A5%E7%82%B9 "句点 - Wikipedia")
- [小説家になろう Hint&Tips - 区切り符号について](http://ncode.syosetu.com/n8977bb/12/ "小説家になろう Hint&amp;Tips - 区切り符号について")

末尾に`。`がない場合でも、代わりに感嘆符や疑問符、括弧などがある場合は例外として扱います。

> これは問題ない文章ですか！？
> 「会話文は括弧で括れば末尾に。がなくても問題ありません」

## Changelog

See [Releases page](https://github.com/azu/textlint-rule-ja-no-mixed-period/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm i -d && npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/azu/textlint-rule-ja-no-mixed-period/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
