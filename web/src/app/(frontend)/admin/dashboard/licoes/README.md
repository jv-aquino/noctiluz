# Licoes (Lessons) Admin Module

This directory contains the admin UI for managing Lessons (Lições) in the Noctiluz platform.

## Features
- Markdown + LaTeX editor with live preview (see `MarkdownEditor.tsx`)
- Ready for image upload integration
- SOLID principles: Editor is reusable, single-responsibility, and easy to extend

## How to Extend
- To add image upload, add a button to `MarkdownEditor` that triggers your S3 upload flow and inserts the image markdown.
- For lesson CRUD, add forms and connect to your backend API.

## Dependencies
- [`@uiw/react-md-editor`](https://github.com/uiwjs/react-md-editor)
- [`remark-math`](https://github.com/remarkjs/remark-math)
- [`rehype-katex`](https://github.com/remarkjs/remark-math/tree/main/packages/rehype-katex)
- [`katex`](https://katex.org/)

## Coding Style
- Follows project conventions for hooks, components, and file structure.
- Editor is isolated for testability and reuse. 

# Math Examples

## Inline Math
- Sum: $\sum_{i=1}^{n} x_i$
- Fraction: $\frac{a}{b}$
- Greek letters: $\alpha, \beta, \gamma$
- Subscript/Superscript: $x^2, x_i$

## Block Math
$$
\begin{align}
y &= mx + b \\
&= 2x + 3
\end{align}
$$