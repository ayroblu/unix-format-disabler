import { eslintDisableAction } from "./eslint-action";

const [filename] = process.argv.slice(2);
if (!filename) {
  console.error("Please enter a filename");
  process.exit(1);
}

(async () => {
  const contents = await Bun.file(filename).text();
  const results = contents
    .split("\n")
    .reduce<Match[]>((result, line) => {
      const match =
        /^(?<filepath>[^:]+):(?<line>\d+):(?<column>\d+):(?<message>.+)$/g.exec(
          line,
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
    }, [])
    .sort(sortByDesc(({ lineNumber }) => lineNumber));
  console.log("handling", results.length);
  await eslintDisableAction(results);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

function sortByDesc<T>(func: (a: T) => string | number) {
  return (a: T, b: T) => (func(a) > func(b) ? -1 : func(b) > func(a) ? 1 : 0);
}

export type Match = {
  filepath: string;
  lineNumber: number;
  columnNumber: number;
  message: string;
};