import { eslintDisableAction } from "./eslint-action";

const [filename] = process.argv.slice(2);
if (!filename) {
  console.error("Please enter a filename");
  process.exit();
}

(async () => {
  const contents = await Bun.file(filename).text();
  const results = contents.split("\n").reduce<Match[]>((result, line) => {
    const match = line.match(
      /^(?<filepath>[^:]+):(?<line>\d+):(?<column>\d+):(?<message>.+)$/g,
    );
    if (match && match.groups) {
      const { filepath, line, column, message } = match.groups;
      result.push({
        filepath,
        lineNumber: parseInt(line, 10),
        columnNumber: parseInt(column, 10),
        message,
      });
    }
    return result;
  }, []);
  await eslintDisableAction(results);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

export type Match = {
  filepath: string;
  lineNumber: number;
  columnNumber: number;
  message: string;
};