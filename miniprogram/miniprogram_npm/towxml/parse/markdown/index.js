let hljs;
hljs = require('../highlight/index');

const config = require('../../config'),
    mdOption = (()=>{
        let result = {
            html: true,
            xhtmlOut: true,
            typographer: true,
            breaks: true,
        };

        if(config.highlight.length && hljs){
            result.highlight = (code,lang,callback)=>{
                let lineLen = code.split(/\r|\n/ig).length,
                    result = hljs.highlightAuto(code).value;

                    result = result.replace(/\r|\n/g,'<br/>').replace(/ /g,'&nbsp;').replace(/\t/g,'&nbsp;&nbsp;&nbsp;&nbsp;');

                if(config.showLineNumber){
                    let lineStr = (()=>{
                        let str = `<ul class="h2w__lineNum">`;
                        for(let i=0;i<lineLen-1;i++){
                            str += `<li class="h2w__lineNumLine">${i+1}</li>`
                        };

                        str += `</ul>`;
                        return str;
                    })();
                    return lineStr + result;
                };
                return result;
            }
        };
        return result;
    })(),
    md = require('./markdown')(mdOption);
// console.log([...config.markdown,...config.components]);
// // 应用Markdown解析扩展，包括自定义组件（['sub','sup','ins','mark','emoji','todo','latex','yuml','echarts']）
// [...config.markdown,...config.components].forEach(item => {
//     if(!/^audio-player|table|todogroup|img$/.test(item)){
//         md.use(require(`./plugins/${item}`));
//     };
// });
//if(!/^audio-player|table|todogroup|img$/.test("c-like")){md.use(require("./plugins/c-like"));};
//if(!/^audio-player|table|todogroup|img$/.test("c")){md.use(require("./plugins/c"));};
// if(!/^audio-player|table|todogroup|img$/.test("bash")){md.use(require("./plugins/bash"));};
// if(!/^audio-player|table|todogroup|img$/.test("css")){md.use(require("./plugins/css"));};
// if(!/^audio-player|table|todogroup|img$/.test("dart")){md.use(require("./plugins/dart"));};
// if(!/^audio-player|table|todogroup|img$/.test("go")){md.use(require("./plugins/go"));};
// if(!/^audio-player|table|todogroup|img$/.test("java")){md.use(require("./plugins/java"));};
// if(!/^audio-player|table|todogroup|img$/.test("javascript")){md.use(require("./plugins/javascript"));};
// if(!/^audio-player|table|todogroup|img$/.test("json")){md.use(require("./plugins/json"));};
// if(!/^audio-player|table|todogroup|img$/.test("less")){md.use(require("./plugins/less"));};
// if(!/^audio-player|table|todogroup|img$/.test("scss")){md.use(require("./plugins/scss"));};
// if(!/^audio-player|table|todogroup|img$/.test("shell")){md.use(require("./plugins/shell"));};
// if(!/^audio-player|table|todogroup|img$/.test("xml")){md.use(require("./plugins/xml"));};
// if(!/^audio-player|table|todogroup|img$/.test("htmlbars")){md.use(require("./plugins/htmlbars"));};
// if(!/^audio-player|table|todogroup|img$/.test("nginx")){md.use(require("./plugins/nginx"));};
// if(!/^audio-player|table|todogroup|img$/.test("php")){md.use(require("./plugins/php"));};
// if(!/^audio-player|table|todogroup|img$/.test("python")){md.use(require("./plugins/python"));};
// if(!/^audio-player|table|todogroup|img$/.test("python-repl")){md.use(require("./plugins/python-repl"));};
// if(!/^audio-player|table|todogroup|img$/.test("typescript")){md.use(require("./plugins/typescript"));};
if(!/^audio-player|table|todogroup|img$/.test("sub")){md.use(require("./plugins/sub"));};
if(!/^audio-player|table|todogroup|img$/.test("sup")){md.use(require("./plugins/sup"));};
if(!/^audio-player|table|todogroup|img$/.test("ins")){md.use(require("./plugins/ins"));};
if(!/^audio-player|table|todogroup|img$/.test("mark")){md.use(require("./plugins/mark"));};
if(!/^audio-player|table|todogroup|img$/.test("emoji")){md.use(require("./plugins/emoji"));};
if(!/^audio-player|table|todogroup|img$/.test("todo")){md.use(require("./plugins/todo"));};
// if(!/^audio-player|table|todogroup|img$/.test("audio-player")){md.use(require("./plugins/audio-player"));};
if(!/^audio-player|table|todogroup|img$/.test("latex")){md.use(require("./plugins/latex"));};
// if(!/^audio-player|table|todogroup|img$/.test("table")){md.use(require("./plugins/table"));};
// if(!/^audio-player|table|todogroup|img$/.test("todogroup")){md.use(require("./plugins/todogroup"));};
if(!/^audio-player|table|todogroup|img$/.test("yuml")){md.use(require("./plugins/yuml"));};
// if(!/^audio-player|table|todogroup|img$/.test("img")){md.use(require("./plugins/img"));};

// 定义emoji渲染规则
md.renderer.rules.emoji = (token,index)=>{
    let item = token[index];
    return `<g-emoji class="h2w__emoji h2w__emoji--${item.markup}">${item.content}</g-emoji>`;
};

// 导出模块
module.exports = str => {
    return md.render(str);
};