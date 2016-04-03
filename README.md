# Graphviz REPL
Graphviz-REPL gives you a two-pane interface for quickly creating and iterating through graphviz diagrams. You type DOT syntax on the left, and the image will appear on the right after just a moment.

![Example Screenshot](/example_graph.png?raw=true)


## Installation & Usage
First install graphviz with `brew install graphviz`.

### Via Github Repo binary

```
git clone git@github.com:caseywatts/graphviz-repl.git
cd graphviz-repl
bin/graphviz-repl
```

and open http://localhost:3000/

### Via npm

```
npm install -g graphviz-repl
graphviz-repl
```

and open http://localhost:3000/

### Locally modified version, but still via npm
In case you want to tweak this for your own needs and also have it installed as a global npm module.

```
git clone git@github.com:caseywatts/graphviz-repl.git
cd graphviz-repl
npm install -g .
graphviz-repl
```

and open http://localhost:3000/

## License - "MIT License"

    Copyright (c) 2012 Yushi Nakai, <yushi.nakai@gmail.com>

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
