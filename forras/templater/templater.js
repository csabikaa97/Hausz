const fs = require('fs');

const extractData = input => {
    let returnvalue = input.split('\n').map(line => {
        let tabcount = line.match(/^\t*/);
        if (tabcount != null) {
            tabs = tabcount.length == 1 ? tabcount[0].length : 0;
        }

        let text = line.match(/"([^"]*)"/);
        if (text != null) {
            text = text.length == 2 ? text[1] : "";
        }
        let link = line.match(/-> "(.*)"/);
        if (link != null) {
            link = link.length == 2 ? link[1] : "";
        }
        let component = line.match(/^(\w+)/);
        if (component != null) {
            component = component.length == 2 ? component[1] : "";
        }
        let modifiers = line.match(/{(.*)}/);
        if( modifiers != null) {
            modifiers = modifiers.length == 2 ? modifiers[1].split(',') : [];
        }
        return {tabs, component, link, modifiers, text};
    });

    return returnvalue;
};

const generateHTML = (lines) => {
    let returnvalue = "";
    let i = 0;
    lines.forEach(line => {
        returnvalue += '\t\t' + '\t'.repeat(line.tabs);
        if( line.component.length <= 0 ) {
            console.error("No component on line: " + i + "\n" + line);
            return;
        }
        
        if( line.link != null ) {
            if( line.link.length > 0 ) {
                returnvalue += '<a href="' + line.link + '">';
            }
        }

        returnvalue += '<' + line.component;

        if( line.modifiers != null) {
            if( line.modifiers.length > 0 ) {
                returnvalue += ' class="' + line.modifiers.join(' ') + '"';
            }
        }

        returnvalue += '>';
        if( line.text != null ) {
            if( line.text.length > 0 ) {
                returnvalue += line.text;
            }
        }
        returnvalue += '</' + line.component + '>'

        if( line.link != null ) {
            if( line.link.length > 0 ) {
                returnvalue += '</a>';
            }
        }

        i++;

        returnvalue += '\n';
    });
    return returnvalue;
};

const main = () => {
  const standardCssFile = fs.readFileSync('../../public/index/alapok.css', 'utf-8');

  if (process.argv.length < 3) {
    console.error('No input file specified!');
    return;
  }

  const input = fs.readFileSync(process.argv[2], 'utf-8');

  const data = extractData(input);

  let html = generateHTML(data);

  const HTMLBoilerPlateTop = `<!DOCTYPE html>
    <html lang="hu">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style></style>
    </head>
    <body>
`;

    const HTMLBoilerPlateBottom = `\t</body>
</html>
    `;

  html = HTMLBoilerPlateTop + html + HTMLBoilerPlateBottom;

  fs.writeFileSync('./output.html', html);

  console.log(process.argv[2]+': done!');
};

main();