import minimist from 'minimist';
import {readFileSync} from 'fs';
import {outputFileSync} from 'fs-extra';
function main(args: minimist.ParsedArgs) {
  const {input, output} = args;
  const zones = new Set(
    readFileSync(input, 'utf8')
      .split('\n')
      // Ignore comments
      .filter(line => !line.startsWith('#'))
      .map(line => line.split('\t')[2])
      .filter(Boolean)
  );
  outputFileSync(
    output,
    `// @generated
// prettier-ignore
export default ${JSON.stringify(Array.from(zones), undefined, 2)}`
  );
}

if (require.main === module) {
  main(minimist(process.argv));
}
