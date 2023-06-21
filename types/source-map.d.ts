// TODO Replace with @types/source-map once merged and released
declare module 'markdown-it-source-map' {
  import type MarkdownIt = require('markdown-it');

  const markdownItSourceMap = MarkdownIt.SimplePlugin;
  export default markdownItSourceMap;
}
