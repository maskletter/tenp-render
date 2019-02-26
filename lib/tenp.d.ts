
import tenp from "@tenp/core";

declare global {

    namespace tenp {

        interface JsonTree{
            name: string
            content: string
            children: JsonTree[]
        }

        interface importList{
            [ argv: string ]: any
        }

        interface UpdateConfig{
            (name: 'isSaveFile' | 'isSaveTemplate' | 'TemplateDefaultTime' | 'templateUrl', value: string|boolean): void
            (data: {
                isSaveFile?: boolean,
                isSaveTemplate?: boolean,
                TemplateDefaultTime?: number,
                templateUrl?: string
            }): void
        }

        
        /**
         * 将传入的html片段根据传入得值从新拼接
         * @param html 
         * @param data 
         */
        function toHtml(html: string, data: any): string;

        /**
         * 将html片段转为真正代码
         */
        function render(html: string, data: any): any;

        /**
         * 解析html片段，并转成json树
         * @param html 
         * @param isImport (是否返回带有import标签的数组)
         */
        function htmltoJsonTree(html: string, isImport?: boolean): JsonTree[] | { treeList: JsonTree[], importList: [] };

        /**
         * 用于express.render模板功能
         * @param filePath 
         * @param options 
         * @param callback 
         */
        function expressRender(filePath: any, options: any, callback: any): any;

        /**
         * 将html片段转成function字符串
         * @param url 模板路径
         * @param html 模板内容
         * @param time 失效时间
         * @param component 是否为组件形式
         */
        function parseRender(url: any, html?: any|number, time?: number, component?: any): string;

        /**
         * 刷新缓存的模板
         * @param url 模板路径
         * @param html 模板内容
         * @param time 失效时间
         * @param component 是否为组件形式
         */
        function RefreshTemplate(url: any, html?: any|number, time?: number, component?: any): boolean;
    }


}

        