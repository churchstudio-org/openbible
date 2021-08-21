# Open Bible

Easy to use public domain Bible sources available on JSON format.

## Directories

The Bible versions are organized by their languages inside `<language-code>/` directories.

## NLP Files

Some JSON files have special prefixes like `tokens` and `clean` that are destined for natural language processing purposes.

### tokens

Each verse was tokenized using the bible-dl tool.

```sh
bible-dl tokenize bible.json en # Outputs bible.tokens.json
```

### clean

All stopwords from each verse were removed using the bible-dl tool.

```sh
bible-dl clean bible.json pt # Outputs bible.clean.json
```

## Data Collection

Each Bible was collected using open source tools created for this purpose.

> None of them provides documentation, but I'll work on this later.

### [bible-crawler](https://github.com/lucaslannes/bible-crawler)

A module to read, extract and storage bible data from websites.

### [bible-dl](https://github.com/lucaslannes/bible-dl)

A CLI to download bible from websites.

## Attributions

| Language   | Code  | Version | Name                     | Website                                    | Attribution                                           |
|------------|-------|---------|--------------------------|--------------------------------------------|-------------------------------------------------------|
| English    | en_US | KJV     | King James Version       | https://just1word.com/                     | ©2009 Just1Word, Inc. All rights reserved.            |
| Japanese   | ja_JP | KOU     | コウゴ - 屋久島          | https://just1word.com/                     | ©2009 Just1Word, Inc. All rights reserved.            |
| Korean     | ko_KR | KOR     | 한국어 성경 Korean Bible | https://just1word.com/                     | ©2009 Just1Word, Inc. All rights reserved.            |
| Portuguese | pt_BR | BLIVRE  | Bíblia Livre             | https://sites.google.com/site/biblialivre/ | Copyright © Diego Santos, Mario Sérgio, e Marco Teles |