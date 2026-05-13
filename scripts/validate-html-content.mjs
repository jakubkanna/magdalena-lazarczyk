import { readFile } from "node:fs/promises";
import { HtmlValidate } from "html-validate";

const htmlvalidate = new HtmlValidate({
  extends: ["html-validate:recommended"],
  rules: {
    "element-required-attributes": "off",
    "no-inline-style": "error",
  },
});

const content = JSON.parse(
  await readFile(new URL("../app/data/wordpress-site-content.json", import.meta.url)),
);

const snippets = [
  ...content.bio.paragraphs.map((html, index) => ({
    html,
    source: `bio.paragraphs[${index}]`,
  })),
  ...content.bio.exhibitionColumns.flatMap((column, columnIndex) =>
    column.items.map((html, itemIndex) => ({
      html,
      source: `bio.exhibitionColumns[${columnIndex}].items[${itemIndex}]`,
    })),
  ),
];

let hasErrors = false;

for (const snippet of snippets) {
  const report = await htmlvalidate.validateString(snippet.html, snippet.source);

  if (!report.valid) {
    hasErrors = true;
    for (const result of report.results) {
      for (const message of result.messages) {
        console.error(
          `${snippet.source}:${message.line}:${message.column} ${message.message} (${message.ruleId})`,
        );
      }
    }
  }
}

if (hasErrors) {
  process.exitCode = 1;
}
