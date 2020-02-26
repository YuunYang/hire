const fixtureStack = `TypeError: Error raised
  at bar http://192.168.31.8:8000/c.js:2:9
  at foo http://192.168.31.8:8000/b.js:4:15
  at calc http://192.168.31.8:8000/a.js:4:3
  at <anonymous>:1:11
  at http://192.168.31.8:8000/a.js:22:3
`

const fixtureFirefoxStack = `
  bar@http://192.168.31.8:8000/c.js:2:9
  foo@http://192.168.31.8:8000/b.js:4:15
  calc@http://192.168.31.8:8000/a.js:4:3
  <anonymous>:1:11
  http://192.168.31.8:8000/a.js:22:3
`

interface ErrorMessage {
    message: string
    stack: Array<{
        line: number
        column: number
        filename: string
    }>
}

class Stack{
    text: string;
    type: 'chrome' | 'firefox';
    message: ErrorMessage;
    constructor(text: string, type: 'chrome' | 'firefox'){
        this.text = text;
        this.type = type;
        this.message = {
            message: '',
            stack: []
        };
    }
    readline(): string[] {
        return this.text.split('\n');
    }
    getLink(line: string, type: 'chrome' | 'firefox'): string[]{
        let info: string;
        const regAM: RegExp = new RegExp("<(anonymous)>:(\\d+):(\\d+)")
        const regNormal: RegExp = new RegExp('((http|ftp|https)://[\\w\\W]+?\/[\\w\\W]+?):(\\d+):(\\d+)');
        if(type === 'chrome'){
            info = line.split(' ').pop()
        } else {
            info = line.split('@').pop()
        }
        let am = regAM.exec(info);
        if(am){
            return am.slice(1, 4);
        }
        let normal = regNormal.exec(info);
        return normal ? [normal[1], normal[3], normal[4]] : [];
    }
    getMessage(): ErrorMessage{
        let lines = this.readline();
        let message: string = '',
            stack: Array<{
                line: number
                column: number
                filename: string
            }>=[];
        if(this.type === 'chrome'){
            message = lines[0].split(': ')[1];
        }
        lines.slice(1).forEach(l => {
            if(l){
                const [filename, line, column] = this.getLink(l, this.type);
                stack.push({ line: parseInt(line), column: parseInt(column), filename })
            }
        })
        this.message.message = message;
        this.message.stack = stack;
        return this.message;
    }
}

const c = new Stack(fixtureStack, "chrome");
const f = new Stack(fixtureStack, "firefox")
console.log(c.getMessage());
console.log(f.getMessage());
