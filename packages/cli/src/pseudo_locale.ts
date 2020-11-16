import {
  parse,
  MessageFormatElement,
  TYPE,
  isLiteralElement,
  isPluralElement,
  isSelectElement,
} from 'intl-messageformat-parser';

export function generateXXLS(
  msg: string | MessageFormatElement[]
): MessageFormatElement[] {
  const ast = typeof msg === 'string' ? parse(msg) : msg;
  const lastChunk = ast.pop();
  if (lastChunk && isLiteralElement(lastChunk)) {
    lastChunk.value += 'SSSSSSSSSSSSSSSSSSSSSSSSS';
    return [...ast, lastChunk];
  }
  return [...ast, {type: TYPE.literal, value: 'SSSSSSSSSSSSSSSSSSSSSSSSS'}];
}

export function generateXXAC(
  msg: string | MessageFormatElement[]
): MessageFormatElement[] {
  const ast = typeof msg === 'string' ? parse(msg) : msg;
  ast.forEach(el => {
    if (isLiteralElement(el)) {
      el.value = el.value.toUpperCase();
    } else if (isPluralElement(el) || isSelectElement(el)) {
      for (const opt of Object.values(el.options)) {
        generateXXAC(opt.value);
      }
    }
  });
  return ast;
}

export function generateXXHA(
  msg: string | MessageFormatElement[]
): MessageFormatElement[] {
  const ast = typeof msg === 'string' ? parse(msg) : msg;
  const firstChunk = ast.shift();
  if (firstChunk && isLiteralElement(firstChunk)) {
    firstChunk.value = '[javascript]' + firstChunk.value;
    return [firstChunk, ...ast];
  }
  return [{type: TYPE.literal, value: '[javascript]'}, ...ast];
}

const ASCII = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ACCENTED_ASCII = 'âḃćḋèḟĝḫíĵǩĺṁńŏṗɋŕśṭůṿẘẋẏẓḀḂḈḊḔḞḠḢḬĴḴĻḾŊÕṔɊŔṠṮŨṼẄẌŸƵ';

export function generateENXA(
  msg: string | MessageFormatElement[]
): MessageFormatElement[] {
  const ast = typeof msg === 'string' ? parse(msg) : msg;
  ast.forEach(el => {
    if (isLiteralElement(el)) {
      el.value = el.value
        .split('')
        .map(c => {
          const i = ASCII.indexOf(c);
          if (i < 0) {
            return c;
          }
          return ACCENTED_ASCII[i];
        })
        .join('');
    } else if (isPluralElement(el) || isSelectElement(el)) {
      for (const opt of Object.values(el.options)) {
        generateENXA(opt.value);
      }
    }
  });
  return ast;
}
