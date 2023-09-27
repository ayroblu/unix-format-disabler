import { Match } from ".";

export async function eslintDisableAction(results: Match[]) {
  for (const { filepath, lineNumber, message } of results) {
    const file = await Bun.file(filepath).text();
    const updatedFile = file.split("\n");
    const line = updatedFile[lineNumber - 1];
    const textToInsert = getTextToInsert({ message, line });
    if (textToInsert) {
      updatedFile.splice(lineNumber - 1, 0, textToInsert);
    }
    await Bun.write(filepath, updatedFile.join("\n"));
  }
}

function getTextToInsert({ message, line }: { message: string; line: string }) {
  const errorMatch = /\[Error\/(?<eslintRule>.+)]$/.exec(message);
  const whitespaceMatch = /^(?<whitespace>\s*)[^\s]/.exec(line);
  if (errorMatch?.groups && whitespaceMatch?.groups) {
    const { eslintRule } = errorMatch.groups;
    const { whitespace } = whitespaceMatch.groups;
    return `${whitespace}// ${customMessage}
${whitespace}// eslint-disable-next-line ${eslintRule}`;
  }
}
const customMessage =
  "Disabled due to fixing bad eslint setup. Please fix this if you're touching this file";
