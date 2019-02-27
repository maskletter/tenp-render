"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Parser = require("./htmlparser2/Parser.js");
var fs = require("fs");
var path = require("path");
//项目所在路径
var cwd = process.cwd();
//获取tsconfig配置信息
var tsconfig = function(){
    try {
        return JSON.parse(fs.readFileSync(cwd + '/tsconfig.json').toString())
    } catch (error) {
        return {
            compilerOptions: {
                outDir: ''
            }
        }
    }
}();

//创建低版本方法
!Object.keys && (Object.keys = function(data){
    let map = [];
    for(let i in data){
        map.push(i)
    }
    return map;
})

//创建低版本方法
!Object.values && (Object.values = function(data){
    let map = [];
    for(let i in data){
        map.push(data[i])
    }
    return map;
})

var config = {
    //是否保存为文件
    isSaveFile: false,
    //是否进行存储
    isSaveTemplate: true,
    //保持模版的数组
    templateMap: {},
    //模板默认存在时间
    TemplateDefaultTime: 1000 * 60 * 60 * 24 * 7,
    //默认模板存储目录
    templateUrl: path.resolve(cwd, 'template'),
    //模板编译之后的保存文件路径
    templateSaveDirectory: path.resolve('node_modules/tenp-template'),
};

function dealWith(){
    //创建模板保存空间
    if (config.isSaveFile) {
        if (!fs.existsSync(config.templateSaveDirectory)) {
            console.log(config.templateSaveDirectory)
            fs.mkdirSync(config.templateSaveDirectory, { recursive: true });
        }
    }
    //删除模板目录垃圾文件
    if(fs.existsSync(config.templateSaveDirectory)){
        var arr = fs.readdirSync(config.templateSaveDirectory);
        for (var i in arr) {
            fs.unlinkSync(config.templateSaveDirectory + '/' + arr[i]);
        }
    }
}
dealWith();
    
//默认的属性
var directive = {
    for: '*for',
    if: '*if',
    else: '*else',
    elseif: '*elseif'
};
//定时删除过期的内存
function clearRubbishTemplate() {
    setTimeout(function () {
        for (var key in config.templateMap) {
            var data = config.templateMap[key];
            if (new Date().getTime() > data.date + data.time) {
                delete config.templateMap[key];
            }
        }
    }, 1000 * 60 * 60 * 24);
}
//解析html片段，并转成json树
function HtmltoparseDom(html, isImport) {
    var currentItemList = [];
    var levelItemList = [];
    var currentItem;
    var oldItem;
    var importList = {};
    var parser = new Parser({
        onopentag: function (name, attribs) {
            oldItem = levelItemList[levelItemList.length - 1];
            currentItem = {
                name: name,
                attr: attribs,
                children: []
            };
            if (oldItem) {
                oldItem.children.push(currentItem);
            }
            if (levelItemList.length == 0) {
                currentItemList.push(currentItem);
            }
            // console.log(name)
            levelItemList.push(currentItem);
            if (name == 'import' && attribs.name) {
                var url = path.resolve(config.templateUrl, attribs.url);
                importList[attribs.name.toLocaleLowerCase()] = url;
                exports.template(url, undefined, config.TemplateDefaultTime, true);
            }
        },
        ontext: function (text) {
            text = text.replace(/[\t\r\n]/g, '');
            if (currentItem && currentItem.children) {
                currentItem.children.push({
                    name: 'text',
                    content: text
                });
            }
            else {
                currentItem = {
                    name: 'text',
                    content: text
                };
                oldItem = levelItemList[levelItemList.length - 1];
                if (oldItem) {
                    oldItem.children.push(currentItem);
                }
                if (levelItemList.length == 0) {
                    currentItemList.push(currentItem);
                }
            }
        },
        onclosetag: function (tagname) {
            currentItem = null;
            levelItemList.pop();
        },
        onend: function () {
        }
    }, { decodeEntities: true, recognizeSelfClosing: true, recognizeCDATA: false });
    parser.write(html);
    parser.end();
    if (isImport) {
        return {
            treeList: currentItemList,
            importList: importList
        };
    }
    else {
        return currentItemList;
    }
}
//解析{{ xx }}格式内容
function createShowData(data) {
    data = data.replace(/"\{\{([\s\S]+?)\}\}"/g, function (m, value) {
        // return '\";str += ('+value+')+\"'
        return '\";str += ' + createShowData.renderFilters(value) + '+\"';
    }).replace(/\{\{([\s\S]+?)\}\}/g, function (m, value) {
        return '\";str += ' + createShowData.renderFilters(value) + '+\"';
    });
    return data;
}
createShowData.renderFilters = function (value) {
    var map = value.split('|');
    var fun = function () {
        if (map[1]) {
            map[1] = map[1].split(':');
            var funname = map[1].shift();
            map = funname + '(' + map[0] + ',' + map[1].join(',') + ')';
        }
        else {
            map = map[0];
        }
    }();
    return map;
};
//解析[attr]属性
function createAttr(attr) {
    var str = '';
    var directiveKey = Object.values(directive);
    var _loop_1 = function (key) {
        if (directiveKey.indexOf(key) != -1) {
            delete attr[key];
        }
        else {
            if (/^\[(.+?)\]$/.test(key)) {
                str += key.replace(/^\[(.+?)\]$/, function (m, d) {
                    return d + '=\\""+' + attr[key] + '+"\\" ';
                });
            }
            else {
                str += key + '=\\"' + attr[key] + '\\" ';
            }
        }
    };
    //剔除组件属性
    for (var key in attr) {
        _loop_1(key);
    }
    return str;
}
var ifCondition = [];
//创建if/else/if判断
function creatgeCondition(data, importList) {
    var str = '';
    if (data.attr[directive.if]) {
        ifCondition = [data.attr[directive.if]];
        str += 'if(' + data.attr[directive.if] + '){';
        str += createLabel(data, importList);
        str += '}';
    }
    else if (data.attr[directive.elseif]) {
        var elseif = ifCondition.map(function (v) { return '!(' + v + ')'; }).join(' && ');
        ifCondition.push(data.attr[directive.elseif]);
        str += 'if(' + elseif + ' && ' + data.attr[directive.elseif] + '){';
        str += createLabel(data, importList);
        str += '}';
    }
    else if (data.attr[directive.else] != undefined) {
        var _else = ifCondition.map(function (v) { return '!(' + v + ')'; }).join(' && ');
        str += 'if(' + _else + '){';
        str += createLabel(data, importList);
        str += '}';
    }
    else {
        str += createLabel(data, importList);
    }
    return str;
}
//创建html标签
function createLabel(data, importList) {
    var str = '';
    if (importList[data.name]) {
        //自定义引用标签
        var render = exports.template(importList[data.name], undefined, config.TemplateDefaultTime, true);
        str += "str += (function(" + data.attr['[data]'] + "){" + render + "}(" + data.attr['[data]'] + "));";
    }
    else if (data.name == 'import' && data.attr.name) {
        //不添加import标签
    }
    else {
        str += "str += \"<" + data.name + " " + createAttr(data.attr) + ">";
        str += EachJsonTree(data.children, importList, true);
        str += "str += \"</" + data.name + ">\";";
    }
    return str;
}
//创建html字符串function
function createElementstr(data, importList) {
    var str = '';
    var forContent = data.attr[directive.for];
    if (forContent) {
        forContent = forContent.split(';');
        var forList = forContent[0].split(' ');
        str += 'for(let ' + forList[0] + ' in ' + forList[2] + '){';
        if (forContent[1]) {
            str += '' + forContent[1] + '=' + forList[0] + ';';
        }
        str += '' + forList[0] + '=' + forList[2] + '[' + forList[0] + '];';
        str += creatgeCondition(data, importList);
        str += '}';
    }
    else {
        str += creatgeCondition(data, importList);
    }
    return str;
}
//删除组件形式的html等标签
function createComponent(treeList) {
    var __treeList = null;
    for (var i in treeList) {
        if (treeList[i].name == 'body') {
            __treeList = treeList[i];
            break;
        }
        else {
            __treeList = createComponent(treeList[i].children);
        }
    }
    return __treeList;
}
//便利dom树
function EachJsonTree(treeList, importList, isWrapper, component) {
    var str = isWrapper ? '";' : '';
    if (component == true) {
        var body = createComponent(treeList);
        if (body) {
            treeList = body.children;
        }
    }
    for (var _i = 0, treeList_1 = treeList; _i < treeList_1.length; _i++) {
        var data = treeList_1[_i];
        if (data.name == 'text') {
            str += 'str += "' + createShowData(data.content.replace(/\n/g, '\\n')) + '";';
        }
        else {
            str += createElementstr(data, importList);
        }
    }
    return str;
}
/**
 * 将html片段function字符串转换成function并运行
 */
exports.compile = (function (html, data = {}) {

    var fun = new Function(Object.keys(data).join(','), html);

    return function () {
        return fun.apply(null, function () {
            var a = [];
            for (var key in data) {
                a.push(data[key]);
            }
            return a;
        }());
    }();
});
/**
 * 将传入的html片段根据传入得值从新拼接
 * @param html
 * @param data
 */
exports.render = function (html, data = {}) {
    var str = exports.template(html);
    var fun = new Function(Object.keys(data).join(','), str);
    return function () {
        return fun.apply(null, function () {
            var a = [];
            for (var key in data) {
                a.push(data[key]);
            }
            return a;
        }());
    }();
};
/**
 * 将html片段转成function字符串
 * @param html
 */
exports.template = function (url, html, time, component) {

    var componentStr = component ? '-component' : '';
    if (config.templateMap[url + componentStr]) {
        if (config.isSaveFile) {
            return fs.readFileSync(config.templateSaveDirectory + '/' + config.templateMap[url + componentStr]);
        }
        else {
            return config.templateMap[url].str;
        }
    }
    if (!time) {
        time = typeof (html) == 'number' ? html : config.TemplateDefaultTime;
    }
    try {
        if (!html) {
            if (path.isAbsolute(url)) {
                html = fs.readFileSync(url).toString();
            }
            else {
                html = fs.readFileSync(config.templateUrl + '/' + url).toString();
            }
        }
        var _a = HtmltoparseDom(html, true), treeList = _a.treeList, importList = _a.importList;
        var str = 'var str = "<!DOCTYPE html>";' + EachJsonTree(treeList, importList, false, component) + ";return str;";
        if (config.isSaveTemplate) {
            if (config.isSaveFile) {
                var name_1 = Math.random() + Math.random() + '.template';
                fs.writeFileSync(config.templateSaveDirectory + '/' + name_1, str);
                config.templateMap[url + componentStr] = name_1;
            }
            else {
                config.templateMap[url + componentStr] = {
                    str: str,
                    time: time,
                    date: new Date().getTime()
                };
            }
        }
        return str;
    }
    catch (error) {
        console.log(error)
        return "return \"<h1>\u6A21\u677F\u8BFB\u53D6\u51FA\u9519</h1>\"";
    }
};
//刷新模板
exports.RefreshTemplate = function (url, html, time, component) {
    var componentStr = component ? '-component' : '';
    if (!time) {
        time = typeof (html) == 'number' ? html : config.TemplateDefaultTime;
    }
    try {
        if (!html) {
            if (path.isAbsolute(url)) {
                html = fs.readFileSync(url).toString();
            }
            else {
                html = fs.readFileSync(config.templateUrl + '/' + url).toString();
            }
        }
        var _a = HtmltoparseDom(html, true), treeList = _a.treeList, importList = _a.importList;
        var str = 'var str = "<!DOCTYPE html>";' + EachJsonTree(treeList, importList, false, component) + ";return str;";
        if (config.isSaveTemplate) {
            if (config.isSaveFile) {
                var name_2 = Math.random() + Math.random() + '.template';
                fs.writeFileSync(config.templateSaveDirectory + '/' + name_2, str);
                config.templateMap[url + componentStr] = name_2;
            }
            else {
                config.templateMap[url + componentStr] = {
                    str: str,
                    time: time,
                    date: new Date().getTime()
                };
            }
        }
        return true;
    }
    catch (error) {
        return error;
    }
};
/**
 * 配置express.render
 * @param filePath
 * @param options
 * @param callback
 */
exports.expressRender = function (filePath, options, callback) {
    delete options.settings;
    delete options._locals;
    delete options.cache;
    return callback(null, exports.toHtml(filePath, options));
};
/**
 * 修改render默认配置
 * @param name
 */
exports.updateConfig = function (name, value) {
    var _a;
    if (typeof (name) == 'string') {
        name = (_a = {}, _a[name] = value, _a);
    }
    for (var key in name) {
        if (key == 'templateUrl') {
            config.templateUrl = path.resolve(cwd, name[key]);
        }
        else {
            config[key] = name[key];
        }
        if(key == 'isSaveFile'){
            dealWith()
        }
    }
};
//解析html dom树
exports.htmltoJsonTree = HtmltoparseDom;
if (!config.isSaveFile) {
    clearRubbishTemplate();
}
