# @tenp/render
基于nodejs 数据模板引擎 

## 模板语法

template/index.html
```html
<!DOCTYPE html>
<html lang="zh">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
  <import name='commodity' url='commodity/info' />
</head>
<body>
	<h1>你好,{{name}}</h1>
    <ul>
        <li *for='item in lists; let $index'>
            {{$index}}: 这里有{{ item.name }}
            <a *if='item.commodityId' href="javascript:void(0)" [commodityId]="item.commodityId">查看详情</a>
            <commodity *if='item.commodityId' />
        </li>
    </ul>
</body>
</html>
```
```typescript
import { render, template } from '@tenp/render';
//创建了一个虚拟模板组件
template('commodity/info',`
  <div>
    商品信息组件{{item.name}}
  </div>`, 0, true);
  
render('index.html', {
  name: 'tom',
	lists: [{ name: '苹果' }, { name: '香蕉', commodityId: '333' }],
})
```
tenp-render的模板语法参考了angular等框架，实现了*for,*if,*elseif,*else,以及自定义属性的[attr]等功能,

#### import标签
import 是一个引用标签，建议设置在head中,
 name为自定义的组件名字，url为模板路径，可以为虚拟模板，也可以为真是模板路径
```html
<head>
  <import name='commodity' url='commodity/info' />
</head>
```
然后页面中，创建import的name标签即可引用(组件可以直接接用当前页面的值)
```html
<body>
  <commodity />
</body>
```
#### updateDirective
你可以更改tenp-render的默认指令
```typescript
import { updateDirective }  from '@tenp/render';
updateDirective({
	if: 'v-if'
})
//<div v-if='item.commodityId'>Hello</div>
```

## 方法说明:
<table>	
	<thead>
		<tr>
			<td align="center" width="20%">方法</td>
			<td align="center" width="40%">说明</td>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td align="center">render</td>
			<td align="center">将指定的模板转换成html片段</td>
		</tr>
		<tr>
			<td align="center">template</td>
			<td align="center">将传入的字符串解析成渲染代码</td>
		</tr>
		<tr>
			<td align="center">compile</td>
			<td align="center">将渲染代码解析成html片段</td>
		</tr>
		<tr>
			<td align="center">htmltoJsonTree</td>
			<td align="center">将传入的字符串解析成json树</td>
		</tr>
		<tr>
			<td align="center">expressRender</td>
			<td align="center">用于express.render渲染</td>
		</tr>
		<tr>
			<td align="center">updateConfig</td>
			<td align="center">修改引擎默认配置</td>
		</tr>
		<tr>
			<td align="center">refreshTemplate</td>
			<td align="center">刷新缓存的模板</td>
		</tr>
	</tbody>
</table>

#### 默认配置
```typescript
const config = {
    //是否保存为文件
    "isSaveFile": false,
    //是否进行存储
    "isSaveTemplate": true,
    //模板默认存在时间
    "TemplateDefaultTime": 1000 * 60 * 60 * 24 * 7,
    //默认模板存储目录
    "templateUrl": "template",
}
```


## 使用:
```typescript
import { render, compile, template, htmltoJsonTree, expressRender, updateConfig } from '@tenp/render';
```
#### 获取dom树
```typescript
const treeList = htmltoJsonTree('<div>Hello</div><h1>World</h1>');

console.log(treeList => { name: 'div', attr: {}, children: [ { name: 'text', content: 'Hello' } ] },
  			{ name: 'h1', attr: {}, children: [ { name: 'text', content: 'World' } ] })

```
#### 创建模板
```typescript
/**
  template包含4个参数(url: any, html?: any|number, time?: number, component?: any)
     url:模板路径,
     html:模板字符串,
     time:失效时间
     component:是否以组件形式创建
*/

//读取项目启动目录下的template/index.html文件
const template1: string = template('template/index.html');

//如果template存在第二个参数，则忽略第一个参数的路径，创建一个虚拟的模板路径
const template2: string = template('template/index.are', '<div>{{name}}</div>');

//设置模板存于内存中的失效时间
const template3: string = template('template/index.html', undefined, 1000 * 60 * 60);

//设置模板存于内存中的失效时间
const template4: string = template('template/index.html', undefined, 1000 * 60 * 60);

//设置为组件形式(组件形式会去除页面中的从跟[html]开始搜索，只保留body内的内容)
const template5: string = template('template/index.html', undefined, 0, true);

```
#### 渲染模板
```typescript

/**
  compile包含两个参数(html: string, data: any)
    html为要解析的渲染代码
    data为传入模板的值
*/
const htmlStr1: string = compile(template1, { name: "tom" })

```

render
```typescript

/**
  render包含两个参数(url: string, data: any)
    url为要解析的渲染代码
    data为传入模板的值
*/

//render函数会直接解析模板的文件，并渲染成html片段
const htmlStr2: string = render('template/index.html', {
  name: "tom"
})

```
#### 修改默认配置
```typescript

//是否将渲染代码保存为文件形式,，默认置于内存中
updateConfig('isSaveFile', boolean)
//是否保存渲染代码，如果不保存的话，每次执行都会从进行编译
updateConfig('isSaveTemplate', boolean)
//模板存于内存中的失效时间
updateConfig('TemplateDefaultTime', number)
//模板所在目录
updateConfig('templateUrl', string)
```
#### refreshTemplate
```typescript
/**
  参数与template函数一直
  用于刷新缓存在内存或本地的模板
*/
refreshTemplate('price.html');

```

