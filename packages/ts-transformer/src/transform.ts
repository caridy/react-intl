import * as ts from 'typescript';
import {MessageDescriptor} from './types';
import {interpolateName} from 'loader-utils';

export type Extractor = (filePath: string, msgs: MessageDescriptor[]) => void;

export type InterpolateNameFn = (
  id?: string,
  defaultMessage?: string,
  description?: string
) => string;

export interface Opts {
  /**
   * Whether the metadata about the location of the message in the source file
   * should be extracted. If `true`, then `file`, `start`, and `end`
   * fields will exist for each extracted message descriptors.
   * Defaults to `false`.
   */
  extractSourceLocation?: boolean;
  /**
   * Remove `defaultMessage` field in generated js after extraction.
   */
  removeDefaultMessage?: boolean;
  /**
   * Additional component names to extract messages from,
   * e.g: `['FormattedFooBarMessage']`.
   */
  additionalComponentNames?: string[];
  /**
   * Opt-in to extract from `intl.formatMessage` call with the same restrictions,
   * e.g: has to be called with object literal such as
   * `intl.formatMessage({ id: 'foo', defaultMessage: 'bar', description: 'baz'})`
   */
  extractFromFormatMessageCall?: boolean;
  /**
   * Callback function that gets called everytime we encountered something
   * that looks like a MessageDescriptor
   *
   * @type {Extractor}
   * @memberof Opts
   */
  onMsgExtracted?: Extractor;
  /**
   * webpack-style name interpolation
   *
   * @type {(InterpolateNameFn | string)}
   * @memberof Opts
   */
  overrideIdFn?: InterpolateNameFn | string;
}

const DEFAULT_OPTS: Omit<Opts, 'program'> = {
  onMsgExtracted: () => undefined,
};

function isMultipleMessageDecl(node: ts.CallExpression) {
  return (
    ts.isIdentifier(node.expression) &&
    node.expression.text === 'defineMessages'
  );
}

function isSingularMessageDecl(
  node: ts.CallExpression | ts.JsxOpeningElement | ts.JsxSelfClosingElement,
  additionalComponentNames: string[]
) {
  const compNames = new Set([
    'FormattedMessage',
    'defineMessage',
    ...additionalComponentNames,
  ]);
  let fnName = '';
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
    fnName = node.expression.text;
  } else if (ts.isJsxOpeningElement(node) && ts.isIdentifier(node.tagName)) {
    fnName = node.tagName.text;
  } else if (
    ts.isJsxSelfClosingElement(node) &&
    ts.isIdentifier(node.tagName)
  ) {
    fnName = node.tagName.text;
  }
  return compNames.has(fnName);
}

function extractMessageDescriptor(
  node:
    | ts.ObjectLiteralExpression
    | ts.JsxOpeningElement
    | ts.JsxSelfClosingElement,
  {overrideIdFn, extractSourceLocation}: Opts,
  sf: ts.SourceFile
): MessageDescriptor | undefined {
  let properties: ts.NodeArray<ts.ObjectLiteralElement> | undefined = undefined;
  if (ts.isObjectLiteralExpression(node)) {
    properties = node.properties;
  } else if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
    properties = node.attributes.properties;
  }
  const msg: MessageDescriptor = {};
  if (!properties) {
    return;
  }

  properties.forEach(prop => {
    const {name} = prop;
    const initializer =
      ts.isPropertyAssignment(prop) || ts.isJsxAttribute(prop)
        ? prop.initializer
        : undefined;
    if (
      !initializer ||
      !ts.isStringLiteral(initializer) ||
      !name ||
      !ts.isIdentifier(name)
    ) {
      return;
    }
    switch (name.text) {
      case 'id':
        msg.id = initializer.text;
        break;
      case 'defaultMessage':
        msg.defaultMessage = initializer.text;
        break;
      case 'description':
        msg.description = initializer.text;
        break;
    }
  });
  // We extracted nothing
  if (!Object.entries(msg).find(([_, v]) => v)) {
    return;
  }
  if (!msg.id && overrideIdFn) {
    switch (typeof overrideIdFn) {
      case 'string':
        msg.id = interpolateName(
          {sourcePath: sf.fileName} as any,
          overrideIdFn,
          {
            content: msg.description
              ? `${msg.defaultMessage}#${msg.description}`
              : msg.defaultMessage,
          }
        );
        break;
      case 'function':
        msg.id = overrideIdFn(msg.id, msg.defaultMessage, msg.description);
        break;
    }
  }
  if (extractSourceLocation) {
    return {
      ...msg,
      file: sf.fileName,
      start: node.pos,
      end: node.end,
    };
  }
  return msg;
}

/**
 * Check if node is `intl.formatMessage` node
 * @param node
 * @param sf
 */
function isIntlFormatMessageCall(node: ts.CallExpression) {
  const method = node.expression;

  // Handle intl.formatMessage()
  if (ts.isPropertyAccessExpression(method)) {
    return (
      (method.name.text === 'formatMessage' &&
        ts.isIdentifier(method.expression) &&
        method.expression.text === 'intl') ||
      (ts.isPropertyAccessExpression(method.expression) &&
        method.expression.name.text === 'intl')
    );
  }

  // Handle formatMessage()
  return ts.isIdentifier(method) && method.text === 'formatMessage';
}

function extractMessageFromJsxComponent(
  node: ts.JsxOpeningElement | ts.JsxSelfClosingElement,
  opts: Opts,
  sf: ts.SourceFile
): typeof node | undefined {
  const {onMsgExtracted} = opts;
  if (!isSingularMessageDecl(node, opts.additionalComponentNames || [])) {
    return;
  }
  const msg = extractMessageDescriptor(node, opts, sf);
  if (!msg) {
    return;
  }
  if (typeof onMsgExtracted === 'function') {
    onMsgExtracted(sf.fileName, [msg]);
  }

  const clonedEl = ts.getMutableClone(node);
  clonedEl.attributes = setAttributesInObject(clonedEl.attributes, {
    defaultMessage: opts.removeDefaultMessage ? undefined : msg.defaultMessage,
    id: msg.id,
  }) as ts.JsxAttributes;
  return clonedEl;
}

function setAttributesInObject(
  node: ts.ObjectLiteralExpression | ts.JsxAttributes,
  msg: MessageDescriptor
) {
  const newNode = ts.getMutableClone(node);
  newNode.properties = ts.createNodeArray(
    (['id', 'description', 'defaultMessage'] as Array<keyof MessageDescriptor>)
      .filter(k => !!msg[k])
      .map(k => {
        const val = msg[k];
        const keyNode = ts.createIdentifier(k);
        const valNode = ts.createStringLiteral(val + '');
        if (ts.isJsxAttributes(node)) {
          return ts.createJsxAttribute(keyNode, valNode);
        }
        return ts.createPropertyAssignment(keyNode, valNode);
      })
  ) as ts.NodeArray<ts.ObjectLiteralElementLike>;
  return newNode;
}

function extractMessagesFromCallExpression(
  node: ts.CallExpression,
  opts: Opts,
  sf: ts.SourceFile
): typeof node | undefined {
  const {onMsgExtracted} = opts;
  if (isMultipleMessageDecl(node)) {
    const [descriptorsObj, ...restArgs] = node.arguments;
    if (ts.isObjectLiteralExpression(descriptorsObj)) {
      const properties = descriptorsObj.properties as ts.NodeArray<
        ts.PropertyAssignment
      >;
      const msgs = properties
        .map(prop =>
          extractMessageDescriptor(
            prop.initializer as ts.ObjectLiteralExpression,
            opts,
            sf
          )
        )
        .filter((msg): msg is MessageDescriptor => !!msg);
      if (!msgs.length) {
        return;
      }
      if (typeof onMsgExtracted === 'function') {
        onMsgExtracted(sf.fileName, msgs);
      }

      const newNode = ts.getMutableClone(node);
      const clonedDescriptorsObj = ts.getMutableClone(descriptorsObj);
      const clonedProperties = ts.createNodeArray(
        properties.map((prop, i) => {
          if (!ts.isObjectLiteralExpression(prop.initializer)) {
            return prop;
          }
          const clonedNode = ts.getMutableClone(prop);
          clonedNode.initializer = setAttributesInObject(prop.initializer, {
            defaultMessage: opts.removeDefaultMessage
              ? undefined
              : msgs[i].defaultMessage,
            id: msgs[i] ? msgs[i].id : undefined,
          });
          return clonedNode;
        })
      );
      clonedDescriptorsObj.properties = clonedProperties;
      newNode.arguments = ts.createNodeArray([
        clonedDescriptorsObj,
        ...restArgs,
      ]);
      return newNode;
    }
  } else if (
    isSingularMessageDecl(node, opts.additionalComponentNames || []) ||
    (opts.extractFromFormatMessageCall && isIntlFormatMessageCall(node))
  ) {
    const [descriptorsObj, ...restArgs] = node.arguments;
    if (ts.isObjectLiteralExpression(descriptorsObj)) {
      const msg = extractMessageDescriptor(descriptorsObj, opts, sf);
      if (!msg) {
        return;
      }
      if (typeof onMsgExtracted === 'function') {
        onMsgExtracted(sf.fileName, [msg]);
      }

      const newNode = ts.getMutableClone(node);
      newNode.arguments = ts.createNodeArray([
        setAttributesInObject(descriptorsObj, {
          defaultMessage: opts.removeDefaultMessage
            ? undefined
            : msg.defaultMessage,
          id: msg.id,
        }),
        ...restArgs,
      ]);
      return newNode;
    }
  }
}

export function transform(opts: Opts) {
  opts = {...DEFAULT_OPTS, ...opts};
  const transformFn: ts.TransformerFactory<ts.SourceFile> = ctx => {
    function getVisitor(sf: ts.SourceFile) {
      const visitor: ts.Visitor = (node: ts.Node): ts.Node => {
        const newNode = ts.isCallExpression(node)
          ? extractMessagesFromCallExpression(node, opts, sf)
          : ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)
          ? extractMessageFromJsxComponent(node, opts, sf)
          : undefined;

        return newNode || ts.visitEachChild(node, visitor, ctx);
      };
      return visitor;
    }

    return (sf: ts.SourceFile) => ts.visitNode(sf, getVisitor(sf));
  };

  return transformFn;
}
