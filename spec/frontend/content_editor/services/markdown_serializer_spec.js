import Blockquote from '~/content_editor/extensions/blockquote';
import Bold from '~/content_editor/extensions/bold';
import BulletList from '~/content_editor/extensions/bullet_list';
import Code from '~/content_editor/extensions/code';
import CodeBlockHighlight from '~/content_editor/extensions/code_block_highlight';
import DescriptionItem from '~/content_editor/extensions/description_item';
import DescriptionList from '~/content_editor/extensions/description_list';
import Details from '~/content_editor/extensions/details';
import DetailsContent from '~/content_editor/extensions/details_content';
import Division from '~/content_editor/extensions/division';
import Emoji from '~/content_editor/extensions/emoji';
import Figure from '~/content_editor/extensions/figure';
import FigureCaption from '~/content_editor/extensions/figure_caption';
import HardBreak from '~/content_editor/extensions/hard_break';
import Heading from '~/content_editor/extensions/heading';
import HorizontalRule from '~/content_editor/extensions/horizontal_rule';
import Image from '~/content_editor/extensions/image';
import InlineDiff from '~/content_editor/extensions/inline_diff';
import Italic from '~/content_editor/extensions/italic';
import Link from '~/content_editor/extensions/link';
import ListItem from '~/content_editor/extensions/list_item';
import OrderedList from '~/content_editor/extensions/ordered_list';
import Paragraph from '~/content_editor/extensions/paragraph';
import Strike from '~/content_editor/extensions/strike';
import Table from '~/content_editor/extensions/table';
import TableCell from '~/content_editor/extensions/table_cell';
import TableHeader from '~/content_editor/extensions/table_header';
import TableRow from '~/content_editor/extensions/table_row';
import TaskItem from '~/content_editor/extensions/task_item';
import TaskList from '~/content_editor/extensions/task_list';
import markdownSerializer from '~/content_editor/services/markdown_serializer';
import { createTestEditor, createDocBuilder } from '../test_utils';

jest.mock('~/emoji');

const tiptapEditor = createTestEditor({
  extensions: [
    Blockquote,
    Bold,
    BulletList,
    Code,
    CodeBlockHighlight,
    DescriptionItem,
    DescriptionList,
    Details,
    DetailsContent,
    Division,
    Emoji,
    Figure,
    FigureCaption,
    HardBreak,
    Heading,
    HorizontalRule,
    Image,
    InlineDiff,
    Italic,
    Link,
    ListItem,
    OrderedList,
    Strike,
    Table,
    TableCell,
    TableHeader,
    TableRow,
    TaskItem,
    TaskList,
  ],
});

const {
  builders: {
    doc,
    blockquote,
    bold,
    bulletList,
    code,
    codeBlock,
    details,
    detailsContent,
    division,
    descriptionItem,
    descriptionList,
    emoji,
    figure,
    figureCaption,
    heading,
    hardBreak,
    horizontalRule,
    image,
    inlineDiff,
    italic,
    link,
    listItem,
    orderedList,
    paragraph,
    strike,
    table,
    tableCell,
    tableHeader,
    tableRow,
    taskItem,
    taskList,
  },
} = createDocBuilder({
  tiptapEditor,
  names: {
    blockquote: { nodeType: Blockquote.name },
    bold: { markType: Bold.name },
    bulletList: { nodeType: BulletList.name },
    code: { markType: Code.name },
    codeBlock: { nodeType: CodeBlockHighlight.name },
    details: { nodeType: Details.name },
    detailsContent: { nodeType: DetailsContent.name },
    division: { nodeType: Division.name },
    descriptionItem: { nodeType: DescriptionItem.name },
    descriptionList: { nodeType: DescriptionList.name },
    emoji: { markType: Emoji.name },
    figure: { nodeType: Figure.name },
    figureCaption: { nodeType: FigureCaption.name },
    hardBreak: { nodeType: HardBreak.name },
    heading: { nodeType: Heading.name },
    horizontalRule: { nodeType: HorizontalRule.name },
    image: { nodeType: Image.name },
    inlineDiff: { markType: InlineDiff.name },
    italic: { nodeType: Italic.name },
    link: { markType: Link.name },
    listItem: { nodeType: ListItem.name },
    orderedList: { nodeType: OrderedList.name },
    paragraph: { nodeType: Paragraph.name },
    strike: { markType: Strike.name },
    table: { nodeType: Table.name },
    tableCell: { nodeType: TableCell.name },
    tableHeader: { nodeType: TableHeader.name },
    tableRow: { nodeType: TableRow.name },
    taskItem: { nodeType: TaskItem.name },
    taskList: { nodeType: TaskList.name },
  },
});

const serialize = (...content) =>
  markdownSerializer({}).serialize({
    schema: tiptapEditor.schema,
    content: doc(...content).toJSON(),
  });

describe('markdownSerializer', () => {
  it('correctly serializes bold', () => {
    expect(serialize(paragraph(bold('bold')))).toBe('**bold**');
  });

  it('correctly serializes italics', () => {
    expect(serialize(paragraph(italic('italics')))).toBe('_italics_');
  });

  it('correctly serializes inline diff', () => {
    expect(
      serialize(
        paragraph(
          inlineDiff({ type: 'addition' }, '+30 lines'),
          inlineDiff({ type: 'deletion' }, '-10 lines'),
        ),
      ),
    ).toBe('{++30 lines+}{--10 lines-}');
  });

  it('correctly serializes a line break', () => {
    expect(serialize(paragraph('hello', hardBreak(), 'world'))).toBe('hello\\\nworld');
  });

  it('correctly serializes a link', () => {
    expect(serialize(paragraph(link({ href: 'https://example.com' }, 'example url')))).toBe(
      '[example url](https://example.com)',
    );
  });

  it('correctly serializes a plain URL link', () => {
    expect(serialize(paragraph(link({ href: 'https://example.com' }, 'https://example.com')))).toBe(
      '<https://example.com>',
    );
  });

  it('correctly serializes a link with a title', () => {
    expect(
      serialize(
        paragraph(link({ href: 'https://example.com', title: 'click this link' }, 'example url')),
      ),
    ).toBe('[example url](https://example.com "click this link")');
  });

  it('correctly serializes a plain URL link with a title', () => {
    expect(
      serialize(
        paragraph(
          link({ href: 'https://example.com', title: 'link title' }, 'https://example.com'),
        ),
      ),
    ).toBe('[https://example.com](https://example.com "link title")');
  });

  it('correctly serializes a link with a canonicalSrc', () => {
    expect(
      serialize(
        paragraph(
          link(
            {
              href: '/uploads/abcde/file.zip',
              canonicalSrc: 'file.zip',
              title: 'click here to download',
            },
            'download file',
          ),
        ),
      ),
    ).toBe('[download file](file.zip "click here to download")');
  });

  it('correctly serializes strikethrough', () => {
    expect(serialize(paragraph(strike('deleted content')))).toBe('~~deleted content~~');
  });

  it('correctly serializes blockquotes with hard breaks', () => {
    expect(serialize(blockquote('some text', hardBreak(), hardBreak(), 'new line'))).toBe(
      `
> some text\\
> \\
> new line
      `.trim(),
    );
  });

  it('correctly serializes blockquote with multiple block nodes', () => {
    expect(serialize(blockquote(paragraph('some paragraph'), codeBlock('var x = 10;')))).toBe(
      `
> some paragraph
>
> \`\`\`
> var x = 10;
> \`\`\`
      `.trim(),
    );
  });

  it('correctly serializes a multiline blockquote', () => {
    expect(
      serialize(
        blockquote(
          { multiline: true },
          paragraph('some paragraph with ', bold('bold')),
          codeBlock('var y = 10;'),
        ),
      ),
    ).toBe(
      `
>>>
some paragraph with **bold**

\`\`\`
var y = 10;
\`\`\`

>>>
      `.trim(),
    );
  });

  it('correctly serializes a code block with language', () => {
    expect(
      serialize(
        codeBlock(
          { language: 'json' },
          'this is not really json but just trying out whether this case works or not',
        ),
      ),
    ).toBe(
      `
\`\`\`json
this is not really json but just trying out whether this case works or not
\`\`\`
      `.trim(),
    );
  });

  it('correctly serializes emoji', () => {
    expect(serialize(paragraph(emoji({ name: 'dog' })))).toBe(':dog:');
  });

  it('correctly serializes headings', () => {
    expect(
      serialize(
        heading({ level: 1 }, 'Heading 1'),
        heading({ level: 2 }, 'Heading 2'),
        heading({ level: 3 }, 'Heading 3'),
        heading({ level: 4 }, 'Heading 4'),
        heading({ level: 5 }, 'Heading 5'),
        heading({ level: 6 }, 'Heading 6'),
      ),
    ).toBe(
      `
# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6
      `.trim(),
    );
  });

  it('correctly serializes horizontal rule', () => {
    expect(serialize(horizontalRule(), horizontalRule(), horizontalRule())).toBe(
      `
---

---

---
      `.trim(),
    );
  });

  it('correctly serializes an image', () => {
    expect(serialize(paragraph(image({ src: 'img.jpg', alt: 'foo bar' })))).toBe(
      '![foo bar](img.jpg)',
    );
  });

  it('correctly serializes an image with a title', () => {
    expect(serialize(paragraph(image({ src: 'img.jpg', title: 'baz', alt: 'foo bar' })))).toBe(
      '![foo bar](img.jpg "baz")',
    );
  });

  it('correctly serializes an image with a canonicalSrc', () => {
    expect(
      serialize(
        paragraph(
          image({
            src: '/uploads/abcde/file.png',
            alt: 'this is an image',
            canonicalSrc: 'file.png',
            title: 'foo bar baz',
          }),
        ),
      ),
    ).toBe('![this is an image](file.png "foo bar baz")');
  });

  it('correctly serializes bullet list', () => {
    expect(
      serialize(
        bulletList(
          listItem(paragraph('list item 1')),
          listItem(paragraph('list item 2')),
          listItem(paragraph('list item 3')),
        ),
      ),
    ).toBe(
      `
* list item 1
* list item 2
* list item 3
      `.trim(),
    );
  });

  it('correctly serializes bullet list with different bullet styles', () => {
    expect(
      serialize(
        bulletList(
          { bullet: '+' },
          listItem(paragraph('list item 1')),
          listItem(paragraph('list item 2')),
          listItem(
            paragraph('list item 3'),
            bulletList(
              { bullet: '-' },
              listItem(paragraph('sub-list item 1')),
              listItem(paragraph('sub-list item 2')),
            ),
          ),
        ),
      ),
    ).toBe(
      `
+ list item 1
+ list item 2
+ list item 3
  - sub-list item 1
  - sub-list item 2
      `.trim(),
    );
  });

  it('correctly serializes a numeric list', () => {
    expect(
      serialize(
        orderedList(
          listItem(paragraph('list item 1')),
          listItem(paragraph('list item 2')),
          listItem(paragraph('list item 3')),
        ),
      ),
    ).toBe(
      `
1. list item 1
2. list item 2
3. list item 3
      `.trim(),
    );
  });

  it('correctly serializes a numeric list with parens', () => {
    expect(
      serialize(
        orderedList(
          { parens: true },
          listItem(paragraph('list item 1')),
          listItem(paragraph('list item 2')),
          listItem(paragraph('list item 3')),
        ),
      ),
    ).toBe(
      `
1) list item 1
2) list item 2
3) list item 3
      `.trim(),
    );
  });

  it('correctly serializes a numeric list with a different start order', () => {
    expect(
      serialize(
        orderedList(
          { start: 17 },
          listItem(paragraph('list item 1')),
          listItem(paragraph('list item 2')),
          listItem(paragraph('list item 3')),
        ),
      ),
    ).toBe(
      `
17. list item 1
18. list item 2
19. list item 3
      `.trim(),
    );
  });

  it('correctly serializes a numeric list with an invalid start order', () => {
    expect(
      serialize(
        orderedList(
          { start: NaN },
          listItem(paragraph('list item 1')),
          listItem(paragraph('list item 2')),
          listItem(paragraph('list item 3')),
        ),
      ),
    ).toBe(
      `
1. list item 1
2. list item 2
3. list item 3
      `.trim(),
    );
  });

  it('correctly serializes a bullet list inside an ordered list', () => {
    expect(
      serialize(
        orderedList(
          { start: 17 },
          listItem(paragraph('list item 1')),
          listItem(paragraph('list item 2')),
          listItem(
            paragraph('list item 3'),
            bulletList(
              listItem(paragraph('sub-list item 1')),
              listItem(paragraph('sub-list item 2')),
            ),
          ),
        ),
      ),
    ).toBe(
      // notice that 4 space indent works fine in this case,
      // when it usually wouldn't
      `
17. list item 1
18. list item 2
19. list item 3
    * sub-list item 1
    * sub-list item 2
      `.trim(),
    );
  });

  it('correctly serializes a task list', () => {
    expect(
      serialize(
        taskList(
          taskItem({ checked: true }, paragraph('list item 1')),
          taskItem(paragraph('list item 2')),
          taskItem(
            paragraph('list item 3'),
            taskList(
              taskItem({ checked: true }, paragraph('sub-list item 1')),
              taskItem(paragraph('sub-list item 2')),
            ),
          ),
        ),
      ),
    ).toBe(
      `
* [x] list item 1
* [ ] list item 2
* [ ] list item 3
  * [x] sub-list item 1
  * [ ] sub-list item 2
      `.trim(),
    );
  });

  it('correctly serializes a numeric task list + with start order', () => {
    expect(
      serialize(
        taskList(
          { numeric: true },
          taskItem({ checked: true }, paragraph('list item 1')),
          taskItem(paragraph('list item 2')),
          taskItem(
            paragraph('list item 3'),
            taskList(
              { numeric: true, start: 1351, parens: true },
              taskItem({ checked: true }, paragraph('sub-list item 1')),
              taskItem(paragraph('sub-list item 2')),
            ),
          ),
        ),
      ),
    ).toBe(
      `
1. [x] list item 1
2. [ ] list item 2
3. [ ] list item 3
   1351) [x] sub-list item 1
   1352) [ ] sub-list item 2
      `.trim(),
    );
  });

  it('correctly renders a description list', () => {
    expect(
      serialize(
        descriptionList(
          descriptionItem(paragraph('Beast of Bodmin')),
          descriptionItem({ isTerm: false }, paragraph('A large feline inhabiting Bodmin Moor.')),

          descriptionItem(paragraph('Morgawr')),
          descriptionItem({ isTerm: false }, paragraph('A sea serpent.')),

          descriptionItem(paragraph('Owlman')),
          descriptionItem(
            { isTerm: false },
            paragraph('A giant ', italic('owl-like'), ' creature.'),
          ),
        ),
      ),
    ).toBe(
      `
<dl>
<dt>Beast of Bodmin</dt>
<dd>A large feline inhabiting Bodmin Moor.</dd>
<dt>Morgawr</dt>
<dd>A sea serpent.</dd>
<dt>Owlman</dt>
<dd>

A giant _owl-like_ creature.

</dd>
</dl>
      `.trim(),
    );
  });

  it('correctly renders a simple details/summary', () => {
    expect(
      serialize(
        details(
          detailsContent(paragraph('this is the summary')),
          detailsContent(paragraph('this content will be hidden')),
        ),
      ),
    ).toBe(
      `
<details>
<summary>this is the summary</summary>
this content will be hidden
</details>
      `.trim(),
    );
  });

  it('correctly renders details/summary with styled content', () => {
    expect(
      serialize(
        details(
          detailsContent(paragraph('this is the ', bold('summary'))),
          detailsContent(
            codeBlock(
              { language: 'javascript' },
              'var a = 2;\nvar b = 3;\nvar c = a + d;\n\nconsole.log(c);',
            ),
          ),
          detailsContent(paragraph('this content will be ', italic('hidden'))),
        ),
        details(detailsContent(paragraph('summary 2')), detailsContent(paragraph('content 2'))),
      ),
    ).toBe(
      `
<details>
<summary>

this is the **summary**

</summary>

\`\`\`javascript
var a = 2;
var b = 3;
var c = a + d;

console.log(c);
\`\`\`

this content will be _hidden_

</details>
<details>
<summary>summary 2</summary>
content 2
</details>
      `.trim(),
    );
  });

  it('correctly renders nested details', () => {
    expect(
      serialize(
        details(
          detailsContent(paragraph('dream level 1')),
          detailsContent(
            details(
              detailsContent(paragraph('dream level 2')),
              detailsContent(
                details(
                  detailsContent(paragraph('dream level 3')),
                  detailsContent(paragraph(italic('inception'))),
                ),
              ),
            ),
          ),
        ),
      ),
    ).toBe(
      `
<details>
<summary>dream level 1</summary>

<details>
<summary>dream level 2</summary>

<details>
<summary>dream level 3</summary>

_inception_

</details>
</details>
</details>
      `.trim(),
    );
  });

  it('correctly renders div', () => {
    expect(
      serialize(
        division(paragraph('just a paragraph in a div')),
        division(paragraph('just some ', bold('styled'), ' ', italic('content'), ' in a div')),
      ),
    ).toBe(
      '<div>just a paragraph in a div</div>\n<div>\n\njust some **styled** _content_ in a div\n\n</div>',
    );
  });

  it('correctly renders figure', () => {
    expect(
      serialize(
        figure(
          paragraph(image({ src: 'elephant.jpg', alt: 'An elephant at sunset' })),
          figureCaption('An elephant at sunset'),
        ),
      ),
    ).toBe(
      `
<figure>

![An elephant at sunset](elephant.jpg)

<figcaption>An elephant at sunset</figcaption>
</figure>
      `.trim(),
    );
  });

  it('correctly renders figure with styled caption', () => {
    expect(
      serialize(
        figure(
          paragraph(image({ src: 'elephant.jpg', alt: 'An elephant at sunset' })),
          figureCaption(italic('An elephant at sunset')),
        ),
      ),
    ).toBe(
      `
<figure>

![An elephant at sunset](elephant.jpg)

<figcaption>

_An elephant at sunset_

</figcaption>
</figure>
      `.trim(),
    );
  });

  it('correctly serializes a table with inline content', () => {
    expect(
      serialize(
        table(
          // each table cell must contain at least one paragraph
          tableRow(
            tableHeader(paragraph('header')),
            tableHeader(paragraph('header')),
            tableHeader(paragraph('header')),
          ),
          tableRow(
            tableCell(paragraph('cell')),
            tableCell(paragraph('cell')),
            tableCell(paragraph('cell')),
          ),
          tableRow(
            tableCell(paragraph('cell')),
            tableCell(paragraph('cell')),
            tableCell(paragraph('cell')),
          ),
        ),
      ).trim(),
    ).toBe(
      `
| header | header | header |
|--------|--------|--------|
| cell | cell | cell |
| cell | cell | cell |
    `.trim(),
    );
  });

  it('correctly serializes a table with line breaks', () => {
    expect(
      serialize(
        table(
          tableRow(tableHeader(paragraph('header')), tableHeader(paragraph('header'))),
          tableRow(
            tableCell(paragraph('cell with', hardBreak(), 'line', hardBreak(), 'breaks')),
            tableCell(paragraph('cell')),
          ),
          tableRow(tableCell(paragraph('cell')), tableCell(paragraph('cell'))),
        ),
      ).trim(),
    ).toBe(
      `
| header | header |
|--------|--------|
| cell with<br>line<br>breaks | cell |
| cell | cell |
    `.trim(),
    );
  });

  it('correctly serializes two consecutive tables', () => {
    expect(
      serialize(
        table(
          tableRow(tableHeader(paragraph('header')), tableHeader(paragraph('header'))),
          tableRow(tableCell(paragraph('cell')), tableCell(paragraph('cell'))),
          tableRow(tableCell(paragraph('cell')), tableCell(paragraph('cell'))),
        ),
        table(
          tableRow(tableHeader(paragraph('header')), tableHeader(paragraph('header'))),
          tableRow(tableCell(paragraph('cell')), tableCell(paragraph('cell'))),
          tableRow(tableCell(paragraph('cell')), tableCell(paragraph('cell'))),
        ),
      ).trim(),
    ).toBe(
      `
| header | header |
|--------|--------|
| cell | cell |
| cell | cell |

| header | header |
|--------|--------|
| cell | cell |
| cell | cell |
    `.trim(),
    );
  });

  it('correctly serializes a table with block content', () => {
    expect(
      serialize(
        table(
          tableRow(
            tableHeader(paragraph('examples of')),
            tableHeader(paragraph('block content')),
            tableHeader(paragraph('in tables')),
            tableHeader(paragraph('in content editor')),
          ),
          tableRow(
            tableCell(heading({ level: 1 }, 'heading 1')),
            tableCell(heading({ level: 2 }, 'heading 2')),
            tableCell(paragraph(bold('just bold'))),
            tableCell(paragraph(bold('bold'), ' ', italic('italic'), ' ', code('code'))),
          ),
          tableRow(
            tableCell(
              paragraph('all marks in three paragraphs:'),
              paragraph('the ', bold('quick'), ' ', italic('brown'), ' ', code('fox')),
              paragraph(
                link({ href: '/home' }, 'jumps'),
                ' over the ',
                strike('lazy'),
                ' ',
                emoji({ name: 'dog' }),
              ),
            ),
            tableCell(
              paragraph(image({ src: 'img.jpg', alt: 'some image' }), hardBreak(), 'image content'),
            ),
            tableCell(
              blockquote('some text', hardBreak(), hardBreak(), 'in a multiline blockquote'),
            ),
            tableCell(
              codeBlock(
                { language: 'javascript' },
                'var a = 2;\nvar b = 3;\nvar c = a + d;\n\nconsole.log(c);',
              ),
            ),
          ),
          tableRow(
            tableCell(bulletList(listItem('item 1'), listItem('item 2'), listItem('item 2'))),
            tableCell(orderedList(listItem('item 1'), listItem('item 2'), listItem('item 2'))),
            tableCell(
              paragraph('paragraphs separated by'),
              horizontalRule(),
              paragraph('a horizontal rule'),
            ),
            tableCell(
              table(
                tableRow(tableHeader(paragraph('table')), tableHeader(paragraph('inside'))),
                tableRow(tableCell(paragraph('another')), tableCell(paragraph('table'))),
              ),
            ),
          ),
        ),
      ).trim(),
    ).toBe(
      `
<table>
<tr>
<th>examples of</th>
<th>block content</th>
<th>in tables</th>
<th>in content editor</th>
</tr>
<tr>
<td>

# heading 1
</td>
<td>

## heading 2
</td>
<td>

**just bold**
</td>
<td>

**bold** _italic_ \`code\`
</td>
</tr>
<tr>
<td>

all marks in three paragraphs:

the **quick** _brown_ \`fox\`

[jumps](/home) over the ~~lazy~~ :dog:
</td>
<td>

![some image](img.jpg)<br>image content
</td>
<td>

> some text\\
> \\
> in a multiline blockquote
</td>
<td>

\`\`\`javascript
var a = 2;
var b = 3;
var c = a + d;

console.log(c);
\`\`\`
</td>
</tr>
<tr>
<td>

* item 1
* item 2
* item 2
</td>
<td>

1. item 1
2. item 2
3. item 2
</td>
<td>

paragraphs separated by

---

a horizontal rule
</td>
<td>

| table | inside |
|-------|--------|
| another | table |

</td>
</tr>
</table>
    `.trim(),
    );
  });

  it('correctly renders content after a markdown table', () => {
    expect(
      serialize(
        table(tableRow(tableHeader(paragraph('header'))), tableRow(tableCell(paragraph('cell')))),
        heading({ level: 1 }, 'this is a heading'),
      ).trim(),
    ).toBe(
      `
| header |
|--------|
| cell |

# this is a heading
    `.trim(),
    );
  });

  it('correctly renders content after an html table', () => {
    expect(
      serialize(
        table(
          tableRow(tableHeader(paragraph('header'))),
          tableRow(tableCell(blockquote('hi'), paragraph('there'))),
        ),
        heading({ level: 1 }, 'this is a heading'),
      ).trim(),
    ).toBe(
      `
<table>
<tr>
<th>header</th>
</tr>
<tr>
<td>

> hi

there
</td>
</tr>
</table>

# this is a heading
      `.trim(),
    );
  });

  it('correctly serializes tables with misplaced header cells', () => {
    expect(
      serialize(
        table(
          tableRow(tableHeader(paragraph('cell')), tableCell(paragraph('cell'))),
          tableRow(tableCell(paragraph('cell')), tableHeader(paragraph('cell'))),
        ),
      ).trim(),
    ).toBe(
      `
<table>
<tr>
<th>cell</th>
<td>cell</td>
</tr>
<tr>
<td>cell</td>
<th>cell</th>
</tr>
</table>
      `.trim(),
    );
  });

  it('correctly serializes table without any headers', () => {
    expect(
      serialize(
        table(
          tableRow(tableCell(paragraph('cell')), tableCell(paragraph('cell'))),
          tableRow(tableCell(paragraph('cell')), tableCell(paragraph('cell'))),
        ),
      ).trim(),
    ).toBe(
      `
<table>
<tr>
<td>cell</td>
<td>cell</td>
</tr>
<tr>
<td>cell</td>
<td>cell</td>
</tr>
</table>
      `.trim(),
    );
  });

  it('correctly serializes table with rowspan and colspan', () => {
    expect(
      serialize(
        table(
          tableRow(
            tableHeader(paragraph('header')),
            tableHeader(paragraph('header')),
            tableHeader(paragraph('header')),
          ),
          tableRow(
            tableCell({ colspan: 2 }, paragraph('cell with rowspan: 2')),
            tableCell({ rowspan: 2 }, paragraph('cell')),
          ),
          tableRow(tableCell({ colspan: 2 }, paragraph('cell with rowspan: 2'))),
        ),
      ).trim(),
    ).toBe(
      `
<table>
<tr>
<th>header</th>
<th>header</th>
<th>header</th>
</tr>
<tr>
<td colspan="2">cell with rowspan: 2</td>
<td rowspan="2">cell</td>
</tr>
<tr>
<td colspan="2">cell with rowspan: 2</td>
</tr>
</table>
      `.trim(),
    );
  });
});
