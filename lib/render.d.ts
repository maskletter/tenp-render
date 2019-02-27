
// declare module '@tenp/render'{

// }



declare interface JsonTree{
    name: string
    content: string
    children: JsonTree[]
}

declare interface importList{
    [ argv: string ]: any
}

/**
 * 将传入的html片段根据传入得值从新拼接
 * @param html 
 * @param data 
 */
export function render(html: string, data: any): string;

/**
 * 将html片段转为真正代码
 */
export function compile(html: string, data: any): any;

/**
 * 解析html片段，并转成json树
 * @param html 
 * @param isImport (是否返回带有import标签的数组)
 */
export function htmltoJsonTree(html: string): JsonTree[];
export function htmltoJsonTree(html: string, isImport: boolean): { treeList: JsonTree[], importList: [] };

/**
 * 用于express.render模板功能
 * @param filePath 
 * @param options 
 * @param callback 
 */
export function expressRender(filePath: any, options: any, callback: any): any;

/**
 * 将html片段转成function字符串
 * @param url 模板路径
 * @param html 模板内容
 * @param time 失效时间
 * @param component 是否为组件形式
 */
export function template(url: any, html?: any|number, time?: number, component?: any): string;

/**
 * 刷新缓存的模板
 * @param url 模板路径
 * @param html 模板内容
 * @param time 失效时间
 * @param component 是否为组件形式
 */
export function refreshTemplate(url: any, html?: any|number, time?: number, component?: any): boolean;

// /**
//  * 修改默认指令名称
//  * @param name 
//  * @param value 
//  */
// export function updateDirective(name: string, value: string): void;

/**
 * 修改默认指令
 * @param a 
 */
export function updateDirective(a: {
    for?: string,
    if?: string,
    else?: string,
    elseif?: string
}): void;

/**
 * 修改render默认配置
 * @param name
 */
export function updateConfig(a: {
    isSaveFile?: boolean,
    isSaveTemplate?: boolean,
    TemplateDefaultTime?: number,
    templateUrl?: string
}): void;

export function updateConfig(name: 'isSaveFile', value: boolean): void;
export function updateConfig(name: 'isSaveTemplate', value: boolean): void;
export function updateConfig(name: 'TemplateDefaultTime', value: number): void;
export function updateConfig(name: 'templateUrl', value: string): void;